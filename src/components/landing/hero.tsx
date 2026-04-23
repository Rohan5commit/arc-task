import Link from "next/link";

export function Hero() {
  return (
    <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
      <div className="space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">
          Built for Agentic Economy on Arc
        </div>
        <div className="space-y-4">
          <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
            Turn work into verifiable nano-payments for agents and humans.
          </h1>
          <p className="max-w-2xl text-lg text-slate-300">
            ArcTask takes a goal, decomposes it into atomic tasks, attaches micro-bounties, routes
            work across agents, and settles a payout ledger that feels native to Arc's stablecoin
            economics.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
          >
            Open live demo
          </Link>
          <a
            href="https://github.com/Rohan5commit/arc-task"
            className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
          >
            View GitHub repo
          </a>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["Atomic payouts", "Assign 0.0025-0.0300 USDC bounties per task."],
            ["Verifier gate", "Only approved work can progress to payout."],
            ["Arc-ready rails", "Mock adapter today, clean Arc testnet swap later."]
          ].map(([title, body]) => (
            <div
              key={title}
              className="rounded-2xl border border-white/10 bg-white/4 p-4 text-sm text-slate-300"
            >
              <p className="mb-1 font-semibold text-slate-100">{title}</p>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-[32px] border border-white/10 bg-slate-950/75 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.45)] backdrop-blur">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Live workflow snapshot</p>
            <p className="text-sm text-slate-400">Coordinator → worker → verifier → payout</p>
          </div>
          <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-200">
            Demo mode
          </span>
        </div>
        <div className="space-y-4">
          {[
            {
              title: "Break down research goal",
              bounty: "0.0065 USDC",
              status: "Paid"
            },
            {
              title: "Capture positioning claims",
              bounty: "0.0085 USDC",
              status: "Submitted"
            },
            {
              title: "Draft gap analysis",
              bounty: "0.0095 USDC",
              status: "Queued"
            }
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-white/10 bg-white/4 p-4 text-sm text-slate-300"
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="font-medium text-slate-100">{item.title}</p>
                <span className="rounded-full bg-slate-800 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-200">
                  {item.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Assigned bounty</span>
                <span className="font-semibold text-emerald-200">{item.bounty}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-2xl border border-emerald-400/10 bg-emerald-400/8 p-4">
          <p className="text-sm font-medium text-emerald-100">Why Arc matters</p>
          <p className="mt-2 text-sm text-emerald-50/80">
            Stablecoin-denominated gas and sub-second deterministic finality make tiny task payouts
            legible, predictable, and demo-friendly.
          </p>
        </div>
      </div>
    </section>
  );
}
