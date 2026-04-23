import type { TaskPriority, TaskStatus } from "@/lib/types";
import { priorityLabel, statusLabel } from "@/lib/utils/format";

const statusClasses: Record<TaskStatus, string> = {
  queued: "bg-slate-800 text-slate-200",
  in_progress: "bg-cyan-400/15 text-cyan-200",
  submitted: "bg-amber-400/15 text-amber-200",
  verified: "bg-blue-400/15 text-blue-200",
  paid: "bg-emerald-400/15 text-emerald-200",
  rejected: "bg-rose-400/15 text-rose-200"
};

const priorityClasses: Record<TaskPriority, string> = {
  low: "bg-slate-800 text-slate-300",
  medium: "bg-indigo-400/15 text-indigo-200",
  high: "bg-fuchsia-400/15 text-fuchsia-200"
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${statusClasses[status]}`}>
      {statusLabel(status)}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${priorityClasses[priority]}`}>
      {priorityLabel(priority)} priority
    </span>
  );
}
