import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getSeedWorkspace } from "@/lib/demo/seed-workspaces";

export default function DashboardPage() {
  return (
    <main className="mx-auto min-h-screen max-w-[1440px] px-6 py-8 lg:px-8">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-200/80">
            ArcTask demo
          </p>
          <h1 className="mt-2 text-4xl font-semibold text-white">Agentic workflow dashboard</h1>
          <p className="mt-2 max-w-3xl text-slate-300">
            Submit a goal, inspect the generated task graph, review worker outputs, and release
            nano-payments into the Arc-style ledger.
          </p>
        </div>
        <a
          href="/"
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10"
        >
          Back to landing page
        </a>
      </div>

      <DashboardShell initialWorkspace={getSeedWorkspace("workspace-market")} />
    </main>
  );
}
