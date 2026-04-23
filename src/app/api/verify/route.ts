import { NextResponse } from "next/server";
import { createFallbackVerification } from "@/lib/ai/fallback-planner";
import { completeWithNim } from "@/lib/ai/nim-client";
import { extractJsonObject, normalizeVerification } from "@/lib/ai/parsers";
import { buildVerificationMessages } from "@/lib/ai/prompts";
import type { TaskItem, VerificationDecision, VerificationRecord } from "@/lib/types";
import { sanitizeGoal } from "@/lib/utils/task-helpers";

const DEFAULT_VERIFIER_MODEL = "meta/llama-4-maverick-17b-128e-instruct";
const DEFAULT_VERIFIER_TIMEOUT_MS = 7000;

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      goal?: string;
      task?: TaskItem;
      decisionIntent?: VerificationDecision;
    };
    const goal = sanitizeGoal(String(payload.goal ?? ""));
    const task = payload.task;
    const decisionIntent =
      payload.decisionIntent === "changes_requested" ? "changes_requested" : "approved";

    if (!task || !goal) {
      return NextResponse.json({ error: "Goal and task are required." }, { status: 400 });
    }

    const modelPreference =
      process.env.NVIDIA_NIM_VERIFIER_MODEL ||
      process.env.NVIDIA_NIM_MODEL ||
      DEFAULT_VERIFIER_MODEL;

    let verificationDraft = createFallbackVerification(task, decisionIntent);
    let source: "llm" | "fallback" = "llm";
    let model = modelPreference;

    try {
      const completion = await completeWithNim(
        buildVerificationMessages(goal, task, decisionIntent),
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
        decisionIntent
      );
      model = completion.model;
    } catch {
      source = "fallback";
      model = "fallback-verifier";
    }

    const verification: VerificationRecord = {
      ...verificationDraft,
      source,
      reviewedBy: "Verifier Agent",
      generatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      taskId: task.id,
      verification,
      model
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to verify task output." },
      { status: 500 }
    );
  }
}
