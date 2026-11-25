import {getSource} from './market-data';
import {metricById,eligiblePoints,cityProvince} from './market-monitor';
export const opportunityLeads=[
 {id:'cq-road',region:'重庆',name:'G4223巫山至万州段一期（重庆段）',stage:'施工进展',date:'2026-09-28',sourceId:'v38-cq-road',note:'公开报道102个工点同步建设，采购安排及集团供应关系待核。'},
 {id:'cq-procurement',region:'重庆·沙坪坝',name:'中交一公局西南公司商品混凝土采购',stage:'采购公告转载 · 待核',date:'2026-11-19',sourceId:'v38-cq-procurement',note:'转载所列标书缴费日期11月24日；不认定仍开放投标，需核对原公告和后续结果。'},
 {id:'cq-port',region:'重庆·奉节',name:'红湾子货运码头工程（一期）',stage:'年度建设计划',date:'2026-04-03',sourceId:'v38-cq-plan',note:'规划建设3个5000吨级泊位，实际开工及采购时间待核。'},
 {id:'cq-factory',region:'重庆·沙坪坝',name:'智能网联汽车城配套产业厂房六期（A区）',stage:'年度建设计划',date:'2026-04-03',sourceId:'v38-cq-plan',note:'计划建筑面积约6.8万平方米，不折算混凝土需求。'}
] as const;
export function marketLeads(cutoff='9999-12-31'){return opportunityLeads.filter(p=>p.date<=cutoff&&!!getSource(p.sourceId)?.url).sort((a,b)=>b.date.localeCompare(a.date));}
export const informationPriceChanges=[
 {month:'2026年9月',change:6,sourceId:'v38-wh-info-sep',date:'2026-09-30'},
 {month:'2026年10月',change:3,sourceId:'v38-wh-info-oct',date:'2026-10-30'}
] as const;
export function changedRegions(cutoff='9999-12-31'){
 const m=metricById('regional'),g=metricById('group-regions');if(!m||!g)return [];
 const shares=eligiblePoints(g,cutoff);
 return eligiblePoints(m,cutoff).filter(p=>p.value!==0).map(p=>{const province=cityProvince[p.label]??p.label;const share=shares.find(r=>r.label===province);return {city:p.label,province,change:p.value,share:share?.value,sourceIds:[p.sourceId,...(share?[share.sourceId]:[])]};}).sort((a,b)=>(b.share??0)-(a.share??0));
}
