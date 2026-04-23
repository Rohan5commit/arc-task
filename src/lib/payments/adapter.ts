import type { PaymentMode, PaymentReceipt, TaskItem } from "@/lib/types";

export interface PaymentSettlementInput {
  task: TaskItem;
  payee: string;
}

export interface PaymentAdapter {
  mode: PaymentMode;
  label: string;
  settleTaskPayout(input: PaymentSettlementInput): Promise<PaymentReceipt>;
}
