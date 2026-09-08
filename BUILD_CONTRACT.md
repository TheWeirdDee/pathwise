# Pathwise build contract

The requested 30-minute build creates a runnable Next.js application and a deterministic fixture workbench. The PRD remains the product target; it is not evidence that live behavior exists.

- Default policy is paper-only, approval required, 1× maximum leverage.
- Current runtime mode is **FIXTURE**, deliberately distinct from PAPER (live quotes + simulated fill) and LIVE.
- No external financial action is implemented or authorized by the build request.
- Binance MCP connection failure is recorded in `data/tools.json`. No fallback feed is substituted.
- All thirteen path families remain visible, including blocked families.
- Inputs and scores are hashed. Fixture receipts have no fill IDs or realized savings.
- Gate status and deviations are explicit in GATES.md, CLAIMS.md, and DECISIONS.md.
- Full scope inventory is preserved in `docs/Pathwise-PRD.md`; unfinished items are tracked in `docs/IMPLEMENTATION_STATUS.md`.
