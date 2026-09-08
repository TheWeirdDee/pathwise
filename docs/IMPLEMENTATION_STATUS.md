# Pathwise Implementation Status Inventory

This document tracks all features, gates, and components defined in [Pathwise-PRD.md](file:///c:/Users/DELL/Desktop/pathwise/docs/Pathwise-PRD.md), documenting their current implementation state, verification evidence, and blockers.

---

## 1. Executive Summary & Runtime Mode

| Item | Status | Detail |
|---|---|---|
| **Runtime Mode** | **FIXTURE WORKSPACE** | Explicitly separated from `PAPER` (live quotes + sim fill) and `LIVE` (real funds). All quotes, books, and receipts are labeled `FIXTURE`. |
| **Framework** | Next.js 16.3.4 + React 19.2.8 | App Router, Server Components & Route Handlers, Turbopack, TypeScript 5. |
| **Core Engine** | 100% Deterministic | Pure scoring function, 13 path families, lot sizing, half-even rounding, SHA-256 canonical hashing. |
| **Test Coverage** | 16 Unit Tests + E2E Suite | 16/16 core mathematical invariant unit tests passing. Playwright E2E browser flows implemented. |
| **Binance MCP Seam** | **BLOCKED (Documented)** | Real probe to `https://agent.binance.com/mcp/agentic` executed. Recorded error: `MCP_CONNECTION_FAILED` in `data/tools.json`. No unverified fallback feed is substituted. |

---

## 2. Gate-by-Gate Verification Matrix

| Gate | Name | Target Requirement | Status | Evidence / Artifact |
|---|---|---|---|---|
| **Gate 0** | Repo & Build Contract | Clean repo, Next.js scaffold, default policy, unit test harness | **PASS** | [package.json](file:///c:/Users/DELL/Desktop/pathwise/package.json), [BUILD_CONTRACT.md](file:///c:/Users/DELL/Desktop/pathwise/BUILD_CONTRACT.md), 16 core tests pass |
| **Gate 1** | Protocol & Tool Seam | Connect to Binance Agent OS MCP, discover tool catalog, verify auth | **BLOCKED** | Probe recorded in [data/tools.json](file:///c:/Users/DELL/Desktop/pathwise/data/tools.json); official endpoint unreachable without OAuth/credentials |
| **Gate 2** | Reference Model & Invariants | Deterministic math model for books, Convert, funding, lot sizing, tie-breaks | **PASS** | [scorer.ts](file:///c:/Users/DELL/Desktop/pathwise/src/core/scorer.ts), [scorer.test.ts](file:///c:/Users/DELL/Desktop/pathwise/tests/scorer.test.ts), [reference_model.md](file:///c:/Users/DELL/Desktop/pathwise/src/core/reference_model.md) |
| **Gate 3** | Enumerator & Wallet Seam | Enumerate all 13 path families; price intra-account transfer legs; block unbacked routes | **PASS (FIXTURE)** | 13 path families visible in UI & CLI; wrong-pocket requires transfer; futures blocked when unbacked |
| **Gate 4** | Paper on Live Quotes | Score live order book quotes with simulated execution | **BLOCKED** | Blocked on Gate 1 (no live quotes feed). No fake paper quotes are invented. |
| **Gate 5** | Recovery & Idempotency | Emergency stop, idempotency keys, duplicate prevention | **PARTIAL (FIXTURE)** | File-backed emergency stop in [control.ts](file:///c:/Users/DELL/Desktop/pathwise/src/server/control.ts); SHA-256 idempotency hash; live crash recovery blocked |
| **Gate 6** | Live Execution | Signed orders, real transfers, balance checks, fill reconciliation | **BLOCKED** | No live tool binding or API secrets. Safely disabled by contract. |
| **Gate 7** | Campaign Benchmark | 120-attempt benchmark suite with 6 ablation variants | **PASS (FIXTURE)** | [campaign.ts](file:///c:/Users/DELL/Desktop/pathwise/src/core/campaign.ts); 120 synthetic scenarios evaluated with ablation breakdown |
| **Gate 8** | User Interface | Responsive UI across 7 sections, modal review, receipt replay, proof verification | **PASS** | [dashboard.tsx](file:///c:/Users/DELL/Desktop/pathwise/src/components/dashboard.tsx), [globals.css](file:///c:/Users/DELL/Desktop/pathwise/src/app/globals.css), [workspace.spec.ts](file:///c:/Users/DELL/Desktop/pathwise/tests/e2e/workspace.spec.ts) |
| **Gate 9** | Agent Facade | Structured intent parsing, clarification dialog, receipt narration | **PASS (RESTRICTED)** | Natural-language parser with clarification errors in [parser.ts](file:///c:/Users/DELL/Desktop/pathwise/src/core/parser.ts); no hallucinating LLM in execution loop |
| **Gate 10** | Submission & Delivery | Repo structure, documentation, deployment instructions | **COMPLETE** | Comprehensive docs in [SETUP.md](file:///c:/Users/DELL/Desktop/pathwise/SETUP.md), [ARCHITECTURE.md](file:///c:/Users/DELL/Desktop/pathwise/ARCHITECTURE.md), [SECURITY.md](file:///c:/Users/DELL/Desktop/pathwise/SECURITY.md), [README.md](file:///c:/Users/DELL/Desktop/pathwise/README.md) |

---

## 3. Path Family Coverage (All 13 Visible)

All 13 canonical path families defined in the PRD are enumerated and scored:

1. `SPOT_TAKER`: Baseline taker market order on Spot order book.
2. `SPOT_MAKER`: Passive limit order; explicitly blocked from winning immediate execution (`FILL_NOT_GUARANTEED`).
3. `CONVERT`: Quote-locked Binance Convert RFQ; wins when Convert spread is tighter than Spot taker fee + book impact.
4. `USDM_TAKER`: USD-M perp taker path (requires USD-M margin; prices funding payment over horizon).
5. `USDM_MAKER`: USD-M perp maker path (blocked from instant win).
6. `COINM_TAKER`: COIN-M inverse contract path (blocked when unbacked by base collateral).
7. `COINM_MAKER`: COIN-M maker path (blocked from instant win).
8. `MARGIN_TAKER`: Cross-margin Spot path (blocked when leverage exceeds policy).
9. `TRANSFER_SPOT`: Internal transfer from USD-M / Margin / COIN-M to Spot, followed by Spot taker order.
10. `TRANSFER_CONVERT`: Internal transfer to Spot followed by Binance Convert.
11. `TRANSFER_USDM`: Internal transfer to USD-M followed by USD-M perp position.
12. `ROTATE_INTERNAL`: Internal asset rotation across sub-account pockets.
13. `HEDGE_PERP`: Spot hold with hedging short perp leg.

---

## 4. Invariant Tests & Validation Suite

| Test Case | Description | Result |
|---|---|---|
| `BUY selects Convert` | Convert wins when cheaper than Spot taker; retains all 13 paths and baseline. | **PASS** |
| `Book walk charges depth` | Walks cumulative depth level by level; fails closed on `DEPTH_SHORT`. | **PASS** |
| `Stale snapshots fail` | Rejects data older than staleness threshold across all routes. | **PASS** |
| `Expired Convert quote` | Expired RFQ loses eligibility without inventing a fake price. | **PASS** |
| `Missing Convert visible` | If Convert is unavailable, path remains visible with `CONVERT_UNAVAILABLE`. | **PASS** |
| `Wrong-pocket quote` | Starting with USD-M produces explicit transfer and balance-wait legs. | **PASS** |
| `Missing transfer blocks` | Insufficient balance without transfer blocks execution. | **PASS** |
| `SELL higher net proceeds` | Maximizes net received quote currency and verifies base asset ownership. | **PASS** |
| `Funding horizon window` | Evaluates next funding payment only if next funding event is within hold horizon. | **PASS** |
| `Ambiguous intent clarification` | Returns structured clarification prompts for zero quantity or dual amounts. | **PASS** |
| `Dust & lot size bounds` | Truncates to exchange lot size; flags residual quote dust; rejects nonfinite prices. | **PASS** |
| `Policy bounds enforcement` | Rejects unapproved symbols and notionals exceeding policy max. | **PASS** |
| `Passive price handling` | Maker paths price correctly but cannot claim guaranteed immediate fill. | **PASS** |
| `Banker's rounding` | Half-even rounding resolves symmetric positive and negative ties deterministically. | **PASS** |
| `Scorer determinism & hashing` | Exact reproducibility and canonical SHA-256 hash stability. | **PASS** |
| `Campaign 120 & 6 ablations` | Completes 120 fixture runs across baseline, no-transfer, convert-only, etc. | **PASS** |

---

## 5. Security & Boundary Architecture

- **No Secret Leakage**: No API keys or private credentials in repository or commit history.
- **Server Authority**: Server recomputes and validates scores at receipt creation; never trusts client-submitted winner or prices.
- **Tamper Evidence**: Every execution receipt includes canonical SHA-256 input and score hashes for independent third-party audit.
- **Emergency Stop**: Global persisted stop mechanism prevents any further execution via API or CLI.
- **Strict Mode Segregation**: Fixture receipts are tagged `FIXTURE` and forbidden from claiming live savings or real exchange execution.
