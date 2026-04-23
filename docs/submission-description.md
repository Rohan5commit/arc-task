# ArcTask submission description

## One-line description

ArcTask is an agentic nano-payments platform that turns a goal into atomic tasks, assigns micro-bounties, verifies outputs, and settles a payout ledger on an Arc-ready payment rail.

## Problem

Most AI demos collapse all value into one prompt and one answer. That hides the real coordination problem. In a true agentic economy, work is split across many small steps, and each step needs its own budget, verification, and payout logic.

## Solution

ArcTask makes that workflow visible:
- the user submits a goal,
- an AI coordinator decomposes it into independent tasks,
- each task gets a nano-payment and priority,
- worker outputs are reviewed,
- approved work becomes a payout receipt in the ledger.

## Why Arc

Arc is especially aligned with this product because it is designed for stablecoin-based financial activity:
- USDC-denominated gas
- predictable fee surface
- sub-second deterministic finality
- EVM compatibility for wallet and contract tooling

Those properties make Arc a natural execution layer for nano-payments coordinating human and software work.

## Demo highlights

- auth-free experience
- live AI planning via NVIDIA NIM
- deterministic fallback for demo resilience
- verifier gate before payout
- mock Arc adapter with clean path to real testnet settlement
- wallet and ledger view that makes agentic economics legible

## Built with

- Next.js
- TypeScript
- Tailwind CSS
- NVIDIA NIM API
- Vercel
- GitHub Actions

## What is mocked vs real

### Real in the demo
- end-to-end workflow state
- live planning and structured AI responses
- verification state machine
- payout ledger receipts
- Arc-oriented network and wallet model

### Mocked for safety
- onchain settlement execution

This tradeoff keeps the stage demo reliable while preserving a clean production path to Arc testnet integration.
