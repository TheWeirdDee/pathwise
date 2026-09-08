import { defaultPolicy } from './fixtures';
import type { Policy } from './types';
export function validatePolicy(value:unknown):Policy {
  if(!value||typeof value!=='object')return structuredClone(defaultPolicy);
  const p=value as Partial<Policy>;
  for(const key of ['max_notional_usdt','max_daily_usdt','max_slippage_bps','max_funding_bps'] as const)if(typeof p[key]!=='number'||!Number.isFinite(p[key])||p[key]!<0)throw new Error(`Invalid policy: ${key}`);
  if(!Array.isArray(p.allowlist)||p.allowlist.some(s=>typeof s!=='string'||!defaultPolicy.allowlist.includes(s)))throw new Error('Invalid symbol allowlist');
  if(!['APPROVE','AUTO'].includes(p.mode??''))throw new Error('Invalid approval mode');
  return {...defaultPolicy,max_notional_usdt:p.max_notional_usdt!,max_daily_usdt:p.max_daily_usdt!,max_slippage_bps:p.max_slippage_bps!,max_funding_bps:p.max_funding_bps!,allowlist:p.allowlist,mode:p.mode!};
}
