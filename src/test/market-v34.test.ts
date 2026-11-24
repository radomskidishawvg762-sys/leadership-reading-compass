import {describe,it,expect} from 'vitest';
import {releaseSnapshot,releaseDetails} from '@/lib/market-release-v34';
import {snapshotInput,validateSnapshot,acceptPublished} from '@/lib/market-snapshot';
import {groupContext,priceCostComparison,regionalComparison} from '@/lib/group-context';
describe('V3.4 first-paint research',()=>{
 it('publishes source-backed AI-authored release for all public topics',()=>{const input=snapshotInput();expect(acceptPublished(releaseSnapshot)).not.toBeNull();expect(validateSnapshot(releaseSnapshot,input)?.items.length).toBe(input.candidates.length);for(const e of input.candidates){expect(releaseSnapshot.items.find(i=>i.eventId===e.id)?.advice).toBeTruthy();expect(releaseDetails[e.id]).toBeTruthy()}});
 it('group facts respect cutoff and match available regions',()=>{expect(groupContext('EV-PUBLIC-001')[0].value).toBe(1.04);expect(groupContext('EV-PUBLIC-003').length).toBe(3);expect(groupContext('EV-PUBLIC-001').find(r=>r.label.includes('5项'))?.value).toBe(60.81);expect(groupContext('EV-PUBLIC-001','2026-09-01').some(r=>r.sourceId==='v35-q3-operations')).toBe(false);expect(groupContext('EV-PUBLIC-001','2026-06-30')).toEqual([]);expect(regionalComparison().length).toBe(6);expect(priceCostComparison().rows[0].sale).toBe(100);expect(priceCostComparison().rows.length).toBe(4)});
});
