import {metricById,eligiblePoints,cityProvince} from './market-monitor';
import {groupContext} from './group-context';
import {marketLeads} from './market-opportunities';
import type {MarketEvent} from './market-data';
export const homeIds=['dispatch','c30','cement','funds'] as const;
export const displayKinds=['number','trend','compare','ring','table','text'] as const;
export type DisplayKind=typeof displayKinds[number];
export function plainBusiness(value:string){return value.replace(/\*+/g,'').replace(/^s*#{1,6}\s*/gm,'').replace(/`{1,3}/g,'').replace(/\b发运量/g,'供应量').replace(/发运量/g,'供应量').replace(/发运下降/g,'供应量下降').replace(/周发运/g,'周度供应').trim();}
export function coreChart(id:string,cutoff='9999-12-31'){const m=metricById(id);if(!m)return [];const p=eligiblePoints(m,cutoff);if(id==='dispatch'&&p.length===1&&p[0].sourceId==='public-dispatch'){return [{label:'上周（反推约数）',value:Number((p[0].value/(1-0.0512)).toFixed(2)),derived:true},{label:'本周',value:p[0].value,derived:false}];}return p.map(q=>({label:q.label,value:q.value,derived:false}));}
export function issueKinds(event:MarketEvent):DisplayKind[]{const kinds:DisplayKind[]=['text'];if(event.id==='EV-PUBLIC-005')kinds.unshift('table','compare');if(event.id==='EV-PUBLIC-001'||event.id==='EV-PUBLIC-002')kinds.unshift('number');if(event.id==='EV-PUBLIC-003')kinds.unshift('trend','ring','number');if(event.id==='EV-PUBLIC-004')kinds.unshift('table','compare','number');if(event.id==='EV-PUBLIC-006')kinds.unshift('number');return kinds;}
export function pickDisplay(event:MarketEvent,requested?:string):DisplayKind{const available=issueKinds(event);return available.find(k=>k===requested)??available[0];}
export function regionalEvidence(event:MarketEvent,cutoff='9999-12-31'){const m=metricById('group-regions');if(!m)return [];const regions=new Set(event.region.split(/[、，,\s]+/).map(s=>cityProvince[s]??s));return eligiblePoints(m,cutoff).filter(p=>regions.has(p.label)).sort((a,b)=>b.value-a.value);}
export function projectEvidence(cutoff='9999-12-31'){const leads=marketLeads(cutoff),m=metricById('group-regions');const regions=new Set(leads.map(p=>p.region.split('·')[0]));return m?eligiblePoints(m,cutoff).filter(p=>regions.has(p.label)):[];}
export function issueReferences(event:MarketEvent,cutoff='9999-12-31'){const base=groupContext(event.id,cutoff),regional=regionalEvidence(event,cutoff);const merged=[...regional.map(p=>({label:p.label+'地区收入占比',value:p.value,unit:'%',sourceId:p.sourceId,period:'2026年上半年'})),...base];if(event.id==='EV-PUBLIC-004')merged.unshift(...projectEvidence(cutoff).map(p=>({label:p.label+'地区收入占比',value:p.value,unit:'%',sourceId:p.sourceId,period:'2026年上半年'})));return merged.filter((r,i)=>merged.findIndex(q=>q.label===r.label)===i);}

// Keep the published period honest: earlier issues retain the utilization proxy if supply was not yet collected.
export function reportCoreIds(cutoff='9999-12-31'){return homeIds.map(id=>id==='dispatch'&&!eligiblePoints(metricById(id)!,cutoff).length?'util':id);}
