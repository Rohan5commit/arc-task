import { NextResponse } from "next/server";
import { createFallbackVerification } from "@/lib/ai/fallback-planner";
import { completeWithNim } from "@/lib/ai/nim-client";
import { extractJsonObject, normalizeVerification } from "@/lib/ai/parsers";
import { buildVerificationMessages } from "@/lib/ai/prompts";
import type { TaskItem, VerificationDecision, VerificationRecord } from "@/lib/types";
import { sanitizeGoal } from "@/lib/utils/task-helpers";

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

    let verificationDraft = createFallbackVerification(task, decisionIntent);
    let source: "llm" | "fallback" = "llm";
    let model = process.env.NVIDIA_NIM_MODEL || "meta/llama-3.1-405b-instruct";

    try {
      const completion = await completeWithNim(
        buildVerificationMessages(goal, task, decisionIntent),
        {
          maxTokens: 700,
          temperature: 0.2
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
