# Fixture reference specification

`score(intent, snapshot, policy)` is pure and uses `snapshot.now`, never a system clock. The executable is `scorer.ts`. An independently implemented model is still outstanding.

1. Validate intent amounts (positive, exactly one quantity/notional), symbols, sides and horizon.
2. Mid is (best bid + best ask) / 2. Missing either side disqualifies the run.
3. Requested base is explicit quantity, or notional / mid. Floor to lot size. Residual quote is dust and is not spent.
4. Compare a fixed lot-rounded base quantity on every buy/sell route.
5. Walk only displayed book levels. Remaining quantity beyond depth gives DEPTH_SHORT. Spread = (top - mid) × quantity × direction. Impact = (walked value - top × quantity) × direction, where direction is +1 BUY, -1 SELL.
6. Fee = executed gross quote × fixture fee rate. Convert premium = (Convert price - mid) × quantity × direction. Quotes under 5 seconds remaining are expired for execution.
7. BUY all-in = principal + spread + impact + fees + Convert premium + funding. SELL proceeds = principal - those costs. Dust is reported separately as unspent residual quote.
8. Funding payment count is zero before the next event, otherwise 1 + floor((horizon end - next event) / interval). Only long funding is estimated; missing position/depth blocks actual perp eligibility.
9. Delta cents = (baseline cost - path cost) × 100 for BUY; reverse for SELL. Baseline remains visible even when wrong-pocket. ROTATE has no cross-product Spot delta.
10. Reject stale/future snapshots, symbol mismatch, policy cap, insufficient balance, expired quote, missing transfer, unsupported scope and slippage breach. Passive fills cannot be guaranteed and remain ineligible.
11. Lower BUY cost / higher SELL proceeds wins, then fewer legs, Convert before Spot before perp, then path ID lexical order. Equal-path comparator is symmetric.
12. Numeric outputs round to 8 decimals, delta cents to 2 decimals. Half-even ties use a documented floating tolerance; this is fixture arithmetic and must be replaced/audited before LIVE.

Every fixture price and fee is synthetic, not an exchange fee-tier assertion. Full input provenance is the source file + frozen snapshot in the receipt.
