export type PaymentMode = "demo" | "arc_testnet";
export type TaskStatus =
  | "queued"
  | "in_progress"
  | "submitted"
  | "verified"
  | "paid"
  | "rejected";

export type TaskPriority = "low" | "medium" | "high";
export type ActivityTone = "info" | "success" | "warning";
export type ActivityType = "planner" | "worker" | "verifier" | "payment" | "system";
export type CompletionConfidence = "low" | "medium" | "high";
export type VerificationDecision = "approved" | "changes_requested";
export type LedgerStatus = "queued" | "settled" | "failed";

export interface PlannerTaskDraft {
  title: string;
  description: string;
  assignedTo: string;
  priority: TaskPriority;
  bountyUsdc: number;
  acceptanceCriteria: string[];
}

export interface PlanDraft {
  workspaceTitle: string;
  planSummary: string;
  tasks: PlannerTaskDraft[];
}

export interface TaskOutputDraft {
  summary: string;
  artifact: string;
  nextCheck: string;
  confidence: CompletionConfidence;
}

export interface VerificationDraft {
  decision: VerificationDecision;
  notes: string;
  riskFlags: string[];
  confidence: CompletionConfidence;
}

export interface TaskOutput extends TaskOutputDraft {
  source: "llm" | "fallback";
  generatedAt: string;
}

export interface VerificationRecord extends VerificationDraft {
  source: "llm" | "fallback";
  reviewedBy: string;
  generatedAt: string;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  priority: TaskPriority;
  bountyUsdc: number;
  status: TaskStatus;
  acceptanceCriteria: string[];
  output?: TaskOutput;
  verification?: VerificationRecord;
}

export interface LedgerEntry {
  id: string;
  taskId: string;
  taskTitle: string;
  payee: string;
  amountUsdc: number;
  adapter: PaymentMode;
  status: LedgerStatus;
  txHash: string;
  memo: string;
  createdAt: string;
  isMock: boolean;
  explorerUrl?: string;
}

export interface PaymentReceipt {
  adapter: PaymentMode;
  status: LedgerStatus;
  txHash: string;
  amountUsdc: number;
  memo: string;
  settledAt: string;
  networkLabel: string;
  isMock: boolean;
  explorerUrl?: string;
}

export interface WalletState {
  mode: PaymentMode;
  treasuryName: string;
  address: string;
  networkLabel: string;
  adapterLabel: string;
  explorerBaseUrl: string;
  startingBalanceUsdc: number;
  currentBalanceUsdc: number;
  reservedUsdc: number;
  availableUsdc: number;
}

export interface WorkspaceMetrics {
  totalTasks: number;
  openTasks: number;
  verificationQueue: number;
  paidTasks: number;
  totalBudgetUsdc: number;
  paidOutUsdc: number;
  avgBountyUsdc: number;
}

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  detail: string;
  tone: ActivityTone;
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  goal: string;
  planSummary: string;
  aiNotice: string;
  createdAt: string;
  paymentMode: PaymentMode;
  tasks: TaskItem[];
  ledger: LedgerEntry[];
  activity: ActivityItem[];
  wallet: WalletState;
  metrics: WorkspaceMetrics;
}

export interface PlanningApiResponse {
  workspace: Workspace;
  source: "llm" | "fallback";
  model: string;
  warnings: string[];
}

export interface TaskOutputApiResponse {
  taskId: string;
  output: TaskOutput;
  model: string;
  warnings: string[];
}

export interface VerifyApiResponse {
  taskId: string;
  verification: VerificationRecord;
  model: string;
  warnings: string[];
}

export interface PayoutApiResponse {
  taskId: string;
  receipt: PaymentReceipt;
  warnings: string[];
}
