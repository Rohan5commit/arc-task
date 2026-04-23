import type { PaymentAdapter } from "@/lib/payments/adapter";
import type { PaymentSettlementInput } from "@/lib/payments/adapter";
import type { PaymentReceipt } from "@/lib/types";
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
      memo: `ArcTask demo nano-payment receipt for ${input.task.title}`,
      settledAt: new Date().toISOString(),
      networkLabel: "Arc Testnet (demo mode)",
      isMock: true
    };
  }
}
