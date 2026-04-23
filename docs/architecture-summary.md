# ArcTask architecture summary

## Overview

ArcTask is a stateless web app optimized for live demo reliability.

- **Frontend**: Next.js App Router UI for landing page and dashboard
- **AI layer**: server routes calling NVIDIA NIM with JSON-only prompts
- **Workflow state**: in-memory client state plus seeded demo workspaces
- **Payment layer**: adapter interface with mock Arc receipt generation
- **Deployment**: Vercel
- **Verification**: GitHub Actions build + typecheck

## Main modules

### 1. Landing page
Explains the product, the Arc fit, and the end-to-end workflow in one screen.

### 2. Dashboard shell
Client-side orchestration for:
- goal creation
- task board interaction
- verification actions
- payment release
- activity feed updates
- wallet and ledger updates

### 3. AI server routes
- `POST /api/plan`: decompose goal into tasks with nano-bounties
- `POST /api/task-output`: generate a worker output for a task
- `POST /api/verify`: generate verification notes for approve/reject actions

All routes try live NVIDIA NIM first, then fall back to deterministic local logic.

### 4. Payment adapter seam
`PaymentAdapter` defines the interface for settlement.
- `MockArcAdapter`: emits demo receipts now
- `ArcTestnetAdapter`: explicit seam for future real execution

### 5. Seed data
Two ready-to-demo workspaces:
- competitive positioning sprint
- meme campaign command center

## Why this architecture works for a hackathon

- no auth friction
- no database dependency
- no fragile blockchain coupling in the live path
- still clearly aligned with Arc
- easy to explain
- easy to deploy
- safe to demo repeatedly

## Upgrade path

1. Move payout release into a server-side signer flow.
2. Replace mock receipts with real Arc testnet transactions.
3. Persist workspaces and ledger entries in a database.
4. Add multi-user identity and treasury controls.
5. Register agents on Arc using ERC-8004 identity and reputation contracts.
