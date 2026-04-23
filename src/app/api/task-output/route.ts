import { NextResponse } from "next/server";
import { createFallbackTaskOutput } from "@/lib/ai/fallback-planner";
import { completeWithNim } from "@/lib/ai/nim-client";
import { extractJsonObject, normalizeTaskOutput } from "@/lib/ai/parsers";
import { buildTaskOutputMessages } from "@/lib/ai/prompts";
import type { TaskItem, TaskOutput } from "@/lib/types";
import { sanitizeGoal } from "@/lib/utils/task-helpers";

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

    let outputDraft = createFallbackTaskOutput(goal, task);
    let source: "llm" | "fallback" = "llm";
    let model = process.env.NVIDIA_NIM_MODEL || "meta/llama-3.1-405b-instruct";

    try {
      const completion = await completeWithNim(buildTaskOutputMessages(goal, task), {
        maxTokens: 900,
        temperature: 0.3
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
