export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface CompletionOptions {
  maxTokens?: number;
  temperature?: number;
}

interface CompletionResult {
  content: string;
  model: string;
}

const DEFAULT_MODEL = "meta/llama-3.1-405b-instruct";
const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

export async function completeWithNim(
  messages: ChatMessage[],
  options: CompletionOptions = {}
): Promise<CompletionResult> {
  const apiKey = process.env.NVIDIA_NIM_API_KEY;

  if (!apiKey) {
    throw new Error("NVIDIA_NIM_API_KEY is not configured.");
  }

  const model = process.env.NVIDIA_NIM_MODEL || DEFAULT_MODEL;
  const response = await fetch(NVIDIA_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    cache: "no-store",
    body: JSON.stringify({
      model,
      messages,
      temperature: options.temperature ?? 0.2,
      max_tokens: options.maxTokens ?? 1200
    })
  });

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
