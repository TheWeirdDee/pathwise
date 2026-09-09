# Claims and evidence

| Claim | Evidence / limit |
|---|---|
| Latest Next.js scaffold at build time | `package.json`: Next 16.3.4, React 19.2.8; npm latest was queried |
| Thirteen path families are visible | `src/core/scorer.ts` and core test |
| Wrong wallet requires a visible transfer leg | Wrong-pocket core test and browser journey |
| Scoring is deterministic on frozen inputs | Pure-function test and receipt verifier |
| Synthetic receipt replay | CLI/API recomputation; inputs and paths hashed with SHA-256 |
| 120 fixture attempts / six variants | `src/core/campaign.ts`, exported campaign JSON |
| Live MCP working | **PARTIALLY CLAIMED**: `data/tools.json` records an authenticated OAuth session to `https://agent.binance.com/mcp/agentic` with a 73-tool catalog. This is the MCP client's connection, not the deployed app's backend — the Next.js adapter layer is not yet wired to call these tools at runtime |
| Actual cents saved | **NOT CLAIMED**: all displayed costs are fixture estimates |
| PAPER on live quotes | **NOT CLAIMED**: no live quote was obtained |
| Realized fill, transfer, conservation or recovery | **NOT CLAIMED**: no financial tool is bound |
| Full PRD completed | **NOT CLAIMED**: see feature status inventory |

Losing or blocked fixture attempts remain in every campaign export. Headline campaign figures have an explicit completed-attempt denominator and never mix FIXTURE into PAPER or LIVE.
