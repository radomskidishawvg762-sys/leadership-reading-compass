/**
 * V2.1: One event identity across the weekly, monthly, report and topic views.
 * A topic is a reading/retrieval context, NOT a copied event record.
 */
import { events, sources, objects, issues, monthlyIssues, getSource, type MarketEvent } from './market-data';
import { currentCutoff, eventAt } from './reading-editions';
import { featuredTopics, findTopicEvents } from './market-topics';
import { isLeaderMaterial, type ReportStage } from './report-workflow';

export type TopicWindow = '7d' | '30d' | '90d' | 'all';
export type TopicInput = { q: string; window: TopicWindow; topicId?: string };
export type TopicEvent = {
  id: string; title: string; date: string; region: string; type: string;
  fact: string; judgment: string; relation: string; impact: string; attention: string;
  public: boolean; sourceIds: string[];
};
export type TopicSource = {
  id: string; eventIds: string[]; title: string; organization: string; date: string;
  excerpt: string; context: string; url?: string;
};
export type TopicResearch = {
  topicId?: string; query: string; window: TopicWindow; cutoff: string; from?: string;
  events: TopicEvent[]; sources: TopicSource[];
  publicCount: number; demoCount: number;
};
const windows: TopicWindow[] = ['7d','30d','90d','all'];
const norm = (value: string) => value.normalize('NFKC').toLowerCase().replace(/[\s，。！？、,.?!：:；;（）()]/g,'');
const areaWords = ['郑州','河南','成都','福州','鄂州','武汉','重庆'];
const placeMatches = (area:string, region:string) => region.includes(area) || (area === '河南' && region.includes('郑州')) || (area === '郑州' && region.includes('河南'));
const topicWords = ['水泥','混凝土','原料','价格','涨价','毛利','成本','传导','绿色建材','认证','资质','采购','政策','需求','资金','房建','基建','投资','发运','订单','交付','信用','风险'];
const themes: Array<{words:string[]; ids:string[]}> = [
  {words:['原料','水泥','成本','涨价','报价','价格','毛利','传导','郑州','成都'],ids:['EV-PUBLIC-001','EV-PUBLIC-005']},
  {words:['需求','发运','房地产','房建','基建','投资','开工','资金','订单','市场'],ids:['EV-PUBLIC-002','EV-PUBLIC-003','EV-PUBLIC-004']},
  {words:['绿色建材','认证','名录','资质','福州','鄂州'],ids:['EV-PUBLIC-006']},
];
export function parseTopicInput(value: unknown): TopicInput | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const data = value as Record<string, unknown>;
  if (typeof data.q !== 'string' || !data.q.trim() || data.q.length > 120) return null;
  const window = data.window === undefined ? '30d' : data.window;
  if (!windows.includes(window as TopicWindow)) return null;
  if (data.topicId !== undefined && (typeof data.topicId !== 'string' ||
      !featuredTopics.some(topic=>topic.id === data.topicId))) return null;
  return {q:data.q.trim(),window:window as TopicWindow,
    ...(typeof data.topicId === 'string'?{topicId:data.topicId}:{})};
}
export function earliestDay(cutoff: string, window: TopicWindow): string | undefined {
  if (window === 'all') return undefined;
  const days = window === '7d' ? 7 : window === '30d' ? 30 : 90;
  const date = new Date(cutoff+'T00:00:00Z');
  date.setUTCDate(date.getUTCDate()-(days-1));
  return date.toISOString().slice(0,10);
}
/** All retrieval is from canonical event IDs; only source IDs are attached. */
export function getTopicResearch(input: TopicInput, options: { includeDemo?: boolean; stage?: ReportStage } = {}): TopicResearch {
  const from=earliestDay(currentCutoff,input.window);
  const visible=events
    .filter(event => isLeaderMaterial(event.id,options.stage ?? 'pending') && (options.includeDemo || event.public))
    .flatMap(event => {
      const view=eventAt(event.id,{});
      return view && view.date<=currentCutoff && (!from || view.date>=from) ? [view] : [];
    });
  const matched = new Set(findTopicEvents(input.q,visible).map(event=>event.id));
  const term=norm(input.q);
  const feature=featuredTopics.find(topic=>topic.id===input.topicId || norm(topic.title)===term);
  if (feature) for(const id of feature.eventIds)matched.add(id);

  const areas = areaWords.filter(word=>term.includes(word));
  const relevantThemes = themes.filter(theme=>theme.words.some(word=>term.includes(word)));
  const relevantWords = topicWords.filter(word=>term.includes(word));
  for(const theme of relevantThemes)for(const id of theme.ids)matched.add(id);

  const ranked=visible.map(event=>{
    const words=norm([event.title,event.region,event.fact,event.type,event.judgment].join(' '));
    const sourceText=event.sources.map(id=>getSource(id)?.title ?? '').join('');
    const matchedWords = relevantWords;
    const score=(matched.has(event.id)?7:0)+
      matchedWords.reduce((sum,word)=>sum + ((words.includes(norm(word)) || sourceText.includes(word))?2:0),0) +
      (areas.some(area=>placeMatches(area,event.region))?5:0);
    return {event,score};
  }).filter(({event,score})=>{
    if(!score) return false;
    if(!areas.length) return true;
    // An explicit region query must not pull unrelated national stories just because
    // the question also says "价格" or "需求".
    return areas.some(area=>placeMatches(area,event.region));
  }).sort((a,b)=>b.score-a.score || b.event.date.localeCompare(a.event.date))
    .slice(0,8).map(item=>item.event);

  const eventRows:TopicEvent[]=ranked.map(event=>({
    id:event.id,title:event.title,date:event.date,region:event.region,type:event.type,
    fact:event.fact,judgment:event.judgment,relation:event.relation,impact:event.impact,attention:event.attention,
    public:Boolean(event.public),sourceIds:event.sources.filter(id=>{
      const source=getSource(id);
      return source?.kind==='外部材料' && Boolean(source.url) &&
        source.date<=currentCutoff && (!from || source.date>=from);
    }),
  }));
  const sourceMap=new Map<string,TopicSource>();
  for(const event of eventRows)for(const id of event.sourceIds){
    const source=getSource(id);
    if (!source || source.kind !== '外部材料' || !source.url)continue;
    const existing=sourceMap.get(id);
    if(existing){existing.eventIds.push(event.id);continue;}
    sourceMap.set(id,{id,eventIds:[event.id],title:source.title,organization:source.organization,
      date:source.date,excerpt:source.excerpt,context:source.context,url:source.url});
  }
  return {topicId:feature?.id,query:input.q,window:input.window,cutoff:currentCutoff,
    ...(from?{from}:{}),events:eventRows,sources:[...sourceMap.values()].slice(0,12),
    publicCount:eventRows.filter(item=>item.public).length,
    demoCount:eventRows.filter(item=>!item.public).length};
}

/** Validate references, not editorial wording. Stable IDs remain unchanged. */
export function validateMarketReferences(): string[] {
  const problems:string[]=[];
  function unique(kind:string,ids:string[]){const set=new Set<string>();for(const id of ids){if(set.has(id))problems.push(`duplicate ${kind}: ${id}`);set.add(id);}}
  unique('event',events.map(item=>item.id));
  unique('source',sources.map(item=>item.id));
  unique('object',objects.map(item=>item.id));
  const ids=new Set(events.map(item=>item.id));
  const sourceIds=new Set(sources.map(item=>item.id));
  const objectIds=new Set(objects.map(item=>item.id));
  for(const event of events){
    for(const id of event.sources)if(!sourceIds.has(id))problems.push(`event ${event.id} missing source ${id}`);
    for(const id of event.objects)if(!objectIds.has(id))problems.push(`event ${event.id} missing object ${id}`);
    for(const question of event.questions)for(const id of question.sourceIds)
      if(!sourceIds.has(id))problems.push(`question ${event.id} missing source ${id}`);
  }
  for(const issue of issues)for(const item of issue.refs)
    if(!ids.has(item.eventId))problems.push(`weekly ${issue.id} missing event ${item.eventId}`);
  for(const issue of monthlyIssues){
    for(const item of issue.items)if(!ids.has(item.eventId))problems.push(`monthly ${issue.id} missing event ${item.eventId}`);
    for(const update of issue.updates??[])if(!ids.has(update.eventId))problems.push(`update ${issue.id} missing event ${update.eventId}`);
  }
  unique('featured topic',featuredTopics.map(item=>item.id));
  for(const topic of featuredTopics)for(const id of topic.eventIds)
    if(!ids.has(id))problems.push(`topic ${topic.id} missing event ${id}`);
  return problems;
}
