import { NextResponse } from "next/server";
import { createFallbackPlan } from "@/lib/ai/fallback-planner";
import { completeWithNim } from "@/lib/ai/nim-client";
import { extractJsonObject, normalizePlanDraft } from "@/lib/ai/parsers";
import { buildPlanningMessages } from "@/lib/ai/prompts";
import type { PaymentMode } from "@/lib/types";
import { buildWorkspaceFromPlan, sanitizeGoal } from "@/lib/utils/task-helpers";

const DEFAULT_PLANNER_MODEL = "meta/llama-4-maverick-17b-128e-instruct";
const DEFAULT_PLANNER_TIMEOUT_MS = 12000;

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { goal?: string };
    const goal = sanitizeGoal(String(payload.goal ?? ""));

    if (goal.length < 12) {
      return NextResponse.json(
        { error: "Goal must be at least 12 characters long." },
        { status: 400 }
      );
    }

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
    let draft = createFallbackPlan(goal);

    try {
      const completion = await completeWithNim(buildPlanningMessages(goal), {
        model: modelPreference,
        maxTokens: 900,
        temperature: 0.15,
        timeoutMs: Number(
          process.env.NVIDIA_NIM_PLANNER_TIMEOUT_MS ?? DEFAULT_PLANNER_TIMEOUT_MS
        )
      });
      draft = normalizePlanDraft(extractJsonObject(completion.content), goal);
      model = completion.model;
    } catch (error) {
      source = "fallback";
      model = "fallback-planner";
      warnings = [
        error instanceof Error
          ? error.message
          : "Live planning exceeded the latency budget. Returned deterministic fallback workflow."
      ];
    }

    const workspace = buildWorkspaceFromPlan(goal, draft, paymentMode);

    return NextResponse.json({
      workspace,
      source,
      model,
      warnings
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to create plan."
      },
      { status: 500 }
    );
  }
}
