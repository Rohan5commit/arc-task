import { Panel } from "@/components/ui/panel";
import type { ActivityItem } from "@/lib/types";
import { formatTime } from "@/lib/utils/format";

const toneClasses = {
  info: "border-cyan-400/20 bg-cyan-400/10 text-cyan-100",
  success: "border-emerald-400/20 bg-emerald-400/10 text-emerald-100",
  warning: "border-amber-400/20 bg-amber-400/10 text-amber-100"
};

export function ActivityFeed({ activity }: { activity: ActivityItem[] }) {
  const sortedActivity = [...activity].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );

  return (
    <Panel eyebrow="Agent activity" title="Execution feed">
      <div className="space-y-3">
        {sortedActivity.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/3 p-5 text-sm text-slate-400">
            No activity yet. Run a workflow or advance a task to see updates here.
          </div>
        ) : (
          sortedActivity.map((item) => (
            <article
              key={item.id}
              className={`rounded-2xl border p-4 text-sm ${toneClasses[item.tone]}`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold">{item.title}</p>
                <span className="text-xs opacity-80">{formatTime(item.createdAt)}</span>
              </div>
              <p className="mt-2 opacity-90">{item.detail}</p>
            </article>
          ))
        )}
      </div>
    </Panel>
  );
}
