import type {
  PlanDraft,
  TaskItem,
  TaskOutputDraft,
  VerificationDecision,
  VerificationDraft
} from "@/lib/types";

function chooseTemplate(goal: string): PlanDraft {
  const normalized = goal.toLowerCase();

  if (normalized.includes("competitor") || normalized.includes("positioning")) {
    return {
      workspaceTitle: "Competitive positioning sprint",
      planSummary:
        "Break the research goal into fast, independently payable tasks so multiple agents can gather and validate market evidence in parallel.",
      tasks: [
        {
          title: "Define competitor scope",
          description: "Lock the comparison criteria, ICP lens, and the five competitors most worth analyzing.",
          assignedTo: "Research Agent",
          priority: "high",
          bountyUsdc: 0.0065,
          acceptanceCriteria: [
            "Five competitors named with rationale",
            "Evaluation rubric defined"
          ]
        },
        {
          title: "Capture positioning claims",
          description: "Pull each competitor's headline positioning, core promise, and target buyer language.",
          assignedTo: "Research Agent",
          priority: "high",
          bountyUsdc: 0.0085,
          acceptanceCriteria: [
            "Each competitor has a positioning note",
            "Evidence is concise and comparable"
          ]
        },
        {
          title: "Map pricing and packaging",
          description: "Summarize pricing anchors, packaging tiers, and obvious monetization differences.",
          assignedTo: "Synthesis Agent",
          priority: "medium",
          bountyUsdc: 0.006,
          acceptanceCriteria: [
            "Pricing observations captured",
            "Any missing data is called out"
          ]
        },
        {
          title: "Draft gap analysis",
          description: "Explain where the user's product can differentiate on value, workflow, or speed.",
          assignedTo: "Strategy Agent",
          priority: "high",
          bountyUsdc: 0.0095,
          acceptanceCriteria: [
            "At least three differentiation gaps",
            "Insights tie back to evidence"
          ]
        },
        {
          title: "Package executive summary",
          description: "Turn the research into a final summary that is ready for a founder or operator to act on.",
          assignedTo: "Verifier Agent",
          priority: "medium",
          bountyUsdc: 0.005,
          acceptanceCriteria: [
            "Summary is decision-ready",
            "Action recommendations included"
          ]
        }
      ]
    };
  }

  if (normalized.includes("meme") || normalized.includes("campaign")) {
    return {
      workspaceTitle: "Meme campaign command center",
      planSummary:
        "Generate a creator-style campaign plan where each deliverable can be independently claimed, reviewed, and paid as a nano-task.",
      tasks: [
        {
          title: "Audience meme scan",
          description: "Identify the target audience, current meme formats, and channels most likely to respond.",
          assignedTo: "Growth Agent",
          priority: "high",
          bountyUsdc: 0.006,
          acceptanceCriteria: [
            "Audience profile is clear",
            "At least three channel insights are listed"
          ]
        },
        {
          title: "Message hook generation",
          description: "Create the core campaign hooks and repeatable joke structures.",
          assignedTo: "Content Agent",
          priority: "high",
          bountyUsdc: 0.0075,
          acceptanceCriteria: [
            "Three strong hooks are proposed",
            "Hooks match audience context"
          ]
        },
        {
          title: "Asset prompt pack",
          description: "Draft image or short-form asset prompts that creators can execute quickly.",
          assignedTo: "Content Agent",
          priority: "medium",
          bountyUsdc: 0.0065,
          acceptanceCriteria: [
            "Prompt pack is structured",
            "Each prompt maps to one hook"
          ]
        },
        {
          title: "Launch calendar",
          description: "Turn the creative into a timed posting sequence with responsibilities and KPIs.",
          assignedTo: "Coordinator Agent",
          priority: "medium",
          bountyUsdc: 0.006,
          acceptanceCriteria: [
            "Posting sequence spans at least three beats",
            "KPIs are attached to each beat"
          ]
        },
        {
          title: "Quality and brand review",
          description: "Check the campaign for tone consistency, repetition risk, and measurable CTA clarity.",
          assignedTo: "Verifier Agent",
          priority: "medium",
          bountyUsdc: 0.0045,
          acceptanceCriteria: [
            "Top risks are called out",
            "Final launch recommendation included"
          ]
        }
      ]
    };
  }

  return {
    workspaceTitle: "General execution workflow",
    planSummary:
      "Split the goal into atomic, reviewable work packages so each contributor can earn small Arc-native payouts for verifiable progress.",
    tasks: [
      {
        title: "Clarify success criteria",
        description: "Turn the goal into a crisp scope, target output, and verification checklist.",
        assignedTo: "Coordinator Agent",
        priority: "high",
        bountyUsdc: 0.005,
        acceptanceCriteria: ["Scope is specific", "Success criteria are testable"]
      },
      {
        title: "Gather source inputs",
        description: "Collect the minimum facts, references, or examples needed to execute the work.",
        assignedTo: "Research Agent",
        priority: "high",
        bountyUsdc: 0.006,
        acceptanceCriteria: ["Relevant inputs are listed", "Missing information is explicit"]
      },
      {
        title: "Draft the first deliverable",
        description: "Produce the first concrete version of the requested output.",
        assignedTo: "Worker Agent",
        priority: "high",
        bountyUsdc: 0.008,
        acceptanceCriteria: ["Deliverable is tangible", "Obvious gaps are flagged"]
      },
      {
        title: "Refine and compress",
        description: "Make the output easier to use, shorter, and more decision-ready.",
        assignedTo: "Synthesis Agent",
        priority: "medium",
        bountyUsdc: 0.0055,
        acceptanceCriteria: ["Output is cleaner", "Key takeaways stand out"]
      },
      {
        title: "Final verification",
        description: "Review the output against the brief and approve or return it for changes.",
        assignedTo: "Verifier Agent",
        priority: "medium",
        bountyUsdc: 0.0045,
        acceptanceCriteria: ["Review note is written", "Final disposition is clear"]
      }
    ]
  };
}

export function createFallbackPlan(goal: string): PlanDraft {
  return chooseTemplate(goal);
}

export function createFallbackTaskOutput(goal: string, task: TaskItem): TaskOutputDraft {
  return {
    summary: `${task.title} completed for goal: ${goal.slice(0, 88)}`,
    artifact: [
      `Deliverable focus: ${task.description}`,
      `Assigned worker: ${task.assignedTo}`,
      `Verification lens: ${task.acceptanceCriteria.join(" | ")}`
    ].join("\n"),
    nextCheck: "Reviewer should confirm the output is specific enough to release the nano-payment.",
    confidence: task.priority === "high" ? "medium" : "low"
  };
}

export function createFallbackVerification(
  task: TaskItem,
  decisionIntent: VerificationDecision
): VerificationDraft {
  const approve = decisionIntent === "approved";

  return {
    decision: decisionIntent,
    notes: approve
      ? `Approved. ${task.title} has evidence attached and the output is usable for the next workflow step.`
      : `Changes requested. ${task.title} needs sharper evidence or clearer execution details before payout.`,
    riskFlags: approve
      ? ["AI-generated evidence should still be spot-checked before real settlement."]
      : ["Evidence quality below threshold", "Do not release funds until updated output is submitted"],
    confidence: approve ? "medium" : "high"
  };
}
