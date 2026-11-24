export type PulseItem={eventId:string;conclusion:string;advice:string;sourceIds:string[]};
export type PulseAnalysis={summary:string;sourceIds:string[];items:PulseItem[];generatedAt:string};
export const pulseQuery='市场需求、原料价格、基建投资、房企资金、绿色建材';
export function parsePulse(value:unknown,events:{id:string;sourceIds:string[]}[],allowed:string[]):Omit<PulseAnalysis,'generatedAt'>|null{
 if(!value||typeof value!=='object')return null;
 const v=value as Record<string,unknown>;
 const str=(x:unknown,n:number):x is string=>typeof x==='string'&&x.trim().length>0&&x.length<=n;
 const ids=(x:unknown):string[]=>Array.isArray(x)?[...new Set(x.filter((i):i is string=>typeof i==='string'&&allowed.includes(i)))]:[];
 if(!str(v.summary,500)||!Array.isArray(v.items))return null;
 const sourceIds=ids(v.sourceIds); if(!sourceIds.length)return null;
 const items:PulseItem[]=[];
 for(const row of v.items.slice(0,4)){
  if(!row||typeof row!=='object')continue;
  const e=events.find(e=>e.id===row.eventId);
  const refs=ids(row.sourceIds).filter(id=>e?.sourceIds.includes(id));
  if(!e||!refs.length||!str(row.conclusion,500)||!str(row.advice,500)||items.some(i=>i.eventId===e.id))continue;
  items.push({eventId:e.id,conclusion:row.conclusion.trim(),advice:row.advice.trim(),sourceIds:refs});
 }
 return items.length?{summary:v.summary.trim(),sourceIds,items}:null;
}
