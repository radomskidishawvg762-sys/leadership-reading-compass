import { MarketPulse, BriefArchive } from '@/components/market/market-pulse';
import { createFileRoute, Link } from '@tanstack/react-router';
import { PageHeading, EventActions, EventKicker, LatestReports } from '@/components/market/reading';
import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft } from 'lucide-react';
import { usePublication } from '@/components/market/publication';
import { contentHead, formatDate, getWeeklyItems, issues } from '@/lib/market-data';
import { eventAt } from '@/lib/reading-editions';
import { isLeaderMaterial } from '@/lib/report-workflow';

export const Route = createFileRoute('/')({
  validateSearch: (search: Record<string, unknown>): { issue?: string; view?: 'issues' | 'briefs' } => ({
    ...(typeof search.issue === 'string' && issues.some(item => item.id === search.issue) ? {issue:search.issue} : {}),
    ...(search.view === 'issues' || search.view === 'briefs' ? {view:search.view} : {}),
  }),
  head: () => contentHead('市场态势','持续关注外部市场变化、经营议题与证据研判。'),
  component: Index,
});

function Index() {
  const {issue,view} = Route.useSearch();
  if (issue) return <WeeklyArchive />;
  if (view === 'briefs') return <BriefArchive />;
  return <MarketPulse directory={view === 'issues'} />;
}

function WeeklyArchive() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const {stage} = usePublication();
  const issue = issues.find(item=>item.id===search.issue) ?? issues[0];
  if(!issue) return null;
  const scope = {issue:issue.id};
  const items = getWeeklyItems(issue).flatMap(item=>{
    const event = eventAt(item.event.id,scope);
    return event && isLeaderMaterial(event.id,stage) ? [{event,date:item.date}] : [];
  });

  return <div className="brief-frame brief-frame--weekly">
    <div className="brief-return no-print"><Link to="/" search={{view:'briefs'}}><ArrowLeft size={16}/>返回经营简报</Link></div>
    <PageHeading title="本周速览" eyebrow="集团经营动态" meta={<><span>{formatDate(issue.start)} — {formatDate(issue.end)}</span><span className="divider" /><span>第 {issue.number} 期</span></>}>
      <div className="issue-control no-print"><select className="select-control" aria-label="选择周报期次" value={issue.id}
        onChange={event=>navigate({search:{issue:event.target.value}})}>
        {issues.map(item=><option key={item.id} value={item.id}>{formatDate(item.end)} · 第{item.number}期</option>)}
      </select><Button variant="outline" onClick={()=>window.print()}><Printer size={16}/>打印简报</Button></div>
    </PageHeading>
    <div className="weekly-grid">
      <div>
        <section className="weekly-main" aria-label="本期重点变化">
          {items.map(({event,date},index)=><article className={`story ${index===0?'featured':''}`} id={`story-${event.id}`} key={event.id}>
            <div className="story-kicker"><EventKicker event={event} /><span>{event.public?'公开资料':'业务样例'}</span><span className="story-date">{formatDate(date)}</span></div>
            <h2><Link className="story-title-link" to="/events/$eventId" params={{eventId:event.id}} search={scope}>{event.title}</Link></h2>
            <p className="story-judgment">{event.judgment}</p>
            <div className="judgment-lines">
              <div className="judgment-row"><span className="judgment-label">关键事实</span><span>{event.fact}</span></div>
              <div className="judgment-row"><span className="judgment-label">经营影响</span><span>{event.relation}</span></div>
            </div>
            <EventActions eventId={event.id} scope={scope} />
          </article>)}
          {!items.length && <div className="empty-state">这期暂无需要集团关注的新变化。</div>}
        </section>
        {items.length>0 && <section className="weekly-watch" aria-label="下周关注">
          <h2>下周关注</h2>
          <ol>{items.map(({event})=><li key={event.id}>
            <span className="weekly-watch-region">{event.region}</span>
            <span>{event.attention}</span>
            <Link to="/events/$eventId" params={{eventId:event.id}} search={scope}>查看依据</Link>
          </li>)}</ol>
          <p>依据本期截至日形成的关注事项，并非已作出的经营决策。</p>
        </section>}
        <div className="issue-end"><span>材料截至 {formatDate(issue.end)}</span><span>每期最多三条实质进展</span></div>
      </div>
      <LatestReports scope={scope} />
    </div>
  </div>;
}
