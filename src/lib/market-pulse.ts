import { events, getSource, type MarketEvent } from './market-data';
import { currentCutoff, eventAt } from './reading-editions';
import { isLeaderMaterial, isPublishedReport, type ReportStage } from './report-workflow';

export type PulseFilter = 'all' | 'public' | 'demo';
export type OperatingArea = '盈利与价格' | '规模与订单' | '现金与风险' | '产能与交付';
export const operatingAreas: OperatingArea[] = ['盈利与价格','规模与订单','现金与风险','产能与交付'];

// Explicit dates already documented in the sample event evidence. Never infer a
// deadline from a news publication date. These are examples, not actual company tasks.
const checkpoints: Record<string,string> = {
  'EV-2026-001':'2026-11-27',
  'EV-2026-004':'2026-12-01',
};

export function getOperatingArea(event: MarketEvent): OperatingArea {
  if(event.type==='竞争价格')return '盈利与价格';
  if(event.type==='客户风险'||event.id==='EV-PUBLIC-003')return '现金与风险';
  if(event.type==='政策与交付')return '产能与交付';
  return '规模与订单';
}

export function getOperatingContext(event: MarketEvent) {
  const internal=event.sources.flatMap(id=>{const source=getSource(id);return source?.kind==='内部快照'?[source]:[];});
  const sampleMatch=!event.public && internal.length>0;
  const checkpoint=checkpoints[event.id];
  // This is evidence/verification status, not an assertion of operational completion.
  const status=sampleMatch?'已有样例关联 · 待核实':'外部信号 · 内部影响待核';
  return {area:getOperatingArea(event),status,checkpoint,sampleMatch,
    internalAsOf:internal.map(source=>source.date).sort().at(-1)};
}

export function getPulseEvents(stage: ReportStage, filter: PulseFilter = 'all'): MarketEvent[] {
  return events.filter(event => isLeaderMaterial(event.id, stage))
    .flatMap(event => { const view = eventAt(event.id, {}); return view ? [view] : []; })
    .filter(event => filter === 'all' || (filter === 'public' ? Boolean(event.public) : !event.public))
    .sort((a,b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
}

// Open matters survive week boundaries. Recency is a tie-breaker, not an eligibility gate.
// No actual closure is stored in this sample corpus; pending evidence is the open criterion.
export function getPulseFocus(items: MarketEvent[], watched: string[] = []): MarketEvent[] {
  return items.filter(event=>event.pending.length>0||watched.includes(event.id))
    .sort((a,b)=>{
      const x=getOperatingContext(a), y=getOperatingContext(b);
      return Number(b.risk)-Number(a.risk) ||
        Number(Boolean(y.checkpoint))-Number(Boolean(x.checkpoint)) ||
        (x.checkpoint??'9999').localeCompare(y.checkpoint??'9999') ||
        Number(y.sampleMatch)-Number(x.sampleMatch) ||
        b.date.localeCompare(a.date) || a.id.localeCompare(b.id);
    });
}

export function getReviewQueue(items: MarketEvent[], stage: ReportStage): MarketEvent[] {
  return getPulseFocus(items.filter(event => isPublishedReport(event.id,stage,currentCutoff)));
}
