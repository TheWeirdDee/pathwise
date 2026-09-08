import { fixtureSnapshot, defaultPolicy } from './fixtures';
import { score } from './scorer';
import { parseIntent } from './parser';
export function runCampaign(){
  const rows:{base:string;size:number;side:string;pocket:string;horizon:number;results:{variant:string;winner:string|null;delta:number|null}[]}[]=[];
  for(const base of defaultPolicy.allowlist)for(const size of [25,100,200])for(const side of ['BUY','SELL'])for(const pocket of ['SPOT','USDM'] as const)for(const horizon of [0,86400]){
    const intent=parseIntent(`${side} ${size} USDT of ${base}`);intent.hold_horizon_sec=horizon;
    const snapshot=fixtureSnapshot(base,pocket);
    const variants=['full','no_convert','no_transfer','no_fee_term','no_funding_term','random_legal_path'];
    const results=variants.map(variant=>{
      const s=structuredClone(snapshot), i=structuredClone(intent);
      if(variant==='no_convert')i.constraints.no_convert=true;
      if(variant==='no_transfer')s.transfer_available=false;
      if(variant==='no_fee_term'){s.spot_maker_fee=0;s.spot_taker_fee=0;s.perp_maker_fee=0;s.perp_taker_fee=0;}
      if(variant==='no_funding_term')s.funding_rate=0;
      const c=score(i,s,defaultPolicy);const legal=c.paths.filter(p=>p.legal);
      const winner=variant==='random_legal_path'?legal[(size+horizon+base.length)%Math.max(1,legal.length)]:c.paths.find(p=>p.path_id===c.winner);
      // Evaluate selected paths against the full cost model, including omitted terms.
      const full=score(intent,snapshot,defaultPolicy).paths.find(p=>p.path_id===winner?.path_id);
      return {variant,winner:winner?.path_id??null,delta:full?.delta_vs_baseline??null};
    });
    rows.push({base,size,side,pocket,horizon,results});
  }
  return {mode:'FIXTURE' as const,attempts:rows.length,rows,summary:['full','no_convert','no_transfer','no_fee_term','no_funding_term','random_legal_path'].map(variant=>{
    const values=rows.flatMap(row=>{const r=row.results.find(r=>r.variant===variant);return r?.delta!=null?[r.delta*1000/row.size]:[];}).sort((a,b)=>a-b);
    const n=values.length;return {variant,completed:n,blocked:rows.length-n,median_cents_per_1000:n?(values[Math.floor((n-1)/2)]+values[Math.floor(n/2)])/2:0};
  })};
}
