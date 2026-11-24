import { describe, expect, it } from 'vitest';
import { getPulseEvents, getPulseFocus, getReviewQueue, getOperatingContext } from '@/lib/market-pulse';
import { currentCutoff, eventAt } from '@/lib/reading-editions';
import { sources } from '@/lib/market-data';
describe('V2.9 operating focus',()=>{
  it('uses latest evidence date, not weekly report period',()=>{expect(currentCutoff).toBe(sources.map(item=>item.date).sort().at(-1));});
  it('keeps public and demo distinct and excludes unpublished materials',()=>{
    const rows=getPulseEvents('pending');
    expect(rows.some(item=>item.id==='EV-2026-002')).toBe(false);
    expect(getPulseEvents('published').some(item=>item.id==='EV-2026-002')).toBe(true);
    expect(getPulseEvents('pending','public').every(item=>item.public)).toBe(true);
    expect(getPulseEvents('pending','demo').every(item=>!item.public)).toBe(true);
  });
  it('keeps unresolved older matters in the main focus and respects visibility',()=>{
    const rows=getPulseEvents('pending');
    const focus=getPulseFocus(rows);
    expect(focus.some(item=>item.id==='EV-2026-006')).toBe(true);
    expect(focus.some(item=>item.id==='EV-2026-004')).toBe(true);
    expect(focus.some(item=>item.id==='EV-2026-002')).toBe(false);
    expect(getReviewQueue(rows,'pending').some(item=>item.id==='EV-2026-004')).toBe(true);
  });
  it('marks internal matches as examples and never assigns a public signal an internal exposure',()=>{
    const rows=getPulseEvents('pending');
    const project=rows.find(item=>item.id==='EV-2026-001')!;
    expect(getOperatingContext(project)).toMatchObject({area:'规模与订单',sampleMatch:true,checkpoint:'2026-11-27'});
    for(const item of rows.filter(item=>item.public)){
      expect(getOperatingContext(item).sampleMatch).toBe(false);
      expect(getOperatingContext(item).status).toContain('内部影响待核');
    }
    expect(getOperatingContext(rows.find(item=>item.id==='EV-PUBLIC-003')!).area).toBe('现金与风险');
  });
  it('does not rewrite historical event snapshots',()=>{
    expect(eventAt('EV-2026-001',{issue:'2026-10-23'})?.title).toContain('总承包中标');
  });
});
