import { describe, expect, it } from 'vitest';
import { getPulseEvents, getPulseFocus, getReviewQueue } from '@/lib/market-pulse';
import { currentCutoff, eventAt } from '@/lib/reading-editions';
import { sources } from '@/lib/market-data';
describe('V2.8 continuous market reading',()=>{
  it('uses latest evidence date, not weekly report period',()=>{expect(currentCutoff).toBe(sources.map(item=>item.date).sort().at(-1));});
  it('keeps public and demo distinct and excludes unpublished materials',()=>{
    const rows=getPulseEvents('pending');
    expect(rows.some(item=>item.id==='EV-2026-002')).toBe(false);
    expect(getPulseEvents('published').some(item=>item.id==='EV-2026-002')).toBe(true);
    expect(getPulseEvents('pending','public').every(item=>item.public)).toBe(true);
    expect(getPulseEvents('pending','demo').every(item=>!item.public)).toBe(true);
  });
  it('shows no more than three distinct recent focus types, while preserving older review items',()=>{
    const rows=getPulseEvents('pending');
    for(const role of ['chair','manager'] as const){
      const focus=getPulseFocus(rows,role);
      expect(focus.length).toBeLessThanOrEqual(3);
      expect(new Set(focus.map(item=>item.type)).size).toBe(focus.length);
    }
    expect(getReviewQueue(rows,'pending').some(item=>item.id==='EV-2026-004')).toBe(true);
  });
  it('does not rewrite historical event snapshots',()=>{
    expect(eventAt('EV-2026-001',{issue:'2026-10-23'})?.title).toContain('总承包中标');
  });
});
