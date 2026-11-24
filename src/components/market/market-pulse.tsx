import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowRight, Bookmark, Search, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeading, EventActions, EventKicker, SourceLinks } from './reading';
import { usePublication } from './publication';
import { formatDate, getSource, issues, monthlyIssues, type MarketEvent } from '@/lib/market-data';
import { currentCutoff } from '@/lib/reading-editions';
import { getPulseEvents, getPulseFocus, getOperatingContext, operatingAreas, type PulseFilter } from '@/lib/market-pulse';
import { getReportBrief } from '@/lib/report-workflow';

const watchKey = 'market-pulse-v28-watch';
const marketQuery = '市场需求、原料价格、基建投资、房企资金、绿色建材';
type Analysis = {answer:string;sourceIds:string[]};
function EventRow({event,watched,onToggle}:{event:MarketEvent;watched:boolean;onToggle:()=>void}) {
  const context=getOperatingContext(event);
  return <article className="pulse-event operating-event">
    <div className="pulse-event-meta"><EventKicker event={event}/><span>{formatDate(event.date)} 更新</span><span className={event.public?'operating-public':'operating-demo'}>{event.public?'公开资料':'业务样例'}</span></div>
    <div className="pulse-event-title"><h3><Link to="/events/$eventId" params={{eventId:event.id}} search={{}}>{event.title}</Link></h3>
      <button className="pulse-watch-button no-print" type="button" aria-label={watched?'取消关注 '+event.title:'关注 '+event.title} aria-pressed={watched} onClick={onToggle}><Bookmark size={17} fill={watched?'currentColor':'none'}/></button></div>
    <div className="operating-status"><span>{context.status}</span>{context.checkpoint&&<strong>样例节点 {formatDate(context.checkpoint)}</strong>}</div>
    <dl className="operating-lines">
      <div><dt>当前状况</dt><dd>{event.fact}</dd></div>
      <div><dt>集团关联</dt><dd>{event.relation}{context.internalAsOf&&<small className="operating-asof">样例内部材料截至 {formatDate(context.internalAsOf)}</small>}</dd></div>
      <div className="operating-action"><dt>建议动作</dt><dd>{event.attention}</dd></div>
      {event.pending.length>0&&<div><dt>待确认</dt><dd>{event.pending.join('；')}</dd></div>}
    </dl>
    <details><summary>影响判断与原始依据</summary><p>{event.impact}</p><SourceLinks ids={event.sources}/></details>
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
        body:JSON.stringify({topic:{q:marketQuery,window:'30d'},question:'站在西部建设预拌混凝土集团经营决策角度，结合当前已收录公开证据，按利润、订单、现金与交付指出最值得关注的2—3个经营问题。每项先说明当前已知事实和具体适用区域/业务，再说明可能影响我方哪个经营环节、建议核实或采取什么动作及改变判断的条件。明确集团实际数据缺口，不把公开行情或示例当成实际经营结果；引用具体来源。',history:[]}),signal:controller.signal});
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
    {!result&&!error&&<p className="pulse-muted">针对集团利润、订单、现金与交付，按现有公开证据研判影响、建议动作及需要补齐的内部数据。</p>}
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
  const [filter,setFilter]=useState<PulseFilter>('all');
  const [query,setQuery]=useState('');
  const [type,setType]=useState('');
  const [watched,setWatched]=useState<string[]>([]);
  const [loaded,setLoaded]=useState(false);
  useEffect(()=>{try{const data=JSON.parse(localStorage.getItem(watchKey)??'[]');if(Array.isArray(data))setWatched(data.filter((id:unknown):id is string=>typeof id==='string'));}catch{/* storage unavailable */}setLoaded(true);},[]);
  useEffect(()=>{if(loaded)try{localStorage.setItem(watchKey,JSON.stringify(watched));}catch{/* storage unavailable */}},[loaded,watched]);
  function toggle(id:string){setWatched(previous=>previous.includes(id)?previous.filter(value=>value!==id):[...previous,id]);}
  const all=useMemo(()=>getPulseEvents(stage,filter),[stage,filter]);
  const focus=getPulseFocus(all,watched);
  const types=[...new Set(all.map(event=>event.type))];
  const filtered=all.filter(event=>(!type||event.type===type)&&(!query.trim()||[event.title,event.region,event.type,event.fact].join(' ').includes(query.trim())));
  const checkpoints=focus.filter(event=>getOperatingContext(event).checkpoint);
  const queue=focus.filter(event=>watched.includes(event.id));
  return <div className="pulse-page operating-page">
    <PageHeading title={directory?'重点议题':'市场态势'} eyebrow="集团经营关注" meta={<><span>收录材料截至 {formatDate(currentCutoff)}</span><span className="divider"/><span>公开资料与业务样例 · 未接实时采集</span></>}/>
    {!directory&&<div className="operating-intro">
      <h2>当前需要关注的经营事项</h2>
      <p>围绕集团利润、订单、现金与交付，持续保留尚待核实的事项。按证据及经营关联展示，不按周报换期清空。</p>
      <div className="operating-overview">{operatingAreas.map(area=>{
        const rows=focus.filter(event=>getOperatingContext(event).area===area);
        const primary=rows[0];
        return <a href={'#area-'+area} key={area} className="operating-overview-item"><span>{area}</span><strong>{rows.length?rows.length+' 项待核':'暂无收录事项'}</strong><small>{primary?.judgment??'当前资料不足'}</small></a>;
      })}</div>
    </div>}
    <div className="pulse-layout">
      <section aria-labelledby="pulse-list-title">
        <div className="pulse-section-head"><h2 id="pulse-list-title">{directory?'全部已收录议题':'集团经营影响与建议'}</h2>{!directory&&<Link to="/" search={{view:'issues'}}>议题目录 <ArrowRight size={14}/></Link>}</div>
        <div className="pulse-filters no-print">
          <select className="select-control" aria-label="资料性质" value={filter} onChange={e=>setFilter(e.target.value as PulseFilter)}><option value="all">全部材料</option><option value="public">公开资料</option><option value="demo">业务样例</option></select>
          {directory&&<><select className="select-control" aria-label="议题类型" value={type} onChange={e=>setType(e.target.value)}><option value="">全部类型</option>{types.map(value=><option key={value}>{value}</option>)}</select><Input aria-label="搜索议题" placeholder="搜索区域、事件或关键词" value={query} onChange={e=>setQuery(e.target.value)}/></>}
        </div>
        {directory?filtered.map(event=><EventRow key={event.id} event={event} watched={watched.includes(event.id)} onToggle={()=>toggle(event.id)}/>):operatingAreas.map(area=>{
          const rows=focus.filter(event=>getOperatingContext(event).area===area);
          return <section className="operating-group" key={area} id={'area-'+area}><h2>{area}<span>{rows.length} 项</span></h2>{rows.length?rows.map(event=><EventRow key={event.id} event={event} watched={watched.includes(event.id)} onToggle={()=>toggle(event.id)}/>):<p className="pulse-muted">当前范围暂无收录事项。</p>}</section>;
        })}
        {directory&&!filtered.length&&<p className="empty-state">当前范围暂无符合条件的议题。</p>}
      </section>
      <aside className="pulse-side">
        <div className="pulse-section-head"><h2>关键复核节点</h2></div>
        {checkpoints.map(event=><div className="pulse-queue" key={event.id}><span>{event.region} · 业务样例</span><h3><Link to="/events/$eventId" params={{eventId:event.id}} search={{}}>{event.title}</Link></h3><strong className="operating-deadline">{formatDate(getOperatingContext(event).checkpoint!)}</strong><p>{getReportBrief(event.id)?.checkpoint??event.attention}</p></div>)}
        {!checkpoints.length&&<p className="pulse-muted">当前资料未记录明确日期节点。</p>}
        <div className="pulse-section-head operating-watch-head"><h2>我的持续关注</h2></div>
        {queue.map(event=><div className="pulse-queue" key={event.id}><span>{event.region} · {event.public?'公开资料':'业务样例'}</span><h3><Link to="/events/$eventId" params={{eventId:event.id}} search={{}}>{event.title}</Link></h3><button type="button" className="pulse-unwatch no-print" onClick={()=>toggle(event.id)}>取消关注</button></div>)}
        {!queue.length&&<p className="pulse-muted">点击议题右侧书签添加关注。</p>}
        {!directory&&<MarketAnalysis/>}
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
