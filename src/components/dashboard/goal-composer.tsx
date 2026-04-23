import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";

const starterGoals = [
  "Research top 5 competitors and summarize positioning.",
  "Generate a meme campaign plan for launching a new Arc-native product.",
  "Create a go-to-market brief for an AI workflow tool."
];

interface GoalComposerProps {
  goal: string;
  isPlanning: boolean;
  error: string | null;
  onGoalChange(value: string): void;
  onPlanGoal(): void;
  onLoadSeed(id: string): void;
  onResetDemo(): void;
}

export function GoalComposer({
  goal,
  isPlanning,
  error,
  onGoalChange,
  onPlanGoal,
  onLoadSeed,
  onResetDemo
}: GoalComposerProps) {
  return (
    <Panel
      eyebrow="Coordinator input"
      title="Create a new agentic workflow"
      className="overflow-hidden"
    >
      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-200">Goal</span>
            <textarea
              value={goal}
              onChange={(event) => onGoalChange(event.target.value)}
              rows={4}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none ring-0 placeholder:text-slate-500"
              placeholder="Research top 5 competitors and summarize positioning..."
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {starterGoals.map((starter) => (
              <button
                key={starter}
                type="button"
                onClick={() => onGoalChange(starter)}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10"
              >
                {starter}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={onPlanGoal} disabled={isPlanning || goal.trim().length < 12}>
              {isPlanning ? "Decomposing..." : "Decompose into tasks"}
            </Button>
            <Button variant="secondary" onClick={() => onLoadSeed("workspace-market")}>
              Load research demo
            </Button>
            <Button variant="secondary" onClick={() => onLoadSeed("workspace-meme")}>
              Load campaign demo
            </Button>
            <Button variant="ghost" onClick={onResetDemo}>
              Reset demo state
            </Button>
          </div>
          <p className="text-xs text-slate-500">
            Browser refreshes now keep your latest demo state until you reset it.
          </p>
          {error ? (
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          ) : null}
        </div>
        <div className="rounded-3xl border border-emerald-400/10 bg-emerald-400/8 p-5 text-sm text-emerald-50/85">
          <p className="mb-2 text-sm font-semibold text-emerald-100">Why the bounty layer matters</p>
          <p>
            ArcTask demonstrates how an agentic economy clears work: each task has its own payout,
            review state, and receipt instead of hiding all value transfer inside one monolithic AI
            request.
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>• Micro-bounties are proposed in USDC-denominated amounts.</li>
            <li>• Verification blocks payout until someone approves the output.</li>
            <li>• The wallet ledger makes agentic work economically legible.</li>
          </ul>
        </div>
      </div>
    </Panel>
  );
}
