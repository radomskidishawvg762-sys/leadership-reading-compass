import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowRight, Bookmark, Search, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeading, EventActions, EventKicker, SourceLinks } from './reading';
import { usePublication } from './publication';
import { formatDate, getSource, issues, monthlyIssues, type MarketEvent } from '@/lib/market-data';
import { currentCutoff } from '@/lib/reading-editions';
import { getPulseEvents, getPulseFocus, getReviewQueue, type PulseFilter, type PulseRole } from '@/lib/market-pulse';
import { getReportBrief } from '@/lib/report-workflow';

const watchKey = 'market-pulse-v28-watch';
const marketQuery = '市场需求、原料价格、基建投资、绿色建材';
type Analysis = {answer:string;sourceIds:string[]};
function EventRow({event,watched,onToggle}:{event:MarketEvent;watched:boolean;onToggle:()=>void}) {
  return <article className="pulse-event">
    <div className="pulse-event-meta"><EventKicker event={event}/><span>{formatDate(event.date)}</span><span>{event.public?'公开资料':'业务样例'}</span></div>
    <div className="pulse-event-title"><h3><Link to="/events/$eventId" params={{eventId:event.id}} search={{}}>{event.title}</Link></h3>
      <button className="pulse-watch-button no-print" type="button" aria-label={watched?'取消关注 '+event.title:'关注 '+event.title} aria-pressed={watched} onClick={onToggle}><Bookmark size={17} fill={watched?'currentColor':'none'}/></button></div>
    <p>{event.judgment}</p>
    <details><summary>事实与经营关联</summary><p>{event.fact}</p><p>{event.relation}</p><SourceLinks ids={event.sources}/></details>
    <EventActions eventId={event.id}/>
  </article>;
}

function MarketAnalysis() {
  const [result,setResult]=useState<Analysis|null>(null);
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  const [question,setQuestion]=useState('');
  const pending=useRef<AbortController|null>(null);
  useEffect(()=>()=>pending.current?.abort(),[]);
  async function analyze() {
    pending.current?.abort();
    const controller=new AbortController();pending.current=controller;
    setBusy(true);setError('');setResult(null);
    try {
      const response=await fetch('/api/topic-chat',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({topic:{q:marketQuery,window:'30d'},question:'综合当前收录的公开市场证据，说明需求、成本、项目机会之间的关系。给出最值得关注的经营问题与依据，区分公开行情和集团实际经营数据。',history:[]}),signal:controller.signal});
      const body=await response.json() as {answer?:unknown;sourceIds?:unknown;error?:unknown};
      if(!response.ok)throw new Error(typeof body.error==='string'?body.error:'AI 服务暂不可用。');
      if(typeof body.answer!=='string'||!body.answer.trim()||!Array.isArray(body.sourceIds))throw new Error('模型返回格式异常。');
      const sourceIds=body.sourceIds.filter((id):id is string=>typeof id==='string'&&Boolean(getSource(id)?.url)&&getSource(id)?.kind==='外部材料');
      if(!sourceIds.length)throw new Error('此次研判缺少有效引用，请重新研判或查看原始材料。');
      if(!controller.signal.aborted)setResult({answer:body.answer,sourceIds});
    }catch(e){if(!controller.signal.aborted)setError(e instanceof Error?e.message:'研判失败。');}
    finally{if(!controller.signal.aborted)setBusy(false);}
  }
  return <section className="pulse-analysis" aria-labelledby="pulse-ai-title">
    <div className="pulse-section-head"><h2 id="pulse-ai-title"><Sparkles size={18}/>市场综合研判</h2><Button variant="outline" size="sm" onClick={()=>void analyze()} disabled={busy}>{busy?'正在研判…':result?'重新研判':'生成 AI 研判'}</Button></div>
    {!result&&!error&&<p className="pulse-muted">结合已收录的公开需求、价格、投资和政策证据，分析当前市场变化及经营影响。</p>}
    {busy&&<p role="status" className="pulse-muted">正在检索证据并调用模型…</p>}
    {error&&<p role="alert" className="pulse-error">{error}</p>}
    {result&&<div className="pulse-ai-result" role="status"><p>{result.answer}</p><SourceLinks ids={result.sourceIds}/></div>}
    <form className="pulse-question no-print" action="/topics" method="get">
      <Input name="q" aria-label="市场研判问题" placeholder="输入区域、客户或经营问题" maxLength={120} value={question} onChange={e=>setQuestion(e.target.value)}/>
      <input type="hidden" name="window" value="30d"/>
      <Button type="submit" disabled={!question.trim()}><Search size={16}/>专题研判</Button>
    </form>
  </section>;
}

export function MarketPulse({directory=false}:{directory?:boolean}) {
  const {stage}=usePublication();
  const [role,setRole]=useState<PulseRole>('chair');
  const [filter,setFilter]=useState<PulseFilter>('all');
  const [query,setQuery]=useState('');
  const [type,setType]=useState('');
  const [watched,setWatched]=useState<string[]>([]);
  const [loaded,setLoaded]=useState(false);
  useEffect(()=>{try{const data=JSON.parse(localStorage.getItem(watchKey)??'[]');if(Array.isArray(data))setWatched(data.filter((id:unknown):id is string=>typeof id==='string'));}catch{/* storage unavailable */}setLoaded(true);},[]);
  useEffect(()=>{if(loaded)try{localStorage.setItem(watchKey,JSON.stringify(watched));}catch{/* storage unavailable */}},[loaded,watched]);
  function toggle(id:string){setWatched(previous=>previous.includes(id)?previous.filter(value=>value!==id):[...previous,id]);}
  const all=useMemo(()=>getPulseEvents(stage,filter),[stage,filter]);
  const focus=getPulseFocus(all,role);
  const types=[...new Set(all.map(event=>event.type))];
  const filtered=all.filter(event=>(!type||event.type===type)&&(!query.trim()||[event.title,event.region,event.type,event.fact].join(' ').includes(query.trim())));
  const review=getReviewQueue(all,stage);
  const queue=all.filter(event=>watched.includes(event.id)||review.some(item=>item.id===event.id));
  const visible=directory?filtered:focus;
  return <div className="pulse-page">
    <PageHeading title={directory?'重点议题':'市场态势'} eyebrow="市场监测" meta={<><span>收录材料截至 {formatDate(currentCutoff)}</span><span className="divider"/><span>当前为资料库版本，非实时采集</span></>}>
      {!directory&&<div className="pulse-role no-print" aria-label="阅读视角">{(['chair','manager'] as const).map(value=><button type="button" key={value} aria-pressed={role===value} onClick={()=>setRole(value)}>{value==='chair'?'一号位':'二号位'}</button>)}</div>}
    </PageHeading>
    {!directory&&<MarketAnalysis/>}
    <div className="pulse-layout">
      <section aria-labelledby="pulse-list-title">
        <div className="pulse-section-head"><h2 id="pulse-list-title">{directory?'全部已收录议题':'近七日重点变化'}</h2>{!directory&&<Link to="/" search={{view:'issues'}}>查看全部 <ArrowRight size={14}/></Link>}</div>
        <div className="pulse-filters no-print">
          <select className="select-control" aria-label="资料性质" value={filter} onChange={e=>setFilter(e.target.value as PulseFilter)}><option value="all">全部材料</option><option value="public">公开资料</option><option value="demo">业务样例</option></select>
          {directory&&<><select className="select-control" aria-label="议题类型" value={type} onChange={e=>setType(e.target.value)}><option value="">全部类型</option>{types.map(value=><option key={value}>{value}</option>)}</select><Input aria-label="搜索议题" placeholder="搜索区域、事件或关键词" value={query} onChange={e=>setQuery(e.target.value)}/></>}
        </div>
        {visible.map(event=><EventRow key={event.id} event={event} watched={watched.includes(event.id)} onToggle={()=>toggle(event.id)}/>)}
        {!visible.length&&<p className="empty-state">当前范围暂无符合条件的议题。</p>}
      </section>
      <aside className="pulse-side">
        <div className="pulse-section-head"><h2>持续关注</h2></div>
        <p className="pulse-muted">已发布专报的待核事项与个人关注。关注仅保存在当前浏览器。</p>
        {queue.map(event=><div className="pulse-queue" key={event.id}><span>{event.region} · {event.public?'公开资料':'业务样例'} · {formatDate(event.date)}</span><h3><Link to="/events/$eventId" params={{eventId:event.id}} search={{}}>{event.title}</Link></h3><p>{getReportBrief(event.id)?.checkpoint??event.attention}</p>{watched.includes(event.id)&&<button type="button" className="pulse-unwatch no-print" onClick={()=>toggle(event.id)}>取消个人关注</button>}</div>)}
        {!queue.length&&<p className="pulse-muted">暂无关注事项。</p>}
      </aside>
    </div>
  </div>;
}

export function BriefArchive() {
  return <div className="pulse-page">
    <PageHeading title="经营简报" eyebrow="正式交付" meta="周度、月度和事件材料按发布期次查阅"/>
    <div className="pulse-archive">
      <section><h2>周度速览</h2>{issues.map(issue=><Link key={issue.id} className="pulse-archive-link" to="/" search={{issue:issue.id}}><span>第 {issue.number} 期</span><span>{formatDate(issue.start)} — {formatDate(issue.end)}</span><ArrowRight size={16}/></Link>)}</section>
      <section><h2>月度简报</h2>{monthlyIssues.map(issue=><Link key={issue.id} className="pulse-archive-link" to="/monthly" search={{month:issue.id}}><span>{issue.id.replace('-','年')}月</span><span>截至 {formatDate(issue.end)}</span><ArrowRight size={16}/></Link>)}<h2 className="pulse-archive-special">事件专报</h2><Link className="pulse-archive-link" to="/reports"><span>查看已发布专报</span><ArrowRight size={16}/></Link></section>
    </div>
  </div>;
}
