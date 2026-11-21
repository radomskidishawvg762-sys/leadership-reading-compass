import { useEffect, useRef } from 'react';
import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { BackLink, DateMeta, EditorialImage, EventKicker, ObjectLinks, SourceLinks, Timeline } from '@/components/market/reading';
import { Followup } from '@/components/market/followup';
import { usePublication } from '@/components/market/publication';
import { contentHead, formatDate, getObject, getSource } from '@/lib/market-data';
import { currentCutoff, eventAt, getReadingEdition, readScope } from '@/lib/reading-editions';
import { getReportBrief, isLeaderMaterial, isPublishedReport } from '@/lib/report-workflow';

export const Route = createFileRoute('/events/$eventId')({
  validateSearch: (search: Record<string, unknown>) => ({
    ...readScope(search),
    ...(search['ask'] === true || search['ask'] === 'true' ? {ask:true} : {}),
    ...(typeof search['q'] === 'string' ? {q:search['q'].slice(0,240)} : {}),
  }),
  loaderDeps: ({search}) => readScope(search),
  loader: ({params,deps}) => {
    const record = eventAt(params.eventId,deps);
    if (!record) throw notFound();
    return record;
  },
  head: ({loaderData}) => contentHead(loaderData?.title ?? '事件材料','按报告期阅读经营影响、证据和后续跟踪事项。'),
  component: EventDetail,
});

function EventDetail() {
  const event = Route.useLoaderData();
  const search = Route.useSearch();
  const scope = readScope(search);
  const edition = getReadingEdition(scope)!;
  const {stage} = usePublication();
  const prompt = useRef<HTMLInputElement>(null);

  useEffect(()=>{
    if (search.ask && !search.q) {
      prompt.current?.scrollIntoView?.({block:'center'});
      prompt.current?.focus({preventScroll:true});
    }
  },[event.id,search.ask, search.issue, search.month, search.q]);

  if (!isLeaderMaterial(event.id,stage)) return <>
    <BackLink />
    <section className="empty-state">
      <h1>该事项尚未发布</h1>
      <p>正式发布后可从事件专报查看。</p>
      <Link to="/reports">返回事件专报</Link>
    </section>
  </>;

  const materials = event.sources.flatMap(id=>{const source=getSource(id);return source?[source]:[]});
  const internal = materials.filter(source=>source.kind==='内部快照');
  const sites = event.objects.filter(id=>getObject(id)?.kind==='站点');
  const brief = isPublishedReport(event.id, stage, edition.cutoff) ? getReportBrief(event.id) : undefined;
  return <><BackLink /><div className="detail-layout"><article>
    <header className="detail-header">
      <div className="story-kicker"><EventKicker event={event} /></div>
      <h1>{event.title}</h1>
      <div className="heading-meta">
        <DateMeta date={event.date} publicMaterial={Boolean(event.public)} />
        <span>{edition.label} · 截至 {formatDate(edition.cutoff)}</span>
        {edition.cutoff<currentCutoff && <Link className="text-action" to="/events/$eventId" params={{eventId:event.id}} search={{}}>看最新进展</Link>}
      </div>
      <div className="detail-judgment">{event.judgment}</div>
    </header>
    {event.type==='项目机会' && <EditorialImage kind="project" />}
    <div className="detail-jumps no-print" aria-label="事件内导航">
      <a href="#evidence">查看证据</a>
      <a href="#followup">继续追问</a>
      <a href="#timeline">历次进展</a>
    </div>
    {brief && <section className="report-brief" aria-label="专报要点">
      <div><h2>为何值得关注</h2><p>{brief.reason}</p></div>
      <div><h2>复核节点</h2><p>{brief.checkpoint}</p></div>
    </section>}
    <section className="detail-section" id="decision">
      <h2 className="section-title">经营影响与建议</h2>
      <p className="section-body">{event.impact}</p>
      <p className="next-decision">{event.attention}</p>
      <ObjectLinks ids={event.objects} scope={scope} />
    </section>
    <section className="detail-section" id="evidence">
      <h2 className="section-title">证据</h2>
      <h3>外部事实</h3>
      <p className="section-body">{event.fact}</p>
      {materials.filter(source=>source.kind==='外部材料').map(source=><div className="source-block" key={source.id}>
        <div className="source-top"><span>{source.organization}</span><span>{formatDate(source.date)}</span></div>
        <div className="source-title">{source.title}</div>
        <p>{source.excerpt}</p>
        <SourceLinks ids={[source.id]} scope={scope} />
      </div>)}
      <h3>我方关联</h3>
      <p className="section-body">{event.relation}</p>
      {internal.length>0 && <details className="source-block business-evidence">
        <summary>查看内部经营依据（{internal.length} 份）</summary>
        {internal.map(source=><div key={source.id}>
          <p className="source-title">{source.title} · 截至 {formatDate(source.date)}</p>
          <p>{source.excerpt}</p>
          <SourceLinks ids={[source.id]} scope={scope} />
        </div>)}
        {sites.length>0 && edition.cutoff>='2026-11-15' && <ObjectLinks ids={sites} scope={scope} includeSites />}
      </details>}
    </section>
    <Followup event={event} question={search.q ?? ''} scope={scope} prompt={prompt} />
    {event.pending.length>0 && <section className="detail-section">
      <h2 className="section-title">仍需核实</h2>
      <ul className="pending-list">{event.pending.map(item=><li key={item}>{item}</li>)}</ul>
    </section>}
    <section className="detail-section" id="timeline">
      <h2 className="section-title">历次进展</h2>
      <Timeline items={event.timeline} scope={scope} />
    </section>
  </article><aside className="detail-aside">
    <h3>研判摘要</h3>
    <div className="aside-line"><span>经营范围</span>{event.region}</div>
    <div className="aside-line"><span>证据截至</span>{formatDate(edition.cutoff)}</div>
    <div className="aside-line"><span>可查依据</span>{materials.length} 份</div>
    <div className={`focus-note ${event.risk?'risk':''}`}><h4>下一步</h4>{event.attention}</div>
  </aside></div></>;
}
