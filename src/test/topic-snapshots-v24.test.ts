import {describe,expect,it} from 'vitest';
import {getTopicResearch} from '@/lib/topic-research';
import {featuredTopics} from '@/lib/market-topics';
import {fixedTopicSnapshots,pinnedTopicIds,isPinnedSnapshotRequest,getFixedTopicAnswer,scopePinnedEvidence} from '@/lib/topic-snapshots';
import {getSource,getEvent} from '@/lib/market-data';
describe('V2.4 pinned topic snapshots',()=>{
  it('has exactly three pinned topics, retaining all six canonical links',()=>{
    expect(pinnedTopicIds).toEqual(['housing-cash','infrastructure','green-building']);
    expect(featuredTopics).toHaveLength(6);
    for(const id of pinnedTopicIds)expect(featuredTopics.some(t=>t.id===id)).toBe(true);
  });
  it('each pinned snapshot contains a checked, dated four-section answer with real references',()=>{
    for(const id of pinnedTopicIds){
      const feature=featuredTopics.find(t=>t.id===id)!;
      const input={topicId:id,q:feature.title,window:'all' as const};
      expect(isPinnedSnapshotRequest(input)).toBe(true);
      const research=scopePinnedEvidence(input,getTopicResearch(input));
      const snapshot=fixedTopicSnapshots[id];
      expect(research.events.map(x=>x.id)).toEqual(expect.arrayContaining(snapshot.eventIds));
      expect(research.events).toHaveLength(snapshot.eventIds.length);
      expect(snapshot.blocks.map(x=>x.heading)).toEqual(['核心判断','主要依据','建议行动','关键缺口']);
      for(const eventId of snapshot.eventIds)expect(getEvent(eventId)?.public).toBe(true);
      for(const sourceId of snapshot.evidenceSourceIds){
        const source=getSource(sourceId);
        expect(source?.kind).toBe('外部材料');
        expect(source?.url).toBeTruthy();
        expect(source!.date<=snapshot.cutoff).toBe(true);
      }
      const result=getFixedTopicAnswer(input,research);
      expect(result).not.toBeNull();
      expect(result!.answer).toContain('【核心判断】');
      expect(result!.answer).toContain('[S');
      expect(result!.cutoff).toBe(snapshot.cutoff);
    }
  });
  it('only exact curated topics use frozen analysis; changing window or query stays dynamic',()=>{
    const feature=featuredTopics.find(t=>t.id==='housing-cash')!;
    expect(isPinnedSnapshotRequest({q:feature.title,topicId:feature.id,window:'30d'})).toBe(false);
    expect(isPinnedSnapshotRequest({q:'房建资金有哪些具体影响',topicId:feature.id,window:'all'})).toBe(false);
    expect(isPinnedSnapshotRequest({q:'成都混凝土',window:'all'})).toBe(false);
    const legacy=featuredTopics.find(t=>t.id==='demand')!;
    expect(isPinnedSnapshotRequest({q:legacy.title,topicId:legacy.id,window:'all'})).toBe(false);
  });
});
