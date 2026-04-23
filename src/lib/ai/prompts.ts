import type { TaskItem, VerificationDecision } from "@/lib/types";
import type { ChatMessage } from "@/lib/ai/nim-client";

export function buildPlanningMessages(goal: string): ChatMessage[] {
  return [
    {
      role: "system",
      content:
        "You are the ArcTask coordinator. Return only valid JSON. No markdown, no prose outside JSON. Schema: { workspaceTitle: string, planSummary: string, tasks: [{ title: string, description: string, assignedTo: string, priority: 'low' | 'medium' | 'high', bountyUsdc: number, acceptanceCriteria: string[] }] }. Rules: produce 4 to 6 atomic tasks that can each be paid independently. Keep workspaceTitle under 70 characters, planSummary under 180 characters, and each task description under 160 characters. Keep bountyUsdc between 0.0025 and 0.03 to model nano-payments on Arc. Favor assignedTo values like Research Agent, Synthesis Agent, Content Agent, Growth Agent, Verifier Agent, or Human Reviewer. Acceptance criteria must be concrete and testable. Do not return nested JSON strings."
    },
    {
      role: "user",
      content: `Goal: ${goal}
Return the JSON plan now.`
    }
  ];
}

export function buildTaskOutputMessages(goal: string, task: TaskItem): ChatMessage[] {
  return [
    {
      role: "system",
      content:
        "You are a worker agent inside ArcTask. Return only valid JSON with schema { summary: string, artifact: string, nextCheck: string, confidence: 'low' | 'medium' | 'high' }. Keep summary under 140 characters. artifact must be plain text with short lines separated by newline characters, not nested JSON and not markdown fences. nextCheck must be one sentence that starts with 'Reviewer should'."
    },
    {
      role: "user",
      content:
        `Goal: ${goal}
Task title: ${task.title}
Task description: ${task.description}
Acceptance criteria: ${task.acceptanceCriteria.join("; ")}
Assigned worker: ${task.assignedTo}
Return the JSON output now.`
    }
  ];
}

export function buildVerificationMessages(
  goal: string,
  task: TaskItem,
  decisionIntent: VerificationDecision
): ChatMessage[] {
  return [
    {
      role: "system",
      content:
        "You are the verifier agent inside ArcTask. Return only valid JSON with schema { decision: 'approved' | 'changes_requested', notes: string, riskFlags: string[], confidence: 'low' | 'medium' | 'high' }. Respect the decision intent from the user while writing honest verification notes. Keep notes under 180 characters and limit riskFlags to 0 to 3 short strings. No markdown fences."
    },
    {
      role: "user",
      content:
        `Goal: ${goal}
Task: ${task.title}
Decision intent: ${decisionIntent}
Acceptance criteria: ${task.acceptanceCriteria.join("; ")}
Submitted output summary: ${task.output?.summary ?? "No summary"}
Submitted output artifact: ${task.output?.artifact ?? "No artifact"}
Return the JSON verification now.`
    }
  ];
}
