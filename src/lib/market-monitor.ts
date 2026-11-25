import {getSource} from './market-data';
export type Point={label:string;value:number;sourceId:string;date:string};
export type Metric={id:string;category:string;name:string;unit:string;scope:string;change:string;kind:'trend'|'compare'|'number';points:Point[]};
const p=(label:string,value:number,sourceId:string,date:string):Point=>({label,value,sourceId,date});
export const categories=['需求','价格','成本','资金','增长','竞争'] as const;
export const metrics:Metric[]=[
{id:'util',category:'需求',name:'混凝土样本产能利用率',unit:'%',scope:'全国506家样本 · 周度',change:'周降0.38个百分点',kind:'trend',points:[p('10.27',7.04,'v30-util-1027','2026-10-27'),p('11.03',7.32,'v30-util-1103','2026-11-03'),p('11.10',7.32,'v30-util-1110','2026-11-10'),p('11.17',6.94,'v30-util-1117','2026-11-17')]},
{id:'c30',category:'价格',name:'全国C30市场参考价',unit:'元/方',scope:'全国 · 周度',change:'周环比持平',kind:'trend',points:[p('10.30',299,'v31-nat-1030','2026-10-30'),p('11.06',300,'v31-nat-1106','2026-11-06'),p('11.13',300,'v30-c30-1113','2026-11-13'),p('11.20',300,'v30-c30-1120','2026-11-20')]},
{id:'cement',category:'成本',name:'全国水泥价格指数',unit:'元/吨',scope:'全国 · 百年建筑网 CEMPI',change:'周涨0.37%',kind:'trend',points:[p('10.30',341.14,'v31-nat-1030','2026-10-30'),p('11.06',344.56,'v31-nat-1106','2026-11-06'),p('11.13',344.32,'v30-cement-1113','2026-11-13'),p('11.20',345.58,'public-cement-week','2026-11-20')]},
{id:'funds',category:'资金',name:'房企到位资金累计同比',unit:'%',scope:'全国 · 月度累计',change:'降幅扩大0.3个百分点',kind:'trend',points:[p('1—6月',-20.2,'v31-fund-06','2026-06-30'),p('1—7月',-20.3,'v31-fund-07','2026-07-31'),p('1—8月',-21,'v31-fund-08','2026-08-31'),p('1—9月',-21.6,'public-housing-sep','2026-09-30'),p('1—10月',-21.9,'public-housing','2026-10-31')]},
{id:'dispatch',category:'需求',name:'混凝土样本发运量',unit:'万方',scope:'全国506家样本 · 11.11—11.17',change:'周降5.12%',kind:'number',points:[p('11.17',139.09,'public-dispatch','2026-11-17')]},
{id:'regional',category:'价格',name:'区域C30周度价格变化',unit:'元/方',scope:'11.13—11.20 · 各城市同规格周度变化',change:'',kind:'compare',points:[p('重庆',20,'v31-chongqing','2026-11-20'),p('成都',5,'public-chengdu','2026-11-20'),p('郑州',0,'public-zhengzhou','2026-11-20'),p('西安',0,'v31-xian','2026-11-20'),p('合肥',0,'v31-hefei','2026-11-20'),p('武汉',-5,'v31-wuhan','2026-11-20')]},
{id:'regional-level',category:'价格',name:'重点城市C30市场报价',unit:'元/方',scope:'11.20 · 公开采价城市，非集团成交价；仅展示已核实城市',change:'',kind:'compare',points:[p('成都',374,'public-chengdu','2026-11-20'),p('济南',364.33,'v31-jinan','2026-11-20'),p('合肥',334,'v31-hefei','2026-11-20'),p('福州',307,'v31-fuzhou','2026-11-20'),p('重庆',300,'v31-chongqing','2026-11-20'),p('郑州',258,'public-zhengzhou','2026-11-20'),p('武汉',245,'v31-wuhan','2026-11-20'),p('西安',235,'v31-xian','2026-11-20')]},
{id:'sand',category:'成本',name:'全国砂石综合均价',unit:'元/吨',scope:'全国 · 周度',change:'周降0.18%',kind:'trend',points:[p('10.23',81.81,'v32-sand-1023','2026-10-23'),p('11.06',82.80,'v32-sand-1106','2026-11-06'),p('11.13',82.65,'v32-sand-1113','2026-11-13'),p('11.20',82.5,'v30-sand','2026-11-20')]},
{id:'slag',category:'成本',name:'S95矿渣粉样本均价',unit:'元/吨',scope:'22个重点城市 · 周度',change:'小幅下跌',kind:'trend',points:[p('10.30',155.9,'v32-slag-1030','2026-10-30'),p('11.06',157.3,'v32-slag-1106','2026-11-06'),p('11.13',157.3,'v32-slag-1113','2026-11-13'),p('11.20',157.1,'v30-slag','2026-11-20')]},
{id:'investment',category:'增长',name:'基础设施及相关行业投资同比',unit:'%',scope:'全国 · 1—10月累计',change:'',kind:'compare',points:[p('信息传输',32,'v32-investment','2026-10-31'),p('航空运输',12.5,'v32-investment','2026-10-31'),p('水上运输',12.5,'v32-investment','2026-10-31'),p('基建整体',-5.1,'v32-investment','2026-10-31'),p('电热气水供应',-7.7,'v32-investment','2026-10-31'),p('道路运输',-10.9,'v32-investment','2026-10-31'),p('公共设施管理',-14.1,'v32-investment','2026-10-31'),p('水利管理',-16.7,'v32-investment','2026-10-31')]},
{id:'group-regions',category:'竞争',name:'西部建设主要经营地区收入占比',unit:'%',scope:'2026年上半年 · 选取已披露国内地区，占公司营业收入比例，非市场份额',change:'',kind:'compare',points:[p('四川',16,'v32-group','2026-06-30'),p('广东',12.09,'v32-group','2026-06-30'),p('江苏',8.63,'v32-group','2026-06-30'),p('北京',8.1,'v32-group','2026-06-30'),p('山东',6.22,'v32-group','2026-06-30'),p('海南',5.58,'v32-group','2026-06-30'),p('湖北',4.17,'v32-group','2026-06-30'),p('重庆',3.96,'v32-group','2026-06-30'),p('安徽',2.89,'v32-group','2026-06-30'),p('陕西',2.03,'v32-group','2026-06-30'),p('福建',1.59,'v32-group','2026-06-30'),p('河南',1.04,'v32-group','2026-06-30')]},
{id:'peers',category:'竞争',name:'公开披露商混销量对比',unit:'万方',scope:'2025年度 · 选取公开披露企业，非行业排名',change:'',kind:'compare',points:[p('中国建材',7577.5,'v30-peer','2025-12-31'),p('西部建设',5792.77,'v30-peer-own','2025-12-31'),p('海南瑞泽',204.72,'v30-peer-hn','2025-12-31')]},
{"id":"housing-starts","category":"需求","name":"全国房屋新开工面积累计同比","unit":"%","scope":"全国房地产开发 · 累计同比","change":"降幅较前三季度收窄0.5个百分点","kind":"trend",points:[p("1—9月",-24.9,"public-housing-sep","2026-09-30"),p("1—10月",-24.4,"public-housing","2026-10-31")]},
{"id":"group-volume-yoy","category":"需求","name":"公司第三季度签约及销量同比","unit":"%","scope":"2026年第三季度 · 公司公开经营简报；两个业务阶段","change":"","kind":"compare",points:[p("混凝土签约量",19.1,"v35-q3-operations","2026-09-30"),p("混凝土销售量",-26.12,"v35-q3-operations","2026-09-30")]},
{"id":"regional-cement-level","category":"成本","name":"郑州、重庆散装水泥市场报价","unit":"元/吨","scope":"11.20 · P.O42.5散装水泥，同规格公开采价","change":"","kind":"compare",points:[p("郑州",340,"public-zhengzhou","2026-11-20"),p("重庆",370,"v31-chongqing","2026-11-20")]},
{"id":"regional-cement-change","category":"成本","name":"郑州、重庆水泥周价变化","unit":"元/吨","scope":"11.13—11.20 · P.O42.5散装水泥，同规格公开采价","change":"","kind":"compare",points:[p("郑州",30,"public-zhengzhou","2026-11-20"),p("重庆",50,"v31-chongqing","2026-11-20")]},
{"id":"group-funds","category":"资金","name":"公司期末应收账款与货币资金","unit":"亿元","scope":"2026年6月末 · 公司合并口径；不同会计项目","change":"","kind":"compare",points:[p("应收账款净额",225.57,"v35-h1-finance","2026-06-30"),p("货币资金",16.53,"v35-h1-finance","2026-06-30")]},
{"id":"group-receivable-concentration","category":"资金","name":"公司前五大客户应收占比","unit":"%","scope":"2026年6月末 · 公司合并口径","change":"","kind":"compare",points:[p("前五大客户",39.6,"v35-h1-finance","2026-06-30"),p("其他客户",60.4,"v35-h1-finance","2026-06-30")]},
{"id":"group-strategy-sign","category":"增长","name":"公司重点业务签约量","unit":"万方","scope":"2026年上半年 · 战略区域与业务类型可能重叠，不可加总","change":"","kind":"compare",points:[p("国家重大战略区域",3425,"v35-h1-strategy","2026-06-30"),p("城市外基础设施",773,"v35-h1-strategy","2026-06-30")]},
{"id":"henan-projects","category":"增长","name":"河南公开披露项目签约量","unit":"万方","scope":"2026年第三季度 · 仅列披露的五个项目，不代表剩余供货量","change":"","kind":"compare",points:[p("超聚变智慧园区",13.5,"v35-q3-operations","2026-09-30"),p("故县水库灌区",13.22,"v35-q3-operations","2026-09-30"),p("洛阳贠庄东安置",12.5,"v35-q3-operations","2026-09-30"),p("郑州宇恒供应链",10.8,"v35-q3-operations","2026-09-30"),p("润沄万象中心",10.79,"v35-q3-operations","2026-09-30")]},
{"id":"peer-growth","category":"竞争","name":"公开披露企业商混销量同比","unit":"%","scope":"2025年度 · 仅列已取得可比同比数据的企业","change":"","kind":"compare",points:[p("西部建设",-1.56,"v30-peer-own","2025-12-31"),p("海南瑞泽",-2.52,"v30-peer-hn","2025-12-31")]},
];
export const categoryLabel=(category:string)=>category==='增长'?'市场机会':category;
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

export const cityProvince:Record<string,string>={成都:'四川',济南:'山东',合肥:'安徽',福州:'福建',重庆:'重庆',郑州:'河南',武汉:'湖北',西安:'陕西'};
export function regionalExposure(city:string){return metricById('group-regions')?.points.find(p=>p.label===cityProvince[city])?.value;}
