import {useState} from 'react';
import {metricNotes,type Observation} from '@/lib/market-snapshot';
import {useMarketSnapshot} from './use-market-snapshot';
import {Link} from '@tanstack/react-router';
import {ArrowUpRight,FileText} from 'lucide-react';
import {Bar,BarChart,CartesianGrid,Cell,Line,LineChart,ResponsiveContainer,Tooltip,XAxis,YAxis} from 'recharts';
import {getSource,formatDate} from '@/lib/market-data';
import {categories,coreIds,metricById,metrics,eligiblePoints,chartKind,regionalExposure,cityProvince,type Metric} from '@/lib/market-monitor';
export function EvidenceNote({ids}:{ids:string[]}){
 const sources=[...new Set(ids)].flatMap(id=>{const s=getSource(id);return s?[s]:[]});
 if(!sources.length)return null;
 return <details className="v30-evidence"><summary><FileText size={13}/>数据来源 · {sources.length} 份</summary><div>{sources.map(s=><div key={s.id}>{s.url&&/^https?:\/\//.test(s.url)?<a href={s.url} target="_blank" rel="noopener noreferrer">{s.organization} · {s.title}<ArrowUpRight size={13}/></a>:<Link to="/sources/$sourceId" params={{sourceId:s.id}}>{s.title}（站内材料）</Link>}<small>{formatDate(s.date)}</small></div>)}</div></details>;
}
const palette:Record<string,string>={'需求':'#2877a9','价格':'#7657b3','成本':'#b47727','资金':'#c16a52','增长':'#268b88','竞争':'#4b72aa'};
export function MetricGraphic({metric,compact=false,cutoff}:{metric:Metric;compact?:boolean;cutoff?:string}){
 const data=eligiblePoints(metric,cutoff);const kind=chartKind(metric,data);const color=palette[metric.category]??'#2877a9';
 if(!data.length)return null;
 if(kind==='number')return <div className="v30-single">{data[0].value.toLocaleString('zh-CN')} <small>{metric.unit}</small></div>;
 if(compact){
  if(metric.kind==='trend'&&data.length>=2){
   const min=Math.min(...data.map(d=>d.value)),max=Math.max(...data.map(d=>d.value)),range=max-min||1;
   const start=Date.parse(data[0].date),end=Date.parse(data.at(-1)!.date);const coords=data.map((d,i)=>[8+(end>start?(Date.parse(d.date)-start)/(end-start):i/(data.length-1))*204,max===min?30:48-(d.value-min)/range*36]);
   return <svg className="v30-mini" viewBox="0 0 220 72" role="img" aria-label={metric.name+' '+data.map(d=>d.label+' '+d.value+metric.unit).join('，')}><path d="M8 49H212" stroke="#c9d0c9"/><polyline points={coords.map(a=>a.join(',')).join(' ')} stroke={color} strokeWidth="2" fill="none"/>{coords.map(([x,y],i)=><circle key={i} cx={x} cy={y} r="3" fill={color}><title>{data[i].label}: {data[i].value}{metric.unit}</title></circle>)}<text x="8" y="66">{data[0].label}</text><text x="212" y="66" textAnchor="end">{data.at(-1)?.label}</text></svg>;
  }
  return <div className="v30-mini-compare">{data.map(d=><div key={d.label}><small>{d.label}</small><strong>{d.value.toLocaleString('zh-CN')}</strong></div>)}</div>;
 }
 if(kind==='compare'&&data.length===2)return <table className="v31-compare-table"><thead><tr><th>{metric.kind==='trend'?'观测期':'对象'}</th><th>{metric.name}（{metric.unit}）</th></tr></thead><tbody>{data.map(d=><tr key={d.label}><td>{d.label}</td><td>{d.value.toLocaleString('zh-CN')}</td></tr>)}</tbody></table>;
 if(kind==='compare'){
  const min=Math.min(0,...data.map(d=>d.value)),max=Math.max(0,...data.map(d=>d.value)),range=max-min||1;
  const zero=(0-min)/range*100;
  return <div className="v32-bars" role="group" aria-label={metric.name+'（'+metric.unit+'）'}>
    {data.map(d=><div className="v32-bar-row" key={d.label} data-region={d.label}><span className="v32-bar-label">{d.label}</span><div className="v32-bar-track"><span className="v32-axis-zero" style={{left:zero+'%'}}/>{d.value===0?<span className="v32-zero-dot" style={{left:zero+'%'}}/>:<span className="v32-bar-fill" style={{left:(Math.min(d.value,0)-min)/range*100+'%',width:Math.abs(d.value)/range*100+'%',background:min<0?(d.value<0?'#c17a42':'#3979af'):color}}/>}</div><span className="v32-bar-value">{min<0&&d.value>0?'+':''}{d.value.toLocaleString('zh-CN',{maximumFractionDigits:2})}{d.value===0?' · 持平':''}</span></div>)}
    <div className="v32-bar-axis"><span>{min}</span><span>单位：{metric.unit}</span><span>{max}</span></div>
  </div>;
 }
 return <div className="v30-chart" style={{height:260}}><ResponsiveContainer width="100%" height="100%">
 <LineChart data={data.map(p=>({...p,time:Date.parse(p.date)}))} margin={{left:6,right:24,top:12,bottom:8}}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="time" type="number" scale="time" domain={['dataMin','dataMax']} ticks={data.map(p=>Date.parse(p.date))} tickFormatter={(n:number)=>data.find(p=>Date.parse(p.date)===n)?.label??''} interval={0}/><YAxis domain={['auto','auto']} unit={metric.unit==='%'?'%':''}/><Tooltip labelFormatter={(n:number)=>data.find(p=>Date.parse(p.date)===n)?.label??''} formatter={(n:number)=>[n+' '+metric.unit,metric.name]}/><Line dataKey="value" stroke={color} strokeWidth={2.5} dot isAnimationActive={false}/></LineChart>
 </ResponsiveContainer></div>;
}
export function MetricPanel({metric,compact=false,cutoff,observation}:{metric:Metric;compact?:boolean;cutoff?:string;observation?:Observation}){
 const data=eligiblePoints(metric,cutoff);if(!data.length)return null;
 const last=data.at(-1)!;const showLatest=metric.kind!=='compare';
 return <section className={'v30-metric '+(compact?'v30-metric-small':'')}>
 <div className="v30-metric-label">{compact?({'需求':'市场需求','价格':'市场价格','成本':'成本环境','资金':'资金环境'} as Record<string,string>)[metric.category]:metric.name}</div>
 {showLatest&&<div className="v30-value">{last.value.toLocaleString('zh-CN')}<small>{metric.unit}</small></div>}
 {compact&&<div className="v30-metric-name">{metric.name}</div>}
 {(!showLatest||data.length>1)&&<MetricGraphic metric={metric} compact={compact} cutoff={cutoff}/>}
 <div className="v30-metric-meta">{!cutoff&&metric.change&&<strong>{metric.change} · </strong>}{metric.scope} · {last.date}</div>
 {!compact&&<p className="v33-metric-note">{metricNotes[metric.id]}</p>}{!compact&&observation&&observation.sourceIds.every(id=>data.some(p=>p.sourceId===id))&&<div className="v33-observation"><strong>AI观察</strong> {observation.text}<EvidenceNote ids={observation.sourceIds}/></div>}{!compact&&data.length>1&&<details className="v32-data-table"><summary>查看完整数据表</summary><table className="v31-compare-table"><thead><tr><th>观测对象／期间</th><th>{metric.unit}</th></tr></thead><tbody>{data.map(d=><tr key={d.label}><td>{d.label}</td><td>{d.value.toLocaleString('zh-CN')}</td></tr>)}</tbody></table></details>}<EvidenceNote ids={data.map(d=>d.sourceId)}/></section>;
}
export function CoreMonitoring({cutoff}:{cutoff?:string}){
 return <div className="v30-core">{coreIds.map(id=><MetricPanel key={id} metric={metricById(id)!} compact cutoff={cutoff}/>)}</div>;
}
export function MarketMonitor(){
 const snapshot=useMarketSnapshot();const [category,setCategory]=useState<string>('需求');const [period,setPeriod]=useState('all');
 return <div className="v30-monitor"><div className="page-heading"><div><div className="eyebrow">行业行情与经营参照</div><h1>市场监测</h1><div className="heading-meta">公开指标 · 按实际观测期展示</div></div></div>
 <div className="v30-tabs" role="group" aria-label="监测类别">{categories.map(c=><button key={c} className={category===c?'active':''} onClick={()=>{setCategory(c);setPeriod('all')}}>{c}</button>)}</div>
 <div className="v30-monitor-controls"><label>观测范围 <select className="select-control" value={period} onChange={e=>setPeriod(e.target.value)}><option value="all">全部已收录</option><option value="latest">最近四期</option></select></label><Link to="/topics" search={{q:({需求:'市场需求与发运量',价格:'混凝土价格',成本:'原料成本',资金:'房建资金',增长:'基建投资',竞争:'市场竞争'} as Record<string,string>)[category],window:'all'}}>基于指标发起研判 <ArrowUpRight size={14}/></Link></div>
 {category==="价格"&&<section className="v32-group-context"><h2>集团经营区域参照</h2><p>2026年半年报：国家重大战略区域签约量占59%，包括京津冀、长三角及粤港澳大湾区等。下列采价城市按所在省份关联公司公开收入占比，不能视作该城市的收入。</p><table className="v31-compare-table"><thead><tr><th>采价城市</th><th>所属经营地区</th><th>公司地区收入占比</th></tr></thead><tbody>{eligiblePoints(metricById("regional-level")!).map(d=><tr key={d.label}><td>{d.label}</td><td>{cityProvince[d.label]}</td><td>{regionalExposure(d.label)?.toFixed(2)}%</td></tr>)}</tbody></table><EvidenceNote ids={["v32-group"]}/></section>}<div className="v30-monitor-grid">{metrics.filter(m=>m.category===category).map(m=><MetricPanel key={m.id} observation={period==='all'?snapshot.result?.observations.find(o=>o.metricId===m.id):undefined} metric={period==='latest'&&m.kind==='trend'?{...m,points:m.points.slice(-4)}:m}/>)}</div>
 </div>;
}
