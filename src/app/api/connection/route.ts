import { NextResponse } from 'next/server';
import evidence from '../../../../data/tools.json';
export async function GET(){return NextResponse.json({status:evidence.status,endpoint:evidence.endpoint,received_at:evidence.received_at,families:evidence.families});}
