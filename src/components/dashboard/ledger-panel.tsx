import { Panel } from "@/components/ui/panel";
import type { LedgerEntry } from "@/lib/types";
import { formatTime, formatUsdc, shortAddress } from "@/lib/utils/format";

export function LedgerPanel({ ledger }: { ledger: LedgerEntry[] }) {
  const sortedLedger = [...ledger].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );

  return (
    <Panel eyebrow="Settlement ledger" title="Nano-payment receipts">
      {sortedLedger.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/3 p-5 text-sm text-slate-400">
          No payouts released yet. Approve a submitted task, then settle it to populate the ledger.
        </div>
      ) : (
        <div className="space-y-3">
          {sortedLedger.map((entry) => (
            <div key={entry.id} className="rounded-2xl border border-white/10 bg-white/4 p-4">
              <div className="mb-3 flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-white">{entry.taskTitle}</p>
                  <p className="text-sm text-slate-400">{entry.payee}</p>
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-200">
                    {entry.status}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      entry.isMock
                        ? "bg-amber-400/15 text-amber-200"
                        : "bg-cyan-400/15 text-cyan-200"
                    }`}
                  >
                    {entry.isMock ? "mock receipt" : "onchain receipt"}
                  </span>
                </div>
              </div>
              <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
                <Metric label="Amount" value={formatUsdc(entry.amountUsdc)} />
                <Metric label="Adapter" value={entry.adapter === "demo" ? "mock_arc" : "arc_testnet"} />
                <Metric label="Hash" value={shortAddress(entry.txHash)} />
                <Metric label="Settled" value={formatTime(entry.createdAt)} />
              </div>
              {entry.isMock ? (
                <p className="mt-3 text-xs text-amber-200/85">
                  Demo receipt only. No external explorer link is shown for mock payouts.
                </p>
              ) : entry.explorerUrl ? (
                <a
                  href={entry.explorerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex text-xs font-semibold text-cyan-200 hover:text-cyan-100"
                >
                  View on Arc explorer
                </a>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-100">{value}</p>
    </div>
  );
}
