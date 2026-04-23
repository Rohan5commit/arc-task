import type {
  ActivityItem,
  ActivityTone,
  ActivityType,
  LedgerEntry,
  PaymentMode,
  PlanDraft,
  TaskItem,
  TaskPriority,
  TaskStatus,
  WalletState,
  Workspace
} from "@/lib/types";
import { createId } from "@/lib/utils/ids";

function round(value: number): number {
  return Number(value.toFixed(4));
}

export const STATUS_COLUMNS: TaskStatus[] = [
  "queued",
  "in_progress",
  "submitted",
  "verified",
  "paid",
  "rejected"
];

export function sanitizeGoal(goal: string): string {
  return goal.trim().replace(/\s+/g, " ");
}

export function createActivity(
  type: ActivityType,
  title: string,
  detail: string,
  tone: ActivityTone = "info"
): ActivityItem {
  return {
    id: createId("activity"),
    type,
    title,
    detail,
    tone,
    createdAt: new Date().toISOString()
  };
}

export function normalizePriority(priority: string): TaskPriority {
  if (priority === "high" || priority === "low") {
    return priority;
  }

  return "medium";
}

export function normalizeStatus(status: string): TaskStatus {
  const allowed = new Set<TaskStatus>(STATUS_COLUMNS);

  if (allowed.has(status as TaskStatus)) {
    return status as TaskStatus;
  }

  return "queued";
}

export function buildWorkspaceFromPlan(
  goal: string,
  plan: PlanDraft,
  paymentMode: PaymentMode = "demo"
): Workspace {
  const createdAt = new Date().toISOString();
  const tasks = plan.tasks.slice(0, 6).map((task, index): TaskItem => ({
    id: `task-${index + 1}`,
    title: task.title.trim(),
    description: task.description.trim(),
    assignedTo: task.assignedTo.trim(),
    priority: normalizePriority(task.priority),
    bountyUsdc: round(Math.min(Math.max(task.bountyUsdc, 0.0025), 0.03)),
    status: index === 0 ? "in_progress" : "queued",
    acceptanceCriteria: task.acceptanceCriteria.slice(0, 3).map((item) => item.trim())
  }));

  const totalBudgetUsdc = round(tasks.reduce((sum, task) => sum + task.bountyUsdc, 0));
  const startingBalanceUsdc = round(Math.max(totalBudgetUsdc * 3.4, 1.8));
  const wallet: WalletState = {
    mode: paymentMode,
    treasuryName: "ArcTask Treasury",
    address: "0xA7C7000000000000000000000000000000000A7C",
    networkLabel: paymentMode === "demo" ? "Arc Testnet (demo mode)" : "Arc Testnet",
    adapterLabel: paymentMode === "demo" ? "Mock Arc adapter" : "Arc testnet adapter",
    explorerBaseUrl: "https://testnet.arcscan.app/tx/",
    startingBalanceUsdc,
    currentBalanceUsdc: startingBalanceUsdc,
    reservedUsdc: totalBudgetUsdc,
    availableUsdc: round(startingBalanceUsdc - totalBudgetUsdc)
  };

  const workspace: Workspace = {
    id: createId("workspace"),
    name: plan.workspaceTitle.trim() || "ArcTask Workspace",
    goal,
    planSummary: plan.planSummary.trim(),
    aiNotice:
      "AI coordinator suggestions propose task granularity, worker assignment, and nano-payment amounts. Review before any real settlement.",
    createdAt,
    paymentMode,
    tasks,
    ledger: [],
    activity: [
      createActivity(
        "planner",
        "Coordinator decomposed goal",
        "Task graph and proposed nano-bounties are ready for review.",
        "success"
      ),
      createActivity(
        "system",
        "Demo treasury reserved budget",
        `Reserved ${totalBudgetUsdc.toFixed(4)} USDC for this workflow on the mock Arc adapter.`,
        "info"
      )
    ],
    wallet,
    metrics: {
      totalTasks: 0,
      openTasks: 0,
      verificationQueue: 0,
      paidTasks: 0,
      totalBudgetUsdc: 0,
      paidOutUsdc: 0,
      avgBountyUsdc: 0
    }
  };

  return reconcileWorkspace(workspace);
}

export function reconcileWorkspace(workspace: Workspace): Workspace {
  const totalBudgetUsdc = round(
    workspace.tasks.reduce((sum, task) => sum + task.bountyUsdc, 0)
  );
  const paidOutUsdc = round(
    workspace.ledger
      .filter((entry) => entry.status === "settled")
      .reduce((sum, entry) => sum + entry.amountUsdc, 0)
  );
  const reservedUsdc = round(
    workspace.tasks
      .filter((task) => task.status !== "paid" && task.status !== "rejected")
      .reduce((sum, task) => sum + task.bountyUsdc, 0)
  );
  const currentBalanceUsdc = round(workspace.wallet.startingBalanceUsdc - paidOutUsdc);
  const availableUsdc = round(Math.max(currentBalanceUsdc - reservedUsdc, 0));

  return {
    ...workspace,
    wallet: {
      ...workspace.wallet,
      currentBalanceUsdc,
      reservedUsdc,
      availableUsdc
    },
    metrics: {
      totalTasks: workspace.tasks.length,
      openTasks: workspace.tasks.filter((task) => task.status !== "paid").length,
      verificationQueue: workspace.tasks.filter((task) => task.status === "submitted").length,
      paidTasks: workspace.tasks.filter((task) => task.status === "paid").length,
      totalBudgetUsdc,
      paidOutUsdc,
      avgBountyUsdc: workspace.tasks.length ? round(totalBudgetUsdc / workspace.tasks.length) : 0
    }
  };
}

export function groupTasksByStatus(tasks: TaskItem[]): Record<TaskStatus, TaskItem[]> {
  return STATUS_COLUMNS.reduce(
    (accumulator, status) => {
      accumulator[status] = tasks.filter((task) => task.status === status);
      return accumulator;
    },
    {
      queued: [],
      in_progress: [],
      submitted: [],
      verified: [],
      paid: [],
      rejected: []
    } as Record<TaskStatus, TaskItem[]>
  );
}

export function upsertTask(workspace: Workspace, taskId: string, updater: (task: TaskItem) => TaskItem): Workspace {
  return reconcileWorkspace({
    ...workspace,
    tasks: workspace.tasks.map((task) => (task.id === taskId ? updater(task) : task))
  });
}

export function appendActivity(workspace: Workspace, item: ActivityItem): Workspace {
  return {
    ...workspace,
    activity: [item, ...workspace.activity].slice(0, 12)
  };
}

export function appendLedgerEntry(workspace: Workspace, entry: LedgerEntry): Workspace {
  return reconcileWorkspace({
    ...workspace,
    ledger: [entry, ...workspace.ledger]
  });
}
