import type { Intent, Path, Policy, Scorecard, Snapshot } from './types';
import { validateIntent } from './parser';
export function round(value:number, digits=8):number {
  const scale=10**digits, n=value*scale, floor=Math.floor(n), fraction=n-floor;
  return (Math.abs(fraction-0.5)<1e-7?(floor%2===0?floor:floor+1):Math.round(n))/scale;
}
export function walkBook(levels:[number,number][],quantity:number) {
  let remaining=quantity,cost=0;
  for (const [price,size] of levels) { if (!(price>0&&size>=0&&Number.isFinite(price)&&Number.isFinite(size))) return null; const take=Math.min(remaining,size); cost+=take*price;remaining-=take;if(remaining<1e-10)break; }
  return remaining>1e-8?null:cost;
}
export function fundingPayments(s:Snapshot,horizon:number):number {
  const until=s.now+horizon*1000;
  if(horizon===0||s.next_funding_at>until||s.next_funding_at<s.now||s.funding_interval_sec<=0)return 0;
  return 1+Math.floor((until-s.next_funding_at)/(s.funding_interval_sec*1000));
}
export function score(rawIntent:Intent,s:Snapshot,policy:Policy):Scorecard {
  const intent=validateIntent(rawIntent);
  const sell=intent.side==='SELL'||intent.side==='REDUCE';
  const mid=((s.bids[0]?.[0]??0)+(s.asks[0]?.[0]??0))/2;
  const requested=mid>0?(intent.qty_base??intent.notional_quote!/mid):0;
  const qty=s.lot_size>0?round(Math.floor((requested+1e-12)/s.lot_size)*s.lot_size):0;
  const notional=requested*mid, principal=qty*mid, dust=round((requested-qty)*mid);
  const spot=s.wallets.find(w=>w.id==='SPOT'&&w.status==='AVAILABLE');
  const usdm=s.wallets.find(w=>w.id==='USDM'&&w.status==='AVAILABLE');
  const paths:Path[]=[];
  const globalReason=!mid?'BOOK_UNAVAILABLE':s.symbol!==`${intent.base}${intent.quote}`?'SYMBOL_MISMATCH':s.now-s.received_at>policy.stale_ms||s.received_at>s.now?'STALE':!policy.allowlist.includes(intent.base)||notional>policy.max_notional_usdt?'POLICY_BLOCK':qty<=0?'LOT_SIZE':null;
  function add(id:string,label:string,venue:string,description:string,legs:string[],kind:'spot'|'convert'|'perp'|'blocked'|'rotate',reason:string|null=null,passive=false) {
    const row:Path={path_id:id,label,venue,description,legs,legal:true,reason_code:'OK',ref_mid:round(mid),quantity:qty,spread_cost:0,impact_cost:0,fee_cost:0,convert_premium:0,funding_cost:0,dust_cost:dust,all_in:null,delta_vs_baseline:null,price:null,execution:passive?'PASSIVE':'IMMEDIATE'};
    let blocked=globalReason??reason;
    if(kind==='spot'&&mid>0) {
      const levels=sell?s.bids:s.asks;
      const top=passive?(sell?s.asks[0][0]:s.bids[0][0]):levels[0][0];
      const value=passive?top*qty:walkBook(levels,qty);
      if(value===null)blocked??='DEPTH_SHORT';
      else { row.price=round(value/qty);row.spread_cost=round((top-mid)*qty*(sell?-1:1));row.impact_cost=round((value-top*qty)*(sell?-1:1));row.fee_cost=round(value*(passive?s.spot_maker_fee:s.spot_taker_fee)); }
      if(passive)blocked??='FILL_NOT_GUARANTEED';
    } else if(kind==='convert') {
      if(!s.convert)blocked??='CONVERT_UNAVAILABLE';
      else {row.price=sell?s.convert.sell_price:s.convert.buy_price;row.convert_premium=round((row.price-mid)*qty*(sell?-1:1));if(s.convert.expires_at-s.now<5000)blocked??='QUOTE_EXPIRED';}
      if(intent.constraints.no_convert)blocked??='POLICY_BLOCK';
    } else if(kind==='perp') {
      row.price=sell?s.perp_bid:s.perp_ask;
      row.spread_cost=round((row.price-mid)*qty*(sell?-1:1));
      row.fee_cost=round(row.price*qty*(passive?s.perp_maker_fee:s.perp_taker_fee));
      row.funding_cost=round(principal*s.funding_rate*fundingPayments(s,intent.hold_horizon_sec));
      // Position and contract depth are unavailable in this fixture. Do not equate a perp with owned Spot assets.
      blocked??=sell?'POSITION_UNAVAILABLE':'PERP_DEPTH_UNAVAILABLE';
      if(intent.constraints.no_perp||intent.constraints.spot_only||!s.perp_available)blocked='POLICY_BLOCK';
      if(Math.abs(row.funding_cost)/principal*10000>policy.max_funding_bps)blocked='FUNDING_CAP';
    } else if(kind==='blocked')blocked??='SCOPE_BLOCKED';
    if(kind==='rotate'){row.dust_cost=0;row.quantity=0;}
    const costs=row.spread_cost+row.impact_cost+row.fee_cost+row.convert_premium+row.funding_cost;
    row.all_in=kind==='blocked'?null:round(kind==='rotate'?notional:sell?principal-costs:principal+costs);
    if(row.price&&Math.max(0,(row.price-mid)*(sell?-1:1))/mid*10000>policy.max_slippage_bps)blocked??='SLIPPAGE_CAP';
    if(!sell&&kind!=='blocked'&&kind!=='rotate'&&row.all_in!==null){const available=legs.some(l=>l.includes('USD-M → Spot'))?(spot?.quote??0)+(usdm?.quote??0):kind==='perp'?(usdm?.quote??0)+(spot?.quote??0):(spot?.quote??0);if(available<row.all_in)blocked??='INSUFFICIENT_BALANCE';}
    if(blocked){row.legal=false;row.reason_code=blocked;row.execution='UNAVAILABLE';}
    paths.push(row);
  }
  const incompatible=intent.side==='ROTATE'||intent.side==='FLATTEN'?'INTENT_MISMATCH':null;
  const pocketReason=sell?(spot?.base??0)<qty?'INSUFFICIENT_BALANCE':null:(spot?.quote??0)<principal?'WRONG_POCKET':null;
  add('P_SPOT_TAKER','Spot market','Spot','Always-taker baseline', ['Spot market order'],'spot',incompatible??pocketReason);
  add('P_CONVERT','Binance Convert','Convert','A locked quote. One simple swap.', ['Accept Convert quote'],'convert',incompatible??pocketReason);
  add('P_XFER_USDM_THEN_TAKER','Transfer → Futures','USD-M','Move exact collateral, then open a 1× perp', ['Spot → USD-M','Wait for balance','Perp market order'],'perp',incompatible);
  add('P_SPOT_LIMIT','Spot limit','Spot','Passive order; fill timing is not guaranteed', ['Spot limit order'],'spot',incompatible??(intent.urgency==='TAKER'?'URGENCY_BLOCK':pocketReason),true);
  add('P_XFER_SPOT_THEN_TAKER','Transfer → Spot','Spot','Bring the required balance home first', ['USD-M → Spot','Wait for balance','Spot market order'],'spot',incompatible??(sell?'BASE_TRANSFER_UNAVAILABLE':!s.transfer_available?'SCOPE_BLOCKED':(usdm?.quote??0)<=0?'INSUFFICIENT_BALANCE':null));
  add('P_XFER_USDM_THEN_LIMIT','Transfer → Futures limit','USD-M','Transfer and post a passive order',['Spot → USD-M','Wait for balance','Perp limit order'],'perp',incompatible??'FILL_NOT_GUARANTEED',true);
  add('P_CONVERT_THEN_XFER_USDM','Convert → Futures','Convert / USD-M','Convert working collateral and transfer',['Accept Convert quote','Spot → USD-M'],'blocked','COLLATERAL_SCOPE_UNVERIFIED');
  add('P_XFER_COINM_THEN_TAKER','Transfer → COIN-M','COIN-M','Coin-margined contract route',['Spot → COIN-M','Contract order'],'blocked','COINM_SCOPE_BLOCKED');
  add('P_REDUCE_SPOT','Reduce Spot','Spot','Sell existing base balance',['Spot sell order'],'spot',!sell?'INTENT_MISMATCH':pocketReason);
  add('P_REDUCE_CONVERT','Reduce via Convert','Convert','Convert base back to USDT',['Accept Convert quote'],'convert',!sell?'INTENT_MISMATCH':pocketReason);
  add('P_REDUCE_PERP','Reduce Futures','USD-M','Close an existing position, return idle',['Reduce-only order','Return idle'],'blocked','POSITION_UNAVAILABLE');
  add('P_ROTATE_IDLE','Rotate idle collateral','Transfer','Transfer exact USDT amount, without an order',['Spot → USD-M','Wait for balance'],'rotate',intent.side!=='ROTATE'?'INTENT_MISMATCH':!s.transfer_available?'SCOPE_BLOCKED':(spot?.quote??0)<notional?'INSUFFICIENT_BALANCE':null);
  add('P_FLATTEN','Flatten & return home','Multi-leg','Close positions and home remaining quote',['Close positions','Reduce base','Return idle'],'blocked',intent.side!=='FLATTEN'?'INTENT_MISMATCH':'POSITION_UNAVAILABLE');
  const baseline=paths[0];
  for(const p of paths)if(p.all_in!==null&&baseline.all_in!==null&&intent.side!=='ROTATE')p.delta_vs_baseline=round((sell?p.all_in-baseline.all_in:baseline.all_in-p.all_in)*100,2);
  const eligible=paths.filter(p=>p.legal&&p.all_in!==null);
  eligible.sort((a,b)=>{const diff=sell?b.all_in!-a.all_in!:a.all_in!-b.all_in!;if(Math.abs(diff)>1e-8)return diff;return a.legs.length-b.legs.length||(a.venue==='Convert'?-1:b.venue==='Convert'?1:0)||a.path_id.localeCompare(b.path_id);});
  return {intent,snapshot:s,policy,paths,winner:eligible[0]?.path_id??null,baseline:baseline.path_id,computed_at:s.now};
}
