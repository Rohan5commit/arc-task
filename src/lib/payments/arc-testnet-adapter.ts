import type { PaymentAdapter, PaymentSettlementInput } from "@/lib/payments/adapter";
import type { PaymentReceipt } from "@/lib/types";

export class ArcTestnetAdapter implements PaymentAdapter {
  mode = "arc_testnet" as const;
  label = "Arc testnet adapter";

  async settleTaskPayout(_input: PaymentSettlementInput): Promise<PaymentReceipt> {
    throw new Error(
      "Arc testnet settlement is intentionally disabled in this hackathon demo. Swap this adapter for a signer-backed implementation described in docs/arc-integration.md."
    );
  }
}
