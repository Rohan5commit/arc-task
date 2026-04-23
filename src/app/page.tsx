import { FeatureGrid } from "@/components/landing/feature-grid";
import { Hero } from "@/components/landing/hero";
import { WorkflowStrip } from "@/components/landing/workflow-strip";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-16 px-6 py-8 lg:px-8">
      <header className="flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
        <div>
          <p className="text-sm font-semibold text-white">ArcTask</p>
          <p className="text-xs text-slate-400">Agentic nano-payments platform for Arc</p>
        </div>
        <a
          href="/dashboard"
          className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10"
        >
          Open dashboard
        </a>
      </header>

      <Hero />
      <WorkflowStrip />
      <FeatureGrid />

      <section className="rounded-[32px] border border-white/10 bg-white/4 p-8 text-slate-300">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.22em] text-emerald-200/80">
              Why judges get it fast
            </p>
            <h2 className="text-3xl font-semibold text-white">
              One screen shows planning, task execution, verification, and payouts.
            </h2>
            <p className="mt-4 max-w-2xl">
              ArcTask is optimized for live demo clarity. It avoids protocol sprawl while still
              showing the core primitive the hackathon theme is asking for: tiny programmable
              payments coordinating agentic work.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
            <p className="text-sm font-semibold text-white">Judge-facing takeaways</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li>• Auth-free demo flow with seeded examples and live AI planning.</li>
              <li>• Clear payment abstraction with demo receipts and Arc integration seam.</li>
              <li>• Strong empty, loading, and error states for stage reliability.</li>
              <li>• Submission-ready docs included directly in the repo.</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
