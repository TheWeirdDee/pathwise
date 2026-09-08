import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import path from 'node:path';
import { canonical } from '@/core/canonical';
import { score } from '@/core/scorer';
import type { Receipt, Scorecard } from '@/core/types';
const root=path.join(process.cwd(),'data');
const hash=(value:unknown)=>createHash('sha256').update(canonical(value)).digest('hex');
export async function createReceipt(card:Scorecard):Promise<Receipt> {
  const recomputed=score(card.intent,card.snapshot,card.policy);
  const winner=recomputed.paths.find(p=>p.path_id===recomputed.winner);
  if(!winner||winner.all_in===null)throw new Error('No legal winner. Execution is blocked.');
  const receipt_id=randomUUID();
  const receipt:Receipt={receipt_id,mode:'FIXTURE',created_at:new Date().toISOString(),scorecard:recomputed,inputs_hash:hash({intent:recomputed.intent,snapshot:recomputed.snapshot,policy:recomputed.policy}),score_hash:hash(recomputed.paths),winner:winner.path_id,planned_all_in:winner.all_in,realized_all_in:null,delta_vs_baseline_planned:winner.delta_vs_baseline,baseline_win:winner.path_id==='P_SPOT_TAKER',approval:card.policy.mode==='AUTO'?'AUTO':'APPROVED',legs_executed:winner.legs.map((leg,i)=>({leg,state:'SIMULATED',clientOrderId:`pathwise_${receipt_id}_${i}`})),fills:[],limitations:['Synthetic fixture inputs, not live market data.','No trade, transfer, or official fill occurred.','Estimated costs are not realized savings.','Live MCP adapter is blocked; authentication and tool mapping are not configured.'],verify_command:`npm run cli -- verify ${receipt_id}`};
  await mkdir(path.join(root,'receipts'),{recursive:true});
  await appendFile(path.join(root,'ledger.jsonl'),JSON.stringify({event:'RECEIPTED',receipt})+'\n');
  await writeFile(path.join(root,'receipts',`${receipt_id}.json`),JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});
  return receipt;
}
export async function listReceipts():Promise<Receipt[]> {
  try {const raw=await readFile(path.join(root,'ledger.jsonl'),'utf8');return raw.trim().split('\n').filter(Boolean).map(line=>JSON.parse(line)).filter(e=>e.event==='RECEIPTED').map(e=>e.receipt).reverse();}catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')return [];throw e;}
}
export function verifyReceipt(receipt:Receipt) {
  const c=receipt.scorecard;const result=score(c.intent,c.snapshot,c.policy);
  return {status:hash({intent:c.intent,snapshot:c.snapshot,policy:c.policy})===receipt.inputs_hash&&hash(result.paths)===receipt.score_hash&&canonical(result)===canonical(c)&&result.winner===receipt.winner&&result.paths.find(p=>p.path_id===result.winner)?.all_in===receipt.planned_all_in?'MATCH':'DRIFT',inputs_hash:hash({intent:c.intent,snapshot:c.snapshot,policy:c.policy}),score_hash:hash(result.paths)};
}
