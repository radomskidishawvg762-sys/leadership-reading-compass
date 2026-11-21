import { createFileRoute, notFound } from '@tanstack/react-router';
import { ArrowUpRight } from 'lucide-react';
import { BackLink, DateMeta } from '@/components/market/reading';
import { contentHead, formatDate, getSource } from '@/lib/market-data';
import { getReadingEdition, readScope } from '@/lib/reading-editions';

export const Route = createFileRoute('/sources/$sourceId')({
  validateSearch: readScope,
  loaderDeps: ({search})=>search,
  loader: ({params,deps})=>{
    const source=getSource(params.sourceId);
    const edition=getReadingEdition(deps);
    if(!source || !edition || source.date>edition.cutoff) throw notFound();
    return source;
  },
  head: ({loaderData})=>contentHead(loaderData?.title ?? '来源未找到','核对发布机构、日期和引用内容。'),
  component: SourceDocument,
});

function SourceDocument() {
  const source=Route.useLoaderData();
  const edition=getReadingEdition(Route.useSearch())!;
  return <><BackLink label="返回事件材料" /><article className="source-document">
    <header><div className="eyebrow">{source.kind}</div><h1>{source.title}</h1>
      <div className="heading-meta"><DateMeta date={source.date} publicMaterial={Boolean(source.url)} /><span>阅读截止 {formatDate(edition.cutoff)}</span></div>
      <div className="source-top mt-4">{source.organization}</div>
    </header>
    <div className="document-body">
      <div className="excerpt-label">{source.url?'材料摘要':'样例摘录'}</div>
      <div className="excerpt-highlight" id="excerpt"><p>{source.excerpt}</p></div>
      <p>{source.context}</p>
      {source.url ? <a className="source-link" href={source.url} target="_blank" rel="noreferrer">查看发布机构原文<ArrowUpRight /></a>
        : <p className="document-note">此处为业务演示样例。</p>}
    </div>
  </article></>;
}
