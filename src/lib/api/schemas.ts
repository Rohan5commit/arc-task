import type {
  CompletionConfidence,
  TaskItem,
  TaskOutput,
  VerificationDecision,
  VerificationRecord
} from "@/lib/types";
import { normalizePriority, normalizeStatus, sanitizeGoal } from "@/lib/utils/task-helpers";

interface ValidationFailure {
  ok: false;
  error: string;
  status: number;
}

interface ValidationSuccess<T> {
  ok: true;
  data: T;
}

export type ValidationResult<T> = ValidationFailure | ValidationSuccess<T>;

type JsonRecord = Record<string, unknown>;

const CONFIDENCE_VALUES: CompletionConfidence[] = ["low", "medium", "high"];

function success<T>(data: T): ValidationResult<T> {
  return { ok: true, data };
}

function failure<T>(error: string, status = 400): ValidationResult<T> {
  return { ok: false, error, status };
}

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : null;
}

function asString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized ? normalized : null;
}

function asOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function asNumber(value: unknown): number | null {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Number(parsed) : null;
}

function asStringArray(value: unknown, minimum = 1): string[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const items = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);

  return items.length >= minimum ? items : null;
}

function asConfidence(value: unknown): CompletionConfidence {
  return CONFIDENCE_VALUES.includes(value as CompletionConfidence)
    ? (value as CompletionConfidence)
    : "medium";
}

function parseTaskOutput(value: unknown): TaskOutput | undefined {
  const record = asRecord(value);

  if (!record) {
    return undefined;
  }

  const summary = asString(record.summary);
  const artifact = asString(record.artifact);
  const nextCheck = asString(record.nextCheck);

  if (!summary || !artifact || !nextCheck) {
    return undefined;
  }

  return {
    summary,
    artifact,
    nextCheck,
    confidence: asConfidence(record.confidence),
    source: record.source === "llm" ? "llm" : "fallback",
    generatedAt: asOptionalString(record.generatedAt) ?? new Date().toISOString()
  };
}

function parseVerificationRecord(value: unknown): VerificationRecord | undefined {
  const record = asRecord(value);

  if (!record) {
    return undefined;
  }

  const notes = asString(record.notes);

  if (!notes) {
    return undefined;
  }

  return {
    decision:
      record.decision === "changes_requested" ? "changes_requested" : "approved",
    notes,
    riskFlags: asStringArray(record.riskFlags, 0) ?? [],
    confidence: asConfidence(record.confidence),
    source: record.source === "llm" ? "llm" : "fallback",
    reviewedBy: asOptionalString(record.reviewedBy) ?? "Verifier Agent",
    generatedAt: asOptionalString(record.generatedAt) ?? new Date().toISOString()
  };
}

function parseTaskItem(value: unknown): TaskItem | null {
  const record = asRecord(value);

  if (!record) {
    return null;
  }

  const id = asString(record.id);
  const title = asString(record.title);
  const description = asString(record.description);
  const assignedTo = asString(record.assignedTo);
  const priority = asOptionalString(record.priority);
  const bountyUsdc = asNumber(record.bountyUsdc);
  const status = asOptionalString(record.status);
  const acceptanceCriteria = asStringArray(record.acceptanceCriteria, 1);

  if (
    !id ||
    !title ||
    !description ||
    !assignedTo ||
    !priority ||
    bountyUsdc === null ||
    !status ||
    !acceptanceCriteria
  ) {
    return null;
  }

  const task: TaskItem = {
    id,
    title,
    description,
    assignedTo,
    priority: normalizePriority(priority),
    bountyUsdc: Number(bountyUsdc.toFixed(4)),
    status: normalizeStatus(status),
    acceptanceCriteria: acceptanceCriteria.slice(0, 3)
  };

  const output = parseTaskOutput(record.output);
  const verification = parseVerificationRecord(record.verification);

  if (output) {
    task.output = output;
  }

  if (verification) {
    task.verification = verification;
  }

  return task;
}

export async function readJsonBody(request: Request): Promise<ValidationResult<unknown>> {
  try {
    return success(await request.json());
  } catch {
    return failure("Request body must be valid JSON.");
  }
}

function parseGoal(raw: unknown, minimumLength = 12): ValidationResult<string> {
  const record = asRecord(raw);

  if (!record) {
    return failure("Request body must be a JSON object.");
  }

  const goal = sanitizeGoal(String(record.goal ?? ""));

  if (goal.length < minimumLength) {
    return failure(`Goal must be at least ${minimumLength} characters long.`);
  }

  return success(goal);
}

export function parsePlanningPayload(raw: unknown): ValidationResult<{ goal: string }> {
  const goal = parseGoal(raw);
  return goal.ok ? success({ goal: goal.data }) : goal;
}

function parseGoalAndTask(raw: unknown): ValidationResult<{ goal: string; task: TaskItem }> {
  const goal = parseGoal(raw);

  if (!goal.ok) {
    return goal;
  }

  const record = asRecord(raw);
  const task = parseTaskItem(record?.task);

  if (!task) {
    return failure("Task payload is missing required fields.");
  }

  return success({ goal: goal.data, task });
}

export function parseTaskOutputPayload(
  raw: unknown
): ValidationResult<{ goal: string; task: TaskItem }> {
  return parseGoalAndTask(raw);
}

export function parseVerificationPayload(
  raw: unknown
): ValidationResult<{
  goal: string;
  task: TaskItem;
  decisionIntent: VerificationDecision;
}> {
  const parsed = parseGoalAndTask(raw);

  if (!parsed.ok) {
    return parsed;
  }

  const record = asRecord(raw);
  const decisionIntent =
    record?.decisionIntent === "changes_requested" ? "changes_requested" : "approved";

  return success({
    ...parsed.data,
    decisionIntent
  });
}

export function parsePayoutPayload(
  raw: unknown
): ValidationResult<{ task: TaskItem; payee: string }> {
  const record = asRecord(raw);

  if (!record) {
    return failure("Request body must be a JSON object.");
  }

  const task = parseTaskItem(record.task);
  const payee = asString(record.payee);

  if (!task) {
    return failure("Task payload is missing required fields.");
  }

  if (!payee) {
    return failure("Payee is required.");
  }

  return success({ task, payee });
}
