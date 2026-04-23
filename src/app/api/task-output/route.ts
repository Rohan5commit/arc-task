import { NextResponse } from "next/server";
import { createFallbackTaskOutput } from "@/lib/ai/fallback-planner";
import { completeWithNim } from "@/lib/ai/nim-client";
import { extractJsonObject, normalizeTaskOutput } from "@/lib/ai/parsers";
import { buildTaskOutputMessages } from "@/lib/ai/prompts";
import { parseTaskOutputPayload, readJsonBody } from "@/lib/api/schemas";
import type { TaskOutput, TaskOutputApiResponse } from "@/lib/types";

const DEFAULT_WORKER_MODEL = "meta/llama-4-maverick-17b-128e-instruct";
const DEFAULT_WORKER_TIMEOUT_MS = 8000;

function buildWorkerWarning(error: unknown): string {
  const message = error instanceof Error ? error.message : "";

  if (message.startsWith("NVIDIA NIM request timed out")) {
    return message;
  }

  return "Live worker generation unavailable. Returned deterministic fallback output.";
}

export async function POST(request: Request) {
  const body = await readJsonBody(request);

  if (!body.ok) {
    return NextResponse.json({ error: body.error }, { status: body.status });
  }

  const parsed = parseTaskOutputPayload(body.data);

  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  }

  try {
    const modelPreference =
      process.env.NVIDIA_NIM_WORKER_MODEL ||
      process.env.NVIDIA_NIM_MODEL ||
      DEFAULT_WORKER_MODEL;

    let outputDraft = createFallbackTaskOutput(parsed.data.goal, parsed.data.task);
    let source: "llm" | "fallback" = "llm";
    let model = modelPreference;
    let warnings: string[] = [];

    try {
      const completion = await completeWithNim(
        buildTaskOutputMessages(parsed.data.goal, parsed.data.task),
        {
          model: modelPreference,
          maxTokens: 650,
          temperature: 0.2,
          timeoutMs: Number(
            process.env.NVIDIA_NIM_WORKER_TIMEOUT_MS ?? DEFAULT_WORKER_TIMEOUT_MS
          )
        }
      );
      outputDraft = normalizeTaskOutput(extractJsonObject(completion.content));
      model = completion.model;
    } catch (error) {
      source = "fallback";
      model = "fallback-worker";
      warnings = [buildWorkerWarning(error)];
    }

    const output: TaskOutput = {
      ...outputDraft,
      source,
      generatedAt: new Date().toISOString()
    };

    const response: TaskOutputApiResponse = {
      taskId: parsed.data.task.id,
      output,
      model,
      warnings
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { error: "Unable to generate task output." },
      { status: 500 }
    );
  }
}
