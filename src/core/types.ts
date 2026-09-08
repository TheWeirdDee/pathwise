export type Side = 'BUY' | 'SELL' | 'ROTATE' | 'REDUCE' | 'FLATTEN';
export type Intent = {
  intent_id: string; side: Side; base: string; quote: 'USDT';
  notional_quote?: number; qty_base?: number; hold_horizon_sec: number;
  urgency: 'TAKER' | 'MIXED' | 'PASSIVE';
  constraints: { spot_only: boolean; no_perp: boolean; no_convert: boolean; reduce_only: boolean };
  policy_id: string;
};
export type Policy = { max_notional_usdt: number; max_daily_usdt: number; max_slippage_bps: number; max_funding_bps: number; max_leverage: number; allowlist: string[]; mode: 'APPROVE' | 'AUTO'; paper_only: true; return_idle: boolean; stale_ms: number };
export type Wallet = { id: string; name: string; quote: number; base: number; status: 'AVAILABLE' | 'BLOCKED'; };
export type Snapshot = {
  source: 'FIXTURE'; now: number; received_at: number; symbol: string;
  bids: [number, number][]; asks: [number, number][];
  perp_bid: number; perp_ask: number; funding_rate: number; next_funding_at: number; funding_interval_sec: number;
  convert: { id: string; buy_price: number; sell_price: number; expires_at: number } | null;
  spot_taker_fee: number; spot_maker_fee: number; perp_taker_fee: number; perp_maker_fee: number;
  lot_size: number; wallets: Wallet[]; transfer_available: boolean; perp_available: boolean;
};
export type Path = {
  path_id: string; label: string; venue: string; description: string; legal: boolean; reason_code: string;
  legs: string[]; ref_mid: number; quantity: number; spread_cost: number; impact_cost: number; fee_cost: number;
  convert_premium: number; funding_cost: number; dust_cost: number; all_in: number | null;
  delta_vs_baseline: number | null; price: number | null; execution: 'IMMEDIATE' | 'PASSIVE' | 'UNAVAILABLE';
};
export type Scorecard = { intent: Intent; snapshot: Snapshot; policy: Policy; paths: Path[]; winner: string | null; baseline: string; computed_at: number; };
export type Receipt = { receipt_id: string; mode: 'FIXTURE'; created_at: string; scorecard: Scorecard; inputs_hash: string; score_hash: string; winner: string; planned_all_in: number; realized_all_in: null; delta_vs_baseline_planned: number | null; baseline_win: boolean; approval: 'APPROVED' | 'AUTO'; legs_executed: {leg: string; state: 'SIMULATED'; clientOrderId: string}[]; fills: never[]; limitations: string[]; verify_command: string; };
