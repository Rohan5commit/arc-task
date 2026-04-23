import type {
  CompletionConfidence,
  PlanDraft,
  PlannerTaskDraft,
  TaskOutputDraft,
  VerificationDecision,
  VerificationDraft
} from "@/lib/types";

const CONFIDENCE_VALUES: CompletionConfidence[] = ["low", "medium", "high"];

function ensureObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Expected an object payload.");
  }

  return value as Record<string, unknown>;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback;
}

function asConfidence(value: unknown): CompletionConfidence {
  return CONFIDENCE_VALUES.includes(value as CompletionConfidence)
    ? (value as CompletionConfidence)
    : "medium";
}

function asStringArray(value: unknown, minimum = 1): string[] {
  if (!Array.isArray(value)) {
    throw new Error("Expected an array of strings.");
  }

  const strings = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);

  if (strings.length < minimum) {
    throw new Error("Too few string items.");
  }

  return strings;
}

function asBounty(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(parsed)) {
    throw new Error("Invalid bounty value.");
  }

  return Number(parsed.toFixed(4));
}

export function extractJsonObject(raw: string): unknown {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");

  if (start === -1 || end === -1 || end < start) {
    throw new Error("No JSON object found in model response.");
  }

  return JSON.parse(raw.slice(start, end + 1));
}

function normalizeTaskDraft(value: unknown): PlannerTaskDraft {
  const task = ensureObject(value);

  return {
    title: asString(task.title),
    description: asString(task.description),
    assignedTo: asString(task.assignedTo, "Worker Agent"),
    priority: (asString(task.priority, "medium") as PlannerTaskDraft["priority"]) || "medium",
    bountyUsdc: asBounty(task.bountyUsdc),
    acceptanceCriteria: asStringArray(task.acceptanceCriteria, 2).slice(0, 3)
  };
}

export function normalizePlanDraft(value: unknown, goal: string): PlanDraft {
  const payload = ensureObject(value);
  const tasks = Array.isArray(payload.tasks) ? payload.tasks.map(normalizeTaskDraft) : [];

  if (tasks.length < 4) {
    throw new Error("Planning response returned fewer than four tasks.");
  }

  return {
    workspaceTitle: asString(payload.workspaceTitle, `${goal.slice(0, 48)} workflow`),
    planSummary: asString(
      payload.planSummary,
      "Coordinator-generated atomic work packages with proposed nano-bounties."
    ),
    tasks: tasks.slice(0, 6)
  };
}

export function normalizeTaskOutput(value: unknown): TaskOutputDraft {
  const payload = ensureObject(value);

  return {
    summary: asString(payload.summary),
    artifact: asString(payload.artifact),
    nextCheck: asString(payload.nextCheck),
    confidence: asConfidence(payload.confidence)
  };
}

export function normalizeVerification(
  value: unknown,
  decisionIntent: VerificationDecision
): VerificationDraft {
  const payload = ensureObject(value);

  return {
    decision:
      payload.decision === "approved" || payload.decision === "changes_requested"
        ? (payload.decision as VerificationDecision)
        : decisionIntent,
    notes: asString(payload.notes),
    riskFlags: Array.isArray(payload.riskFlags)
      ? asStringArray(payload.riskFlags, 0).slice(0, 3)
      : [],
    confidence: asConfidence(payload.confidence)
  };
}
