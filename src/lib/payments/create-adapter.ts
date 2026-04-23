import type { PaymentAdapter } from "@/lib/payments/adapter";
import type { PaymentMode } from "@/lib/types";
import { ArcTestnetAdapter } from "@/lib/payments/arc-testnet-adapter";
import { MockArcAdapter } from "@/lib/payments/mock-arc-adapter";

export function createPaymentAdapter(mode: PaymentMode): PaymentAdapter {
  if (mode === "arc_testnet") {
    return new ArcTestnetAdapter();
  }

  return new MockArcAdapter();
}
