import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowRight, BookOpen, FileText, MessageSquare, Search, Send, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeading, SourceLinks } from '@/components/market/reading';
import { TopicNarrativeView } from '@/components/market/topic-narrative';
import { contentHead, formatDate } from '@/lib/market-data';
import { featuredTopics } from '@/lib/market-topics';
import { currentCutoff } from '@/lib/reading-editions';
import { getTopicResearch, type TopicWindow, type TopicInput } from '@/lib/topic-research';
import type { ChatTurn } from '@/lib/hybrid-ai';

const windows: Array<{value:TopicWindow;label:string}> = [
  {value:'7d',label:'近7天'}, {value:'30d',label:'近30天'},
  {value:'90d',label:'近90天'}, {value:'all',label:'全部已收录'},
];
type TopicAnswer = {answer:string;sourceIds:string[];eventIds:string[]};
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
  const history=useRef<ChatTurn[]>([]);
  const pending=useRef<AbortController|null>(null);
  const window=search.window??'30d';
  const topic:TopicInput=useMemo(()=>({
    q:search.q??'',window,...(search.topicId?{topicId:search.topicId}:{})
  }),[search.q,search.topicId,window]);
  const research=useMemo(()=>getTopicResearch(topic,{includeDemo:false}),[topic]);
  const key=[topic.q,topic.window,topic.topicId??''].join('|');
  useEffect(()=>setInput(search.q??''),[search.q]);

  const ask=useCallback(async(question:string,reset=false)=>{
    if(!research.events.length || !research.sources.length)return;
    pending.current?.abort();
    const controller=new AbortController();
    pending.current=controller;
    const previous=reset?[]:history.current.slice(-6);
    if(reset)history.current=[];
    setBusy(true);
    if(reset)setExchanges([]);
    setExchanges(rows=>[...rows,{question,status:'loading'}]);
    try{
      const response=await fetch('/api/topic-chat',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({topic,question,history:previous}),
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
      const answer=body.answer;
      history.current=[...previous,{role:'user' as const,content:question},
        {role:'assistant' as const,content:answer}].slice(-8);
      setExchanges(rows=>{
        const result=rows.slice();
        result[result.length-1]={question,status:'ready',data:{answer,sourceIds,eventIds}};
        return result;
      });
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
  },[topic,research.events,research.sources]);

  useEffect(()=>{
    pending.current?.abort();
    history.current=[];
    setExchanges([]);
    setDraft('');
    setBusy(false);
    if(topic.q&&research.events.length&&research.sources.length){
      void ask('请基于当前专题所有关联事件与公开来源，综合判断本议题的主要变化、经营影响与优先行动，并注明证据范围。',true);
    }
    return ()=>pending.current?.abort();
  },[key,ask,topic.q,research.events.length,research.sources.length]);

  function runSearch(event:React.FormEvent){
    event.preventDefault();
    const q=input.trim().slice(0,120);
    void navigate({search:q?{q,window}: {window}});
  }

  function openFeatured(id:string,title:string){
    void navigate({search:{q:title,window:'all',topicId:id}});
  }

  return <>
    <PageHeading title="专题研判" eyebrow="市场监测" meta={<span>收录材料截至 {formatDate(currentCutoff)} · 跨事件证据分析</span>}/>
    <form className="topic-v21-search" onSubmit={runSearch}>
      <Input aria-label="专题问题或区域" placeholder="输入区域、经营议题或问题，如：河南原料涨价对经营有何影响？"
        maxLength={120} value={input} onChange={event=>setInput(event.target.value)}/>
      <select aria-label="专题时间窗" className="select-control" value={window}
        onChange={event=>void navigate({search:{...search,window:event.target.value as TopicWindow}})}>
        {windows.map(item=><option key={item.value} value={item.value}>{item.label}</option>)}
      </select>
      <Button type="submit" disabled={!input.trim()}><Search size={16}/>研判分析</Button>
    </form>
    <div className="topic-v21-featured" aria-label="精选研究专题">
      <span className="topic-v21-featured-label">本期推荐 · 6 个研究方向</span>
      {featuredTopics.map(feature=><button type="button" key={feature.id}
        className={research.topicId===feature.id?'topic-v21-chip active':'topic-v21-chip'}
        onClick={()=>openFeatured(feature.id,feature.title)}>{feature.title}</button>)}
    </div>

    {!topic.q ? <section className="topic-v21-intro">
      <div className="topic-v21-intro-head">
        <h2>从一个经营问题开始</h2>
        <p>从本期推荐的六个方向切入，也可以自由输入新的区域或经营问题；只使用已收录的公开证据。</p>
      </div>
      <div className="topic-v21-intro-grid">
        {featuredTopics.map(feature=><article className="topic-v21-entry" key={feature.id}>
          <span className="eyebrow">推荐研究 · {String(featuredTopics.indexOf(feature)+1).padStart(2, "0")}</span><h3>{feature.title}</h3>
          <p>{feature.description}</p>
          <button type="button" onClick={()=>openFeatured(feature.id,feature.title)}>进入专题 <ArrowRight size={14}/></button>
        </article>)}
      </div>
      <p className="topic-v21-disclaimer"><ShieldCheck size={15}/>分析范围仅限本站已收录、当前允许引用的公开资料，不代表集团内部经营数据。</p>
    </section> : <>
      <section className="topic-v21-heading">
        <div><div className="eyebrow">综合研判 · {research.window==='all'?'全部历史':windows.find(item=>item.value===research.window)?.label}</div>
          <h2>{topic.q}</h2>
          <p>关联 {research.events.length} 个规范事件 · {research.sources.length} 份去重来源 · 截至 {formatDate(research.cutoff)}</p>
        </div>
        <span className="topic-v21-scope">公开资料专题</span>
      </section>
      {!research.events.length || !research.sources.length ? <section className="empty-state">
        <h2>当前范围内没有足够的可引用材料</h2>
        <p>可以改用“全部已收录”时间窗，或换一个更具体的区域、市场关键词。不会凭空生成研判。</p>
      </section> : <>
        <div className="topic-v21-layout">
          <div className="topic-v21-main">
            <section className="topic-v21-analysis" aria-label="专题研判摘要">
              <h3><BookOpen size={18}/>综合研判摘要</h3>
              {exchanges[0]?.status==='ready'?<>
                <TopicNarrativeView answer={exchanges[0].data!.answer} research={research}
                  sourceIds={exchanges[0].data!.sourceIds} eventIds={exchanges[0].data!.eventIds}/>
                {!!exchanges[0].data?.sourceIds.length&&
                  <SourceLinks ids={exchanges[0].data!.sourceIds}/>}
              </>:exchanges[0]?.status==='error'?<>
                <p className="topic-v21-muted">{exchanges[0].error}</p>
                <p className="topic-v21-muted">下方保留原有事件判断与来源，可以继续核对。</p>
                <Button variant="outline" size="sm" onClick={()=>void ask('请综合当前关联事件，给出判断、依据和优先建议。',true)}>重试分析</Button>
              </>:<p className="topic-v21-muted">正在组织跨事件证据，形成综合研判……</p>}
            </section>
            <section className="topic-v21-conversation" aria-label="专题级追问">
              <div className="topic-v21-section-title"><h3><MessageSquare size={18}/>继续围绕专题追问</h3>
                <span>同一专题的多轮分析</span></div>
              {exchanges.slice(1).map((turn,index)=><article key={index} className="topic-v21-turn">
                <h4>{turn.question}</h4>
                {turn.status==='ready'?<>
                  <TopicNarrativeView answer={turn.data!.answer} research={research}
                    sourceIds={turn.data!.sourceIds} eventIds={turn.data!.eventIds}/>
                  {!!turn.data?.sourceIds.length&&<SourceLinks ids={turn.data!.sourceIds}/>}
                </>:<p className="topic-v21-muted">{turn.status==='loading'?'正在基于专题资料分析……':turn.error}</p>}
              </article>)}
              <form className="topic-v21-ask" onSubmit={event=>{
                event.preventDefault();if(draft.trim()&&!busy){void ask(draft.trim());setDraft('');}
              }}>
                <Input aria-label="专题连续追问" placeholder="例如：应优先排查哪些合同？为什么？"
                  maxLength={240} value={draft} onChange={event=>setDraft(event.target.value)}/>
                <Button type="submit" disabled={!draft.trim()||busy}><Send size={15}/>追问</Button>
              </form>
              <p className="topic-v21-help">当前对话仅保留本页专题上下文；切换搜索条件后重新研判。请勿输入企业机密。</p>
            </section>
          </div>
          <aside className="topic-v21-aside" aria-label="关联事件与来源">
            <h3>关联事件与依据 <span>{research.events.length}</span></h3>
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
        <p className="topic-v21-disclaimer"><ShieldCheck size={15}/>每个关联事项沿用唯一事件 ID；专题引用不生成重复事件。公开行业数据与集团内部实际经营数据须区分。</p>
      </>}
    </>}
  </>;
}
