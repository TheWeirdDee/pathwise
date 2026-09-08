import { notFound } from 'next/navigation';
import { Dashboard } from '@/components/dashboard';
export function generateStaticParams(){return ['wallets','receipts','campaign','proof','policy'].map(section=>({section}));}
export default async function Section({params}:{params:Promise<{section:string}>}){const {section}=await params;if(!['wallets','receipts','campaign','proof','policy'].includes(section))notFound();return <Dashboard page={section}/>}
