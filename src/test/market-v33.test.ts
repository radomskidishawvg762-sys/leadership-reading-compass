import {describe,it,expect} from 'vitest';
import {snapshotInput,validateSnapshot,metricNotes} from '@/lib/market-snapshot';
import {metrics} from '@/lib/market-monitor';
describe('published market snapshot',()=>{
 it('requires real suggestions for every public candidate and valid references',()=>{
  const input=snapshotInput();expect(input.candidates.length).toBeGreaterThan(0);
  const items=input.candidates.map(e=>({eventId:e.id,conclusion:'公开市场观察',advice:'可关注区域市场变化',sourceIds:[e.sourceIds[0]]}));
  const raw={summary:'市场变化观察',sourceIds:items[0].sourceIds,focusIds:[items[0].eventId],items,observations:[]};
  expect(validateSnapshot(raw,input)?.items.length).toBe(input.candidates.length);
  expect(validateSnapshot({...raw,items:items.slice(1)},input)).toBeNull();
  expect(validateSnapshot({...raw,items:items.map((i,n)=>n===0?{...i,sourceIds:['invented']}:i)},input)).toBeNull();
 });
 it('has a concise non-AI explanation for every metric',()=>{for(const m of metrics)expect(metricNotes[m.id]).toBeTruthy()});
});
