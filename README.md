# Pathwise · Every Path. Every Cent.

> **Binance Agent OS Execution Operator**  
> *Deterministic multi-venue path scorer, wallet-aware routing engine, and replayable cryptographically verifiable receipts.*

---

## Overview

Pathwise turns high-level trading intents (Buy, Sell, Reduce, Rotate, Hedge) into the mathematically optimal execution path on Binance. Rather than naively firing taker orders on the Spot market, Pathwise enumerates all 13 possible path families—evaluating order book depth, Binance Convert quote locks, funding horizons, maker/taker fee tiers, and internal sub-account wallet transfers (Spot, USD-M, COIN-M, Margin).

Pathwise produces deterministic, tamper-evident receipts with SHA-256 canonical hashing that can be independently audited and rescored against recorded inputs.

---

## Key Features

- **13 Canonical Path Families**: Always compares Spot Taker (baseline), Spot Maker, Binance Convert, USD-M Perp Taker/Maker, COIN-M Taker/Maker, Cross-Margin, and intra-account Transfer + Order combinations.
- **Wallet-Aware Routing**: Detects wrong-pocket collateral (e.g. USDT in USD-M or Margin) and explicitly plans transfer legs and balance-wait times rather than silently assuming single-pocket liquidity.
- **Deterministic Math & Banker's Rounding**: Implements exact half-even rounding, lot size quantization, and multi-tier book walking without non-deterministic or LLM-hallucinated prices.
- **Cryptographic Replay Receipts**: Writes append-only execution records containing the complete market snapshot, intent, policy, and SHA-256 input/score digests. Receipts can be rescored via CLI, REST API, or web dashboard.
- **Fail-Closed Safety & Policy Bounds**: Strict policy bounds for maximum notional, symbol allowlists, leverage limits, staleness cutoffs, and a global file-backed emergency stop mechanism.
- **Fixture Campaign & Ablation Matrix**: Built-in 120-attempt synthetic benchmark with 6 ablation variants to evaluate routing alpha under controlled market scenarios.
- **Zero-Secret Architecture**: Synthetic fixture workspace cleanly separated from live credentials. MCP probe records connection evidence in `data/tools.json`.

---

## Quickstart

### 1. Requirements
- Node.js 20.9+ (tested on Node.js 24+)
- npm 10+

### 2. Installation & Development

```bash
# Install dependencies
npm install

# Start Next.js development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to access the Pathwise Dashboard.

### 3. Verification & Testing

```bash
# Run unit tests (16 invariant test suites)
npm test

# Run linter
npm run lint

# Build production bundle
npm run build

# Run Playwright end-to-end browser journeys
npm run test:e2e
```

### 4. CLI Usage

```bash
# Score an intent across all 13 path families
npm run cli -- score "Buy 200 USDT of SOL, hold 24h"

# Score from USD-M wallet (exercises transfer routing)
npm run cli -- score "Buy 200 USDT of SOL" --usdm

# Generate an execution receipt
npm run cli -- execute "Buy 200 USDT of SOL"

# Recompute and mathematically verify a receipt
npm run cli -- verify <RECEIPT_ID_OR_FILE_PATH>

# Run the 120-attempt fixture campaign
npm run cli -- campaign

# Probe Binance Agent OS MCP endpoint
npm run probe
```

---

## Live Binance MCP Connection

Pathwise is authenticated against Binance's official Agent MCP server (`https://agent.binance.com/mcp/agentic`) via OAuth. The full 73-tool catalog — spanning Spot, Margin, Convert, USD-M/COIN-M Futures, Wallet, and Sub-account — is captured as real evidence in [`data/tools.json`](data/tools.json).

**Scope of this claim, stated precisely:** this is the MCP client's authenticated session. The Next.js app's own backend adapter is not yet wired to call these tools at runtime, so the dashboard still runs on fixtures — see [`GATES.md`](GATES.md) Gate 1 for the full status and [`CLAIMS.md`](CLAIMS.md) for what is and isn't claimed. The prior blocked-connection evidence (`MCP_CONNECTION_FAILED`, caused by a local DNS resolver failure rather than the endpoint itself) is preserved at `data/tools.json.blocked_evidence_backup` for comparison.

---

## Architecture & Code Structure

```
pathwise/
├── src/
│   ├── app/                 # Next.js App Router (pages, layouts, dynamic routes, API endpoints)
│   │   ├── api/             # /api/receipts, /api/verify, /api/control, /api/connection
│   │   ├── [section]/       # /wallets, /receipts, /proof, /policy, /campaign
│   │   └── globals.css      # Dark-mode responsive design system
│   ├── components/
│   │   └── dashboard.tsx    # Interactive dashboard with 7 sub-views and review modal
│   ├── core/
│   │   ├── parser.ts        # Intent grammar parser with clarification diagnostics
│   │   ├── scorer.ts        # Pure 13-path mathematical scorer and tie-breaker
│   │   ├── canonical.ts     # SHA-256 canonical hashing engine
│   │   ├── fixtures.ts      # Multi-wallet and order book fixture generator
│   │   ├── policy.ts        # Risk management & guardrail validator
│   │   └── campaign.ts      # 120-attempt benchmark runner & ablation engine
│   └── server/
│       ├── ledger.ts        # Append-only JSONL receipt ledger & verifier
│       └── control.ts       # Global file-backed emergency stop coordinator
├── cli/
│   └── index.ts             # Pathwise CLI runner
├── data/
│   ├── tools.json           # Binance MCP probe evidence
│   ├── ledger.jsonl         # Append-only receipt storage (gitignored in production)
│   └── campaign/            # Exported campaign benchmarks
├── docs/
│   ├── Pathwise-PRD.md      # Complete Product Requirements Document
│   └── IMPLEMENTATION_STATUS.md # Detailed gate & feature inventory
└── tests/
    ├── scorer.test.ts       # 16 unit tests for mathematical invariants
    └── e2e/                 # Playwright end-to-end test specs
```

---

## Governance & Security

- **Contract & Claims**: See [BUILD_CONTRACT.md](file:///c:/Users/DELL/Desktop/pathwise/BUILD_CONTRACT.md), [GATES.md](file:///c:/Users/DELL/Desktop/pathwise/GATES.md), [CLAIMS.md](file:///c:/Users/DELL/Desktop/pathwise/CLAIMS.md), and [DECISIONS.md](file:///c:/Users/DELL/Desktop/pathwise/DECISIONS.md).
- **Security Boundaries**: See [SECURITY.md](file:///c:/Users/DELL/Desktop/pathwise/SECURITY.md).
