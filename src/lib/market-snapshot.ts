import {events,getSource} from './market-data';
import {metrics,eligiblePoints} from './market-monitor';
import {currentCutoff} from './reading-editions';
import {shortSummary,type PulseItem} from './pulse-analysis';
export type Observation={metricId:string;text:string;sourceIds:string[]};
export type MarketSnapshot={summary:string;sourceIds:string[];items:PulseItem[];focusIds:string[];observations:Observation[];generatedAt:string;cutoff:string;fingerprint:string};
export const observationIds=['regional','regional-level','investment','group-regions','peers'];
export function snapshotInput(){
 const candidates=events.filter(e=>e.public&&e.date<=currentCutoff).map(e=>({id:e.id,title:e.title,region:e.region,date:e.date,fact:e.fact,sourceIds:e.sources.filter(id=>{const s=getSource(id);return s?.kind==='外部材料'&&!!s.url&&s.date<=currentCutoff;})})).filter(e=>e.sourceIds.length);
 const indicators=metrics.filter(m=>observationIds.includes(m.id)).map(m=>({id:m.id,name:m.name,unit:m.unit,scope:m.scope,points:eligiblePoints(m,currentCutoff)})).filter(m=>m.points.length>1);
 const ids=[...new Set([...candidates.flatMap(e=>e.sourceIds),...indicators.flatMap(m=>m.points.map(p=>p.sourceId)),'v32-group'])];
 const sources=ids.flatMap(id=>{const s=getSource(id);return s?.url&&s.kind==='外部材料'&&s.date<=currentCutoff?[{id:s.id,title:s.title,excerpt:s.excerpt.slice(0,450)}]:[];});
 return {candidates,indicators,sources,cutoff:currentCutoff};
}
const clean=(x:unknown,max:number)=>typeof x==='string'&&x.trim()&&x.trim().length<=max?x.trim():'';
export function validateSnapshot(raw:unknown,input= snapshotInput()):Omit<MarketSnapshot,'generatedAt'|'cutoff'|'fingerprint'>|null{
 if(!raw||typeof raw!=='object')return null;
 const v=raw as Record<string,unknown>;
 const ids=(x:unknown,allowed:string[])=>Array.isArray(x)?[...new Set(x.filter((id):id is string=>typeof id==='string'&&allowed.includes(id)))]:[];
 const all=input.sources.map(s=>s.id),summary=clean(v.summary,1000),sourceIds=ids(v.sourceIds,all);
 if(!summary||!sourceIds.length||!Array.isArray(v.items))return null;
 const items:PulseItem[]=[];
 for(const row of v.items){if(!row||typeof row!=='object')continue;const e=input.candidates.find(e=>e.id===row.eventId);if(!e||items.some(x=>x.eventId===e.id))continue;
 const refs=ids(row.sourceIds,e.sourceIds.filter(id=>all.includes(id))),conclusion=clean(row.conclusion,180),advice=clean(row.advice,90);
 if(refs.length&&conclusion&&advice)items.push({eventId:e.id,sourceIds:refs,conclusion,advice});}
 // Do not publish a partial replacement: every public topic must have a real suggestion.
 if(items.length!==input.candidates.length||!items.length)return null;
 const focusIds=ids(v.focusIds,items.map(i=>i.eventId)).slice(0,4);if(!focusIds.length)return null;
 const observations:Observation[]=[];
 if(Array.isArray(v.observations))for(const row of v.observations){if(!row||typeof row!=='object')continue;const metric=input.indicators.find(m=>m.id===row.metricId);if(!metric||observations.some(o=>o.metricId===metric.id))continue;
 const refs=ids(row.sourceIds,metric.points.map(p=>p.sourceId)),text=clean(row.text,100);if(text&&refs.length)observations.push({metricId:metric.id,text,sourceIds:refs});}
 return {summary:shortSummary(summary),sourceIds,items,focusIds,observations};
}
export function acceptPublished(value:unknown):MarketSnapshot|null{
 if(!value||typeof value!=='object')return null;const v=value as MarketSnapshot;
 if(!v.generatedAt||Number.isNaN(Date.parse(v.generatedAt))||typeof v.cutoff!=='string'||v.cutoff>currentCutoff||typeof v.fingerprint!=='string')return null;
 // Retain previously published valid results when the corpus grows; do not fabricate missing topics.
 const known=events.filter(e=>e.public);const validRefs=(refs:unknown)=>Array.isArray(refs)&&refs.length>0&&refs.every(id=>typeof id==='string'&&!!getSource(id)?.url);
 if(typeof v.summary!=='string'||!validRefs(v.sourceIds)||!Array.isArray(v.items)||!Array.isArray(v.focusIds)||!Array.isArray(v.observations))return null;
 if(!v.items.every(i=>known.some(e=>e.id===i.eventId)&&typeof i.advice==='string'&&typeof i.conclusion==='string'&&validRefs(i.sourceIds)))return null;
 return {...v,focusIds:v.focusIds.filter(id=>v.items.some(i=>i.eventId===id)),observations:v.observations.filter(o=>typeof o.text==='string'&&validRefs(o.sourceIds))};
}
export const metricNotes:Record<string,string>={
 util:'反映样本搅拌站的产能使用情况，可用于观察行业需求强弱。',c30:'全国C30市场均价，反映产品售价环境，不等同于集团实际成交价。',cement:'反映水泥市场行情，可作为原材料成本环境的参考。',funds:'反映房地产开发企业资金到位情况，可用于观察下游资金环境。',dispatch:'反映样本企业实际发运规模，适合与同口径的历史调查比较。',regional:'比较同一统计周的城市报价涨跌，零值表示持平。','regional-level':'比较公开采价城市的市场报价；区域报价差异不能直接推断盈利差异。',sand:'观察全国砂石综合均价变化，具体采购价格受地区和规格影响。',slag:'观察22城S95矿渣粉样本行情，反映辅助胶凝材料价格环境。',investment:'对比各行业累计投资同比，观察需求结构，不等同于订单增量。','group-regions':'公司公开披露的地区收入占比，用于识别经营布局，不是市场占有率。',peers:'选取公开披露企业的年度商混销量对标，不代表完整行业排名。'};
