import type { TaskPriority, TaskStatus } from "@/lib/types";

const timestampFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit"
});

export function formatUsdc(amount: number): string {
  return `${amount.toFixed(4)} USDC`;
}

export function formatTime(timestamp: string): string {
  return timestampFormatter.format(new Date(timestamp));
}

export function shortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function statusLabel(status: TaskStatus): string {
  return status.replaceAll("_", " ");
}

export function priorityLabel(priority: TaskPriority): string {
  return priority;
}
