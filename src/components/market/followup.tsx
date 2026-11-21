import { useState, type RefObject } from 'react';
import { ArrowRight, MessageSquare, Send } from 'lucide-react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDate, getObject, resolveQuestion, type MarketEvent } from '@/lib/market-data';
import { getReadingEdition, type ReadingScope } from '@/lib/reading-editions';
import { SourceLinks } from './reading';

export function Followup({event,question,scope,prompt}:{
  event:MarketEvent; question:string; scope:ReadingScope; prompt:RefObject<HTMLInputElement|null>;
}) {
  const [input,setInput] = useState('');
  const navigate = useNavigate({from:'/events/$eventId'});
  const answer = resolveQuestion(event,question);
  const object = answer?.objectId ? getObject(answer.objectId) : undefined;
  const edition = getReadingEdition(scope)!;
  function ask(value:string) {
    navigate({search:previous=>({...previous,q:value}),replace:true,resetScroll:false,hash:'followup'});
    setInput('');
  }

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
        <p>截至本期，现有证据不足以回答这个问题。<a href="#evidence">核对已收录证据</a>。</p>
        {event.pending.length>0 && <p>目前仍缺的资料：{event.pending[0]}</p>}
      </>}
    </div>}
  </section>;
}
