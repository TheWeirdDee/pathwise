# Architecture

One TypeScript repository on Next.js 16.3.4 / React 19.2.8.

| Location | Responsibility |
|---|---|
| `src/core/` | Pure intent validation, fixture input factory, path enumeration/scoring, canonical serialization, campaign |
| `src/server/` | Append-only JSONL fixture ledger, receipt export, recomputation, file-backed stop control |
| `src/app/api/` | Server-authoritative fixture scoring at receipt creation; verification and connection evidence |
| `src/components/` | Responsive intent, wallet, score, execution review, receipt, policy, campaign and proof screens |
| `scripts/probe.mjs` | Unauthenticated official endpoint probe; no financial mutations |
| `cli/` | Local score, fixture execute, verify and campaign commands |
| `tests/` | Core invariants and browser journeys |

The browser scores a fixture for an immediate preview. Receipt creation parses and scores again on the server. The API never accepts a browser-selected winner as authoritative. Receipts include the complete snapshot, policy, intent and paths. SHA-256 hashes cover canonical inputs and score rows; verification reruns the pure scorer against the recorded clock.

There is no LLM, financial tool binding, or live execution engine. The restricted natural-language parser supports explicit examples and produces clarification errors. Passive and futures paths remain unavailable where timing, contract depth or position truth is absent.

The ledger is append-only JSONL; per-receipt JSON files are convenient exports. The ledger is authoritative for the UI. Simulations do not claim exchange reconciliation, conservation or order recovery. Local files support one local workspace, not horizontally scaled services.
