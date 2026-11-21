import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowRight, BookOpen, FileCheck2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DateMeta, EventKicker, PageHeading } from '@/components/market/reading';
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
    <PageHeading title="事件专报" eyebrow="市场监测" meta="重点变化、经营影响与复核节点" />
    <section className="report-editorial-intro" aria-label="专报导读">
      <div>
        <span className="eyebrow">事件深度研判 · 一事一报</span>
        <h2>将重点变化转化为有依据的经营判断</h2>
        <p>围绕具体事项查看经营影响、原始证据、复核节点和后续进展。每份专报沿用原事件编号，不重复创建材料。</p>
      </div>
      <div className="report-editorial-stat"><BookOpen size={19} aria-hidden="true" />
        <strong>{reports.length}</strong><span>份可阅读专报</span></div>
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
    <section className="report-editorial-list" aria-label="专题事件专报列表">
      {filtered.map((event,index) => (
        <Link key={event.id} className="report-row report-row--brief report-editorial-card" to="/events/$eventId" params={{ eventId:event.id }}>
          <div className="report-editorial-number">{String(index+1).padStart(2,'0')}</div>
          <div className="report-editorial-card-main">
            <div className="story-kicker"><EventKicker event={event} /><span className="report-meta"><DateMeta date={event.date} publicMaterial={Boolean(event.public)} /></span></div>
            <h2>{event.title}</h2>
            <p className="report-editorial-judgment">{event.judgment}</p>
            <p className="report-checkpoint"><FileCheck2 size={14} aria-hidden="true"/><strong>复核节点</strong> {getReportBrief(event.id)?.checkpoint ?? event.attention}</p>
          </div>
          <ArrowRight size={17} aria-hidden="true" />
        </Link>
      ))}
    </section>
    {!filtered.length && <div className="empty-state">当前筛选范围内暂无事件专报</div>}
  </>;
}
