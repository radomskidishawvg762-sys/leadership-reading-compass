import {metricById,eligiblePoints,cityProvince} from './market-monitor';
import {getSource} from './market-data';
export type GroupRef={label:string;value:number;unit:string;sourceId:string};
const locations:Record<string,string[]>={'EV-PUBLIC-001':['河南'],'EV-PUBLIC-005':['四川','河南','重庆','湖北'],'EV-PUBLIC-006':['福建','湖北']};
export function groupContext(eventId:string,cutoff='9999-12-31'):GroupRef[]{
 const source=getSource('v32-group');if(!source?.url||source.date>cutoff)return [];
 if(eventId==='EV-PUBLIC-004')return [{label:'国家重大战略区域签约占比',value:59,unit:'%',sourceId:source.id},{label:'城市外基础设施签约量',value:773,unit:'万方',sourceId:source.id}];
 const region=metricById('group-regions');if(!region)return [];
 return eligiblePoints(region,cutoff).filter(p=>(locations[eventId]??[]).includes(p.label)).map(p=>({label:p.label+'地区收入占比',value:p.value,unit:'%',sourceId:p.sourceId}));
}
export function regionalComparison(cutoff='9999-12-31'){
 const price=metricById('regional'),group=metricById('group-regions');if(!price||!group)return [];
 const refs=eligiblePoints(group,cutoff);
 return eligiblePoints(price,cutoff).flatMap(p=>{const g=refs.find(r=>r.label===cityProvince[p.label]);return g?[{city:p.label,province:g.label,change:p.value,share:g.value,sourceIds:[p.sourceId,g.sourceId]}]:[];});
}
export function priceCostComparison(cutoff='9999-12-31'){
 const price=metricById('c30'),cost=metricById('cement');if(!price||!cost)return {rows:[],sourceIds:[] as string[]};
 const a=eligiblePoints(price,cutoff),b=eligiblePoints(cost,cutoff);
 const joined=a.flatMap(p=>{const c=b.find(x=>x.date===p.date);return c?[{p,c}]:[];});
 const first=joined[0];if(!first||!first.p.value||!first.c.value)return {rows:[],sourceIds:[] as string[]};
 return {rows:joined.map(({p,c})=>({date:p.label,sale:100*p.value/first.p.value,cost:100*c.value/first.c.value})),sourceIds:[...new Set(joined.flatMap(({p,c})=>[p.sourceId,c.sourceId]))]};
}
