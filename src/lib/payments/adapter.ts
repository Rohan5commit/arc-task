import type { LedgerStatus, PaymentMode, TaskItem } from "@/lib/types";

export interface PaymentSettlementInput {
  task: TaskItem;
  payee: string;
}

export interface PaymentReceipt {
  adapter: PaymentMode;
  status: LedgerStatus;
  txHash: string;
  amountUsdc: number;
  memo: string;
  settledAt: string;
  networkLabel: string;
  explorerUrl?: string;
}

export interface PaymentAdapter {
  mode: PaymentMode;
  label: string;
  settleTaskPayout(input: PaymentSettlementInput): Promise<PaymentReceipt>;
}
