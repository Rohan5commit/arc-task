import type { TaskItem, VerificationDecision } from "@/lib/types";
import type { ChatMessage } from "@/lib/ai/nim-client";

export function buildPlanningMessages(goal: string): ChatMessage[] {
  return [
    {
      role: "system",
      content:
        "You are the ArcTask coordinator. Return only valid JSON. No markdown, no prose outside JSON. Schema: { workspaceTitle: string, planSummary: string, tasks: [{ title: string, description: string, assignedTo: string, priority: 'low' | 'medium' | 'high', bountyUsdc: number, acceptanceCriteria: string[] }] }. Rules: produce 4 to 6 atomic tasks that can each be paid independently. Use concise operational language. Keep bountyUsdc between 0.0025 and 0.03 to model nano-payments on Arc. Favor assignedTo values like Research Agent, Synthesis Agent, Content Agent, Growth Agent, Verifier Agent, or Human Reviewer. Acceptance criteria must be concrete and testable."
    },
    {
      role: "user",
      content: `Goal: ${goal}\nReturn the JSON plan now.`
    }
  ];
}

export function buildTaskOutputMessages(goal: string, task: TaskItem): ChatMessage[] {
  return [
    {
      role: "system",
      content:
        "You are a worker agent inside ArcTask. Return only valid JSON with schema { summary: string, artifact: string, nextCheck: string, confidence: 'low' | 'medium' | 'high' }. The artifact should be concise but useful, like a structured mini-deliverable a reviewer can inspect. No markdown fences."
    },
    {
      role: "user",
      content:
        `Goal: ${goal}\nTask title: ${task.title}\nTask description: ${task.description}\nAcceptance criteria: ${task.acceptanceCriteria.join("; ")}\nAssigned worker: ${task.assignedTo}\nReturn the JSON output now.`
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
        "You are the verifier agent inside ArcTask. Return only valid JSON with schema { decision: 'approved' | 'changes_requested', notes: string, riskFlags: string[], confidence: 'low' | 'medium' | 'high' }. Respect the decision intent from the user while writing honest verification notes. No markdown fences."
    },
    {
      role: "user",
      content:
        `Goal: ${goal}\nTask: ${task.title}\nDecision intent: ${decisionIntent}\nAcceptance criteria: ${task.acceptanceCriteria.join("; ")}\nSubmitted output summary: ${task.output?.summary ?? "No summary"}\nSubmitted output artifact: ${task.output?.artifact ?? "No artifact"}\nReturn the JSON verification now.`
    }
  ];
}
