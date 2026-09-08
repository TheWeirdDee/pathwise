# Pathwise Mini PRD

Product requirements · Binance Agent OS Track A · v1.0 LOCK

An execution operator for Binance Agent OS. The user states an intent. Pathwise prices every live venue path after fees, Convert quote, book impact, funding, and wallet location, then executes only the winning path and writes a cents-level receipt.

| Field | Value |
|---|---|
| Product | Pathwise |
| Track | Binance Agent OS Mini Hackathon, Track A |
| Status | LOCK candidate. Mode D PRD. Features not cut. |
| Owner | Divine |
| Build window | 7 days from lock |
| Headline metric | Cents saved per $1,000 notional vs always-taker Spot |
| Sponsor directness | L4. Convert quote and intra-account transfer gate the fill |
| Removal score | 4/5. Swap Binance and Convert + Spot↔USD-M seams vanish |
| Agent role | Operator. LLM parses and narrates. Scorer is deterministic |

## 1. One sentence

Pathwise turns a buy, sell, rotate, or hedge intent into the cheapest live Binance path that actually exists for this sub-account, then takes that path and proves the saving against a taker-spot baseline.

## 2. Problem and user

### Exact user

A Binance trader who already funds an Agentic sub-account and wants an agent to act, not commentate. They hold USDT and coins across Spot, USD-M, and sometimes COIN-M or Margin wallets inside that same sub-account.

### Job

Finish an intent such as buy 200 USDT of SOL, rotate idle USDT into a perp sleeve, or reduce a position, without paying the dumb path.

### Break

- The visible spread is not the profit. Fees, Convert spread, book impact, and funding change the result.
- Funds sit in the wrong wallet. The agent cannot pull from main. Inside the Agentic account, Spot and USD-M are still separate.
- A fresh Agentic book has no history. Portfolio chat on an empty sub-account is theater.
- Most agents market-buy a pair and skip Convert, which is the quote-lock product Binance already ships.

### Workaround today

Manual Convert screen, manual Transfer screen, then an order ticket, then a spreadsheet after the fact.

## 3. Lock

### Dominant mechanism

User intent + live wallet map + Convert quote + Spot book + futures mark and funding → one deterministic path score in quote-currency cents → one venue action (convert, transfer-then-order, or spot order) → one public receipt of cents saved versus always-taker Spot.

### Falsifiable claim

Given a structured intent, live Agent OS market data, a Convert quote with an expiry, and the Agentic sub-account wallet map, Pathwise enumerates the legal paths, scores them with a frozen fee-impact-funding model, executes only the winner through official MCP tools, preserves conservation and idempotency, exposes a receipt that a third party can recompute from recorded inputs, and produces a realized fill whose all-in cost is less than or equal to the taker-spot baseline on the same intent, except where the receipt explicitly marks `BASELINE_WIN`.

### Competitive hypothesis

Under the same intents, timestamps, sizes, and wallet starting states, scoring Convert and wallet-seam paths instead of always sending a Spot taker order changes all-in cost in USDT cents because Convert locks a quote and because an internal transfer changes which fee schedule and funding clock apply.

### Falsifiers

- Convert is not available on the agentic MCP. Then Convert paths must be marked `UNAVAILABLE`, not simulated, and the lock narrows to Seam Runner plus Spot.
- On the frozen campaign set, median cents saved is ≤ 0 after fees and impact.
- The scorer can be replaced by an LLM guess without changing winners.
- A silent fallback to CCXT or a mock book is used while the UI still says Agent OS.
- Receipts cannot be recomputed from recorded quotes and books.

## 4. Scope rule

This PRD is the full Pathwise system. Do not delete a listed feature to make a fake V1. Implement in gates so the live core exists first. A feature may be marked `BLOCKED_BY_MCP` with a named error. It may not be quietly dropped.

## 5. Actors and permissions

| Actor | Can do | Cannot do |
|---|---|---|
| Owner (human) | Fund Agentic sub-account from main, set policy, approve if required, hit Emergency Stop, revoke MCP | Claim the agent can withdraw |
| Pathwise operator process | Read MCP market + account, request Convert quotes, transfer inside the sub-account, place allowed orders, write ledger | Withdraw, move main→agent, change owner policy |
| LLM narrator | Parse intent to schema, explain a finished scorecard | Choose the path, place an order, invent a quote |
| Judge / public | Open demo, read receipts, rerun verifier on recorded inputs | See API secrets, main-account identity, unused balances beyond the demo account |
| Binance | See the order, enforce scopes, isolate the sub-account | See model reasoning |

Trust assumption: Binance MCP and matching engine are source of truth for quotes, books, balances, and fills. Pathwise is source of truth for path math and receipts. The model is never source of truth for money.

## 6. User journeys

### J1. Buy with idle Spot USDT

1. Owner types: buy 200 USDT of SOL, hold about 24h.
2. System maps wallets, pulls Spot book, requests Convert quote, prices futures path only if transfer is legal.
3. Scorecard shows at least three paths. Winner highlighted with cents vs baseline.
4. If policy is AUTO and winner is legal, execute. If APPROVE, pause.
5. Ledger writes planned path, raw quotes, fill, realized vs planned, receipt id.

### J2. Buy when USDT sits on USD-M

Same intent. Spot taker now requires a transfer out of USD-M or a futures-native path. Wrong-pocket baseline is priced as a failed or extra-leg path, never hidden.

### J3. Reduce or sell

Intent names an asset and a reduce amount. Paths include Spot sell, Convert from asset to USDT, and close-perp plus transfer-home.

### J4. Rotate idle collateral

Intent: keep 200 USDT working on USD-M for the next funding window, leave the rest on Spot. System transfers the exact working notional plus buffer, does not sweep the whole wallet unless asked.

### J5. Hold-horizon funding

Intent includes a hold horizon. Funding is accrued on futures paths only. If the next funding event flips the score, the receipt says why.

### J6. Quote died

Convert quote expires or book moves past the slippage cap before send. System refreshes once, rescores, and either executes the new winner or fails closed. No stale send.

### J7. Timeout is not a fill

MCP or HTTP times out after an order request. System queries open orders and fills by `clientOrderId` before any retry. Duplicate send is a defect.

### J8. Judge replay

A visitor opens `/proof`, picks a receipt, sees inputs, path table, fill ids, and a local recompute that matches or flags drift.

## 7. Feature inventory

Nothing in this list is optional flavor. If MCP cannot support a path family, the UI still lists the family as `UNAVAILABLE` with the failing tool name.

### 7.1 Intent layer

- Natural-language intake and structured JSON intake.
- Intent schema: side (`BUY`, `SELL`, `ROTATE`, `FLATTEN`, `REDUCE`), base, quote, notional or qty, `hold_horizon_sec`, urgency (`TAKER`, `MIXED`, `PASSIVE`), venue preference (`ANY`, `SPOT_ONLY`, `NO_PERP`, `NO_CONVERT`), `reduce_only` flag.
- Ambiguous intent returns a clarification card. No inferred leverage. No inferred short unless side is explicit.
- Symbol normalization to Binance instruments (`SOLUSDT` spot, `SOLUSDT` perp, Convert assets).
- Allowlist and denylist per policy.

### 7.2 Wallet map

- Read Agentic balances across Spot, Funding, USD-M, COIN-M, Isolated/Cross Margin when scoped.
- Optional read-only main-account view, labeled `MAIN_READONLY` and never executable.
- Wallet seam graph: which transfers are legal inside the Agentic account.
- Exact-notional planner: amount to move = trade need + fee buffer + contract lot rounding.
- Return-idle: after a completed futures path, move unused quote back to the home wallet the policy names.
- Wrong-pocket detector: intent is illegal without a transfer. Surface as a first-class path leg, not an error toast.

### 7.3 Market inputs

- Spot best bid/ask and depth to configured levels.
- USD-M and COIN-M mark, index, bid/ask, funding rate, next funding time.
- Ticker 24h only as context, never as the execution price.
- Klines only for ATR or volatility buffer if policy asks. Not used to pick direction.
- Account fee tier if exposed. Else explicit fee schedule file with source date.
- Provenance on every input: tool name, request id, `received_at`, hash of raw payload.

### 7.4 Convert

- Request a live Convert quote for the intent size.
- Record quote id, from/to asset, from/to amount, implied price, expiry.
- Convert is a path, not a decoration. It competes with Spot and perp paths.
- Requote path: if TTL remaining < `requote_ms`, pull a new quote and rescore.
- Execute Convert only with the quote id that won the score.
- If Convert tool missing: status `CONVERT_UNAVAILABLE`, do not invent a synthetic Convert price.

### 7.5 Path enumerator

Every intent produces a path set. Illegal paths stay visible with a reason code.

- `P_SPOT_TAKER`. Baseline path. Market order on the spot pair from current Spot wallet.
- `P_SPOT_LIMIT`. Passive limit at configured book level. Only if urgency allows `PASSIVE` or `MIXED`.
- `P_CONVERT`. Convert quote lock, no spot book take.
- `P_XFER_SPOT_THEN_TAKER`. Transfer quote or base into Spot, then `P_SPOT_TAKER`.
- `P_XFER_USDM_THEN_TAKER`. Transfer into USD-M, then market perp (buy = long, sell/reduce = close or short only if explicit).
- `P_XFER_USDM_THEN_LIMIT`. Same with a limit.
- `P_CONVERT_THEN_XFER_USDM`. Convert to the working asset, then move to USD-M.
- `P_XFER_COINM_THEN_TAKER`. When COIN-M is scoped and the intent names a coin-margined instrument.
- `P_REDUCE_SPOT`. Sell base on Spot.
- `P_REDUCE_CONVERT`. Convert base back to USDT or requested quote.
- `P_REDUCE_PERP`. Close or reduce the matching perp position, then optional transfer-home.
- `P_ROTATE_IDLE`. Transfer exact working notional, no speculative order unless the intent includes one.
- `P_FLATTEN`. Close open perp in the intent symbol, sell leftover base via best scored reduce path, home remaining USDT.

### 7.6 Scoring model

- Score unit: USDT cents, signed. Lower all-in cost to achieve the intent is better for `BUY`. Higher net proceeds is better for `SELL`.
- Terms: mid reference, spread paid, Convert implied vs mid, taker/maker fee, estimated impact from depth, internal transfer fee (usually 0, still recorded), funding over hold horizon, lot-size leftover dust valued at mid, estimated slippage cap as a hard constraint not a soft score.
- Funding term = `position_notional * funding_rate * expected_payments_in_horizon`. Sign follows owner position.
- Impact: walk the book to the order qty. If depth is insufficient, path is `DEPTH_SHORT` and disqualified.
- Stale data: if any load-bearing input is older than `stale_ms`, path family is `STALE` and the run fail-closes.
- Tie-break: fewer legs, then Convert over book, then Spot over perp, then stable sort by path id.
- No model weights. No hidden conviction term. Direction is not scored.
- Reference model in plaintext must accept the same JSON inputs and emit the same winner.

### 7.7 Execution

- Execute winner only. Never spray multiple live paths for one intent.
- `clientOrderId = pathwise_{receipt_id}_{leg_index}`. Idempotent on retry.
- Leg machine: `TRANSFER → WAIT_BALANCE → QUOTE_OR_PLACE → ACK → FILL_OR_QUERY → NEXT_LEG`.
- Convert execute uses winning quote id.
- Spot and futures orders use MCP place-order tools only.
- Paper mode uses live quotes and a simulated fill at the scored price. Labeled `PAPER`. Never mixed into `LIVE` totals.
- Live mode uses the funded Agentic sub-account.
- Partial fills: wait `fill_wait_ms`, then either complete remainder if still winning or cancel remainder and receipt `PARTIAL`.
- Post-trade: fetch fills, compute realized all-in, write delta vs planned.
- Return-idle after futures legs when `policy.return_idle` is true.

### 7.8 Recovery and order truth

- On timeout, query order by `clientOrderId` before any second send.
- States: `UNKNOWN`, `ACKED`, `PARTIAL`, `FILLED`, `CANCELED`, `REJECTED`, `EXPIRED`.
- `UNKNOWN` after query budget is a human-visible halt, not a silent retry loop.
- Crash recovery: ledger is append-only on disk. On boot, resume any `OPEN` receipt.
- Kill switch file and HTTP control: cancel opens, stop new intents.

### 7.9 Policy and safety constraints

These are constraints on Pathwise, not a separate Mandate product.

- `max_notional_usdt` per intent and per day.
- `max_leverage`. Default 1. No implied cross leverage.
- Symbol allowlist.
- `spot_only` / `no_perp` / `no_convert` switches.
- `max_slippage_bps`. Breach disqualifies the path.
- `max_funding_bps` over horizon. Breach disqualifies futures paths.
- Mode `AUTO` or `APPROVE`.
- `paper_only` until owner flips live.
- No withdrawal tools bound in the process.
- Prompt-injection rule: tool layer accepts only a scored winner object signed by the local scorer key. Free-text from the model cannot call place-order.

### 7.10 Agent surface

- MCP client to `https://agent.binance.com/mcp/agentic`.
- OAuth / browser auth as Binance documents. No local API keys in the repo.
- Tool catalog snapshot written at session start. Missing expected tools become named `BLOCKED`.
- Visible trace: observe → enumerate → score → (approve) → act → fetch fill → receipt.
- Narration is generated from the receipt JSON. If the model contradicts sign or cents, discard narration and print the JSON.
- Pathwise can expose its own MCP server so another agent can call `score_intent` and `execute_winner`. Same policy applies.

### 7.11 Ledger, receipts, proof

- Append-only JSONL ledger at `data/ledger.jsonl`.
- Receipt fields listed in section 10.
- Canonical hash over the scored inputs, not over the prose.
- Campaign runner: frozen intent set, N runs, two starting wallet states, five symbols.
- Ablation runner: full, `no_convert`, `no_transfer`, `no_fee_term`, `no_funding_term`, `random_path`.
- Verifier CLI: `pathwise verify RECEIPT_ID` reads recorded inputs, reruns reference model, prints `MATCH` or `DRIFT`.
- `GATES.md` and `CLAIMS.md` updated when a gate runs. Failures stay in the file.
- No silent deletion of losing runs.

### 7.12 Product UI

- Screen A Intent. One box, examples, policy chips (`AUTO`/`APPROVE`, `PAPER`/`LIVE`).
- Screen B Wallet map. Spot, USD-M, other scoped wallets, amounts, last refresh.
- Screen C Path table. All enumerated paths, status, each score term, winner row.
- Screen D Execute. Legs as a timeline. Live state per leg.
- Screen E Receipt. Planned vs realized, fill ids, cents vs baseline, copyable JSON.
- Screen F Campaign. Frozen set results, ablation chart, last updated commit.
- Screen G Proof. Public replay of published receipts. No login.
- Empty, loading, stale, blocked-scope, insufficient-balance, timeout-unknown states are first-class.
- Winning screenshot: path table with three live prices and a cents delta, not a logo.

### 7.13 Distribution and repo

- Public web app for judge path.
- CLI for local score, execute, verify, campaign.
- README leads with the cents table.
- `SETUP.md`, `ARCHITECTURE.md`, `SECURITY.md`, `DECISIONS.md`, `BUILD_CONTRACT.md`, `CLAIMS.md`, `GATES.md`.
- CI: unit + reference-model tests. Live MCP tests labeled and skippable.

## 8. Intent schema

Canonical JSON. LLM output must validate against this schema or the run stops.

| Field | Type | Rules |
|---|---|---|
| `intent_id` | ulid | Client generated |
| `side` | enum | `BUY` \| `SELL` \| `ROTATE` \| `REDUCE` \| `FLATTEN` |
| `base` | string | SOL, BTC, ETH, BNB, ... |
| `quote` | string | Default USDT |
| `notional_quote` | decimal | XOR with `qty_base`. One required |
| `qty_base` | decimal | XOR with `notional_quote` |
| `hold_horizon_sec` | int | Default 86400. 0 means ignore funding |
| `urgency` | enum | `TAKER` \| `MIXED` \| `PASSIVE`. Default `MIXED` |
| `constraints` | object | `spot_only`, `no_perp`, `no_convert`, `reduce_only` |
| `policy_id` | string | Which policy snapshot applies |

## 9. Scorecard schema

| Field | Meaning |
|---|---|
| `path_id` | Stable id from section 7.5 |
| `legal` | true \| false |
| `reason_code` | `OK`, `WRONG_POCKET`, `DEPTH_SHORT`, `STALE`, `SCOPE_BLOCKED`, `CONVERT_UNAVAILABLE`, `POLICY_BLOCK`, `LOT_SIZE` |
| `legs[]` | `transfer` \| `convert` \| `spot_order` \| `perp_order` \| `wait_balance` |
| `ref_mid` | Quote-currency mid used for the run |
| `spread_cost` | USDT |
| `impact_cost` | USDT |
| `fee_cost` | USDT |
| `convert_premium` | USDT, signed vs mid |
| `funding_cost` | USDT over horizon |
| `dust_cost` | USDT |
| `all_in` | USDT. The comparable number |
| `delta_vs_baseline` | USDT cents vs `P_SPOT_TAKER`, signed from owner point of view |
| `inputs_hash` | SHA-256 of raw MCP payloads used |

## 10. Receipt schema

| Field | Meaning |
|---|---|
| `receipt_id` | ulid |
| `mode` | `PAPER` \| `LIVE` |
| `intent` | Frozen intent JSON |
| `wallet_snapshot_before` | All scoped wallets |
| `paths` | Full scorecard array |
| `winner` | `path_id` |
| `approval` | `AUTO` \| `APPROVED` \| `DENIED` \| `NOT_REQUIRED` |
| `legs_executed` | Tool, request, response, `clientOrderId`, state |
| `fills` | Official fill ids, qty, price, fee, time |
| `planned_all_in` | From winner score |
| `realized_all_in` | From fills |
| `delta_vs_baseline_planned` | Cents |
| `delta_vs_baseline_realized` | Cents |
| `baseline_win` | true if taker-spot was best |
| `verify_command` | `pathwise verify {id}` |
| `limitations` | Plain text, required if any tool was blocked |

## 11. State machines

### Intent run

`NEW → PARSED → SNAPSHOTTED → ENUMERATED → SCORED → (AWAIT_APPROVAL) → EXECUTING → RECONCILING → RECEIPTED | FAILED | ABORTED`

### Order leg

`READY → SENT → ACKED → PARTIAL → FILLED`

Side doors: `REJECTED`, `CANCELED`, `EXPIRED`, `UNKNOWN_HALT`.

### Convert leg

`NEED_QUOTE → QUOTED → WINNER → EXECUTE_REQUESTED → SETTLED | QUOTE_EXPIRED | REJECTED`

### Transfer leg

`NEED_MOVE → SENT → BALANCE_WAIT → CONFIRMED | FAILED`

Balance wait polls MCP balances, not a sleep guess.

## 12. Invariants

1. The model never selects a path. The scorer does.
2. One intent produces at most one live execution plan.
3. `P_SPOT_TAKER` always exists as a scored row if the spot pair exists, even when it loses.
4. A blocked primitive is named. The product does not substitute a generic venue and keep the Binance badge.
5. `clientOrderId` is unique per leg and reused on retry of that leg only.
6. Ledger lines are append-only. Corrections are new lines that reference the old `receipt_id`.
7. `PAPER` totals never add into `LIVE` campaign numbers.
8. No withdrawal tool is linked.
9. Conservation: realized fee + residual balances + filled assets explain the wallet delta within lot dust.
10. Receipt hash covers inputs and score, not the LLM paragraph.

## 13. Agent OS protocol seam

| Need | Source of truth | Fail closed if missing |
|---|---|---|
| Spot book, ticker | MCP market tools, unauth allowed | Yes for spot paths |
| Funding, mark | MCP market tools | Yes for perp paths |
| Balances, positions | MCP account on Agentic sub-account | Yes |
| Internal transfer | MCP transfer inside Agentic account | Yes for seam paths |
| Spot / futures order | MCP trade scopes | Yes for live execute |
| Convert quote + execute | MCP Convert tools | Convert family `UNAVAILABLE` |
| Main read-only | Optional MCP scope | Hide the pane, do not fake it |
| On-chain / x402 / Earn | Not in v1 execute path | Out of execute path |

Seam spike is Gate 1. Before UI, run a script that lists tools, pulls a book, requests a Convert quote if present, reads balances, transfers a dust amount inside the sub-account if funded, and writes `tools.json`. That file is committed as evidence, secrets stripped.

## 14. Architecture

Single repo, three runtimes.

- `core/`. Reference model and scorer in deterministic TypeScript or Python. No network.
- `adapter/`. Binance MCP client, auth, tool wrappers, raw payload store.
- `exec/`. Leg state machine, idempotency, recovery.
- `agent/`. Intent parser prompt, narration, MCP server facade.
- `web/`. Screens A–G.
- `cli/`. score, execute, verify, campaign.
- `data/`. `ledger.jsonl`, `receipts/`, `campaign/`.

Default language: TypeScript for web + adapter, or Python if the MCP SDK you already trust is Python. Do not split languages without a reason. Pick one in `DECISIONS.md` on Day 1 and do not reopen it.

Original technical insight to capture in `DECISIONS.md`: the first naive design will treat Convert as a price check and transfer as setup. The insight is that both are competing execution legs with their own clocks. Scoring them as first-class paths, with quote TTL and balance-wait as state, is the product.

## 15. Threat model

| Threat | What we do | Residual |
|---|---|---|
| Prompt injection tries to place an order | Orders only from scorer-signed winner objects | Owner still granted MCP trade scope |
| Duplicate order after timeout | `clientOrderId` + query-before-retry | Exchange-side races outside our view |
| Stale Convert quote | TTL check, requote, fail closed | Quote can still move inside the send window |
| Wrong wallet send | Wallet map is a scored leg | MCP could still reject |
| Model invents PnL | Narration checked against receipt JSON | Owner may screenshot prose anyway |
| Secret leak in repo or demo | OAuth tokens in env, never committed, public proof uses recorded payloads | Live token theft is owner ops |
| Over-size live trade | `max_notional`, `paper_only` default | Owner can raise caps |
| Judge thinks paper is live | Mode stamped on every receipt and screen | None if labels hold |

## 16. Public / private boundary

| Item | Boundary |
|---|---|
| Score math, path ids, reason codes | Public |
| Recorded books and Convert quotes used in published receipts | Public at submission |
| Fill ids on the Agentic account for published runs | Public at submission |
| Campaign aggregates | Public |
| OAuth tokens, cookie jars | Private forever |
| Main-account identity, KYC, email | Private forever |
| Unpublished live balances | Private until owner publishes a receipt |
| LLM chain-of-thought | Private. Not needed for proof |

## 17. Reference model spec

File: `core/reference_model.md` plus an executable function `score(intent, snapshot) -> Scorecard`.

- Inputs are pure JSON. No clock calls inside the function. `received_at` is an input field.
- Rounding: 8 decimal qty, 8 decimal price, 2 decimal USDT cents for deltas. Bankers rounding documented.
- Book walk uses displayed levels only. No interpolation past last level.
- If qty remains after last level, `DEPTH_SHORT`.
- Convert premium = convert_to_amount valued at mid minus from_amount, sign by side.
- Funding payments = floor of horizon against the funding clock, including the next event if `next_funding_at` falls inside horizon.
- Ties broken as section 7.6.
- Zeros, missing books, zero quote size, dust below lot size, and expired quotes have fixtures.

Production scorer must match the reference on the fixture pack. Tests compare against the reference. They do not re-code expected winners by hand except in the fixture generator.

## 18. Measurement campaign

### Headline

Median realized cents saved per $1,000 notional versus always-taker Spot, on the frozen intent set, `LIVE` or labeled paper-with-live-quotes. Show both planned and realized.

### Frozen set, lock before looking

- Symbols: `BTCUSDT`, `ETHUSDT`, `SOLUSDT`, `BNBUSDT`, and one thinner alt the owner actually holds risk for.
- Sizes: 25, 100, 200 USDT.
- Sides: `BUY` and `SELL`.
- Wallet starts: all quote on Spot, all quote on USD-M.
- Horizons: 0s and 24h.
- Minimum 20 completed runs that reach `RECEIPTED`. Publish every attempt, including fails.

### Ablations

- `full`
- `no_convert`
- `no_transfer`
- `no_fee_term`
- `no_funding_term`
- `random_legal_path`

Hold timestamps and inputs fixed. If full does not beat `no_convert` and `no_transfer` on the set, the mechanism is not proven.

### Epistemic attacks to run

- Cherry-pick check: publish the full set, not the best five.
- Leakage: scorer cannot see future klines.
- Crippled baseline: baseline uses the same book, not a worse feed.
- Unequal info: ablations get the same snapshot.
- Hidden retry: campaign runner records attempt count.

## 19. UX copy and demo

### 10 second line

You say what you want done. Pathwise prices every live Binance path after fees, Convert, and wallet location, then takes the cheap one.

### Winning screenshot

A table. Three paths. Convert, Spot taker, Transfer-then-perp. One winner. A number like −37¢ vs Spot taker on $200. Timestamp and MCP provenance under it.

### Three-minute demo, written before build

1. 0:00–0:15. Intent box. Type buy 200 USDT of SOL, hold 24h. Wallet map shows USDT on USD-M, not Spot.
2. 0:15–0:50. Path table fills from live MCP. Spot taker is legal only after a transfer. Convert has a quote id and TTL. Perp path shows funding.
3. 0:50–1:20. Winner highlighted. Cents vs baseline spoken in one sentence.
4. 1:20–2:10. Execute. Transfer leg confirms. Order or Convert settles. Fill id on screen.
5. 2:10–2:40. Receipt. Planned vs realized. verify command pasted.
6. 2:40–3:00. Campaign page. Frozen set, ablation, no architecture slide.

## 20. Non-goals

These are out of Pathwise, not deferred Pathwise features.

- Direction prediction, RSI, Wyckoff, news alpha.
- A standalone policy-passport product.
- Selling signals over x402.
- Stock options and tokenized-equity hedging.
- Main-account withdrawals or agent self-funding from main.
- Claiming empty Agentic history is the owner’s lifetime PnL.
- Multi-exchange routing.

## 21. Phased gates

Build in this order. A later gate does not start because the calendar moved. It starts because the previous pass rule hit.

### Gate 0. Repo and contract

Scope: `BUILD_CONTRACT.md`, folder layout, policy defaults, `paper_only` true.

Pass: clean clone boots, unit test harness green on a dummy score.

### Gate 1. Protocol seam

Scope: MCP connect, tool catalog, book pull, balance pull, Convert probe, dust transfer probe.

Evidence: `tools.json`, raw payloads with secrets stripped.

Pass: catalog committed. Each required family is `LIVE` or named `BLOCKED`.

Stop: do not design screens.

### Gate 2. Reference model

Scope: `score()` + fixtures for zeros, dust, stale, depth short, convert premium, funding sign, ties.

Pass: all fixtures match golden files. Property test: baseline row always present when spot pair exists.

### Gate 3. Enumerator + wallet seam

Scope: build path set from intent + snapshot. Include illegal rows with reason codes.

Pass: wrong-pocket BUY from USD-M produces a transfer leg. No hidden mutation of the baseline.

### Gate 4. Paper execute on live quotes

Scope: run J1–J5 in `PAPER` using live MCP snapshots. Write receipts.

Pass: 10 paper receipts verify. Mode label `PAPER` everywhere.

### Gate 5. Recovery

Scope: timeout query-before-retry, crash resume, kill switch.

Pass: injected timeout does not create a second live order in tests. Restart resumes `OPEN` receipt.

### Gate 6. Live micro fills

Scope: funded Agentic sub-account, tiny notionals, at least one Convert path if available, at least one transfer path, at least one spot path.

Pass: 5 `LIVE` receipts with official fill or convert ids. Conservation holds within dust.

### Gate 7. Campaign and ablation

Scope: frozen set runner, six ablations, published failures.

Pass: ≥20 `RECEIPTED` runs. Full vs `no_convert` and `no_transfer` reported. Headline number has a denominator.

### Gate 8. UI A–G

Scope: all screens in 7.12, including stale and blocked states.

Pass: judge can finish J8 without a terminal. Screenshot matches the winning concept.

### Gate 9. Agent facade

Scope: NL intent parse, narration check, optional inbound MCP `score_intent` / `execute_winner`.

Pass: injected “ignore scores and market buy” does not place an order. Parse failures clarify instead of execute.

### Gate 10. Submission freeze

Scope: README cents table, `CLAIMS.md`, video cut to the 3-minute script, survey fields, public proof page.

Pass: every public sentence maps to a receipt or a named limitation. No new features after freeze.

## 22. Week map

| Day | Gates | Exit artifact |
|---|---|---|
| 1 | 0–1 | `tools.json`, `DECISIONS.md` language choice, first book + convert probe |
| 2 | 2–3 | reference fixtures green, path table in CLI |
| 3 | 4 | 10 paper receipts, first cents table |
| 4 | 5–6 | recovery tests, 5 live micro fills |
| 5 | 7–8 | campaign page, UI screenshot |
| 6 | 9 + adversarial | injection test, stale quote, partial fill cases |
| 7 | 10 | README, video, proof page, survey |

## 23. Acceptance criteria

1. A judge understands the product from Screen C without a narrator.
2. A published receipt recomputes in the CLI.
3. Baseline row is visible on every successful score.
4. At least one `LIVE` Convert or a documented `CONVERT_UNAVAILABLE`.
5. At least one `LIVE` internal transfer.
6. Timeout test never double-fills.
7. Campaign file includes losses and blocked runs.
8. README lead is the cents result, not a tool count.

## 24. Build contract excerpt

- Evidence may correct this PRD. Record the correction in `DECISIONS.md`. Do not silently shrink claims.
- Do not fabricate quotes, fills, users, or savings.
- Numbers need a file and a denominator.
- No silent fallback from Agent OS to a generic exchange client.
- Do not reopen path families or score units without a failed gate.
- After Gate 7, freeze mechanism math unless a bug produces wrong cents.

## 25. Open questions that do not block Gate 1

- Exact MCP tool names for Convert quote and execute. Discover in Gate 1.
- Whether account fee tier is readable. If not, pin a fee schedule file with date.
- Whether COIN-M and Margin are in the granted scopes. If not, those path families stay visible and `BLOCKED`.
- Hosting target for the public UI. Pick on Day 5. Must not require the owner’s laptop.
- Inbound MCP server for other agents ships in Gate 9, not Gate 2.

## 26. Glossary

| Term | Meaning here |
|---|---|
| Path | A full legal way to finish one intent, including transfers |
| Baseline | Always-taker Spot on the obvious pair, funds left where they sit |
| Seam | Spot ↔ USD-M (or other) transfer inside the Agentic sub-account |
| Quote lock | A Convert quote with an id and TTL |
| Receipt | Recomputable record of inputs, winner, fills, cents |
| Paper | Live data, simulated fill, labeled, excluded from LIVE totals |

End of Pathwise Mini PRD v1.0. Feature inventory in section 7 is the source of truth. Gates in section 21 are the build order. Non-goals in section 20 are the only allowed cuts.
