import { Panel } from "@/components/ui/panel";
import type { WalletState } from "@/lib/types";
import { formatUsdc, shortAddress } from "@/lib/utils/format";

export function WalletPanel({ wallet }: { wallet: WalletState }) {
  return (
    <Panel eyebrow="Wallet + rail" title="Arc payout layer">
      <div className="space-y-4 text-sm text-slate-300">
        <div className="rounded-2xl border border-white/10 bg-white/4 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-white">{wallet.treasuryName}</p>
              <p className="text-xs text-slate-400">{wallet.networkLabel}</p>
            </div>
            <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-200">
              {wallet.adapterLabel}
            </span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Metric label="Current balance" value={formatUsdc(wallet.currentBalanceUsdc)} />
            <Metric label="Reserved" value={formatUsdc(wallet.reservedUsdc)} />
            <Metric label="Free" value={formatUsdc(wallet.availableUsdc)} />
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Treasury address</p>
          <p className="mt-2 font-mono text-sm text-slate-100">{shortAddress(wallet.address)}</p>
        </div>
        <p className="text-xs text-slate-500">
          Demo mode uses a mock Arc adapter that emits realistic receipt metadata. Swap the adapter
          for a signer-backed testnet implementation when ready.
        </p>
      </div>
    </Panel>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-2 font-semibold text-slate-100">{value}</p>
    </div>
  );
}
