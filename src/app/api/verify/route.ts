import { NextResponse } from 'next/server';
import { listReceipts, verifyReceipt } from '@/server/ledger';
export async function POST(request:Request){try{const {receipt_id}=await request.json();const r=(await listReceipts()).find(r=>r.receipt_id===receipt_id);if(!r)return NextResponse.json({error:'Receipt not found'},{status:404});return NextResponse.json(verifyReceipt(r));}catch{return NextResponse.json({error:'Unable to verify receipt'},{status:400});}}
