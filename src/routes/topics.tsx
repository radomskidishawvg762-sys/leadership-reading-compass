import { useEffect, useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EventActions, EventKicker, PageHeading, SourceLinks } from '@/components/market/reading';
import { usePublication } from '@/components/market/publication';
import { contentHead, events, formatDate, getSource, type MarketEvent } from '@/lib/market-data';
import { featuredTopics, findTopicEvents } from '@/lib/market-topics';
import { currentCutoff, eventAt } from '@/lib/reading-editions';
import { isLeaderMaterial } from '@/lib/report-workflow';

export const Route = createFileRoute('/topics')({
  validateSearch: (search: Record<string, unknown>): { q?: string } =>
    typeof search['q'] === 'string' ? { q: search['q'].trim().slice(0, 120) } : {},
  head: () => contentHead('专题查询', '按经营问题、区域或项目阅读市场事实、经营影响和原始依据。'),
  component: Topics,
});

function Topics() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [input, setInput] = useState(search.q ?? '');
  const { stage } = usePublication();
  useEffect(() => setInput(search.q ?? ''), [search.q]);

  const availableEvents = events
    .filter(event => isLeaderMaterial(event.id, stage))
    .flatMap(event => {
      const view = eventAt(event.id, {});
      return view ? [view] : [];
    });
  const results = findTopicEvents(search.q ?? '', availableEvents);
  const latestPublic = availableEvents.filter(event => event.public).sort((a,b) => b.date.localeCompare(a.date)).slice(0,4);

  return <>
    <PageHeading title="专题查询" eyebrow="市场监测" meta={<span>材料截至 {formatDate(currentCutoff)}</span>} />
    <form className="topic-search" onSubmit={event => {
      event.preventDefault();
      const query = input.trim();
      void navigate({ search: query ? { q: query } : {} });
    }}>
      <Input aria-label="搜索主题、区域或项目" placeholder="搜索主题、区域或项目，如基建投资、成都混凝土" value={input} maxLength={120} onChange={event => setInput(event.target.value)} />
      <Button type="submit" disabled={!input.trim()}><Search />查询</Button>
      {search.q && <Button variant="outline" type="button" onClick={() => navigate({ search: {} })}>清除</Button>}
    </form>
    <div className="quick-topics" aria-label="按区域查看材料">
      {['全国','河南','成都','福州','鄂州','武汉','重庆'].map(q => (
        <Button key={q} variant="outline" size="sm" onClick={() => navigate({ search: { q } })}>{q}</Button>
      ))}
    </div>
    {search.q ? <section className="query-answer" aria-label="查询结果">
      <h2>「{search.q}」的查询结果</h2>
      {results.length ? <>
        <p className="reading-note">找到 {results.length} 条材料。公开资料与业务样例分别标注。</p>
        {results.map(event => <TopicResult key={event.id} event={event} />)}
      </> : <p>当前资料中未找到匹配结果。可试试城市名、材料品类或项目简称。</p>}
    </section> : <>
      <section className="topic-intro">
        <h2>专题导读</h2>
        <div className="object-directory">
          {featuredTopics.map(topic => <article className="directory-item topic-feature" key={topic.id}>
            <h3><Link to="/topics" search={{ q: topic.title }}>{topic.title}</Link></h3>
            <p>{topic.description}</p>
            <Link className="topic-link" to="/topics" search={{ q: topic.title }}>查看专题</Link>
          </article>)}
        </div>
      </section>
      <section className="topic-intro">
        <h2>近期公开资料</h2>
        {latestPublic.map(event => (
          <Link className="report-row" key={event.id} to="/events/$eventId" params={{ eventId:event.id }}>
            <time>{formatDate(event.date)}</time>
            <div><h3>{event.title}</h3><p>{event.judgment}</p></div>
          </Link>
        ))}
      </section>
    </>}
  </>;
}

function TopicResult({event}: {event: MarketEvent}) {
  const publicSources = event.sources.filter(id => getSource(id)?.kind === '外部材料');
  return <article className="topic-result">
    <div className="story-kicker">
      <EventKicker event={event} />
      <span className="sample-label">{event.public ? '公开资料' : '业务样例'}</span>
      <time>{formatDate(event.date)}</time>
    </div>
    <h3><Link to="/events/$eventId" params={{ eventId:event.id }}>{event.title}</Link></h3>
    <p>{event.fact}</p>
    <p><strong>经营判断</strong> {event.judgment}</p>
    <p><strong>建议关注</strong> {event.attention}</p>
    <SourceLinks ids={publicSources} />
    <EventActions eventId={event.id} />
  </article>;
}
