import { events, type MarketEvent } from './market-data';
import { currentCutoff, eventAt } from './reading-editions';
import { isLeaderMaterial, isPublishedReport, type ReportStage } from './report-workflow';

export type PulseFilter = 'all' | 'public' | 'demo';
export type PulseRole = 'chair' | 'manager';
export function getPulseEvents(stage: ReportStage, filter: PulseFilter = 'all'): MarketEvent[] {
  return events.filter(event => isLeaderMaterial(event.id, stage))
    .flatMap(event => { const view = eventAt(event.id, {}); return view ? [view] : []; })
    .filter(event => filter === 'all' || (filter === 'public' ? Boolean(event.public) : !event.public))
    .sort((a,b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
}

export function getPulseFocus(items: MarketEvent[], role: PulseRole): MarketEvent[] {
  const order = role === 'chair'
    ? ['客户风险','市场需求','区域与财政','竞争价格','政策与交付','项目机会']
    : ['客户风险','项目机会','竞争价格','政策与交付','市场需求','区域与财政'];
  const recent = new Date(currentCutoff + 'T00:00:00Z');
  recent.setUTCDate(recent.getUTCDate()-6);
  const cutoff = recent.toISOString().slice(0,10);
  const ranked = items.filter(event => event.date >= cutoff)
    .sort((a,b) => order.indexOf(a.type)-order.indexOf(b.type) || b.date.localeCompare(a.date));
  const seen = new Set<string>();
  return ranked.filter(event => { if(seen.has(event.type))return false;seen.add(event.type);return true; }).slice(0,3);
}

export function getReviewQueue(items: MarketEvent[], stage: ReportStage): MarketEvent[] {
  return items.filter(event => event.pending.length > 0 && isPublishedReport(event.id,stage,currentCutoff));
}
