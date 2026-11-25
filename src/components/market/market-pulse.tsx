import {useEffect,useMemo,useRef,useState} from 'react';
import {Link} from '@tanstack/react-router';
import {ArrowRight,Star,Search,Sparkles} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {PageHeading,EventKicker} from './reading';
import {usePublication} from './publication';
import {formatDate,issues,monthlyIssues,getSource,type MarketEvent} from '@/lib/market-data';
import {currentCutoff} from '@/lib/reading-editions';
import {getPulseEvents,getPulseFocus,type PulseFilter} from '@/lib/market-pulse';
import {CoreMonitoring,EvidenceNote,MetricGraphic} from './market-visual';
import {eventMetric,eligiblePoints} from '@/lib/market-monitor';
import type {PulseItem} from '@/lib/pulse-analysis';
import {groupContext} from '@/lib/group-context';
import {RegionChanges} from './opportunity-context';
import {GroupContext} from './group-context';
import {useMarketSnapshot} from './use-market-snapshot';
const watchKey='market-pulse-v28-watch';
function useStars(){
 const [watched,setWatched]=useState<string[]>([]);const [loaded,setLoaded]=useState(false);
 useEffect(()=>{try{const x=JSON.parse(localStorage.getItem(watchKey)??'[]');if(Array.isArray(x))setWatched(x.filter((id:unknown)=>typeof id==='string'));}catch{}setLoaded(true);},[]);
 useEffect(()=>{if(loaded)try{localStorage.setItem(watchKey,JSON.stringify(watched));}catch{}},[watched,loaded]);
 return {watched,toggle:(id:string)=>setWatched(v=>v.includes(id)?v.filter(x=>x!==id):[...v,id])};
}
function IssueRow({event,item,watched,toggle,compact=false}:{event:MarketEvent;item?:PulseItem;watched:boolean;toggle:()=>void;compact?:boolean}){
 const metric=eventMetric(event.id);
 const related=!compact&&event.public&&groupContext(event.id).length>0;
 const hasChart=!!metric&&!compact;
 return <article className="v30-issue">
 <div className="v30-issue-kicker"><EventKicker event={event}/><span>{formatDate(event.date)}</span><span>{event.public?'公开资料':'业务样例'}</span><button className={'v30-star '+(watched?'active':'')} aria-label={(watched?'取消关注 ':'关注 ')+event.title} aria-pressed={watched} onClick={toggle}><Star size={19} fill={watched?'currentColor':'none'}/></button></div>
 <h3>{event.public?<Link to="/topics" search={{q:event.title,window:"all"}}>{metric?.id==='regional'?'成都、重庆价格上涨，武汉价格下降':event.title}</Link>:<Link to="/events/$eventId" params={{eventId:event.id}} search={{}}>{event.title}</Link>}</h3>
 <div className={'v30-issue-body '+(hasChart||related?'with-graphic':'')}>
 {(hasChart||related)&&<div className="v35-issue-data">{metric&&hasChart&&<div className="v30-issue-chart"><div className="v30-metric-label">{metric.name} · {metric.unit}</div><MetricGraphic metric={metric}/></div>}{related&&<GroupContext eventId={event.id}/>}</div>}
 <div className="v35-issue-reading"><p className="v30-conclusion">{item?.conclusion??event.judgment}</p>
 {item?<div className="v30-advice"><span><Sparkles size={15}/> AI研判建议</span><strong>{item.advice}</strong></div>:null}
 <EvidenceNote ids={[...(item?.sourceIds??event.sources),...(metric&&!compact?eligiblePoints(metric).map(p=>p.sourceId):[])]}/>
 {event.public?<Link className="v30-more" to="/topics" search={{q:event.title,window:"all"}}>深入研判 <ArrowRight size={15}/></Link>:<Link className="v30-more" to="/events/$eventId" params={{eventId:event.id}} search={{ask:true}}>查看样例 <ArrowRight size={15}/></Link>}</div></div>
 </article>;
}
export function MarketPulse({directory=false}:{directory?:boolean}){
 const {stage}=usePublication();const {watched,toggle}=useStars();
 const [filter,setFilter]=useState('public'),[query,setQuery]=useState('');
 const all=useMemo(()=>getPulseEvents(stage,'all'),[stage]);
 const ai=useMarketSnapshot();
 const recommended=ai.result?.items??[];const focusIds=ai.result?.focusIds??[];
 const focus=getPulseFocus(all.filter(e=>e.public),watched);
 const fallback=focus.filter(e=>!['EV-PUBLIC-001'].includes(e.id)).slice(0,4);
 const selected=ai.result?focusIds.flatMap(id=>{const e=all.find(e=>e.id===id);return e?[e]:[]}):fallback;
 const visible=directory?all.filter(e=>(filter==='all'||(filter==='ai'?focusIds.includes(e.id):filter==='star'?watched.includes(e.id):filter==='public'?!!e.public:!e.public))&&(!query||[e.title,e.region,e.fact].join(' ').includes(query))).sort((a,b)=>Number(watched.includes(b.id))-Number(watched.includes(a.id))||Number(focusIds.includes(b.id))-Number(focusIds.includes(a.id))||Number(!!b.public)-Number(!!a.public)||b.date.localeCompare(a.date)):selected;
 return <div className={"v30-page "+(directory?"v34-directory":"v34-home")}>
 <h1 className="v37-sr-only">{directory?'专题研判':'市场态势'}</h1>
 {directory?<><form className="v30-search" action="/topics" method="get"><Input name="q" placeholder="输入经营问题，发起 AI 研判" aria-label="经营研判问题" required maxLength={120}/><input name="window" type="hidden" value="all"/><Button type="submit"><Search size={16}/>发起研判</Button></form>
 <div className="v30-tabs">{[['all','全部专题'],['ai','AI推荐'],['public','公开市场议题'],['star','星标关注'],['demo','业务样例']].map(([id,label])=><button key={id} className={id===filter?'active':''} onClick={()=>setFilter(id)}>{label}</button>)}<Input value={query} onChange={e=>setQuery(e.target.value)} placeholder="搜索议题" aria-label="搜索议题"/></div></>:<>
 <section className="v30-summary"><div className="v30-section-head"><h2><Sparkles size={18}/>当前 AI 综合研判</h2><Button size="sm" variant="outline" disabled={ai.busy} onClick={()=>void ai.run(true)}>{ai.busy?'提交中…':'检查更新'}</Button></div>
 {ai.result?<><h3>{ai.result.summary}</h3><small>{ai.result.origin==='release-ai'?'AI发布版 · ':'AI研判 · '}{ai.result.generatedAt.slice(0,10)} · 资料截至 {ai.result.cutoff}{ai.checkedAt?' · 最近检查 '+ai.checkedAt.slice(0,10):''}</small><EvidenceNote ids={ai.result.sourceIds}/></>:<p>{ai.busy?'正在结合公开证据形成综合研判…':'首次公开研判尚未发布。市场监测与原始资料仍可阅读。'}</p>}
 {ai.error&&<p role="status" className="v30-error">{ai.error}{ai.result?' · 保留上次有效研判':''}</p>}</section>
 <section className="v30-monitor-section"><div className="v30-section-head"><h2>核心市场监测</h2><Link to="/" search={{view:'monitor'}}>全部指标 <ArrowRight size={15}/></Link></div><CoreMonitoring/></section><RegionChanges/>
 </>}
 <section className="v30-dynamic"><div className="v30-section-head"><h2>{directory?'研究专题':'重点市场变化与经营研判'}</h2>{!directory&&<Link to="/" search={{view:'issues'}}>全部议题 <ArrowRight size={15}/></Link>}</div>
 {visible.map(e=><IssueRow key={e.id} event={e} item={recommended.find(i=>i.eventId===e.id)} watched={watched.includes(e.id)} toggle={()=>toggle(e.id)} compact={directory}/>)}
 {!visible.length&&<p className="v30-empty">当前没有匹配的议题。</p>}</section>
 {!directory&&watched.length>0&&<section><div className="v30-section-head"><h2>我的重点关注</h2></div>{all.filter(e=>watched.includes(e.id)).map(e=><Link className="v30-saved" key={e.id} to="/events/$eventId" params={{eventId:e.id}} search={{}}><Star size={15} fill="currentColor"/>{e.title}<ArrowRight size={14}/></Link>)}</section>}
 </div>;
}
export function BriefArchive(){
 const latest=monthlyIssues[0];
 return <div className="v30-page"><h1 className="v37-sr-only">经营简报</h1>
 {latest&&<section className="v30-latest-brief"><div className="v30-section-head"><h2>最新月度简报</h2><Link to="/monthly" search={{month:latest.id}}>阅读完整简报 <ArrowRight size={15}/></Link></div><h3>{latest.title}</h3><p>{latest.summary}</p><CoreMonitoring cutoff={latest.end}/></section>}
 <div className="pulse-archive"><section><h2>月度简报</h2>{monthlyIssues.map(issue=><Link key={issue.id} className="pulse-archive-link" to="/monthly" search={{month:issue.id}}><span>{issue.id.replace('-','年')}月</span><span>截至 {formatDate(issue.end)}</span><ArrowRight size={16}/></Link>)}<h2 className="pulse-archive-special">事件专报</h2><Link className="pulse-archive-link" to="/reports"><span>查看已发布专报</span><ArrowRight size={16}/></Link></section><section><h2>历史周度速览</h2>{issues.map(issue=><Link key={issue.id} className="pulse-archive-link" to="/" search={{issue:issue.id}}><span>第 {issue.number} 期</span><span>{formatDate(issue.start)} — {formatDate(issue.end)}</span><ArrowRight size={16}/></Link>)}</section></div></div>;
}
