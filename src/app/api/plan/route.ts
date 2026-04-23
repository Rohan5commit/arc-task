import { NextResponse } from "next/server";
import { createFallbackPlan } from "@/lib/ai/fallback-planner";
import { completeWithNim } from "@/lib/ai/nim-client";
import { extractJsonObject, normalizePlanDraft } from "@/lib/ai/parsers";
import { buildPlanningMessages } from "@/lib/ai/prompts";
import { parsePlanningPayload, readJsonBody } from "@/lib/api/schemas";
import type { PaymentMode } from "@/lib/types";
import { buildWorkspaceFromPlan } from "@/lib/utils/task-helpers";

const DEFAULT_PLANNER_MODEL = "meta/llama-4-maverick-17b-128e-instruct";
const DEFAULT_PLANNER_TIMEOUT_MS = 12000;

function buildPlannerWarning(error: unknown): string {
  const message = error instanceof Error ? error.message : "";

  if (message.startsWith("NVIDIA NIM request timed out")) {
    return message;
  }

  return "Live planning unavailable. Returned deterministic fallback workflow.";
}

export async function POST(request: Request) {
  const body = await readJsonBody(request);

  if (!body.ok) {
    return NextResponse.json({ error: body.error }, { status: body.status });
  }

  const parsed = parsePlanningPayload(body.data);

  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  }

  try {
    const paymentMode = (process.env.PAYMENT_MODE === "arc_testnet"
      ? "arc_testnet"
      : "demo") as PaymentMode;

    const modelPreference =
      process.env.NVIDIA_NIM_PLANNER_MODEL ||
      process.env.NVIDIA_NIM_MODEL ||
      DEFAULT_PLANNER_MODEL;

    let source: "llm" | "fallback" = "llm";
    let model = modelPreference;
    let warnings: string[] = [];
    let draft = createFallbackPlan(parsed.data.goal);

    try {
      const completion = await completeWithNim(buildPlanningMessages(parsed.data.goal), {
        model: modelPreference,
        maxTokens: 900,
        temperature: 0.15,
        timeoutMs: Number(
          process.env.NVIDIA_NIM_PLANNER_TIMEOUT_MS ?? DEFAULT_PLANNER_TIMEOUT_MS
        )
      });
      draft = normalizePlanDraft(extractJsonObject(completion.content), parsed.data.goal);
      model = completion.model;
    } catch (error) {
      source = "fallback";
      model = "fallback-planner";
      warnings = [buildPlannerWarning(error)];
    }

    const workspace = buildWorkspaceFromPlan(parsed.data.goal, draft, paymentMode);

    return NextResponse.json({
      workspace,
      source,
      model,
      warnings
    });
  } catch {
    return NextResponse.json({ error: "Unable to create plan." }, { status: 500 });
  }
}
