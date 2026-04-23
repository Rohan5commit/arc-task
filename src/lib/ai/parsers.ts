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

function cleanText(value: string): string {
  return value
    .replace(/
/g, "
")
    .replace(/[ 	]+
/g, "
")
    .replace(/
{3,}/g, "

")
    .trim();
}

function clampText(value: string, fallback: string, maxLength: number): string {
  const normalized = cleanText(value);

  if (!normalized) {
    return fallback;
  }

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
}

function looksLikeIsoTimestamp(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(value);
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
    title: clampText(asString(task.title), "Untitled task", 80),
    description: clampText(asString(task.description), "No description provided.", 200),
    assignedTo: clampText(asString(task.assignedTo, "Worker Agent"), "Worker Agent", 60),
    priority: (asString(task.priority, "medium") as PlannerTaskDraft["priority"]) || "medium",
    bountyUsdc: asBounty(task.bountyUsdc),
    acceptanceCriteria: asStringArray(task.acceptanceCriteria, 2)
      .slice(0, 3)
      .map((item) => clampText(item, "Review required", 120))
  };
}

export function normalizePlanDraft(value: unknown, goal: string): PlanDraft {
  const payload = ensureObject(value);
  const tasks = Array.isArray(payload.tasks) ? payload.tasks.map(normalizeTaskDraft) : [];

  if (tasks.length < 4) {
    throw new Error("Planning response returned fewer than four tasks.");
  }

  return {
    workspaceTitle: clampText(
      asString(payload.workspaceTitle, `${goal.slice(0, 48)} workflow`),
      `${goal.slice(0, 48)} workflow`,
      80
    ),
    planSummary: clampText(
      asString(
        payload.planSummary,
        "Coordinator-generated atomic work packages with proposed nano-bounties."
      ),
      "Coordinator-generated atomic work packages with proposed nano-bounties.",
      220
    ),
    tasks: tasks.slice(0, 6)
  };
}

export function normalizeTaskOutput(value: unknown): TaskOutputDraft {
  const payload = ensureObject(value);
  const nextCheck = clampText(asString(payload.nextCheck), "", 180);

  return {
    summary: clampText(asString(payload.summary), "Task output generated for review.", 180),
    artifact: clampText(
      asString(payload.artifact),
      "No artifact returned. Reviewer should request a clearer deliverable.",
      1200
    ),
    nextCheck:
      !nextCheck || looksLikeIsoTimestamp(nextCheck)
        ? "Reviewer should verify the artifact against the acceptance criteria before payout."
        : nextCheck,
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
    notes: clampText(
      asString(payload.notes),
      decisionIntent === "approved"
        ? "Approved for payout review."
        : "Changes requested before payout.",
      220
    ),
    riskFlags: Array.isArray(payload.riskFlags)
      ? asStringArray(payload.riskFlags, 0)
          .slice(0, 3)
          .map((item) => clampText(item, "Review flag", 120))
      : [],
    confidence: asConfidence(payload.confidence)
  };
}
