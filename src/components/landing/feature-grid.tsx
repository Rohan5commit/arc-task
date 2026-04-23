const features = [
  {
    title: "Coordinator agent",
    body: "Uses structured JSON planning to turn a messy goal into atomic, reviewable work packages."
  },
  {
    title: "Nano-bounty engine",
    body: "Every task carries a proposed USDC amount, payment state, and receipt trail for the demo wallet."
  },
  {
    title: "Verification gate",
    body: "Outputs must be reviewed before they move from submitted to verified and finally to paid."
  },
  {
    title: "Arc adapter seam",
    body: "The mock payment adapter implements the same interface a signer-backed Arc settlement module would use."
  }
];

export function FeatureGrid() {
  return (
    <section className="space-y-6">
      <div className="max-w-2xl space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-200/80">
          Product pillars
        </p>
        <h2 className="text-3xl font-semibold text-white">
          Demo-first execution with real agentic economy primitives.
        </h2>
        <p className="text-slate-300">
          ArcTask is intentionally scoped as a polished prototype: fast to understand, resilient on
          stage, and architected so a real Arc payout rail can replace the demo adapter later.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {features.map((feature) => (
          <article
            key={feature.title}
            className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 text-slate-300"
          >
            <h3 className="mb-2 text-lg font-semibold text-slate-50">{feature.title}</h3>
            <p>{feature.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
