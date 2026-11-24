import {useState} from 'react';
import {Link} from '@tanstack/react-router';
import {ArrowUpRight,FileText} from 'lucide-react';
import {Bar,BarChart,CartesianGrid,Cell,Line,LineChart,ResponsiveContainer,Tooltip,XAxis,YAxis} from 'recharts';
import {getSource,formatDate} from '@/lib/market-data';
import {categories,coreIds,metricById,metrics,eligiblePoints,chartKind,type Metric} from '@/lib/market-monitor';
export function EvidenceNote({ids}:{ids:string[]}){
 const sources=[...new Set(ids)].flatMap(id=>{const s=getSource(id);return s?[s]:[]});
 if(!sources.length)return null;
 return <details className="v30-evidence"><summary><FileText size={13}/>数据来源 · {sources.length} 份</summary><div>{sources.map(s=><div key={s.id}>{s.url&&/^https?:\/\//.test(s.url)?<a href={s.url} target="_blank" rel="noopener noreferrer">{s.organization} · {s.title}<ArrowUpRight size={13}/></a>:<Link to="/sources/$sourceId" params={{sourceId:s.id}}>{s.title}（站内材料）</Link>}<small>{formatDate(s.date)}</small></div>)}</div></details>;
}
export function MetricGraphic({metric,compact=false,cutoff}:{metric:Metric;compact?:boolean;cutoff?:string}){
 const data=eligiblePoints(metric,cutoff);const kind=chartKind(metric,data);
 if(!data.length)return null;
 if(kind==='number')return <div className="v30-single">{data[0].value.toLocaleString('zh-CN')} <small>{metric.unit}</small></div>;
 if(compact){
  if(metric.kind==='trend'&&data.length>=2){
   const min=Math.min(...data.map(d=>d.value)),max=Math.max(...data.map(d=>d.value)),range=max-min||1;
   const start=Date.parse(data[0].date),end=Date.parse(data.at(-1)!.date);const coords=data.map((d,i)=>[8+(end>start?(Date.parse(d.date)-start)/(end-start):i/(data.length-1))*204,max===min?30:48-(d.value-min)/range*36]);
   return <svg className="v30-mini" viewBox="0 0 220 72" role="img" aria-label={metric.name+' '+data.map(d=>d.label+' '+d.value+metric.unit).join('，')}><path d="M8 49H212" stroke="#c9d0c9"/><polyline points={coords.map(a=>a.join(',')).join(' ')} stroke="#326a55" strokeWidth="2" fill="none"/>{coords.map(([x,y],i)=><circle key={i} cx={x} cy={y} r="3" fill="#326a55"><title>{data[i].label}: {data[i].value}{metric.unit}</title></circle>)}<text x="8" y="66">{data[0].label}</text><text x="212" y="66" textAnchor="end">{data.at(-1)?.label}</text></svg>;
  }
  return <div className="v30-mini-compare">{data.map(d=><div key={d.label}><small>{d.label}</small><strong>{d.value.toLocaleString('zh-CN')}</strong></div>)}</div>;
 }
 if(kind==='compare'&&data.length===2)return <table className="v31-compare-table"><thead><tr><th>{metric.kind==='trend'?'观测期':'对象'}</th><th>{metric.name}（{metric.unit}）</th></tr></thead><tbody>{data.map(d=><tr key={d.label}><td>{d.label}</td><td>{d.value.toLocaleString('zh-CN')}</td></tr>)}</tbody></table>;
 return <div className="v30-chart" style={{height:kind==='trend'?300:Math.max(260,data.length*36+50)}}><ResponsiveContainer width="100%" height="100%">
 {kind==='trend'?<LineChart data={data} margin={{left:2,right:24,top:12,bottom:8}}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="label"/><YAxis domain={['auto','auto']} unit={metric.unit==='%'?'%':''}/><Tooltip formatter={(v:number)=>[v+' '+metric.unit,metric.name]}/><Line dataKey="value" stroke="#326a55" strokeWidth={2.5} dot isAnimationActive={false}/></LineChart>:<BarChart data={data} layout="vertical" margin={{left:8,right:24,top:10,bottom:8}}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis type="number" domain={[(min:number)=>Math.min(0,min),(max:number)=>Math.max(0,max)]}/><YAxis type="category" dataKey="label" width={90}/><Tooltip formatter={(v:number)=>[v+' '+metric.unit,metric.name]}/><Bar dataKey="value" isAnimationActive={false} maxBarSize={85}>{data.map(d=><Cell key={d.label} fill={d.value<0?'#a16b36':'#548d75'}/>)}</Bar></BarChart>}
 </ResponsiveContainer></div>;
}
export function MetricPanel({metric,compact=false,cutoff}:{metric:Metric;compact?:boolean;cutoff?:string}){
 const data=eligiblePoints(metric,cutoff);if(!data.length)return null;
 const last=data.at(-1)!;const showLatest=metric.kind!=='compare';
 return <section className={'v30-metric '+(compact?'v30-metric-small':'')}>
 <div className="v30-metric-label">{compact?({'需求':'市场需求','价格':'市场价格','成本':'成本环境','资金':'资金环境'} as Record<string,string>)[metric.category]:metric.name}</div>
 {showLatest&&<div className="v30-value">{last.value.toLocaleString('zh-CN')}<small>{metric.unit}</small></div>}
 {compact&&<div className="v30-metric-name">{metric.name}</div>}
 {(!showLatest||data.length>1)&&<MetricGraphic metric={metric} compact={compact} cutoff={cutoff}/>}
 <div className="v30-metric-meta">{!cutoff&&metric.change&&<strong>{metric.change} · </strong>}{metric.scope} · {last.date}</div>
 <EvidenceNote ids={data.map(d=>d.sourceId)}/></section>;
}
export function CoreMonitoring({cutoff}:{cutoff?:string}){
 return <div className="v30-core">{coreIds.map(id=><MetricPanel key={id} metric={metricById(id)!} compact cutoff={cutoff}/>)}</div>;
}
export function MarketMonitor(){
 const [category,setCategory]=useState<string>('需求');const [period,setPeriod]=useState('all');
 return <div className="v30-monitor"><div className="page-heading"><div><div className="eyebrow">行业行情与经营参照</div><h1>市场监测</h1><div className="heading-meta">公开指标 · 按实际观测期展示</div></div></div>
 <div className="v30-tabs" role="group" aria-label="监测类别">{categories.map(c=><button key={c} className={category===c?'active':''} onClick={()=>{setCategory(c);setPeriod('all')}}>{c}</button>)}</div>
 <div className="v30-monitor-controls"><label>观测范围 <select className="select-control" value={period} onChange={e=>setPeriod(e.target.value)}><option value="all">全部已收录</option><option value="latest">最近四期</option></select></label><Link to="/topics" search={{q:({需求:'市场需求与发运量',价格:'混凝土价格',成本:'原料成本',资金:'房建资金',增长:'基建投资',竞争:'市场竞争'} as Record<string,string>)[category],window:'all'}}>基于指标发起研判 <ArrowUpRight size={14}/></Link></div>
 <div className="v30-monitor-grid">{metrics.filter(m=>m.category===category).map(m=><MetricPanel key={m.id} metric={period==='latest'&&m.kind==='trend'?{...m,points:m.points.slice(-4)}:m}/>)}</div>
 </div>;
}
