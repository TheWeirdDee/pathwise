import { NextResponse } from 'next/server';
import { createReceipt, listReceipts } from '@/server/ledger';
import { fixtureSnapshot, defaultPolicy } from '@/core/fixtures';
import { parseIntent } from '@/core/parser';
import { score } from '@/core/scorer';
export const runtime='nodejs';
export async function GET(){try{return NextResponse.json(await listReceipts());}catch{return NextResponse.json({error:'Ledger could not be read.'},{status:500});}}
export async function POST(request:Request){
  try{
    const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return NextResponse.json({error:'Origin not allowed'},{status:403});
    const body=await request.json();if(typeof body.text!=='string'||body.text.length>5000)throw new Error('Provide an intent under 5,000 characters.');
    const intent=parseIntent(body.text);
    const policy={...defaultPolicy,mode:body.mode==='AUTO'?'AUTO' as const:'APPROVE' as const};
    const card=score(intent,fixtureSnapshot(intent.base,body.pocket==='USDM'?'USDM':'SPOT'),policy);
    return NextResponse.json(await createReceipt(card));
  }catch(e){return NextResponse.json({error:(e as Error).message},{status:400});}
}
