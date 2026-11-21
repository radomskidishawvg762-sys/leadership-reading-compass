import { createFileRoute, Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { PageHeading, SourceLinks } from '@/components/market/reading';
import { usePublication } from '@/components/market/publication';
import { contentHead, getEvent } from '@/lib/market-data';
import { reviewExample } from '@/lib/report-workflow';

export const Route = createFileRoute('/workbench')({
  head: () => contentHead('采编演示','演示客户风险线索从核实到发布的过程。'),
  component: Workbench,
});

const steps = {
  pending:{ title:'待财资确认', description:'核对公开执行记录的统一社会信用代码与合同主体，并确认截至日的应收余额。逾期和损失继续标为待核。', action:'confirm', button:'财资确认主体及应收' },
  review:{ title:'待负责人审核', description:'确认应收余额、执行标的和未核实逾期分别列示，按武汉区域的业务影响决定是否发专报。', action:'approve', button:'负责人审核通过' },
  approved:{ title:'已审核 · 待发布', description:'领导端尚未展示该专报。发布后可从首页和专报列表查看。', action:'publish', button:'发布到领导端' },
} as const;

function Workbench() {
  const {stage,advance,reset} = usePublication();
  const event = getEvent(reviewExample)!;
  const step = stage === 'published' ? undefined : steps[stage];
  return <>
    <PageHeading title="采编演示" eyebrow="模拟工作台" meta="演示状态保存在当前浏览器。材料均为虚构样例。" />
    <section className="editorial-callout" aria-label="客户风险演示">
      <p className="story-kicker">{step?.title ?? '已发布'}</p>
      <h2>{event.title}</h2>
      <p>{step?.description ?? '该事件已出现在最新专报列表，可以从领导端查看依据和追问。'}</p>
      <SourceLinks ids={event.sources} />
      <div className="editorial-actions">
        {step ? <Button onClick={()=>advance(step.action)}>{step.button}</Button>
          : <Button asChild><Link to="/events/$eventId" params={{eventId:event.id}}>查看已发布专报</Link></Button>}
        {stage !== 'pending' && <Button variant="outline" onClick={reset}>重置演示</Button>}
      </div>
    </section>
    <section className="watchboard">
      <h2>待补证线索</h2>
      <p>成都竞对价格仍缺同条件正式报价。恒远姐妹公司涉诉尚未匹配我方签约法人。</p>
    </section>
  </>;
}
