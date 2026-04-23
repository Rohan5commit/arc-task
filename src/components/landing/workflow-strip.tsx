const steps = [
  {
    step: "1",
    title: "Submit a goal",
    body: "The user gives ArcTask one goal like competitor research or a meme campaign sprint."
  },
  {
    step: "2",
    title: "Coordinate work",
    body: "The AI planner splits the goal into atomic tasks with worker assignments, priority, and nano-bounties."
  },
  {
    step: "3",
    title: "Review outputs",
    body: "Worker agents submit evidence, and the verifier gate decides whether the work is ready for payout."
  },
  {
    step: "4",
    title: "Settle the ledger",
    body: "Approved work produces a payout receipt in the wallet ledger, showing how a software-native economy could clear."
  }
];

export function WorkflowStrip() {
  return (
    <section className="space-y-6">
      <div className="max-w-2xl space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200/80">
          Demo flow
        </p>
        <h2 className="text-3xl font-semibold text-white">
          One end-to-end loop from plan to payout.
        </h2>
      </div>
      <div className="grid gap-4 lg:grid-cols-4">
        {steps.map((step) => (
          <div
            key={step.step}
            className="rounded-3xl border border-white/10 bg-white/4 p-5 text-slate-300"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-cyan-400/15 text-sm font-semibold text-cyan-200">
              {step.step}
            </div>
            <h3 className="mb-2 text-lg font-semibold text-slate-50">{step.title}</h3>
            <p>{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
