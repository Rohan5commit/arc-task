# Real Arc integration note

ArcTask currently uses a mock payment adapter because hackathon demos need reliability. The payment abstraction is already shaped so a real Arc testnet rail can replace it cleanly.

## Current abstraction

- `PaymentAdapter`
- `MockArcAdapter`
- `ArcTestnetAdapter`

The UI and ledger do not care which adapter is behind the interface.

## How to plug in real Arc settlement

### 1. Connect a treasury wallet to Arc testnet
Arc testnet network values:
- RPC: `https://rpc.testnet.arc.network`
- Chain ID: `5042002`
- Currency: `USDC`
- Explorer: `https://testnet.arcscan.app`

### 2. Fund the treasury wallet
Use testnet USDC from the Arc-supported faucet path before executing payouts.

### 3. Replace the stub adapter
Implement `ArcTestnetAdapter.settleTaskPayout()` so it:
- builds a transaction,
- signs it with the treasury wallet,
- submits it to Arc testnet,
- waits for final confirmation,
- returns the real tx hash and explorer URL.

### 4. Move payment execution to a server-side action
Never expose signer material in the browser. Use server-side env vars or wallet infrastructure.

### 5. Add richer Arc-native trust
Arc also supports AI agent identity and reputation flows via ERC-8004 on testnet. ArcTask can later register coordinator and verifier agents onchain so payouts reference persistent agent identity.

## Suggested future implementation options

### Option A: signer-backed wallet
- server-side private key or custody signer
- best for hackathon-speed execution
- easiest to wire to the existing adapter interface

### Option B: Circle developer wallet / App Kit flow
- stronger custody model
- more realistic for production-grade treasury management
- good fit if the product expands into real payroll or agent marketplaces

## Why the mock is acceptable now

The hackathon objective is to prove the product insight:
> tiny programmable payments can coordinate agentic workflows.

The mock adapter keeps the demo stable while still showing:
- per-task payouts
- receipts
- wallet balances
- payment states
- Arc-specific network assumptions
