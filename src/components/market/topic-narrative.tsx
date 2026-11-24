/**
 * Presentation-only parsing for the topic AI narrative. No innerHTML,
 * no new source IDs and no trust in the model's invented references.
 */
import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import type { TopicResearch } from '@/lib/topic-research';

export type TopicNarrative = {
  heading: string;
  lines: string[];
};

const SECTION = /^\s*(?:【\s*([^】]{2,12})\s*】|(?:#{1,3}\s+)([^\n]{2,18}))\s*/;
const HEADINGS: Record<string, string> = {
  '核心判断':'核心判断','判断':'核心判断','主要依据':'主要依据','依据':'主要依据',
  '建议行动':'建议行动','建议动作':'建议行动','行动建议':'建议行动','AI研判提示':'AI研判提示','影响分析':'影响分析',
  '关键缺口':'关键缺口','数据缺口':'关键缺口','待核实':'关键缺口',
  '研判结论':'核心判断',
};
export function parseTopicNarrative(input: string): TopicNarrative[] {
  const normalized = input.replace(/\r\n?/g,'\n')
    .replace(/\*\*(?=【(?:核心判断|判断|主要依据|依据|建议行动|建议动作|行动建议|AI研判提示|影响分析|关键缺口|数据缺口|待核实|研判结论)】)/g,'')
    .replace(/(【(?:核心判断|判断|主要依据|依据|建议行动|建议动作|行动建议|AI研判提示|影响分析|关键缺口|数据缺口|待核实|研判结论)】)\*\*/g,'$1')
    .replace(/([^\n])\s*(【(?:核心判断|判断|主要依据|依据|建议行动|建议动作|行动建议|AI研判提示|影响分析|关键缺口|数据缺口|待核实|研判结论)】)/g,'$1\n$2')
    .replace(/([^\n])\s+(?=[1-3][.、]\s*[^\d\s])/g,'$1\n');
  const sections: TopicNarrative[] = [];
  let current:TopicNarrative={heading:'',lines:[]};
  const push=()=>{if(current.lines.length)sections.push(current);};
  for(const line of normalized.split('\n')){
    const trimmed=line.trim();
    if(!trimmed)continue;
    const header=trimmed.match(SECTION);
    if(header && HEADINGS[(header[1]??header[2]??'').trim()]){
      push();
      current={heading:HEADINGS[(header[1]??header[2]??'').trim()]!,lines:[]};
      const rest=trimmed.slice(header[0].length).trim();
      if(rest)current.lines.push(rest);
    } else current.lines.push(trimmed);
  }
  push();
  return sections;
}

export type CitationToken = {type:'text';text:string}|{type:'source'|'event';index:number};
export function tokenizeCitations(value:string):CitationToken[] {
  const tokens:CitationToken[]=[];
  const marker=/\[([SE])(\d{1,2})\]/g;
  let last=0,match:RegExpExecArray|null;
  while((match=marker.exec(value))){
    if(match.index>last)tokens.push({type:'text',text:value.slice(last,match.index)});
    tokens.push({type:match[1]==='S'?'source':'event',index:Number(match[2])-1});
    last=marker.lastIndex;
  }
  if(last<value.length)tokens.push({type:'text',text:value.slice(last)});
  return tokens;
}

function LinkedCitation({kind,index,research,allowedSourceIds,allowedEventIds}:{
  kind:'source'|'event';index:number;research:TopicResearch;
  allowedSourceIds:string[];allowedEventIds:string[];
}){
  const source=kind==='source'?research.sources[index]:undefined;
  const event=kind==='event'?research.events[index]:undefined;
  if(source && allowedSourceIds.includes(source.id)&&source.url&&/^https?:\/\//.test(source.url))return <a className="topic-citation" href={source.url} target="_blank" rel="noopener noreferrer" title={source.title} aria-label={'引用来源：'+source.title}>{index+1}</a>;
  if(source && allowedSourceIds.includes(source.id))return <Link
    className="topic-citation" to="/sources/$sourceId" params={{sourceId:source.id}}
    title={source.title} aria-label={`引用来源：${source.title}`}>{index+1}</Link>;
  if(event && allowedEventIds.includes(event.id))return <Link
    className="topic-citation topic-citation--event" to="/events/$eventId" params={{eventId:event.id}}
    title={event.title} aria-label={`关联事件：${event.title}`}>{index+1}</Link>;
  return <span className="topic-citation topic-citation--unknown" title="模型引用未能核实" aria-label="未核实的引用">?</span>;
}
export type InlineSegment={type:'text'|'bold'|'italic'|'code';text:string};
/** Never use raw HTML: only parse a few common Markdown delimiters into React nodes. */
export function formatInlineSegments(value:string):InlineSegment[]{
  const out:InlineSegment[]=[];
  const regex=/(\*\*([^*\n]+)\*\*|__([^_\n]+)__|(?<!\*)\*([^*\n]+)\*(?!\*)|(?<!_)_([^_\n]+)_(?!_)|`([^`\n]+)`)/g;
  let last=0,match:RegExpExecArray|null;
  while((match=regex.exec(value))){
    if(match.index>last)out.push({type:'text',text:value.slice(last,match.index)});
    const type=match[2]||match[3]?'bold':match[4]||match[5]?'italic':'code';
    out.push({type,text:match[2]??match[3]??match[4]??match[5]??match[6]??''});
    last=regex.lastIndex;
  }
  if(last<value.length)out.push({type:'text',text:value.slice(last)});
  return out;
}
function RichText({value}:{value:string}){
  return <>{formatInlineSegments(value).map((segment,i)=>
    segment.type==='bold'?<strong key={i}>{segment.text}</strong>:
    segment.type==='italic'?<em key={i}>{segment.text}</em>:
    segment.type==='code'?<code key={i}>{segment.text}</code>:
    <span key={i}>{segment.text}</span>)}</>;
}
function NarrativeLine({text,research,sourceIds,eventIds}:{
  text:string;research:TopicResearch;sourceIds:string[];eventIds:string[];
}) {
  const trimmed=text.replace(/^\s*[-•*+]\s+/,'').replace(/^([1-9])[.、]\s*/, '$1. ');
  const tokens=tokenizeCitations(trimmed);
  const elements:ReactNode[]=[];
  let group:CitationToken[]=[];
  const flush=()=>{
    if(!group.length)return;
    const unique=group.filter((token,i,arr)=>token.type!=='text' &&
      arr.findIndex(other=>other.type===token.type && other.index===token.index)===i);
    elements.push(<span key={`ref-${elements.length}`} className="topic-citation-group" aria-label="查看关联依据">
      {unique.map((token,i)=>token.type==='text'?null:
        <LinkedCitation key={i} kind={token.type} index={token.index} research={research}
          allowedSourceIds={sourceIds} allowedEventIds={eventIds}/>)}
    </span>);
    group=[];
  };
  for(const token of tokens){
    if(token.type==='text'){flush();elements.push(<span key={`text-${elements.length}`}><RichText value={token.text}/></span>);}
    else group.push(token);
  }
  flush();
  return <>{elements}</>;
}

export function TopicNarrativeView({answer,research,sourceIds,eventIds}:{
  answer:string;research:TopicResearch;sourceIds:string[];eventIds:string[];
}){
  const sections=parseTopicNarrative(answer);
  return <div className="topic-narrative">
    {sections.map((section,i)=><section className={section.heading==='AI研判提示'?'topic-narrative-section v31-topic-advice':section.heading?'topic-narrative-section':'topic-narrative-section topic-narrative-section--plain'} key={i}>
      {section.heading&&<h4 className="topic-narrative-heading">{section.heading}</h4>}
      <div className="topic-narrative-content">
        {section.lines.map((line,j)=><p key={j}>
          <NarrativeLine text={line} research={research} sourceIds={sourceIds} eventIds={eventIds}/>
        </p>)}
      </div>
    </section>)}
  </div>;
}
