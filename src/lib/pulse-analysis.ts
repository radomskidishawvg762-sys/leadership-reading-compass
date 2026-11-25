export type PulseItem={eventId:string;conclusion:string;advice:string;sourceIds:string[];presentation?:'number'|'trend'|'compare'|'ring'|'table'|'text'};
export type PulseAnalysis={summary:string;sourceIds:string[];items:PulseItem[];generatedAt:string};
export const pulseQuery='市场需求、原料价格、基建投资、房企资金、绿色建材';
export function shortSummary(text:string):string{
 const s=text.trim().replace(/\s+/g,' ');
 if(s.length<=120)return s;
 const first=s.slice(0,120),end=Math.max(first.lastIndexOf('。'),first.lastIndexOf('！'),first.lastIndexOf('；'));
 return end>=35?first.slice(0,end+1):first.slice(0,117)+'…';
}
export function decodePulse(text:string):unknown{
 const s=text.trim().replace(/^\x60\x60\x60(?:json)?\s*/i,'').replace(/\s*\x60\x60\x60$/,'');
 try{return JSON.parse(s)}catch{}
 const start=s.indexOf('{'),end=s.lastIndexOf('}');if(start>=0&&end>start)try{return JSON.parse(s.slice(start,end+1))}catch{}
 return null;
}
export function parsePulse(value:unknown,events:{id:string;sourceIds:string[]}[],allowed:string[]):Omit<PulseAnalysis,'generatedAt'>|null{
 if(!value||typeof value!=='object')return null;
 const v=value as Record<string,unknown>;
 const str=(x:unknown,n:number):x is string=>typeof x==='string'&&x.trim().length>0&&x.length<=n;
 // Accept canonical IDs and numbered citations from the exact prompt, never unknown references.
 const ref=(x:unknown,kind:'S'|'E',list:string[])=>{if(typeof x!=='string')return '';const a=x.trim();const match=a.match(new RegExp('^\\[?'+kind+'(\\d+)\\]?$','i'));return match?list[Number(match[1])-1]??'':a;};
 const ids=(x:unknown):string[]=>Array.isArray(x)?[...new Set(x.map(i=>ref(i,'S',allowed)).filter(i=>allowed.includes(i)))]:[];
 if(!str(v.summary,4000)||!Array.isArray(v.items))return null;
 const items:PulseItem[]=[];
 for(const row of v.items.slice(0,4)){
  if(!row||typeof row!=='object')continue;
  const e=events.find(e=>e.id===ref(row.eventId,'E',events.map(e=>e.id)));
  const refs=ids(row.sourceIds).filter(id=>e?.sourceIds.includes(id));
  if(!e||!refs.length||!str(row.conclusion,1000)||!str(row.advice,1000)||items.some(i=>i.eventId===e.id))continue;
  items.push({eventId:e.id,conclusion:row.conclusion.trim(),advice:row.advice.trim(),sourceIds:refs});
 }
 const sourceIds=ids(v.sourceIds);if(!sourceIds.length||!items.length)return null;
 return {summary:shortSummary(v.summary),sourceIds,items};
}
