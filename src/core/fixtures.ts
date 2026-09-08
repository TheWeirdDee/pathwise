import type { Policy, Snapshot } from './types';
export const defaultPolicy: Policy = { max_notional_usdt: 1000, max_daily_usdt: 5000, max_slippage_bps: 30, max_funding_bps: 10, max_leverage: 1, allowlist: ['SOL','BTC','ETH','BNB','XRP'], mode: 'APPROVE', paper_only: true, return_idle: true, stale_ms: 15000 };
export const fixtureTime = Date.UTC(2026,8,8,12,0,0);
export function fixtureSnapshot(base = 'SOL', pocket: 'SPOT' | 'USDM' = 'SPOT'): Snapshot {
  const price: Record<string,number> = { SOL: 142.68, BTC: 97420, ETH: 3248.5, BNB: 612.4, XRP: 2.38 };
  const mid = price[base] ?? 142.68;
  return {
    source:'FIXTURE', now:fixtureTime, received_at:fixtureTime, symbol:`${base}USDT`,
    bids:[[mid*0.9998,10000/mid],[mid*0.9995,50000/mid],[mid*0.999,100000/mid]],
    asks:[[mid*1.0002,10000/mid],[mid*1.0005,50000/mid],[mid*1.001,100000/mid]],
    perp_bid:mid*0.9999, perp_ask:mid*1.0001, funding_rate:0.0001,
    next_funding_at:fixtureTime+4*3600000, funding_interval_sec:28800,
    convert:{id:`fixture-convert-${base.toLowerCase()}`,buy_price:mid*1.00035,sell_price:mid*0.99965,expires_at:fixtureTime+30000},
    spot_taker_fee:0.001, spot_maker_fee:0.001, perp_taker_fee:0.0005,perp_maker_fee:0.0002,lot_size:base==='BTC'?0.00001:0.0001,
    wallets:[{id:'SPOT',name:'Spot wallet',quote:pocket==='SPOT'?1240.50:40.50,base:500/mid,status:'AVAILABLE'}, {id:'USDM',name:'USD-M Futures',quote:pocket==='USDM'?1200:320,base:0,status:'AVAILABLE'}, {id:'FUNDING',name:'Funding',quote:0,base:0,status:'AVAILABLE'}, {id:'COINM',name:'COIN-M Futures',quote:0,base:0,status:'BLOCKED'}, {id:'MARGIN',name:'Margin',quote:0,base:0,status:'BLOCKED'}], transfer_available:true,perp_available:true,
  };
}
