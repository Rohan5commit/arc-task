import { NextResponse } from "next/server";
import { createFallbackTaskOutput } from "@/lib/ai/fallback-planner";
import { completeWithNim } from "@/lib/ai/nim-client";
import { extractJsonObject, normalizeTaskOutput } from "@/lib/ai/parsers";
import { buildTaskOutputMessages } from "@/lib/ai/prompts";
import type { TaskItem, TaskOutput } from "@/lib/types";
import { sanitizeGoal } from "@/lib/utils/task-helpers";

const DEFAULT_WORKER_MODEL = "meta/llama-4-maverick-17b-128e-instruct";
const DEFAULT_WORKER_TIMEOUT_MS = 8000;

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      goal?: string;
      task?: TaskItem;
    };
    const goal = sanitizeGoal(String(payload.goal ?? ""));
    const task = payload.task;

    if (!task || !goal) {
      return NextResponse.json({ error: "Goal and task are required." }, { status: 400 });
    }

    const modelPreference =
      process.env.NVIDIA_NIM_WORKER_MODEL ||
      process.env.NVIDIA_NIM_MODEL ||
      DEFAULT_WORKER_MODEL;

    let outputDraft = createFallbackTaskOutput(goal, task);
    let source: "llm" | "fallback" = "llm";
    let model = modelPreference;

    try {
      const completion = await completeWithNim(buildTaskOutputMessages(goal, task), {
        model: modelPreference,
        maxTokens: 650,
        temperature: 0.2,
        timeoutMs: Number(
          process.env.NVIDIA_NIM_WORKER_TIMEOUT_MS ?? DEFAULT_WORKER_TIMEOUT_MS
        )
      });
      outputDraft = normalizeTaskOutput(extractJsonObject(completion.content));
      model = completion.model;
    } catch {
      source = "fallback";
      model = "fallback-worker";
    }

    const output: TaskOutput = {
      ...outputDraft,
      source,
      generatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      taskId: task.id,
      output,
      model
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to generate task output." },
      { status: 500 }
    );
  }
}
