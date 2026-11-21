import { Link, useRouter, useRouterState } from '@tanstack/react-router';
import { useEffect, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, ChevronDown, ChevronRight, Clock3, FileText, History, MessageSquare, Newspaper, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { currentCutoff, eventAt, getReadingEdition, type ReadingScope } from '@/lib/reading-editions';
import { isPublishedReport } from '@/lib/report-workflow';
import { usePublication } from './publication';
import { events, formatDate, getObject, getSource, issues, monthlyIssues, type MarketEvent } from '@/lib/market-data';

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: s => s.location.pathname });
  const search = useRouterState({ select: s => s.location.search });
  const edition = getReadingEdition(search);
  const [archiveOpen, setArchiveOpen] = useState(false);
  useEffect(() => { setArchiveOpen(false); }, [pathname, search]);
  return <>
    <header className="masthead">
      <div className="container masthead-inner">
        <Link to="/" className="brand" aria-label="中建西部建设，返回本周速览">
          <img className="brand-symbol" src="/market/cscec.png" width={44} height={44} alt="中国建筑 CSCEC" />
          <div><div className="brand-name">中建西部建设</div><div className="brand-product">市场业态感知</div></div>
        </Link>
        <div className="header-meta">
          <div className="header-date"><span>材料日期</span><strong>{formatDate(edition?.cutoff ?? currentCutoff)}</strong></div>
          <div className="archive">
            <Button variant="ghost" size="sm" aria-expanded={archiveOpen} onClick={() => setArchiveOpen(!archiveOpen)}><History />往期材料<ChevronDown /></Button>
            {archiveOpen && <div className="archive-menu"><h4>周度速览</h4>{issues.map(issue => <Link key={issue.id} to="/" search={{ issue: issue.id }} onClick={() => setArchiveOpen(false)}>{formatDate(issue.end)} · 第{issue.number}期</Link>)}<h4>月度简报</h4>{monthlyIssues.map(({id:month}) => <Link key={month} to="/monthly" search={{ month }} onClick={() => setArchiveOpen(false)}>{month.replace('-', '年')}月简报</Link>)}</div>}
          </div>
        </div>
      </div>
    </header>
    <nav className="main-nav" aria-label="主导航"><div className="container nav-inner">
      <a href="/" className={`nav-item ${pathname === '/' ? 'active' : ''}`}><Newspaper />本周速览</a>
      <a href="/monthly" className={`nav-item ${pathname === '/monthly' ? 'active' : ''}`}><FileText />月度简报</a>
      <a href="/reports" className={`nav-item ${pathname === '/reports' || pathname.startsWith('/events') ? 'active' : ''}`}><BookOpen />事件专报</a>
      <a href="/topics" className={`nav-item ${pathname === '/topics' || pathname.startsWith('/objects') ? 'active' : ''}`}><Search />专题查询</a>
      <div className="nav-status"><span className="status-dot" />公开资料与业务样例</div>
    </div></nav>
    <main className="container soft-enter">{children}</main>
    <footer><div className="container footer-inner"><div className="footer-brand">中建西部建设<span>·</span>市场业态感知</div><div className="footer-links"><span>内部经营关联使用样例数据</span></div></div></footer>
  </>;
}
export function PageHeading({ title, eyebrow, children, meta }: { title: string; eyebrow: string; children?: ReactNode; meta?: ReactNode }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1>{meta && <div className="heading-meta">{meta}</div>}</div>{children}</div>;
}
export function BackLink({ label = '返回上一页' }: { label?: string }) {
  const router = useRouter();
  return <div className="back-link no-print"><Button variant="ghost" className="text-action" onClick={() => { if (window.history.length > 1) router.history.back(); else router.navigate({ to: '/' }); }}><ArrowLeft />{label}</Button></div>;
}
export function EventActions({ eventId, scope = {} }: { eventId: string; scope?: ReadingScope }) {
  return <div className="story-actions no-print"><Button variant="ghost" className="text-action" asChild><Link to="/events/$eventId" params={{ eventId }} search={scope}><FileText />查看依据<ArrowUpRight /></Link></Button><span className="story-action-separator" /><Button variant="ghost" className="text-action" asChild><Link to="/events/$eventId" params={{ eventId }} search={{ ...scope, ask: true }} hash="followup"><MessageSquare />继续追问<ChevronRight /></Link></Button></div>;
}
export function SourceLinks({ ids, scope = {} }: { ids: string[]; scope?: ReadingScope }) {
  return <div className="source-links">{ids.map(id => { const source = getSource(id); return source ? <Link className="source-link" key={id} to="/sources/$sourceId" params={{ sourceId: id }} search={scope} hash="excerpt"><FileText />{source.kind === '内部快照' ? '内部快照' : source.organization} · {formatDate(source.date)}<ArrowUpRight /></Link> : null; })}</div>;
}
export function ObjectLinks({ ids, scope = {}, includeSites = false }: { ids: string[]; scope?: ReadingScope; includeSites?: boolean }) {
  return <div className="object-links">{ids.map(id => { const object = getObject(id); return object && (includeSites || object.kind !== "站点") ? <Link key={id} className="object-link" to="/objects/$objectId" params={{ objectId: id }} search={scope}>{object.name}<ArrowRight /></Link> : null; })}</div>;
}
export function EventKicker({ event }: { event: MarketEvent }) {
  return <><span className={`type-label ${event.risk ? 'risk' : ''}`}>{event.type}</span><span className="kicker-divider" /><span>{event.region}</span></>;
}
export function LatestReports({scope = {}}:{scope?:ReadingScope}) {
  const {stage} = usePublication();
  const edition = getReadingEdition(scope);
  const historical = edition && edition.cutoff < currentCutoff;
  const reports = events.filter(event=>isPublishedReport(event.id,stage,edition?.cutoff ?? currentCutoff))
    .flatMap(event=>{const view=eventAt(event.id,scope);return view?[view]:[]})
    .sort((a,b)=>b.date.localeCompare(a.date)).slice(0,3);
  return <aside className="sidebar">
    <div className="sidebar-title"><h2>{historical ? '截至本期的专报' : '最新专报'}</h2></div>
    {reports.map(event=><Link key={event.id} className="special-item" to="/events/$eventId" params={{eventId:event.id}} search={scope}>
      <div className="special-meta"><span className={`special-dot ${event.risk?'risk':''}`} /><span>{event.region} · {event.type}</span>
      <span className="ml-auto">{formatDate(event.date)}</span></div><h3>{event.title}</h3><p>{event.judgment}</p>
    </Link>)}
    {!reports.length && <p className="reading-note">当期暂无已发布专报。</p>}
    <Link className="sidebar-more" to="/reports">查看全部专报<ArrowRight size={15} /></Link>
  </aside>;
}
export function EditorialImage({kind, eager=false}:{kind:'week'|'month'|'project'; eager?:boolean}) {
  const alt={week:'高架桥与滨水城市建设',month:'沿河产业片区和交通建设',project:'高架桥梁施工现场'}[kind];
  return <figure className={`editorial-image editorial-image--${kind}`}>
    <img src={`/market/${kind}.webp`} alt={alt} width={1100} height={675} loading={eager?'eager':'lazy'} />
    <figcaption>场景示意图</figcaption>
  </figure>;
}
export function Timeline({ items, scope = {} }: { items: { date: string; title: string; text: string; eventId?: string }[]; scope?:ReadingScope }) {
  return <ol className="timeline">{items.map((item, i) => <li key={`${item.date}-${i}`}><time>{formatDate(item.date)}</time><h4>{item.eventId ? <Link to="/events/$eventId" params={{ eventId: item.eventId }} search={scope}>{item.title}<ArrowUpRight size={14} className="inline ml-2" /></Link> : item.title}</h4><p>{item.text}</p></li>)}</ol>;
}
export function DateMeta({ date, publicMaterial = false }: { date: string; publicMaterial?: boolean }) { return <><Clock3 size={12} />{formatDate(date)}<span className="divider" /><span className="sample-label">{publicMaterial ? "公开资料" : "业务样例"}</span></>; }
