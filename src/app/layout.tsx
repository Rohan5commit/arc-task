import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

const appTitle = "ArcTask — Agentic Nano-Payments on Arc";
const appDescription =
  "ArcTask turns user goals into atomic tasks, verifiable outputs, and Arc-ready payout receipts for a live demo of the agentic economy.";

export const metadata: Metadata = {
  metadataBase: new URL("https://arc-task-rohan-santhoshs-projects.vercel.app"),
  title: appTitle,
  description: appDescription,
  robots: {
    index: true,
    follow: true
  },
  openGraph: {
    title: appTitle,
    description: appDescription,
    url: "/",
    siteName: "ArcTask",
    type: "website"
  },
  twitter: {
    card: "summary",
    title: appTitle,
    description: appDescription
  }
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
