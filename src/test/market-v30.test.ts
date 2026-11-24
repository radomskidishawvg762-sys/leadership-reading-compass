import {describe,it,expect} from 'vitest';
import {metrics,coreIds,metricById,eligiblePoints,chartKind} from '@/lib/market-monitor';
import {parsePulse,decodePulse} from '@/lib/pulse-analysis';
describe('V3.0 monitoring contracts',()=>{
 it('all observations have linked sources, fixed national core',()=>{
  for(const m of metrics)expect(eligiblePoints(m)).toHaveLength(m.points.length);
  for(const id of coreIds)expect(metricById(id)?.scope).toContain('全国');
 });
 it('uses comparison for two observations, no fake lines or zero filling',()=>{
  const m=metricById('c30')!;expect(chartKind(m,eligiblePoints(m))).toBe('trend');
  expect(chartKind(m,eligiblePoints(m).slice(-2))).toBe('compare');
  expect(chartKind(m,[])).toBe('number');
  expect(eligiblePoints(m,'2026-10-31')).toHaveLength(1);
  for(const id of coreIds)expect(eligiblePoints(metricById(id)! ).length).toBeGreaterThanOrEqual(4);
  expect(eligiblePoints(metricById('regional-level')!)).toHaveLength(8);
  for(const id of ['sand','slag','investment'])expect(eligiblePoints(metricById(id)!).length).toBeGreaterThanOrEqual(4);
  expect(eligiblePoints(metricById('regional')!).filter(p=>p.value===0)).toHaveLength(3);
 });
 it('requires an actual event and matching cited source for AI advice',()=>{
  const events=[{id:'e',sourceIds:['s']}];
  const raw=JSON.stringify({summary:'整体市场承压。'.repeat(30),sourceIds:['S1'],items:[{eventId:'E1',conclusion:'影响',advice:'可考虑关注',sourceIds:['[S1]']}]});
  const parsed=parsePulse(decodePulse('模型结果：'+raw),events,['s']);expect(parsed?.items[0].eventId).toBe('e');expect(parsed?.summary.length).toBeLessThanOrEqual(120);
  expect(parsePulse({summary:'判断',sourceIds:['s'],items:[{eventId:'e',conclusion:'影响',advice:'建议',sourceIds:['x']}]},events,['s'])).toBeNull();
  expect(parsePulse({summary:'判断',sourceIds:['s'],items:[{eventId:'e',conclusion:'影响',advice:'建议',sourceIds:['s']}]},events,['s'])?.items).toHaveLength(1);
 });
});
