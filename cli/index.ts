import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseIntent } from '../src/core/parser';
import { fixtureSnapshot, defaultPolicy } from '../src/core/fixtures';
import { score } from '../src/core/scorer';
import { runCampaign } from '../src/core/campaign';
import { createReceipt, listReceipts, verifyReceipt } from '../src/server/ledger';
import { isStopped } from '../src/server/control';
async function main(){
 const [command,...args]=process.argv.slice(2);
 if(command==='verify'){const id=args[0];if(!id)throw new Error('Provide a receipt ID or JSON path.');const receipt=id.endsWith('.json')?JSON.parse(await readFile(path.resolve(id),'utf8')):(await listReceipts()).find(r=>r.receipt_id===id);if(!receipt)throw new Error('Receipt not found');const result=verifyReceipt(receipt);console.log(JSON.stringify(result,null,2));if(result.status!=='MATCH')process.exitCode=1;return;}
 if(command==='campaign'){const result=runCampaign();await mkdir('data/campaign',{recursive:true});const file=`data/campaign/fixture-${Date.now()}.json`;await writeFile(file,JSON.stringify(result,null,2));console.table(result.summary);console.log(`${result.attempts} FIXTURE attempts; ${file}`);return;}
 if(command==='score'||command==='execute'){if(args.includes('--live'))throw new Error('LIVE_EXECUTION_UNAVAILABLE: MCP_CONNECTION_FAILED. No live order adapter is bound.');const pocket=args.includes('--usdm')?'USDM':'SPOT';const text=args.filter(a=>!a.startsWith('--')).join(' ')||'Buy 200 USDT of SOL, hold 24h';const intent=parseIntent(text);const card=score(intent,fixtureSnapshot(intent.base,pocket),defaultPolicy);if(command==='execute'){if(await isStopped())throw new Error('EMERGENCY_STOP');console.log(JSON.stringify(await createReceipt(card),null,2));}else{console.table(card.paths.map(p=>({path:p.path_id,status:p.reason_code,all_in:p.all_in,delta_cents:p.delta_vs_baseline,winner:p.path_id===card.winner})));}return;}
 console.log('Pathwise fixture CLI\n  npm run cli -- score "Buy 200 USDT of SOL, hold 24h" [--usdm]\n  npm run cli -- execute "Buy 200 USDT of SOL"\n  npm run cli -- verify RECEIPT_ID_OR_JSON\n  npm run cli -- campaign\nLive execution is unavailable.');
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
