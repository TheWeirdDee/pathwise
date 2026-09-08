import type { Intent } from './types';
export class ClarificationError extends Error {}
export function validateIntent(value: unknown): Intent {
  if (!value || typeof value !== 'object') throw new ClarificationError('Enter an intent object.');
  const v = value as Partial<Intent>;
  if (!['BUY','SELL','ROTATE','REDUCE','FLATTEN'].includes(v.side ?? '')) throw new ClarificationError('Choose BUY, SELL, ROTATE, REDUCE, or FLATTEN.');
  if (!v.base || !/^[A-Z0-9]{2,12}$/.test(v.base)) throw new ClarificationError('Provide an uppercase asset symbol, such as SOL.');
  const amount = v.notional_quote ?? v.qty_base;
  if ((v.notional_quote != null) === (v.qty_base != null) || typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) throw new ClarificationError('Provide exactly one positive notional_quote or qty_base.');
  if (v.quote && v.quote !== 'USDT') throw new ClarificationError('This scorer currently supports USDT quotes.');
  if (v.hold_horizon_sec != null && (!Number.isInteger(v.hold_horizon_sec) || v.hold_horizon_sec < 0 || v.hold_horizon_sec > 31536000)) throw new ClarificationError('Hold horizon must be between 0 seconds and one year.');
  if (v.urgency && !['TAKER','MIXED','PASSIVE'].includes(v.urgency)) throw new ClarificationError('Urgency must be TAKER, MIXED, or PASSIVE.');
  return {intent_id:v.intent_id ?? 'local-intent',side:v.side!,base:v.base,quote:'USDT',...(v.notional_quote!=null?{notional_quote:v.notional_quote}:{qty_base:v.qty_base}),hold_horizon_sec:v.hold_horizon_sec??86400,urgency:v.urgency??'MIXED',constraints:{spot_only:false,no_perp:false,no_convert:false,reduce_only:v.side==='REDUCE'||v.side==='FLATTEN',...v.constraints},policy_id:'default'};
}
export function parseIntent(text: string): Intent {
  const input=text.trim();
  if (input.startsWith('{')) { try { return validateIntent(JSON.parse(input)); } catch(e) { throw new ClarificationError(e instanceof SyntaxError?'That JSON is incomplete. Check the property names and commas.':(e as Error).message); } }
  if (/short|leverage|\d+x\b/i.test(input)) throw new ClarificationError('Leveraged and short intents need a structured, explicitly scoped position. No order has been created.');
  const sideMatch=input.match(/^(buy|sell|rotate|reduce|flatten)\b/i);
  const symbol=input.toUpperCase().match(/\b(SOL|BTC|ETH|BNB|XRP)\b/);
  const quoteAmount=input.match(/(?:\$\s*(\d+(?:\.\d+)?))|(?:(\d+(?:\.\d+)?)\s*(?:USDT|USD)\b)/i);
  const baseAmount=input.match(/(\d+(?:\.\d+)?)\s*(SOL|BTC|ETH|BNB|XRP)\b/i);
  if (!sideMatch || !symbol || (!quoteAmount && !baseAmount)) throw new ClarificationError('Tell us the action, amount, and asset. For example: “Buy 200 USDT of SOL, hold 24h”.');
  const horizon=input.match(/(?:hold|for)\s*(?:about\s*)?(\d+(?:\.\d+)?)\s*(h|hours?|d|days?|s|seconds?)\b/i);
  return validateIntent({side:sideMatch[1].toUpperCase(),base:symbol[1],...(quoteAmount?{notional_quote:Number(quoteAmount[1]??quoteAmount[2])}:{qty_base:Number(baseAmount![1])}),hold_horizon_sec:horizon?Number(horizon[1])*({h:3600,d:86400,s:1}[horizon[2][0].toLowerCase()]??3600):86400,urgency:/passive/i.test(input)?'PASSIVE':/taker|immediate/i.test(input)?'TAKER':'MIXED',constraints:{spot_only:/spot only/i.test(input),no_perp:/no perp/i.test(input),no_convert:/no convert/i.test(input)}});
}
