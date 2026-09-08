import { NextResponse } from 'next/server';
import { isStopped, setStopped } from '@/server/control';
export async function GET(){return NextResponse.json({stopped:await isStopped()});}
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
export async function POST(request:Request){try{if(!isAllowedOrigin(request))return NextResponse.json({error:'Origin not allowed'},{status:403});const {stopped}=await request.json();if(typeof stopped!=='boolean')throw new Error('Expected boolean stopped');return NextResponse.json(await setStopped(stopped));}catch(e){return NextResponse.json({error:(e as Error).message},{status:400});}}
