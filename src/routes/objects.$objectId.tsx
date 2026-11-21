import { createFileRoute, notFound } from '@tanstack/react-router';
import { BackLink, Timeline, EditorialImage } from '@/components/market/reading';
import { usePublication } from '@/components/market/publication';
import { contentHead, events, formatDate, getObject } from '@/lib/market-data';
import { eventAt, getReadingEdition, readScope } from '@/lib/reading-editions';
import { isLeaderMaterial } from '@/lib/report-workflow';

export const Route = createFileRoute('/objects/$objectId')({
  validateSearch: readScope,
  loader: ({params})=>{const object=getObject(params.objectId);if(!object) throw notFound();return object;},
  head: ({loaderData}) => contentHead(`${loaderData?.name ?? '对象'}的历次变化`,'按报告截稿日回看对象历史。'),
  component: ObjectDetail,
});

function ObjectDetail() {
  const object=Route.useLoaderData();
  const scope=Route.useSearch();
  const edition=getReadingEdition(scope);
  const {stage}=usePublication();
  if(!edition) throw notFound();
  const related=events.filter(event=>event.objects.includes(object.id) && isLeaderMaterial(event.id,stage)).flatMap(event=>{
    const view=eventAt(event.id,scope);
    return view?[view]:[];
  });
  const items=related.flatMap(event=>event.timeline.map(item=>({...item,eventId:event.id}))).sort((a,b)=>b.date.localeCompare(a.date));
  return <><BackLink label="返回原阅读位置" /><header className="object-header">
    <div className="eyebrow">{object.kind} · {object.region}</div><h1>{object.name}</h1>
    <div className="heading-meta"><span>{related.length} 个关联事件</span><span>截至 {formatDate(edition.cutoff)}</span></div>
    {!(scope.issue || scope.month) && <p>{object.description}</p>}
  </header>
  {object.kind==='项目' && <EditorialImage kind="project" />}
  <section className="object-history"><h2 className="section-title">历次变化</h2>
    {items.length>0?<Timeline items={items} scope={scope} />:<p>当期暂无可查的已发布材料。</p>}
  </section></>;
}
