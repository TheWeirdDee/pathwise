import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
const file=path.join(process.cwd(),'data','kill-switch.json');
export async function isStopped(){try{return JSON.parse(await readFile(file,'utf8')).stopped===true;}catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')return false;throw e;}}
export async function setStopped(stopped:boolean){await mkdir(path.dirname(file),{recursive:true});await writeFile(file,JSON.stringify({stopped,at:new Date().toISOString()}));return {stopped};}
