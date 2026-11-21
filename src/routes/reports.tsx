import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EventKicker, PageHeading } from '@/components/market/reading';
import { usePublication } from '@/components/market/publication';
import { getReportBrief, isPublishedReport } from '@/lib/report-workflow';
import { contentHead, events } from '@/lib/market-data';
import { currentCutoff } from '@/lib/reading-editions';

export const Route = createFileRoute('/reports')({
  validateSearch: (search: Record<string, unknown>): { region?: string; type?: string } => ({
    ...(typeof search['region'] === 'string' && search['region'] ? { region: search['region'] } : {}),
    ...(typeof search['type'] === 'string' && search['type'] ? { type: search['type'] } : {}),
  }),
  head: () => contentHead('事件专报', '跟踪重要市场变化、经营影响和复核节点。'),
  component: Reports,
});

function Reports() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { stage } = usePublication();
  const reports = events.filter(event => isPublishedReport(event.id, stage, currentCutoff))
    .sort((a,b) => b.date.localeCompare(a.date));
  const regions = [...new Set(reports.flatMap(event => event.region.split('、')))];
  const types = [...new Set(reports.map(event => event.type))];
  const filtered = reports.filter(event =>
    (!search.region || event.region.split('、').includes(search.region)) &&
    (!search.type || event.type === search.type)
  );

  return <>
    <div className="report-heading-with-image">
      <PageHeading title="事件专报" eyebrow="市场监测" meta="重点变化、经营影响与复核节点" />
      <figure className="report-heading-visual">
        <img src="/market/project.webp" alt="城市建设场景示意" width={460} height={170} decoding="async" />
        <figcaption>场景示意</figcaption>
      </figure>
    </div>
    <div className="report-reading-intro">
      <p>重要变化及其对经营的影响。按事项阅读判断、核查证据和后续关注节点。</p>
      <span>{reports.length} 份已收录专报 · 一事一报</span>
    </div>
    <div className="filters">
      <select className="select-control" aria-label="筛选区域" value={search.region ?? ''} onChange={event => navigate({ search: { ...search, region: event.target.value } })}>
        <option value="">全部区域</option>
        {regions.map(region => <option key={region}>{region}</option>)}
      </select>
      <select className="select-control" aria-label="筛选事件类型" value={search.type ?? ''} onChange={event => navigate({ search: { ...search, type: event.target.value } })}>
        <option value="">全部事件类型</option>
        {types.map(type => <option key={type}>{type}</option>)}
      </select>
      {(search.region || search.type) && <Button variant="ghost" size="sm" onClick={() => navigate({ search: {} })}>重置</Button>}
      <span className="result-count">{filtered.length} 条专报</span>
    </div>
    <section className="report-editorial-list report-reading-list" aria-label="事件专报列表">
      {filtered.map((event) => (
        <Link key={event.id} className="report-reading-item" to="/events/$eventId" params={{eventId:event.id}}>
          <div className="report-reading-date">{event.date.replaceAll('-','.')}<span>{event.public?'公开资料':'业务样例'}</span></div>
          <div className="report-reading-body">
            <div className="report-reading-kicker"><EventKicker event={event}/></div>
            <h2>{event.title}</h2>
            <p className="report-reading-judgment">{event.judgment}</p>
            <p className="report-reading-checkpoint"><span>后续关注</span>{getReportBrief(event.id)?.checkpoint ?? event.attention}</p>
          </div>
          <ArrowRight size={17} aria-hidden="true"/>
        </Link>
      ))}
    </section>
    {!filtered.length && <div className="empty-state">当前筛选范围内暂无事件专报</div>}
  </>;
}
