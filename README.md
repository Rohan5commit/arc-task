# ArcTask

ArcTask is an agentic nano-payments platform built for the **Agentic Economy on Arc / Nano Payments on Arc** hackathon.

The product shows how a goal can become:
1. atomic tasks,
2. micro-bounties,
3. agent or human work submissions,
4. verifier approvals,
5. payout ledger receipts on an Arc-ready payment rail.

The current demo uses a **mock Arc adapter** for safety and stage reliability, while keeping a clean seam for future Arc testnet settlement.

## Live product

- Landing page: https://arc-task-rohan-santhoshs-projects.vercel.app
- Dashboard: `/dashboard`
- GitHub repo: https://github.com/Rohan5commit/arc-task

## Why this fits Arc

Arc is a strong home for nano-payment workflows because the chain is designed for:
- **USDC-denominated gas**
- **predictable fees**
- **sub-second deterministic finality**
- **EVM-compatible payment and wallet tooling**

ArcTask turns those chain properties into a product demo that judges can understand in one screen.

## Core demo flow

1. User enters a goal.
2. AI coordinator decomposes it into atomic tasks.
3. Each task gets a proposed nano-payment and priority.
4. Worker output is generated and attached as evidence.
5. Verifier approves or rejects the output.
6. Approved work can release a nano-payment receipt into the wallet ledger.
7. Dashboard updates budget, payment, and activity state.

## Features

### Frontend
- polished landing page
- auth-free dashboard
- task board by status
- payout ledger
- wallet panel
- activity feed
- responsive layout
- seeded demo workspaces
- strong empty/loading/error states

### AI layer
- goal decomposition
- bounty estimation
- task output generation
- verification note generation
- structured JSON parsing
- deterministic fallback mode when live AI is unavailable
- bounded latency budgets for planner, worker, and verifier routes

### Payment abstraction
- demo wallet balances
- nano-payment receipts
- mock Arc adapter
- Arc testnet adapter interface stub
- docs for real Arc integration

## Stack

- Next.js 16
- TypeScript
- Tailwind CSS 4
- NVIDIA NIM chat completions API
- Vercel deployment
- GitHub Actions verification

## Repo structure

```
.
├── .env.example
├── .github/workflows/verify.yml
├── README.md
├── docs
│   ├── arc-integration.md
│   ├── architecture-summary.md
│   ├── demo-script.md
│   ├── elevator-pitch.md
│   └── submission-description.md
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── src
│   ├── app
│   │   ├── api
│   │   │   ├── plan/route.ts
│   │   │   ├── task-output/route.ts
│   │   │   └── verify/route.ts
│   │   ├── dashboard
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components
│   │   ├── dashboard
│   │   ├── landing
│   │   └── ui
│   └── lib
│       ├── ai
│       ├── demo
│       ├── payments
│       ├── types.ts
│       └── utils
├── tsconfig.json
└── vercel.json
```

## Environment variables

Copy `.env.example` and provide:

```bash
NVIDIA_NIM_API_KEY=
NVIDIA_NIM_MODEL=meta/llama-4-maverick-17b-128e-instruct
NVIDIA_NIM_PLANNER_MODEL=meta/llama-4-maverick-17b-128e-instruct
NVIDIA_NIM_WORKER_MODEL=meta/llama-4-maverick-17b-128e-instruct
NVIDIA_NIM_VERIFIER_MODEL=meta/llama-4-maverick-17b-128e-instruct
NVIDIA_NIM_PLANNER_TIMEOUT_MS=12000
NVIDIA_NIM_WORKER_TIMEOUT_MS=8000
NVIDIA_NIM_VERIFIER_TIMEOUT_MS=7000
PAYMENT_MODE=demo
NEXT_PUBLIC_PAYMENT_MODE=demo
ARC_TESTNET_RPC_URL=https://rpc.testnet.arc.network
ARC_TESTNET_CHAIN_ID=5042002
ARC_TREASURY_ADDRESS=0xA7C7000000000000000000000000000000000A7C
NEXT_PUBLIC_DEMO_TREASURY_NAME=ArcTask Treasury
```

## Local run

```bash
npm install
npm run typecheck
npm run build
npm run dev
```

Then open http://localhost:3000.

## Deployment

### Vercel
1. Create the Vercel project.
2. Set the environment variables from `.env.example`.
3. Disable SSO deployment protection if you want a public hackathon demo.
4. Deploy the latest `main` commit.
5. Verify:
   - `/`
   - `/dashboard`
   - `POST /api/plan`
   - task output generation
   - verification flow
   - payout ledger updates

### GitHub Actions
The repo ships with a verification workflow that installs dependencies, type-checks, and builds the app on every push to `main`.

## Demo shortcuts

- Load research demo
- Load campaign demo
- Enter a fresh goal and let the planner create a new workflow
- Approve a submitted task
- Release the payout and inspect the ledger receipt

## Real Arc integration

See [docs/arc-integration.md](docs/arc-integration.md).

Short version:
- replace the mock adapter with a signer-backed Arc testnet adapter,
- fund the treasury wallet with testnet USDC,
- submit signed transactions to Arc testnet,
- optionally register agents with ERC-8004 for onchain identity and reputation,
- swap demo explorer receipts for real Arc scan links.

## Submission assets

- Architecture summary: [docs/architecture-summary.md](docs/architecture-summary.md)
- Elevator pitch: [docs/elevator-pitch.md](docs/elevator-pitch.md)
- Demo script: [docs/demo-script.md](docs/demo-script.md)
- Submission description: [docs/submission-description.md](docs/submission-description.md)
- Arc integration note: [docs/arc-integration.md](docs/arc-integration.md)

## Notes

- The app clearly labels AI-generated suggestions.
- The live AI path is bounded by route-specific latency budgets so the demo falls back quickly instead of hanging on stage.
- Demo mode is intentional. It makes the product reliable for live judging while preserving a real path to Arc settlement.
- No secrets should be committed. Configure the NVIDIA key only in Vercel project settings or local env files.
