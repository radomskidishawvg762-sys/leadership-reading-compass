import { createFileRoute, Link } from '@tanstack/react-router';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EditorialImage, EventActions, PageHeading } from '@/components/market/reading';
import { contentHead, formatDate, monthlyIssues } from '@/lib/market-data';
import { eventAt } from '@/lib/reading-editions';

export const Route = createFileRoute('/monthly')({
  validateSearch: (search: Record<string, unknown>): { month?: string } =>
    typeof search['month'] === 'string' ? { month: search['month'] } : {},
  head: () => contentHead('月度简报','本月主要市场变化、集团经营关联及上期进展。'),
  component: Monthly,
});

function Monthly() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const issue = monthlyIssues.find(m=>m.id===search.month) ?? monthlyIssues[0];
  if(!issue) return null;
  const scope = {month:issue.id};
  const items = issue.items.flatMap(item => {
    const event = eventAt(item.eventId, scope);
    return event ? [{...item, event}] : [];
  });

  return <div className="brief-frame brief-frame--monthly">
    <PageHeading title="月度简报" eyebrow="市场监测" meta={<span>{formatDate(issue.start)} — {formatDate(issue.end)}</span>}>
      <div className="issue-control no-print">
        <select aria-label="选择月份" className="select-control" value={issue.id} onChange={e=>navigate({search:{month:e.target.value}})}>
          {monthlyIssues.map(m=><option key={m.id} value={m.id}>{m.id.replace('-','年')}月</option>)}
        </select>
        <Button variant="outline" onClick={()=>window.print()}><Printer /><span>打印简报</span></Button>
      </div>
    </PageHeading>
    <article className="monthly-paper">
      <div className="monthly-top"><span>本月市场概览</span><span>截至 {formatDate(issue.end)}</span></div>
      <div className="monthly-lead">
        <div><h2>{issue.title}</h2><p>{issue.summary}</p></div>
        <EditorialImage kind="month" />
      </div>
      <nav className="monthly-contents no-print" aria-label="本月市场简报导读">
        {items.map(({eventId,topic}) => <a key={eventId} href={`#monthly-${eventId}`}>{topic}</a>)}
        {!!issue.updates?.length && <a href="#monthly-progress">上期进展</a>}
      </nav>
      {items.map(({eventId,event,topic,change,implication,watch}) => (
        <section className="monthly-item" id={`monthly-${eventId}`} key={eventId}>
          <div className="monthly-topic"><strong>{topic}</strong><span>{event.region}</span></div>
          <div className="monthly-item-body">
            <div className="monthly-item-heading">
              <h3><Link to="/events/$eventId" params={{eventId}} search={scope}>{event.title}</Link></h3>
              <span className="sample-label">{event.public ? '公开资料' : '业务样例'}</span>
            </div>
            <p className="monthly-change">{change}</p>
            <div className="monthly-reading-notes">
              <p><strong>对集团的影响</strong>{implication}</p>
              <p><strong>建议关注</strong>{watch}</p>
            </div>
            <EventActions eventId={eventId} scope={scope} />
          </div>
        </section>
      ))}
      {!!issue.updates?.length && <section className="monthly-progress" id="monthly-progress">
        <h2>上期关注进展</h2>
        <dl>
          {issue.updates.map(update => (
            <div className="monthly-progress-row" key={update.eventId}>
              <dt><Link to="/events/$eventId" params={{eventId:update.eventId}} search={scope} hash="timeline">{update.label}</Link><span className="sample-label">业务样例</span></dt>
              <dd><span>上期</span>{update.previous}</dd>
              <dd><span>本期</span>{update.current}</dd>
              <dd><span>下一步</span>{update.watch}</dd>
            </div>
          ))}
        </dl>
      </section>}
      <div className="monthly-foot"><span>每期简报按当期截止日查阅</span><span>内部经营关联使用样例数据</span></div>
    </article>
  </div>;
}
