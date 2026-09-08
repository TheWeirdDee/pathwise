# Gate evidence

| Gate | Status | Evidence / blocker |
|---|---|---|
| 0 Repo + contract | IMPLEMENTED | Next app, default policy, contract and test harness |
| 1 Protocol seam | BLOCKED | `data/tools.json`: MCP_CONNECTION_FAILED; no catalog or auth |
| 2 Reference model | PARTIAL | Deterministic model and invariant tests; independent reference/golden pack not complete |
| 3 Enumerator + wallet seam | FIXTURE IMPLEMENTED | All 13 families; wrong-pocket transfer and wait; contract families blocked |
| 4 Paper on live quotes | BLOCKED | Fixtures work; no live quotes, not PAPER |
| 5 Recovery | PARTIAL | File-backed stop implemented; no live idempotency/recovery proof |
| 6 Live fills | BLOCKED | No auth, funding, scopes, transfer or order calls |
| 7 Campaign | FIXTURE IMPLEMENTED | 120 attempts, six variants; no live measurement claim |
| 8 UI | IMPLEMENTED FOR FIXTURES | Seven surfaces, clarification/blocked/empty states, receipt replay |
| 9 Agent facade | PARTIAL | Restricted NL/JSON intake; no LLM or inbound MCP server |
| 10 Submission | NOT COMPLETE | Repo/docs provided; public deployment and video absent |

Failures retained: initial build found a campaign row inference error (fixed with an explicit type); initial SELL test found an asymmetric venue tie comparator (fixed with numeric ranks); initial browser run could not find the matching Chromium binary (browser dependency installation required). Final validation results are recorded in README and the build handoff.
