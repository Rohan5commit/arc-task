import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "ArcTask",
  description:
    "ArcTask is an agentic nano-payments platform where goals become atomic tasks, verifiable outputs, and Arc-ready payout receipts."
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
