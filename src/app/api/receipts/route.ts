import { NextResponse } from 'next/server';
import { createReceipt, listReceipts } from '@/server/ledger';
import { fixtureSnapshot } from '@/core/fixtures';
import { validatePolicy } from '@/core/policy';
import { isStopped } from '@/server/control';
import { parseIntent } from '@/core/parser';
import { score } from '@/core/scorer';
export const runtime='nodejs';
export async function GET(){try{return NextResponse.json(await listReceipts());}catch{return NextResponse.json({error:'Ledger could not be read.'},{status:500});}}
function isAllowedOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  try {
    const originUrl = new URL(origin);
    const reqUrl = new URL(request.url);
    const host = request.headers.get('host');
    if (originUrl.host === reqUrl.host || (host && originUrl.host === host)) return true;
    if ((originUrl.hostname === 'localhost' || originUrl.hostname === '127.0.0.1') &&
        (reqUrl.hostname === 'localhost' || reqUrl.hostname === '127.0.0.1')) return true;
    return false;
  } catch {
    return false;
  }
}
export async function POST(request:Request){
  try{
    if(!isAllowedOrigin(request))return NextResponse.json({error:'Origin not allowed'},{status:403});
    if(await isStopped())return NextResponse.json({error:'Emergency stop is active.'},{status:409});
    const body=await request.json();if(typeof body.text!=='string'||body.text.length>5000)throw new Error('Provide an intent under 5,000 characters.');
    const intent=parseIntent(body.text);
    const policy=validatePolicy(body.policy);
    const card=score(intent,fixtureSnapshot(intent.base,body.pocket==='USDM'?'USDM':'SPOT'),policy);
    return NextResponse.json(await createReceipt(card));
  }catch(e){return NextResponse.json({error:(e as Error).message},{status:400});}
}
