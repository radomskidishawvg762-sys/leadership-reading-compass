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
import {parsePulse,pulseQuery,type PulseAnalysis,type PulseItem} from '@/lib/pulse-analysis';
const watchKey='market-pulse-v28-watch',cacheKey='market-v32-pulse:'+currentCutoff;
function useStars(){
 const [watched,setWatched]=useState<string[]>([]);const [loaded,setLoaded]=useState(false);
 useEffect(()=>{try{const x=JSON.parse(localStorage.getItem(watchKey)??'[]');if(Array.isArray(x))setWatched(x.filter((id:unknown)=>typeof id==='string'));}catch{}setLoaded(true);},[]);
 useEffect(()=>{if(loaded)try{localStorage.setItem(watchKey,JSON.stringify(watched));}catch{}},[watched,loaded]);
 return {watched,toggle:(id:string)=>setWatched(v=>v.includes(id)?v.filter(x=>x!==id):[...v,id])};
}
function usePulse(enabled:boolean,events:MarketEvent[]){
 const [result,setResult]=useState<PulseAnalysis|null>(null);const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 const abort=useRef<AbortController|null>(null);const started=useRef(false);
 const publicEvents=events.filter(e=>e.public).map(e=>({id:e.id,sourceIds:e.sources}));
 const allowed=[...publicEvents.flatMap(e=>e.sourceIds).filter(id=>!!getSource(id)?.url),'v32-group'];
 function verify(v:unknown):PulseAnalysis|null{
  const parsed=parsePulse(v,publicEvents,allowed);
  const timestamp=(v as {generatedAt?:unknown}|null)?.generatedAt;
  return parsed&&typeof timestamp==='string'&&!Number.isNaN(Date.parse(timestamp))?{...parsed,generatedAt:timestamp}:null;
 }
 async function run(refresh=false){
  abort.current?.abort();const c=new AbortController();abort.current=c;setBusy(true);setError('');const timeout=setTimeout(()=>c.abort('timeout'),30000);
  try{
   const res=await fetch('/api/topic-chat',{method:'POST',headers:{'Content-Type':'application/json'},signal:c.signal,body:JSON.stringify({mode:'pulse',refresh,topic:{q:pulseQuery,window:'all'},question:'综合当前公开证据，选出对集团经营最值得关注的变化，给出整体判断和各事项的具体建议。',history:[]})});
   const body=await res.json();if(!res.ok)throw Error(body.error??'AI 服务暂不可用');
   const next=verify(body.pulse);if(!next)throw Error('研判未通过校验');
   if(c.signal.aborted)return;setResult(next);try{localStorage.setItem(cacheKey,JSON.stringify(next));}catch{}
  }catch(e){if(!c.signal.aborted||c.signal.reason==='timeout')setError(c.signal.reason==='timeout'?'AI响应超时，可稍后重新研判。':e instanceof Error?e.message:'研判暂不可用');}finally{clearTimeout(timeout);if(abort.current===c)setBusy(false);}
 }
 useEffect(()=>{if(started.current)return;started.current=true;try{const cached=verify(JSON.parse(localStorage.getItem(cacheKey)??localStorage.getItem('market-v31-pulse:'+currentCutoff)??'null'));if(cached){setResult(cached);if(!enabled||Date.now()-Date.parse(cached.generatedAt)<3600000)return;}}catch{}if(enabled)void run();return ()=>{abort.current?.abort();started.current=false;};},[enabled]);
 return {result,busy,error,run};
}
function IssueRow({event,item,watched,toggle,compact=false}:{event:MarketEvent;item?:PulseItem;watched:boolean;toggle:()=>void;compact?:boolean}){
 const metric=eventMetric(event.id);
 return <article className="v30-issue">
 <div className="v30-issue-kicker"><EventKicker event={event}/><span>{formatDate(event.date)}</span><span>{event.public?'公开资料':'业务样例'}</span><button className={'v30-star '+(watched?'active':'')} aria-label={(watched?'取消关注 ':'关注 ')+event.title} aria-pressed={watched} onClick={toggle}><Star size={19} fill={watched?'currentColor':'none'}/></button></div>
 <h3><Link to="/events/$eventId" params={{eventId:event.id}} search={{}}>{metric?.id==='regional'?'重点城市商混价格涨跌分化':event.title}</Link></h3>
 <div className={'v30-issue-body '+(metric&&!compact?'with-graphic':'')}>
 {metric&&!compact&&<div className="v30-issue-chart"><div className="v30-metric-label">{metric.name} · {metric.unit}</div><MetricGraphic metric={metric}/></div>}
 <div><p className="v30-conclusion">{item?.conclusion??event.judgment}</p>
 {item?<div className="v30-advice"><span><Sparkles size={15}/> AI研判提示</span><strong>{item.advice}</strong></div>:event.public?<div className="v30-advice"><span><Sparkles size={15}/> AI研判提示</span><p className="v32-pending">{compact?'进入专题查看AI分析。':'本次AI提示尚未生成，可进入专题深入研判。'}</p></div>:null}
 <EvidenceNote ids={[...(item?.sourceIds??event.sources),...(metric&&!compact?eligiblePoints(metric).map(p=>p.sourceId):[])]}/>
 {event.public?<Link className="v30-more" to="/topics" search={{q:event.title,window:"all"}}>深入研判 <ArrowRight size={15}/></Link>:<Link className="v30-more" to="/events/$eventId" params={{eventId:event.id}} search={{ask:true}}>查看样例 <ArrowRight size={15}/></Link>}</div></div>
 </article>;
}
export function MarketPulse({directory=false}:{directory?:boolean}){
 const {stage}=usePublication();const {watched,toggle}=useStars();
 const [filter,setFilter]=useState('all'),[query,setQuery]=useState('');
 const all=useMemo(()=>getPulseEvents(stage,'all'),[stage]);
 const ai=usePulse(!directory,all);
 const recommended=ai.result?.items??[];
 const focus=getPulseFocus(all.filter(e=>e.public),watched);
 const fallback=focus.filter(e=>!['EV-PUBLIC-001'].includes(e.id)).slice(0,4);
 const selected=ai.result?recommended.flatMap(i=>{const e=all.find(e=>e.id===i.eventId);return e?[e]:[]}):fallback;
 const visible=directory?all.filter(e=>(filter==='all'||(filter==='ai'?recommended.some(i=>i.eventId===e.id):filter==='star'?watched.includes(e.id):filter==='public'?!!e.public:!e.public))&&(!query||[e.title,e.region,e.fact].join(' ').includes(query))).sort((a,b)=>Number(watched.includes(b.id))-Number(watched.includes(a.id))||Number(recommended.some(i=>i.eventId===b.id))-Number(recommended.some(i=>i.eventId===a.id))||Number(!!b.public)-Number(!!a.public)||b.date.localeCompare(a.date)):selected;
 return <div className="v30-page">
 <PageHeading title={directory?'专题研判':'市场态势'} eyebrow={directory?'重点议题与持续研究':'集团市场经营观察'} meta={'收录资料截至 '+formatDate(currentCutoff)}/>
 {directory?<><form className="v30-search" action="/topics" method="get"><Input name="q" placeholder="输入经营问题，发起 AI 研判" aria-label="经营研判问题" required maxLength={120}/><input name="window" type="hidden" value="all"/><Button type="submit"><Search size={16}/>发起研判</Button></form>
 <div className="v30-tabs">{[['all','全部专题'],['ai','AI推荐'],['public','公开市场议题'],['star','星标关注'],['demo','业务样例']].map(([id,label])=><button key={id} className={id===filter?'active':''} onClick={()=>setFilter(id)}>{label}</button>)}<Input value={query} onChange={e=>setQuery(e.target.value)} placeholder="搜索议题" aria-label="搜索议题"/></div></>:<>
 <section className="v30-summary"><div className="v30-section-head"><h2><Sparkles size={18}/>当前 AI 综合研判</h2><Button size="sm" variant="outline" disabled={ai.busy} onClick={()=>void ai.run(true)}>{ai.busy?'正在研判…':ai.result?'重新研判':'生成研判'}</Button></div>
 {ai.result?<><h3>{ai.result.summary}</h3><small>生成于 {ai.result.generatedAt.slice(0,10)} · 基于已收录公开资料</small><EvidenceNote ids={ai.result.sourceIds}/></>:<p>{ai.busy?'正在结合公开证据形成综合研判…':'尚无已验证的 AI 综合研判。下方保留可核实的市场监测及资料判断。'}</p>}
 {ai.error&&<p role="status" className="v30-error">{ai.error}{ai.result?' · 保留上次有效研判':''}</p>}</section>
 <section className="v30-monitor-section"><div className="v30-section-head"><h2>核心市场监测</h2><Link to="/" search={{view:'monitor'}}>全部指标 <ArrowRight size={15}/></Link></div><CoreMonitoring/></section>
 </>}
 <section className="v30-dynamic"><div className="v30-section-head"><h2>{directory?'研究专题':'重点市场变化与经营研判'}</h2>{!directory&&<Link to="/" search={{view:'issues'}}>全部议题 <ArrowRight size={15}/></Link>}</div>
 {visible.map(e=><IssueRow key={e.id} event={e} item={recommended.find(i=>i.eventId===e.id)} watched={watched.includes(e.id)} toggle={()=>toggle(e.id)} compact={directory}/>)}
 {!visible.length&&<p className="v30-empty">当前没有匹配的议题。</p>}</section>
 {!directory&&watched.length>0&&<section><div className="v30-section-head"><h2>我的重点关注</h2></div>{all.filter(e=>watched.includes(e.id)).map(e=><Link className="v30-saved" key={e.id} to="/events/$eventId" params={{eventId:e.id}} search={{}}><Star size={15} fill="currentColor"/>{e.title}<ArrowRight size={14}/></Link>)}</section>}
 </div>;
}
export function BriefArchive(){
 const latest=monthlyIssues[0];
 return <div className="v30-page"><PageHeading title="经营简报" eyebrow="经营成果与历史归档" meta="按发布期次阅读 · 保留当期资料"/>
 {latest&&<section className="v30-latest-brief"><div className="v30-section-head"><h2>最新月度简报</h2><Link to="/monthly" search={{month:latest.id}}>阅读完整简报 <ArrowRight size={15}/></Link></div><h3>{latest.title}</h3><p>{latest.summary}</p><CoreMonitoring cutoff={latest.end}/></section>}
 <div className="pulse-archive"><section><h2>月度简报</h2>{monthlyIssues.map(issue=><Link key={issue.id} className="pulse-archive-link" to="/monthly" search={{month:issue.id}}><span>{issue.id.replace('-','年')}月</span><span>截至 {formatDate(issue.end)}</span><ArrowRight size={16}/></Link>)}<h2 className="pulse-archive-special">事件专报</h2><Link className="pulse-archive-link" to="/reports"><span>查看已发布专报</span><ArrowRight size={16}/></Link></section><section><h2>历史周度速览</h2>{issues.map(issue=><Link key={issue.id} className="pulse-archive-link" to="/" search={{issue:issue.id}}><span>第 {issue.number} 期</span><span>{formatDate(issue.start)} — {formatDate(issue.end)}</span><ArrowRight size={16}/></Link>)}</section></div></div>;
}
