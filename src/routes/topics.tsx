import {releaseDetails,releaseSnapshot} from '@/lib/market-release-v34';
import {GroupContext} from '@/components/market/group-context';
import {eventMetric} from '@/lib/market-monitor';
import {EvidenceNote,MetricGraphic} from '@/components/market/market-visual';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowRight, BookOpen, FileText, MessageSquare, Search, Send, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeading, SourceLinks } from '@/components/market/reading';
import { TopicNarrativeView } from '@/components/market/topic-narrative';
import {useMarketSnapshot} from '@/components/market/use-market-snapshot';
import {events,contentHead, formatDate } from '@/lib/market-data';
import { featuredTopics } from '@/lib/market-topics';
import { currentCutoff } from '@/lib/reading-editions';
import { getTopicResearch, type TopicWindow, type TopicInput } from '@/lib/topic-research';
import { pinnedTopicIds, isPinnedSnapshotRequest, getFixedTopicAnswer, scopePinnedEvidence } from '@/lib/topic-snapshots';
import { getTopicVisual } from '@/lib/topic-visuals';
import type { ChatTurn } from '@/lib/hybrid-ai';

const windows: Array<{value:TopicWindow;label:string}> = [
  {value:'7d',label:'近7天'}, {value:'30d',label:'近30天'},
  {value:'90d',label:'近90天'}, {value:'all',label:'全部已收录'},
];
type TopicAnswer = {answer:string;sourceIds:string[];eventIds:string[];generatedAt?:string};
type Exchange = {question:string;status:'loading'|'ready'|'error';data?:TopicAnswer;error?:string};

export const Route = createFileRoute('/topics')({
  validateSearch: (search:Record<string,unknown>):{q?:string;window?:TopicWindow;topicId?:string}=>({
    ...(typeof search.q==='string' && search.q.trim()?{q:search.q.trim().slice(0,120)}:{}),
    ...(typeof search.window==='string' && windows.some(item=>item.value===search.window)
      ?{window:search.window as TopicWindow}:{}),
    ...(typeof search.topicId==='string' && featuredTopics.some(item=>item.id===search.topicId)
      ?{topicId:search.topicId}:{}),
  }),
  head:()=>contentHead('专题研判','按区域、市场和经营问题聚合事件事实、证据，并开展专题级连续追问。'),
  component:Topics,
});

function Topics(){
  const search=Route.useSearch();
  const navigate=Route.useNavigate();
  const [input,setInput]=useState(search.q??'');
  const [draft,setDraft]=useState('');
  const [exchanges,setExchanges]=useState<Exchange[]>([]);
  const [busy,setBusy]=useState(false);
  const [savedNotice,setSavedNotice]=useState('');
  const [savedVersions,setSavedVersions]=useState<{at:string;rows:Exchange[]}[]>([]);
  const history=useRef<ChatTurn[]>([]);
  const pending=useRef<AbortController|null>(null);
  const window=search.window??'all';
  const topic:TopicInput=useMemo(()=>({
    q:search.q??'',window,...(search.topicId?{topicId:search.topicId}:{})
  }),[search.q,search.topicId,window]);
  const research=useMemo(()=>scopePinnedEvidence(topic,getTopicResearch(topic,{includeDemo:false})),[topic]);
  const featuredPinned=featuredTopics.filter(feature=>pinnedTopicIds.some(id=>id===feature.id));
  const fixedSnapshot=useMemo(()=>getFixedTopicAnswer(topic,research),[topic,research]);
  const key=[topic.q,topic.window,topic.topicId??''].join('|');
  const canonical=topic.window==='all'?events.find(e=>e.public&&e.title===topic.q):undefined;
  const shared=useMarketSnapshot();const prior=shared.result?.items.find(i=>i.eventId===canonical?.id);
  const seed=releaseSnapshot.items.find(i=>i.eventId===canonical?.id);
  const storageKey='v31-topic:'+key;
  function saveResearch(){
    const rows=exchanges.filter(e=>e.status==='ready'&&e.data);if(!rows.length)return;
    const versions=[{at:new Date().toISOString(),rows},...savedVersions].slice(0,5);
    try{localStorage.setItem(storageKey,JSON.stringify(versions));setSavedVersions(versions);setSavedNotice('已保存至本机');}catch{setSavedNotice('本机存储不可用');}
  }
  function clearResearch(){try{localStorage.removeItem(storageKey);setSavedVersions([]);setSavedNotice('已清除本机记录');}catch{setSavedNotice('无法清除本机记录');}}
  useEffect(()=>setInput(search.q??''),[search.q]);

  const ask=useCallback(async(question:string,reset=false)=>{
    if(!research.events.length || !research.sources.length)return;
    pending.current?.abort();
    const controller=new AbortController();
    pending.current=controller;
    const previous=reset?[]:history.current.slice(-6);
    if(reset)history.current=[];
    setBusy(true);
    // Keep the published analysis visible while an explicit refresh runs.
    setExchanges(rows=>[...rows,{question,status:'loading'}]);
    try{
      const response=await fetch('/api/topic-chat',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({topic,question,history:previous.map(t=>({...t,content:t.content.slice(0,1600)}))}),
        signal:controller.signal,
      });
      const raw:unknown=await response.json();
      const body=raw&&typeof raw==='object'?raw as Record<string,unknown>:{};
      if(!response.ok)throw Error(typeof body.error==='string'?body.error:'分析服务暂不可用。');
      if(typeof body.answer!=='string'||!Array.isArray(body.sourceIds)||!Array.isArray(body.eventIds))
        throw Error('模型返回格式无效。');
      if(controller.signal.aborted)return;
      const sourceIds=body.sourceIds.filter((id):id is string=>
        typeof id==='string'&&research.sources.some(source=>source.id===id));
      const eventIds=body.eventIds.filter((id):id is string=>
        typeof id==='string'&&research.events.some(event=>event.id===id));
      if(!sourceIds.length)throw Error('本次研判未提供可核实引用。');
      const answer=body.answer;
      history.current=[...previous,{role:'user' as const,content:question},
        {role:'assistant' as const,content:answer}].slice(-8);
      const completed:Exchange={question,status:'ready',data:{answer,sourceIds,eventIds,generatedAt:new Date().toISOString()}};
      if(reset){try{const old=JSON.parse(localStorage.getItem(storageKey)??'[]');const versions=[{at:completed.data!.generatedAt!,rows:[completed]},...(Array.isArray(old)?old:[])].slice(0,5);localStorage.setItem(storageKey,JSON.stringify(versions));setSavedVersions(versions);}catch{}}
      setExchanges(rows=>reset?[completed]:[...rows.slice(0,-1),completed]);
    }catch(error){
      if(controller.signal.aborted)return;
      const message=error instanceof Error?error.message:'专题分析失败。';
      setExchanges(rows=>{
        const result=rows.slice();
        result[result.length-1]={question,status:'error',error:message};
        return result;
      });
    }finally{
      if(!controller.signal.aborted)setBusy(false);
    }
  },[topic,research.events,research.sources,storageKey]);

  useEffect(()=>{
    pending.current?.abort();
    history.current=[];
    setExchanges([]);
    setDraft('');
    setBusy(false);
    setSavedNotice('');setSavedVersions([]);
    try{const stored=JSON.parse(localStorage.getItem(storageKey)??'[]');if(Array.isArray(stored)){
      const versions=stored.filter(v=>v&&typeof v.at==='string'&&Array.isArray(v.rows)).slice(0,5).map(v=>({at:v.at,rows:v.rows.filter((r:Exchange)=>r?.status==='ready'&&typeof r.question==='string'&&typeof r.data?.answer==='string'&&Array.isArray(r.data.sourceIds)&&Array.isArray(r.data.eventIds)&&r.data.sourceIds.every(id=>research.sources.some(s=>s.id===id))&&r.data.eventIds.every(id=>research.events.some(e=>e.id===id)))})).filter(v=>v.rows.length);
      setSavedVersions(versions);if(versions.length){const rows=versions[0].rows as Exchange[];setExchanges(rows);history.current=rows.flatMap(r=>[{role:'user' as const,content:r.question},{role:'assistant' as const,content:r.data!.answer}]).slice(-8);return ()=>pending.current?.abort();}
    }}catch{}
    const frozen=getFixedTopicAnswer(topic,research);
    if(frozen){
      setExchanges([{question:topic.q,status:'ready',data:{
        answer:frozen.answer,sourceIds:frozen.sourceIds,eventIds:frozen.eventIds,
      }}]);
    }else if(topic.q&&research.events.length&&research.sources.length){
      // Opening or changing a topic only reads published evidence. Explicit update triggers the model.
    }
    return ()=>pending.current?.abort();
  },[key,ask,topic.q,research,storageKey,canonical]);

  function runSearch(event:React.FormEvent){
    event.preventDefault();
    const q=input.trim().slice(0,120);
    void navigate({search:q?{q,window}: {window}});
  }

  function openFeatured(id:string,title:string){
    void navigate({search:{q:title,window:'all',topicId:id}});
  }

  return <>
    <Link className="v30-more" to="/" search={{view:"issues"}}>← 返回专题研判</Link><PageHeading title="专题研判" eyebrow="持续专题研究" meta={<span>收录材料截至 {formatDate(currentCutoff)} · 跨事件证据分析</span>}/>
    <form className="topic-v21-search" onSubmit={runSearch}>
      <Input aria-label="专题问题或区域" placeholder="输入区域、经营议题或问题，如：河南原料涨价对经营有何影响？"
        maxLength={120} value={input} onChange={event=>setInput(event.target.value)}/>
      <select aria-label="专题时间窗" className="select-control" value={window}
        onChange={event=>void navigate({search:{...search,window:event.target.value as TopicWindow}})}>
        {windows.map(item=><option key={item.value} value={item.value}>{item.label}</option>)}
      </select>
      <Button type="submit" disabled={!input.trim()}><Search size={16}/>研判分析</Button>
    </form>
    {Boolean(topic.q) && <div className="topic-v21-featured" aria-label="精选研究专题">
      <span className="topic-v21-featured-label">本期精选 · 3 个专题</span>
      {featuredPinned.map(feature=><button type="button" key={feature.id}
        className={research.topicId===feature.id?'topic-v21-chip active':'topic-v21-chip'}
        onClick={()=>openFeatured(feature.id,feature.title)}>{feature.title}</button>)}
    </div>}

    {!topic.q ? <section className="topic-v21-intro">
      <div className="topic-v21-intro-head">
        <h2>从一个经营问题开始</h2>
        <p>从三个精选专题快速了解重要议题；也可自由输入区域或经营问题，按时间范围动态研判。</p>
      </div>
      <div className="topic-v21-intro-grid">
        {featuredPinned.map(feature=><article className="topic-v21-entry topic-feature-card" key={feature.id}>
          <button className="topic-feature-image-button" type="button" aria-label={`打开专题：${feature.title}`}
            onClick={()=>openFeatured(feature.id,feature.title)}>
            <img className="topic-feature-image" src={getTopicVisual(feature.id)?.src}
              alt={getTopicVisual(feature.id)?.alt ?? '专题行业摄影'}
              width={960} height={540} loading="lazy" decoding="async"
              onError={event=>{event.currentTarget.style.opacity='0';}}/>
            <span className="topic-feature-image-note">行业实景摄影 · 非本期事件现场</span>
          </button>
          <div className="topic-feature-copy">
            <span className="topic-feature-kicker">{getTopicVisual(feature.id)?.tag ?? '专题研判'} · {String(featuredPinned.indexOf(feature)+1).padStart(2, "0")}</span>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>{shared.result.items.find(i=>i.eventId===({"housing-cash":"EV-PUBLIC-003","infrastructure":"EV-PUBLIC-004","green-building":"EV-PUBLIC-006"} as Record<string,string>)[feature.id])&&<p className="v34-feature-advice"><strong>AI研判建议</strong> {shared.result.items.find(i=>i.eventId===({"housing-cash":"EV-PUBLIC-003","infrastructure":"EV-PUBLIC-004","green-building":"EV-PUBLIC-006"} as Record<string,string>)[feature.id])?.advice}</p>}
            <button type="button" onClick={()=>openFeatured(feature.id,feature.title)}>阅读本期研判 <ArrowRight size={14}/></button>
          </div>
        </article>)}
      </div>
      <p className="topic-v21-disclaimer"><ShieldCheck size={15}/>分析范围仅限本站已收录、当前允许引用的公开资料，不代表集团内部经营数据。</p>
      <details className="topic-photo-sources">
        <summary>图片来源与使用说明</summary>
        <p>专题图片为行业真实场景摄影，不代表本期事件现场，也不作为研判证据。</p>
        <div className="topic-photo-source-links">
          {featuredPinned.map(feature=>{
            const visual=getTopicVisual(feature.id);
            return visual?<a key={feature.id} href={visual.photoPage} target="_blank" rel="noopener noreferrer">
              {feature.title} · {visual.photoCredit}
            </a>:null;
          })}
        </div>
      </details>
    </section> : <>
      <section className="topic-v21-heading">
        <div><div className="eyebrow">综合研判 · {research.window==='all'?'全部历史':windows.find(item=>item.value===research.window)?.label}</div>
          <h2>{topic.q}</h2>
          <p>参考 {research.events.length} 条相关动态 · {research.sources.length} 份来源 · 资料截至 {formatDate(research.cutoff)}</p>
        </div>
        <span className="topic-v21-scope">公开资料专题</span>
      </section>
      {fixedSnapshot && getTopicVisual(topic.topicId) && <section className="topic-evidence-pulse" aria-label="本期专题关键公开信息">
        <div className="topic-evidence-pulse-head">
          <span>关键信息</span>
          <span>{getTopicVisual(topic.topicId)?.note}</span>
        </div>
        <div className="topic-evidence-pulse-items">
          {getTopicVisual(topic.topicId)?.highlights.map(item=><div className="topic-evidence-pulse-item" key={item.label}>
            <strong>{item.value}</strong><span>{item.label}</span>
          </div>)}
          <div className="topic-evidence-pulse-context">
            <span>研判提示</span>
            <p>公开市场与政策信号，仅作背景参考；具体经营影响请核对下方证据及实际业务数据。</p>
          </div>
        </div>
      </section>}
      {!research.events.length || !research.sources.length ? <section className="empty-state">
        <h2>当前范围内没有足够的可引用材料</h2>
        <p>可以改用“全部已收录”时间窗，或换一个更具体的区域、市场关键词。不会凭空生成研判。</p>
      </section> : <>
        <div className="topic-v21-layout v34-topic-layout">
          <div className="topic-v21-main">
            <section className="topic-v21-analysis" aria-label="专题研判摘要">
              <div className="v31-topic-tools"><h3><BookOpen size={17}/>专题研判</h3><Button size="sm" variant="outline" disabled={busy} onClick={()=>void ask('请结合当前专题证据，在保持历史判断可追溯的前提下，形成一份完整的最新研判，明确新增变化与仍未验证的判断。',true)}>更新研判</Button><Button size="sm" variant="outline" disabled={busy||!exchanges.some(e=>e.status==='ready')} onClick={saveResearch}>保存本机</Button></div>{savedNotice&&<small role="status">{savedNotice}</small>}{exchanges[0]?.data?.generatedAt&&<p className="topic-fixed-meta">AI研判 · {exchanges[0].data.generatedAt.slice(0,10)}</p>}
              {fixedSnapshot && !exchanges[0]?.data?.generatedAt && <p className="topic-fixed-meta">本期固定研判 · v{fixedSnapshot.version} · 资料截至 {formatDate(fixedSnapshot.cutoff)}{fixedSnapshot.stale?' · 资料可能已更新':''}</p>}
              {isPinnedSnapshotRequest(topic) && !fixedSnapshot && <p className="topic-v21-muted">本期固定研判已与关联资料不匹配，暂不展示旧结论。请调整查询范围或使用自由搜索。</p>}
              {exchanges[0]?.status==='ready'?<>
                <TopicNarrativeView answer={exchanges[0].data!.answer} research={research}
                  sourceIds={exchanges[0].data!.sourceIds} eventIds={exchanges[0].data!.eventIds}/>
                {!!exchanges[0].data?.sourceIds.length&&
                  <EvidenceNote ids={exchanges[0].data!.sourceIds}/>}
              </>:exchanges[0]?.status==='error'?<>
                <p className="topic-v21-muted">{exchanges[0].error}</p>
                <p className="topic-v21-muted">下方保留原有事件判断与来源，可继续阅读。</p>
                <Button variant="outline" size="sm" onClick={()=>void ask('请综合当前关联事件，给出判断、依据和优先建议。',true)}>重试分析</Button>
              </>:canonical?<div className="v33-topic-prior">{prior?<><h4>核心判断</h4><p>{prior.conclusion}</p><EvidenceNote ids={prior.sourceIds}/><small>已发布判断 · {shared.result.generatedAt.slice(0,10)}</small>{eventMetric(canonical.id)&&<div className="v34-topic-chart"><MetricGraphic metric={eventMetric(canonical.id)!} cutoff={research.cutoff}/></div>}<GroupContext eventId={canonical.id} cutoff={research.cutoff}/>{seed&&<><h4>详细影响分析</h4><p>{releaseDetails[canonical.id]}</p><EvidenceNote ids={[...seed.sourceIds,...(canonical.id==="EV-PUBLIC-001"?["v35-h1-finance","v35-q3-operations"]:canonical.id==="EV-PUBLIC-003"?["v35-h1-finance"]:canonical.id==="EV-PUBLIC-004"?["v35-h1-strategy"]:[])]}/><small>首发AI研究 · {releaseSnapshot.generatedAt.slice(0,10)}</small></>}<h4>AI研判提示</h4><p>{prior.advice}</p><EvidenceNote ids={prior.sourceIds}/></>:<p>{canonical.judgment}</p>}{busy&&<p className="topic-v21-muted">正在更新，保留已发布内容…</p>}</div>:<p className="topic-v21-muted">请选择更新研判，查看当前资料范围内的深入分析。</p>}
            </section>
            <section className="topic-v21-conversation" aria-label="专题级追问">
              <div className="topic-v21-section-title"><h3><MessageSquare size={18}/>继续围绕专题追问</h3>
                <span>同一专题的多轮分析</span></div>
              {exchanges.slice(exchanges[0]?.status==='ready'?1:0).map((turn,index)=><article key={index} className="topic-v21-turn">
                <h4>{turn.question}</h4>
                {turn.status==='ready'?<>
                  <TopicNarrativeView answer={turn.data!.answer} research={research}
                    sourceIds={turn.data!.sourceIds} eventIds={turn.data!.eventIds}/>
                  {!!turn.data?.sourceIds.length&&<EvidenceNote ids={turn.data!.sourceIds}/>}
                </>:<p className="topic-v21-muted">{turn.status==='loading'?'正在基于专题资料分析……':turn.error}</p>}
              </article>)}
              <form className="topic-v21-ask" onSubmit={event=>{
                event.preventDefault();if(draft.trim()&&!busy){void ask(draft.trim());setDraft('');}
              }}>
                <Input aria-label="专题连续追问" placeholder="例如：应优先排查哪些合同？为什么？"
                  maxLength={240} value={draft} onChange={event=>setDraft(event.target.value)}/>
                <Button type="submit" disabled={!draft.trim()||busy}><Send size={15}/>追问</Button>
              </form>
              <p className="topic-v21-help">完整研判自动保存在本机；追问记录可使用保存本机保留。</p>
            </section>
            {savedVersions.length>0&&<section className="v31-topic-history"><div className="v31-topic-tools"><h3>历史研判</h3><button type="button" onClick={clearResearch}>清除本机记录</button></div>{savedVersions.map((v,i)=><details key={v.at+i}><summary>{v.at.slice(0,10)} · {v.rows.length} 轮研判</summary>{v.rows.map((r,j)=><div key={j}><h4>{j?r.question:"综合研判"}</h4><TopicNarrativeView answer={r.data!.answer} research={research} sourceIds={r.data!.sourceIds} eventIds={r.data!.eventIds}/><EvidenceNote ids={r.data!.sourceIds}/></div>)}</details>)}</section>}
          </div>
          <aside className="topic-v21-aside" aria-label="关联事件与来源">
            <h3>相关动态 <span>{research.events.length}</span></h3>
            {research.events.map(event=><article className="topic-v21-event" key={event.id}>
              <div className="topic-v21-event-meta"><time>{formatDate(event.date)}</time><span>{event.region}</span></div>
              <h4><Link to="/events/$eventId" params={{eventId:event.id}}>{event.title}<ArrowRight size={13}/></Link></h4>
              <p>{event.judgment}</p>
              <div className="topic-v21-event-foot"><span>{event.type}</span><span>{event.sourceIds.length} 份证据</span></div>
            </article>)}
            <details className="topic-v21-source-list">
              <summary><FileText size={15}/>全部来源与原始材料 <span>{research.sources.length} 份</span></summary>
              <div className="topic-v21-source-rows">
                {research.sources.map(source=><Link key={source.id} to="/sources/$sourceId" params={{sourceId:source.id}}>
                  {source.organization} · {formatDate(source.date)}<ArrowRight size={12}/></Link>)}
              </div>
            </details>
          </aside>
        </div>
        <p className="topic-v21-disclaimer"><ShieldCheck size={15}/>来源与历史记录均可查看；公开市场信息不代表集团实际经营数据。</p>
      </>}
    </>}
  </>;
}
