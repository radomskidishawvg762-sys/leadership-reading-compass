import {getSource} from './market-data';
export type Point={label:string;value:number;sourceId:string;date:string};
export type Metric={id:string;category:string;name:string;unit:string;scope:string;change:string;kind:'trend'|'compare'|'number';points:Point[]};
const p=(label:string,value:number,sourceId:string,date:string):Point=>({label,value,sourceId,date});
export const categories=['需求','价格','成本','资金','增长','竞争'] as const;
export const metrics:Metric[]=[
{id:'util',category:'需求',name:'混凝土样本产能利用率',unit:'%',scope:'全国506家样本 · 周度',change:'周降0.38个百分点',kind:'trend',points:[p('10.27',7.04,'v30-util-1027','2026-10-27'),p('11.03',7.32,'v30-util-1103','2026-11-03'),p('11.10',7.32,'v30-util-1110','2026-11-10'),p('11.17',6.94,'v30-util-1117','2026-11-17')]},
{id:'c30',category:'价格',name:'全国C30市场均价',unit:'元/方',scope:'全国 · 周度',change:'周环比持平',kind:'trend',points:[p('10.30',299,'v31-nat-1030','2026-10-30'),p('11.06',300,'v31-nat-1106','2026-11-06'),p('11.13',300,'v30-c30-1113','2026-11-13'),p('11.20',300,'v30-c30-1120','2026-11-20')]},
{id:'cement',category:'成本',name:'全国水泥价格指数',unit:'元/吨',scope:'全国 · 百年建筑网 CEMPI',change:'周涨0.37%',kind:'trend',points:[p('10.30',341.14,'v31-nat-1030','2026-10-30'),p('11.06',344.56,'v31-nat-1106','2026-11-06'),p('11.13',344.32,'v30-cement-1113','2026-11-13'),p('11.20',345.58,'public-cement-week','2026-11-20')]},
{id:'funds',category:'资金',name:'房企到位资金累计同比',unit:'%',scope:'全国 · 月度累计',change:'降幅扩大0.3个百分点',kind:'trend',points:[p('1—6月',-20.2,'v31-fund-06','2026-06-30'),p('1—7月',-20.3,'v31-fund-07','2026-07-31'),p('1—8月',-21,'v31-fund-08','2026-08-31'),p('1—9月',-21.6,'public-housing-sep','2026-09-30'),p('1—10月',-21.9,'public-housing','2026-10-31')]},
{id:'dispatch',category:'需求',name:'混凝土样本发运量',unit:'万方',scope:'全国506家样本 · 11.11—11.17',change:'周降5.12%',kind:'number',points:[p('11.17',139.09,'public-dispatch','2026-11-17')]},
{id:'regional',category:'价格',name:'区域C30周度价格变化',unit:'元/方',scope:'11.13—11.20 · 各城市同规格周度变化',change:'',kind:'compare',points:[p('重庆',20,'v31-chongqing','2026-11-20'),p('成都',5,'public-chengdu','2026-11-20'),p('郑州',0,'public-zhengzhou','2026-11-20'),p('西安',0,'v31-xian','2026-11-20'),p('合肥',0,'v31-hefei','2026-11-20'),p('武汉',-5,'v31-wuhan','2026-11-20')]},
{id:'regional-level',category:'价格',name:'重点城市C30市场报价',unit:'元/方',scope:'11.20 · 公开采价城市，非集团成交价；仅展示已核实城市',change:'',kind:'compare',points:[p('成都',374,'public-chengdu','2026-11-20'),p('济南',364.33,'v31-jinan','2026-11-20'),p('合肥',334,'v31-hefei','2026-11-20'),p('福州',307,'v31-fuzhou','2026-11-20'),p('重庆',300,'v31-chongqing','2026-11-20'),p('郑州',258,'public-zhengzhou','2026-11-20'),p('武汉',245,'v31-wuhan','2026-11-20'),p('西安',235,'v31-xian','2026-11-20')]},
{id:'sand',category:'成本',name:'全国砂石综合均价',unit:'元/吨',scope:'全国 · 周度',change:'周降0.18%',kind:'number',points:[p('11.20',82.5,'v30-sand','2026-11-20')]},
{id:'slag',category:'成本',name:'S95矿渣粉样本均价',unit:'元/吨',scope:'22个重点城市 · 周度',change:'小幅下跌',kind:'number',points:[p('11.20',157.1,'v30-slag','2026-11-20')]},
{id:'investment',category:'增长',name:'基础设施及相关行业投资同比',unit:'%',scope:'全国 · 1—10月累计',change:'',kind:'compare',points:[p('基础设施',-5.1,'public-investment','2026-10-31'),p('航空运输',12.5,'public-investment','2026-10-31'),p('水上运输',12.5,'public-investment','2026-10-31')]},
{id:'peers',category:'竞争',name:'公开披露商混销量对比',unit:'万方',scope:'2025年度 · 选取公开披露企业，非行业排名',change:'',kind:'compare',points:[p('中国建材',7577.5,'v30-peer','2025-12-31'),p('西部建设',5792.77,'v30-peer-own','2025-12-31'),p('海南瑞泽',204.72,'v30-peer-hn','2025-12-31')]},
];
export const coreIds=['util','c30','cement','funds'];
export const metricById=(id:string)=>metrics.find(m=>m.id===id);
export function eligiblePoints(metric:Metric,cutoff='9999-12-31'){
 return metric.points.filter(x=>Number.isFinite(x.value)&&x.date<=cutoff&&!!getSource(x.sourceId)?.url&&(getSource(x.sourceId)?.date??'9999')<=cutoff);
}
export function chartKind(metric:Metric,points:Point[]){
 return points.length<2?'number':metric.kind==='trend'?(points.length>=3?'trend':'compare'):metric.kind;
}
export function eventMetric(id:string):Metric|undefined{
 return metricById(({ 'EV-PUBLIC-005':'regional','EV-PUBLIC-002':'util','EV-PUBLIC-003':'funds','EV-PUBLIC-004':'investment'} as Record<string,string>)[id]??'');
}
