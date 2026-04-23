import type { Workspace } from "@/lib/types";
import { reconcileWorkspace } from "@/lib/utils/task-helpers";

const marketResearchWorkspace: Workspace = reconcileWorkspace({
  id: "workspace-market",
  name: "Competitive positioning sprint",
  goal: "Research top 5 competitors and summarize positioning for a new AI workflow product.",
  planSummary:
    "The coordinator split the research into independently payable work packages so evidence collection, synthesis, verification, and payout can happen in a clear sequence.",
  aiNotice:
    "AI coordinator suggestions propose task scope and nano-bounties. Humans still approve verification and payment release.",
  createdAt: "2026-04-23T07:10:00.000Z",
  paymentMode: "demo",
  tasks: [
    {
      id: "task-1",
      title: "Define competitor scope",
      description: "Lock the target ICP, comparison criteria, and five competitors worth tracking.",
      assignedTo: "Research Agent",
      priority: "high",
      bountyUsdc: 0.0065,
      status: "paid",
      acceptanceCriteria: ["Five competitors selected", "Evaluation rubric approved"],
      output: {
        summary: "Scoped the comparison around AI workflow tools selling to lean ops teams.",
        artifact:
          "Competitors: Relay, Pipedream, Zapier AI Actions, Lindy, and Gumloop.\nRubric: buyer segment, activation path, pricing anchor, and differentiator.",
        nextCheck: "Move into message extraction.",
        confidence: "high",
        source: "llm",
        generatedAt: "2026-04-23T07:12:00.000Z"
      },
      verification: {
        decision: "approved",
        notes: "Scope is tight enough to anchor the rest of the workflow.",
        riskFlags: ["Minor pricing assumptions still need validation downstream."],
        confidence: "medium",
        source: "llm",
        reviewedBy: "Verifier Agent",
        generatedAt: "2026-04-23T07:15:00.000Z"
      }
    },
    {
      id: "task-2",
      title: "Capture positioning claims",
      description: "Pull each competitor's headline positioning, core promise, and buyer language.",
      assignedTo: "Research Agent",
      priority: "high",
      bountyUsdc: 0.0085,
      status: "submitted",
      acceptanceCriteria: ["Each competitor has a positioning note", "Evidence is concise and comparable"],
      output: {
        summary: "Positioning matrix drafted for all five competitors.",
        artifact:
          "Relay: AI workflow automation for revenue teams.\nPipedream: developer-first integrations with code control.\nZapier AI Actions: broad no-code automation with AI steps.\nLindy: executive-assistant style agent workflows.\nGumloop: visual AI pipelines for growth and ops.",
        nextCheck: "Verifier should confirm the claims are framed consistently and flag missing evidence.",
        confidence: "medium",
        source: "llm",
        generatedAt: "2026-04-23T07:22:00.000Z"
      }
    },
    {
      id: "task-3",
      title: "Map pricing and packaging",
      description: "Summarize pricing anchors, packaging tiers, and obvious monetization differences.",
      assignedTo: "Synthesis Agent",
      priority: "medium",
      bountyUsdc: 0.006,
      status: "queued",
      acceptanceCriteria: ["Pricing observations captured", "Any missing data is called out"]
    },
    {
      id: "task-4",
      title: "Draft gap analysis",
      description: "Explain where the product can differentiate on value, workflow, or speed.",
      assignedTo: "Strategy Agent",
      priority: "high",
      bountyUsdc: 0.0095,
      status: "queued",
      acceptanceCriteria: ["At least three differentiation gaps", "Insights tie back to evidence"]
    },
    {
      id: "task-5",
      title: "Package executive summary",
      description: "Turn the research into a final summary that is ready for a founder or operator to act on.",
      assignedTo: "Verifier Agent",
      priority: "medium",
      bountyUsdc: 0.005,
      status: "queued",
      acceptanceCriteria: ["Summary is decision-ready", "Action recommendations included"]
    }
  ],
  ledger: [
    {
      id: "ledger-1",
      taskId: "task-1",
      taskTitle: "Define competitor scope",
      payee: "Research Agent",
      amountUsdc: 0.0065,
      adapter: "demo",
      status: "settled",
      txHash: "0xd4c4fdcebb6d7452f620fa6bc476a130f9a9aa9fe2b640d4b6d19b6fd1f2c032",
      memo: "ArcTask demo nano-payment receipt for Define competitor scope",
      createdAt: "2026-04-23T07:16:00.000Z",
      isMock: true
    }
  ],
  activity: [
    {
      id: "activity-1",
      type: "payment",
      title: "Nano-payment settled",
      detail: "Research Agent received 0.0065 USDC on the demo Arc adapter after verification.",
      tone: "success",
      createdAt: "2026-04-23T07:16:00.000Z"
    },
    {
      id: "activity-2",
      type: "verifier",
      title: "Verifier approved scope task",
      detail: "Task 1 cleared review and moved to payout.",
      tone: "success",
      createdAt: "2026-04-23T07:15:00.000Z"
    },
    {
      id: "activity-3",
      type: "worker",
      title: "Research Agent submitted positioning matrix",
      detail: "Task 2 is ready for verification.",
      tone: "info",
      createdAt: "2026-04-23T07:22:00.000Z"
    }
  ],
  wallet: {
    mode: "demo",
    treasuryName: "ArcTask Treasury",
    address: "0xA7C7000000000000000000000000000000000A7C",
    networkLabel: "Arc Testnet (demo mode)",
    adapterLabel: "Mock Arc adapter",
    explorerBaseUrl: "https://testnet.arcscan.app/tx/",
    startingBalanceUsdc: 2.75,
    currentBalanceUsdc: 0,
    reservedUsdc: 0,
    availableUsdc: 0
  },
  metrics: {
    totalTasks: 0,
    openTasks: 0,
    verificationQueue: 0,
    paidTasks: 0,
    totalBudgetUsdc: 0,
    paidOutUsdc: 0,
    avgBountyUsdc: 0
  }
});

const memeCampaignWorkspace: Workspace = reconcileWorkspace({
  id: "workspace-meme",
  name: "Meme campaign command center",
  goal: "Generate a meme campaign plan for launching a new Arc-native agent marketplace.",
  planSummary:
    "The coordinator set up micro-bountied creative tasks so audience research, asset prompts, launch scheduling, and review can be completed in parallel.",
  aiNotice:
    "All task proposals, outputs, and verification notes are AI-assisted suggestions for demo purposes.",
  createdAt: "2026-04-23T08:00:00.000Z",
  paymentMode: "demo",
  tasks: [
    {
      id: "task-1",
      title: "Audience meme scan",
      description: "Identify the target audience, meme formats, and channels most likely to respond.",
      assignedTo: "Growth Agent",
      priority: "high",
      bountyUsdc: 0.006,
      status: "in_progress",
      acceptanceCriteria: ["Audience profile is clear", "At least three channel insights are listed"]
    },
    {
      id: "task-2",
      title: "Message hook generation",
      description: "Create the core campaign hooks and repeatable joke structures.",
      assignedTo: "Content Agent",
      priority: "high",
      bountyUsdc: 0.0075,
      status: "queued",
      acceptanceCriteria: ["Three strong hooks are proposed", "Hooks match audience context"]
    },
    {
      id: "task-3",
      title: "Asset prompt pack",
      description: "Draft image and short-form asset prompts that creators can execute quickly.",
      assignedTo: "Content Agent",
      priority: "medium",
      bountyUsdc: 0.0065,
      status: "queued",
      acceptanceCriteria: ["Prompt pack is structured", "Each prompt maps to one hook"]
    },
    {
      id: "task-4",
      title: "Launch calendar",
      description: "Turn the creative into a timed posting sequence with responsibilities and KPIs.",
      assignedTo: "Coordinator Agent",
      priority: "medium",
      bountyUsdc: 0.006,
      status: "queued",
      acceptanceCriteria: ["Posting sequence spans at least three beats", "KPIs are attached to each beat"]
    },
    {
      id: "task-5",
      title: "Quality and brand review",
      description: "Check the campaign for tone consistency, repetition risk, and CTA clarity.",
      assignedTo: "Verifier Agent",
      priority: "medium",
      bountyUsdc: 0.0045,
      status: "queued",
      acceptanceCriteria: ["Top risks are called out", "Final launch recommendation included"]
    }
  ],
  ledger: [],
  activity: [
    {
      id: "activity-4",
      type: "planner",
      title: "Creative workflow minted",
      detail: "The coordinator created five nano-bountied tasks for the campaign sprint.",
      tone: "success",
      createdAt: "2026-04-23T08:01:00.000Z"
    },
    {
      id: "activity-5",
      type: "worker",
      title: "Growth Agent started discovery",
      detail: "Audience and channel scan is now in progress.",
      tone: "info",
      createdAt: "2026-04-23T08:03:00.000Z"
    }
  ],
  wallet: {
    mode: "demo",
    treasuryName: "ArcTask Treasury",
    address: "0xA7C7000000000000000000000000000000000A7C",
    networkLabel: "Arc Testnet (demo mode)",
    adapterLabel: "Mock Arc adapter",
    explorerBaseUrl: "https://testnet.arcscan.app/tx/",
    startingBalanceUsdc: 2.15,
    currentBalanceUsdc: 0,
    reservedUsdc: 0,
    availableUsdc: 0
  },
  metrics: {
    totalTasks: 0,
    openTasks: 0,
    verificationQueue: 0,
    paidTasks: 0,
    totalBudgetUsdc: 0,
    paidOutUsdc: 0,
    avgBountyUsdc: 0
  }
});

export const seedWorkspaces: Workspace[] = [marketResearchWorkspace, memeCampaignWorkspace];

export function getSeedWorkspace(id: string): Workspace {
  const match = seedWorkspaces.find((workspace) => workspace.id === id) ?? seedWorkspaces[0];
  return structuredClone(match);
}
