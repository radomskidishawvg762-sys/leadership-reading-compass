import { useEffect, useRef, useState, type RefObject } from 'react';
import { ArrowRight, MessageSquare, Send } from 'lucide-react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDate, getObject, getSource, type MarketEvent } from '@/lib/market-data';
import { getReadingEdition, type ReadingScope } from '@/lib/reading-editions';
import { fixedAnswer, type ChatResult, type ChatTurn } from '@/lib/hybrid-ai';
import { SourceLinks } from './reading';

type AiState = { key: string; status: 'loading' | 'ready' | 'error'; answer?: string; sourceIds: string[]; error?: string };

export function Followup({event,question,scope,prompt}:{
  event:MarketEvent; question:string; scope:ReadingScope; prompt:RefObject<HTMLInputElement|null>;
}) {
  const [input,setInput] = useState('');
  const [ai,setAi] = useState<AiState|null>(null);
  const navigate = useNavigate({from:'/events/$eventId'});
  const fixed = fixedAnswer(event, question);
  const answer = fixed ? event.questions.find(item => item.answer === fixed.answer) : undefined;
  const object = answer?.objectId ? getObject(answer.objectId) : undefined;
  const edition = getReadingEdition(scope)!;
  const sessionKey = [event.id,scope.issue ?? '',scope.month ?? ''].join(':');
  const requestKey = sessionKey + ':' + question;
  const history = useRef<ChatTurn[]>([]);
  const session = useRef('');

  useEffect(() => {
    if (session.current !== sessionKey) {
      history.current = [];
      session.current = sessionKey;
    }
    // Fixed question answers are synchronous and never call the model.
    if (!question || fixedAnswer(event, question)) {
      setAi(null);
      return;
    }

    const controller = new AbortController();
    const previous = history.current.slice(-6);
    setAi({ key: requestKey, status: 'loading', sourceIds: [] });
    void fetch('/api/ai-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId:event.id, question, scope, history:previous }),
      signal: controller.signal,
    }).then(async response => {
      const body: unknown = await response.json();
      if (!body || typeof body !== 'object') throw new Error('AI 服务没有返回有效内容。');
      const result = body as Partial<ChatResult> & {error?:unknown};
      if (!response.ok) throw new Error(typeof result.error === 'string' ? result.error : 'AI 服务暂不可用。');
      if (typeof result.answer !== 'string' || !Array.isArray(result.sourceIds)) throw new Error('AI 服务回答格式异常。');
      if (controller.signal.aborted) return;
      history.current = [...previous, {role:'user',content:question}, {role:'assistant',content:result.answer}].slice(-8) as ChatTurn[];
      setAi({ key:requestKey, status:'ready', answer:result.answer, sourceIds:result.sourceIds.filter(id=>{const source=getSource(id);return source?.kind === '外部材料' && source.date <= edition.cutoff && (event.public ? Boolean(source.url) : true);}) });
    }).catch((error:unknown) => {
      if (controller.signal.aborted) return;
      setAi({ key:requestKey,status:'error',error: error instanceof Error ? error.message : 'AI 服务暂不可用。',sourceIds:[] });
    });
    return () => controller.abort();
  }, [event, question, requestKey, scope.issue, scope.month, sessionKey]);

  function ask(value:string) {
    navigate({search:previous=>({...previous,q:value}),replace:true,resetScroll:false,hash:'followup'});
    setInput('');
  }

  const currentAi = ai?.key === requestKey ? ai : null;
  return <section className="detail-section followup-section" id="followup">
    <h2 className="section-title"><MessageSquare size={18} />继续追问</h2>
    <p className="source-top">依据截至 {formatDate(edition.cutoff)} · {edition.label}</p>
    <div className="followups">
      {event.questions.map(item=><Button key={item.label} variant="outline" className="followup-button" onClick={()=>ask(item.label)}>{item.label}<ArrowRight /></Button>)}
    </div>
    <form className="question-form" onSubmit={e=>{e.preventDefault();if(input.trim()) ask(input.trim());}}>
      <Input ref={prompt} aria-label="围绕当前事件追问" placeholder="围绕这件事提问" value={input} maxLength={240} onChange={e=>setInput(e.target.value)} />
      <Button type="submit" disabled={!input.trim()}><Send />发送追问</Button>
    </form>
    {question && <div className="answer" role="status">
      <div className="answer-question">{question}</div>
      {answer ? <>
        <p>{answer.answer}</p>
        <h3>回答依据</h3>
        <SourceLinks ids={answer.sourceIds} scope={scope} />
        {object && object.kind!=='站点' && <Link className="object-link" to="/objects/$objectId" params={{objectId:object.id}} search={scope}>看{object.name}的历次变化<ArrowRight /></Link>}
      </> : <>
        <p className="source-top">AI 补充分析 · 仅供参考，依据当前期可公开/演示材料</p>
        {!currentAi || currentAi.status==='loading' ? <p>正在结合已收录的事件证据分析……</p> : currentAi.status==='ready' ? <>
          <p style={{whiteSpace:'pre-wrap'}}>{currentAi.answer}</p>
          {currentAi.sourceIds.length > 0 ? <>
            <h3>模型引用的材料</h3>
            <SourceLinks ids={currentAi.sourceIds} scope={scope} />
          </> : <p>模型未标明具体证据，以下回答不应作为已核实结论。</p>}
        </> : <>
          <p>{currentAi.error} <a href="#evidence">查看现有材料</a>。</p>
          {event.pending.length>0 && <p>仍需核实：{event.pending[0]}</p>}
        </>}
      </>}
    </div>}
  </section>;
}
