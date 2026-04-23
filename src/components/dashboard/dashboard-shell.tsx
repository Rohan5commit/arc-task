"use client";

import { useMemo, useState } from "react";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { GoalComposer } from "@/components/dashboard/goal-composer";
import { LedgerPanel } from "@/components/dashboard/ledger-panel";
import { StatCard } from "@/components/dashboard/stat-card";
import { TaskCard } from "@/components/dashboard/task-card";
import { WalletPanel } from "@/components/dashboard/wallet-panel";
import { Panel } from "@/components/ui/panel";
import { seedWorkspaces, getSeedWorkspace } from "@/lib/demo/seed-workspaces";
import { createPaymentAdapter } from "@/lib/payments/create-adapter";
import type {
  PlanningApiResponse,
  TaskItem,
  TaskOutputApiResponse,
  VerificationDecision,
  VerifyApiResponse,
  Workspace
} from "@/lib/types";
import { formatUsdc } from "@/lib/utils/format";
import {
  appendActivity,
  appendLedgerEntry,
  createActivity,
  groupTasksByStatus,
  STATUS_COLUMNS,
  upsertTask
} from "@/lib/utils/task-helpers";
import { createId } from "@/lib/utils/ids";

interface DashboardShellProps {
  initialWorkspace: Workspace;
}

export function DashboardShell({ initialWorkspace }: DashboardShellProps) {
  const [workspace, setWorkspace] = useState<Workspace>(() => structuredClone(initialWorkspace));
  const [goalDraft, setGoalDraft] = useState(initialWorkspace.goal);
  const [isPlanning, setIsPlanning] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null);
  const [runtimeLabel, setRuntimeLabel] = useState(
    "Loaded seeded workspace. AI outputs and payouts below are safe demo suggestions."
  );

  const groupedTasks = useMemo(() => groupTasksByStatus(workspace.tasks), [workspace.tasks]);

  function loadSeedWorkspace(id: string) {
    const nextWorkspace = getSeedWorkspace(id);
    setWorkspace(nextWorkspace);
    setGoalDraft(nextWorkspace.goal);
    setPlanError(null);
    setActionError(null);
    setRuntimeLabel("Loaded seeded demo workspace. You can keep iterating or create a new goal.");
  }

  async function handlePlanGoal() {
    setPlanError(null);
    setActionError(null);
    setIsPlanning(true);

    try {
      const response = await fetch("/api/plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          goal: goalDraft
        })
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const payload = (await response.json()) as PlanningApiResponse;
      setWorkspace(payload.workspace);
      setGoalDraft(payload.workspace.goal);
      setRuntimeLabel(
        `Planner source: ${payload.source === "llm" ? "live NVIDIA NIM" : "deterministic fallback"} · model: ${payload.model}`
      );
    } catch (error) {
      setPlanError(error instanceof Error ? error.message : "Planning failed.");
    } finally {
      setIsPlanning(false);
    }
  }

  function updateTask(
    taskId: string,
    mutator: (task: TaskItem) => TaskItem,
    activityTitle: string,
    activityDetail: string
  ) {
    setWorkspace((current) =>
      appendActivity(
        upsertTask(current, taskId, mutator),
        createActivity("system", activityTitle, activityDetail, "info")
      )
    );
  }

  async function handleGenerateOutput(taskId: string) {
    setActionError(null);
    setBusyTaskId(taskId);
    const task = workspace.tasks.find((item) => item.id === taskId);

    if (!task) {
      setBusyTaskId(null);
      return;
    }

    try {
      const response = await fetch("/api/task-output", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          goal: workspace.goal,
          task
        })
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const payload = (await response.json()) as TaskOutputApiResponse;
      setWorkspace((current) =>
        appendActivity(
          upsertTask(current, payload.taskId, (item) => ({
            ...item,
            status: "submitted",
            output: payload.output
          })),
          createActivity(
            "worker",
            "Worker submitted output",
            `${task.title} now awaits verification. Generated via ${payload.output.source} mode.`,
            "success"
          )
        )
      );
      setRuntimeLabel(`Latest worker output model: ${payload.model}`);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Failed to generate output.");
    } finally {
      setBusyTaskId(null);
    }
  }

  async function handleVerify(taskId: string, decisionIntent: VerificationDecision) {
    setActionError(null);
    setBusyTaskId(taskId);
    const task = workspace.tasks.find((item) => item.id === taskId);

    if (!task) {
      setBusyTaskId(null);
      return;
    }

    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          goal: workspace.goal,
          task,
          decisionIntent
        })
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const payload = (await response.json()) as VerifyApiResponse;
      setWorkspace((current) =>
        appendActivity(
          upsertTask(current, payload.taskId, (item) => ({
            ...item,
            status: payload.verification.decision === "approved" ? "verified" : "rejected",
            verification: payload.verification
          })),
          createActivity(
            "verifier",
            payload.verification.decision === "approved" ? "Verifier approved output" : "Verifier requested changes",
            payload.verification.notes,
            payload.verification.decision === "approved" ? "success" : "warning"
          )
        )
      );
      setRuntimeLabel(`Latest verification model: ${payload.model}`);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Verification failed.");
    } finally {
      setBusyTaskId(null);
    }
  }

  async function handlePay(taskId: string) {
    setActionError(null);
    setBusyTaskId(taskId);
    const task = workspace.tasks.find((item) => item.id === taskId);

    if (!task) {
      setBusyTaskId(null);
      return;
    }

    try {
      const adapter = createPaymentAdapter(workspace.paymentMode);
      const receipt = await adapter.settleTaskPayout({
        task,
        payee: task.assignedTo
      });

      setWorkspace((current) => {
        const withPaidTask = upsertTask(current, taskId, (item) => ({
          ...item,
          status: "paid"
        }));

        const withLedger = appendLedgerEntry(withPaidTask, {
          id: createId("ledger"),
          taskId,
          taskTitle: task.title,
          payee: task.assignedTo,
          amountUsdc: receipt.amountUsdc,
          adapter: receipt.adapter,
          status: receipt.status,
          txHash: receipt.txHash,
          memo: receipt.memo,
          createdAt: receipt.settledAt,
          explorerUrl: receipt.explorerUrl
        });

        return appendActivity(
          withLedger,
          createActivity(
            "payment",
            "Nano-payment settled",
            `${task.assignedTo} received ${receipt.amountUsdc.toFixed(4)} USDC via ${adapter.label}.`,
            "success"
          )
        );
      });
      setRuntimeLabel("Payout settled on the demo Arc adapter. Receipt stored in the ledger.");
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Payment failed.");
    } finally {
      setBusyTaskId(null);
    }
  }

  function handleStartTask(taskId: string) {
    updateTask(
      taskId,
      (task) => ({
        ...task,
        status: "in_progress"
      }),
      "Task started",
      "A worker claimed this task and began execution."
    );
  }

  function handleRequeue(taskId: string) {
    updateTask(
      taskId,
      (task) => ({
        ...task,
        status: "queued",
        output: undefined,
        verification: undefined
      }),
      "Task re-queued",
      "The task is available for another execution cycle."
    );
  }

  return (
    <div className="space-y-6">
      <GoalComposer
        goal={goalDraft}
        isPlanning={isPlanning}
        error={planError}
        onGoalChange={setGoalDraft}
        onPlanGoal={handlePlanGoal}
        onLoadSeed={loadSeedWorkspace}
      />

      <div className="rounded-3xl border border-cyan-400/10 bg-cyan-400/8 px-5 py-4 text-sm text-cyan-50/90">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-semibold text-cyan-100">{workspace.name}</p>
            <p>{workspace.aiNotice}</p>
          </div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/75">{runtimeLabel}</p>
        </div>
      </div>

      {actionError ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {actionError}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total budget"
          value={formatUsdc(workspace.metrics.totalBudgetUsdc)}
          hint="Coordinator-assigned nano-bounty pool"
        />
        <StatCard
          label="Paid out"
          value={formatUsdc(workspace.metrics.paidOutUsdc)}
          hint="Released after verification"
        />
        <StatCard
          label="Verification queue"
          value={String(workspace.metrics.verificationQueue)}
          hint="Submitted tasks awaiting approval"
        />
        <StatCard
          label="Treasury free"
          value={formatUsdc(workspace.wallet.availableUsdc)}
          hint="Balance available for future tasks"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <Panel eyebrow="Task board" title="Atomic work packages">
          <div className="mb-5 flex flex-wrap gap-2">
            {seedWorkspaces.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => loadSeedWorkspace(item.id)}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10"
              >
                {item.name}
              </button>
            ))}
          </div>

          {workspace.tasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/3 p-6 text-sm text-slate-400">
              No tasks yet. Submit a goal to see the agentic workflow populate.
            </div>
          ) : (
            <div className="overflow-x-auto pb-2">
              <div className="grid min-w-[1100px] gap-4 xl:min-w-0 xl:grid-cols-3 2xl:grid-cols-6">
                {STATUS_COLUMNS.map((status) => (
                  <div key={status} className="space-y-3">
                    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/4 px-3 py-2">
                      <p className="text-sm font-semibold capitalize text-slate-100">
                        {status.replaceAll("_", " ")}
                      </p>
                      <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs text-slate-300">
                        {groupedTasks[status].length}
                      </span>
                    </div>

                    {groupedTasks[status].length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/50 p-4 text-sm text-slate-500">
                        No tasks here yet.
                      </div>
                    ) : (
                      groupedTasks[status].map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          isBusy={busyTaskId === task.id}
                          onStartTask={handleStartTask}
                          onGenerateOutput={handleGenerateOutput}
                          onApprove={(id) => handleVerify(id, "approved")}
                          onReject={(id) => handleVerify(id, "changes_requested")}
                          onPay={handlePay}
                          onRequeue={handleRequeue}
                        />
                      ))
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Panel>

        <div className="space-y-6">
          <WalletPanel wallet={workspace.wallet} />
          <LedgerPanel ledger={workspace.ledger} />
          <ActivityFeed activity={workspace.activity} />
        </div>
      </div>
    </div>
  );
}
