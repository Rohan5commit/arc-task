export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface CompletionOptions {
  maxTokens?: number;
  temperature?: number;
  model?: string;
  timeoutMs?: number;
}

interface CompletionResult {
  content: string;
  model: string;
}

const DEFAULT_MODEL = "meta/llama-4-maverick-17b-128e-instruct";
const DEFAULT_TIMEOUT_MS = 12000;
const MIN_TIMEOUT_MS = 1500;
const MAX_TIMEOUT_MS = 30000;
const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

function clampTimeoutMs(value: number | undefined): number {
  if (!Number.isFinite(value)) {
    return DEFAULT_TIMEOUT_MS;
  }

  return Math.min(Math.max(Math.round(value as number), MIN_TIMEOUT_MS), MAX_TIMEOUT_MS);
}

export async function completeWithNim(
  messages: ChatMessage[],
  options: CompletionOptions = {}
): Promise<CompletionResult> {
  const apiKey = process.env.NVIDIA_NIM_API_KEY;

  if (!apiKey) {
    throw new Error("NVIDIA_NIM_API_KEY is not configured.");
  }

  const model = options.model?.trim() || process.env.NVIDIA_NIM_MODEL || DEFAULT_MODEL;
  const timeoutMs = clampTimeoutMs(options.timeoutMs);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;

  try {
    response = await fetch(NVIDIA_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      cache: "no-store",
      signal: controller.signal,
      body: JSON.stringify({
        model,
        messages,
        temperature: options.temperature ?? 0.2,
        max_tokens: options.maxTokens ?? 1200
      })
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`NVIDIA NIM request timed out after ${timeoutMs}ms.`);
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`NVIDIA NIM request failed: ${response.status} ${errorText}`);
  }

  const payload = (await response.json()) as {
    model?: string;
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = payload.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("NVIDIA NIM returned an empty completion.");
  }

  return {
    content,
    model: payload.model || model
  };
}
