import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EventKicker } from '@/components/market/reading';
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
    <section className="report-cover" aria-labelledby="report-cover-title">
      <div className="report-cover-copy">
        <span className="report-cover-kicker">市场监测 <span aria-hidden="true">/</span> SPECIAL REPORT</span>
        <h1 id="report-cover-title">事件专报</h1>
        <p className="report-cover-lead">聚焦重要市场变化，读懂经营影响与复核重点。</p>
        <p className="report-cover-description">一事一报，保留原始来源和历史进展。先看判断，再按事项深入阅读。</p>
        <div className="report-cover-foot"><span>{reports.length} 份已收录专报</span><span>资料可追溯</span></div>
      </div>
      <figure className="report-cover-photo">
        <img src="https://images.unsplash.com/photo-1527410651988-c2f385ccd3f7?auto=format&fit=crop&w=1280&q=75"
          alt="施工现场的混凝土搅拌运输车，真实行业场景摄影"
          width={1280} height={720} fetchPriority="high" loading="eager" decoding="async"
          referrerPolicy="no-referrer" />
        <figcaption>真实场景摄影 · 非本期事件实拍</figcaption>
      </figure>
    </section>
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
