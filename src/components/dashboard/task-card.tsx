import { Button } from "@/components/ui/button";
import { PriorityBadge, StatusBadge } from "@/components/ui/badge";
import type { TaskItem } from "@/lib/types";
import { formatTime, formatUsdc } from "@/lib/utils/format";

interface TaskCardProps {
  task: TaskItem;
  isBusy: boolean;
  onStartTask(taskId: string): void;
  onGenerateOutput(taskId: string): void;
  onApprove(taskId: string): void;
  onReject(taskId: string): void;
  onPay(taskId: string): void;
  onRequeue(taskId: string): void;
}

export function TaskCard({
  task,
  isBusy,
  onStartTask,
  onGenerateOutput,
  onApprove,
  onReject,
  onPay,
  onRequeue
}: TaskCardProps) {
  return (
    <article className="rounded-3xl border border-white/10 bg-slate-950/90 p-4 shadow-[0_6px_24px_rgba(15,23,42,0.35)]">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
        </div>
        <span className="text-sm font-semibold text-emerald-200">{formatUsdc(task.bountyUsdc)}</span>
      </div>

      <div className="space-y-3">
        <div>
          <h4 className="text-base font-semibold text-white">{task.title}</h4>
          <p className="mt-1 text-sm text-slate-300">{task.description}</p>
        </div>

        <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
          <Info label="Assigned worker" value={task.assignedTo} />
          <Info
            label="Verification state"
            value={task.verification ? task.verification.decision : "Awaiting reviewer"}
          />
        </div>

        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.22em] text-slate-500">Acceptance criteria</p>
          <ul className="space-y-1 text-sm text-slate-300">
            {task.acceptanceCriteria.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-emerald-300">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {task.output ? (
          <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/8 p-4 text-sm text-cyan-50/90">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="font-semibold text-cyan-100">AI worker output</p>
              <span className="text-xs text-cyan-100/75">{formatTime(task.output.generatedAt)}</span>
            </div>
            <p className="mb-2 text-cyan-50">{task.output.summary}</p>
            <pre className="whitespace-pre-wrap font-sans text-cyan-50/85">{task.output.artifact}</pre>
            <p className="mt-3 text-xs text-cyan-100/75">
              Next check: {task.output.nextCheck} · Confidence: {task.output.confidence}
            </p>
          </div>
        ) : null}

        {task.verification ? (
          <div className="rounded-2xl border border-amber-400/10 bg-amber-400/8 p-4 text-sm text-amber-50/90">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="font-semibold text-amber-100">Verifier note</p>
              <span className="text-xs text-amber-100/75">{formatTime(task.verification.generatedAt)}</span>
            </div>
            <p>{task.verification.notes}</p>
            {task.verification.riskFlags.length ? (
              <ul className="mt-3 space-y-1 text-xs text-amber-100/80">
                {task.verification.riskFlags.map((flag) => (
                  <li key={flag}>• {flag}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2 pt-1">
          {task.status === "queued" ? (
            <Button variant="secondary" onClick={() => onStartTask(task.id)} disabled={isBusy}>
              Start work
            </Button>
          ) : null}

          {task.status === "in_progress" ? (
            <Button onClick={() => onGenerateOutput(task.id)} disabled={isBusy}>
              {isBusy ? "Generating..." : "Generate draft output"}
            </Button>
          ) : null}

          {task.status === "submitted" ? (
            <>
              <Button onClick={() => onApprove(task.id)} disabled={isBusy}>
                {isBusy ? "Reviewing..." : "Approve"}
              </Button>
              <Button variant="danger" onClick={() => onReject(task.id)} disabled={isBusy}>
                Request changes
              </Button>
            </>
          ) : null}

          {task.status === "verified" ? (
            <Button onClick={() => onPay(task.id)} disabled={isBusy}>
              {isBusy ? "Settling..." : "Release nano-payment"}
            </Button>
          ) : null}

          {task.status === "rejected" ? (
            <Button variant="secondary" onClick={() => onRequeue(task.id)} disabled={isBusy}>
              Re-queue task
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/4 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-medium text-slate-100">{value}</p>
    </div>
  );
}
