import { mkdir, writeFile } from 'node:fs/promises';
const endpoint = 'https://agent.binance.com/mcp/agentic';
const at = new Date().toISOString();
let evidence;
try {
  const response = await fetch(endpoint, {method:'POST', headers:{'Content-Type':'application/json', Accept:'application/json, text/event-stream'}, body:JSON.stringify({jsonrpc:'2.0',id:1,method:'initialize',params:{protocolVersion:'2025-03-26',capabilities:{},clientInfo:{name:'pathwise-probe',version:'0.1.0'}}}), signal:AbortSignal.timeout(15000)});
  const body = await response.text();
  evidence = {endpoint,received_at:at,http_status:response.status,status:response.ok?'INITIALIZED_CATALOG_PENDING':'BLOCKED_BY_MCP',detail:body.slice(0,4000),families:['market','balance','convert','transfer','spot_order','futures_order'].map(family=>({family,status:'BLOCKED',reason:response.ok?'CATALOG_NOT_VERIFIED':`MCP_HTTP_${response.status}`}))};
} catch(error) { evidence={endpoint,received_at:at,status:'BLOCKED_BY_MCP',detail:String(error),families:['market','balance','convert','transfer','spot_order','futures_order'].map(family=>({family,status:'BLOCKED',reason:'MCP_CONNECTION_FAILED'}))}; }
await mkdir('data',{recursive:true});
await writeFile('data/tools.json',JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify(evidence,null,2));
