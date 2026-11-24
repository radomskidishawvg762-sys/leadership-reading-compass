import {metricById,eligiblePoints,cityProvince} from './market-monitor';
import {getSource} from './market-data';
export type GroupRef={label:string;value:number;unit:string;sourceId:string;period?:string};
const locations:Record<string,string[]>={'EV-PUBLIC-001':['河南'],'EV-PUBLIC-005':['四川','河南','重庆','湖北'],'EV-PUBLIC-006':['福建','湖北']};
export const henanProjects=[
 {name:'超聚变智慧制造园区及研发中心',volume:13.50},
 {name:'故县水库灌区总干渠施工2标',volume:13.22},
 {name:'洛阳贠庄东安置小区EPC',volume:12.50},
 {name:'郑州宇恒供应链所属项目',volume:10.80},
 {name:'润沄万象中心',volume:10.79},
];
export function groupContext(eventId:string,cutoff='9999-12-31'):GroupRef[]{
 const ref=(label:string,value:number,unit:string,sourceId:string,period:string):GroupRef=>({label,value,unit,sourceId,period});
 const h='2026年上半年',q='2026年第三季度',hf='v35-h1-finance',hs='v35-h1-strategy',q3='v35-q3-operations';
 const fixed:Record<string,GroupRef[]>={
  'EV-PUBLIC-001':[ref('河南营业收入',0.75,'亿元',hf,h),ref('河南收入同比',-33.96,'%',hf,h),ref('河南5项披露项目签约量',Math.round(henanProjects.reduce((s,p)=>s+p.volume,0)*100)/100,'万方',q3,q)],
  'EV-PUBLIC-002':[ref('公司混凝土签约量',3338.58,'万方',q3,q),ref('签约量同比',19.10,'%',q3,q),ref('公司混凝土销售量',1130.41,'万方',q3,q),ref('销售量同比',-26.12,'%',q3,q)],
  'EV-PUBLIC-003':[ref('公司应收账款净额',225.57,'亿元',hf,'2026年6月末'),ref('前五大客户应收占比',39.60,'%',hf,'2026年6月末'),ref('公司货币资金',16.53,'亿元',hf,'2026年6月末')],
  'EV-PUBLIC-004':[ref('国家重大战略区域签约占比',59,'%',hs,h),ref('城市外基础设施签约量',773,'万方',hs,h),ref('城市外基础设施签约占比',15,'%',hs,h),ref('国家战略及国内重点区域新增站点',14,'个',hs,h)],
 };
 const region=metricById('group-regions');
 const regions=region?eligiblePoints(region,cutoff).filter(p=>(locations[eventId]??[]).includes(p.label)).map(p=>ref(p.label+'地区收入占比',p.value,'%',p.sourceId,h)):[];
 return [...regions,...(fixed[eventId]??[])].filter(r=>{const s=getSource(r.sourceId);return !!s?.url&&s.date<=cutoff});
}
export const groupNotes:Record<string,string>={
 'EV-PUBLIC-001':'河南有实际业务，新签项目不等于目前仍在供货的项目。现有数据还不能算出此次涨价会增加多少成本。',
 'EV-PUBLIC-002':'公司三季度签约增加、销售减少。两者统计的是不同业务阶段，也与本周全国样本不同期。',
 'EV-PUBLIC-003':'这是全公司的资金和应收情况，不是房建客户的应收金额。',
 'EV-PUBLIC-004':'公司已经开展城市外基础设施业务；行业投资增长不等于新增合同。',
 'EV-PUBLIC-005':'城市报价与省级收入对应，仅用于判断哪些地区值得关注。',
 'EV-PUBLIC-006':'地区收入说明当地有经营业务，不代表已满足本次采购的认证要求。',
};
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
