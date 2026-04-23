import type { PaymentAdapter } from "@/lib/payments/adapter";
import type { PaymentSettlementInput, PaymentReceipt } from "@/lib/payments/adapter";
import { createMockTxHash } from "@/lib/utils/ids";

export class MockArcAdapter implements PaymentAdapter {
  mode = "demo" as const;
  label = "Mock Arc adapter";

  async settleTaskPayout(input: PaymentSettlementInput): Promise<PaymentReceipt> {
    const txHash = createMockTxHash();

    return {
      adapter: this.mode,
      status: "settled",
      txHash,
      amountUsdc: Number(input.task.bountyUsdc.toFixed(4)),
      memo: `ArcTask nano-payment for ${input.task.title}`,
      settledAt: new Date().toISOString(),
      networkLabel: "Arc Testnet (demo mode)",
      explorerUrl: `https://testnet.arcscan.app/tx/${txHash}?demo=1`
    };
  }
}
