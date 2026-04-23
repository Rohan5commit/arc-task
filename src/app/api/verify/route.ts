import { NextResponse } from "next/server";
import { createFallbackVerification } from "@/lib/ai/fallback-planner";
import { completeWithNim } from "@/lib/ai/nim-client";
import { extractJsonObject, normalizeVerification } from "@/lib/ai/parsers";
import { buildVerificationMessages } from "@/lib/ai/prompts";
import { parseVerificationPayload, readJsonBody } from "@/lib/api/schemas";
import type { VerificationRecord, VerifyApiResponse } from "@/lib/types";

const DEFAULT_VERIFIER_MODEL = "meta/llama-4-maverick-17b-128e-instruct";
const DEFAULT_VERIFIER_TIMEOUT_MS = 7000;

function buildVerifierWarning(error: unknown): string {
  const message = error instanceof Error ? error.message : "";

  if (message.startsWith("NVIDIA NIM request timed out")) {
    return message;
  }

  return "Live verifier unavailable. Returned deterministic fallback review note.";
}

export async function POST(request: Request) {
  const body = await readJsonBody(request);

  if (!body.ok) {
    return NextResponse.json({ error: body.error }, { status: body.status });
  }

  const parsed = parseVerificationPayload(body.data);

  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  }

  try {
    const modelPreference =
      process.env.NVIDIA_NIM_VERIFIER_MODEL ||
      process.env.NVIDIA_NIM_MODEL ||
      DEFAULT_VERIFIER_MODEL;

    let verificationDraft = createFallbackVerification(
      parsed.data.task,
      parsed.data.decisionIntent
    );
    let source: "llm" | "fallback" = "llm";
    let model = modelPreference;
    let warnings: string[] = [];

    try {
      const completion = await completeWithNim(
        buildVerificationMessages(
          parsed.data.goal,
          parsed.data.task,
          parsed.data.decisionIntent
        ),
        {
          model: modelPreference,
          maxTokens: 450,
          temperature: 0.15,
          timeoutMs: Number(
            process.env.NVIDIA_NIM_VERIFIER_TIMEOUT_MS ?? DEFAULT_VERIFIER_TIMEOUT_MS
          )
        }
      );
      verificationDraft = normalizeVerification(
        extractJsonObject(completion.content),
        parsed.data.decisionIntent
      );
      model = completion.model;
    } catch (error) {
      source = "fallback";
      model = "fallback-verifier";
      warnings = [buildVerifierWarning(error)];
    }

    const verification: VerificationRecord = {
      ...verificationDraft,
      source,
      reviewedBy: "Verifier Agent",
      generatedAt: new Date().toISOString()
    };

    const response: VerifyApiResponse = {
      taskId: parsed.data.task.id,
      verification,
      model,
      warnings
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { error: "Unable to verify task output." },
      { status: 500 }
    );
  }
}
