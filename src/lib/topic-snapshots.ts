/**
 * Three editorially reviewed research snapshots. They are not new events;
 * both the displayed answers and follow-ups link back to canonical event/source IDs.
 * The snapshots are dated and must never be represented as current live research.
 */
import type { TopicInput, TopicResearch } from './topic-research';
import { featuredTopics } from './market-topics';

export const pinnedTopicIds = ['housing-cash','infrastructure','green-building'] as const;
type PinnedId = typeof pinnedTopicIds[number];
export type SnapshotBlock = { heading: string; text: string; sourceIds: string[] };
export type FixedTopicSnapshot = {
  topicId: PinnedId; version: string; cutoff: string; window: 'all';
  eventIds: string[]; evidenceSourceIds: string[]; blocks: SnapshotBlock[];
};
export type FixedTopicAnswer = {
  answer: string; topicId: string; version: string; cutoff: string;
  sourceIds: string[]; eventIds: string[]; stale: boolean;
};

export const fixedTopicSnapshots: Record<PinnedId, FixedTopicSnapshot> = {
  'housing-cash': {
    topicId:'housing-cash',version:'1.0',cutoff:'2026-11-20',window:'all',
    eventIds:['EV-PUBLIC-003','EV-PUBLIC-002'],
    evidenceSourceIds:['public-housing','public-housing-sep','public-dispatch','public-price'],
    blocks:[
      {heading:'核心判断',text:'房企到位资金降幅扩大，新开工仍低于上年同期。新增房建业务宜关注客户资信、首款及垫资条件，具体回款风险需结合实际付款情况判断。',sourceIds:['public-housing']},
      {heading:'主要依据',text:'国家统计局披露，2026 年前十个月房屋新开工面积同比下降 24.4%，房地产开发企业到位资金同比下降 21.9%。另有行业样本发运周环比下降 5.12%，其统计对象、时间窗与房地产统计不同，不能直接合算。',sourceIds:['public-housing','public-dispatch']},
      {heading:'建议行动',text:'对拟签房建合同优先核实付款主体、首付款日期和垫资上限；对资金来源不清晰的项目，先补充支付保障条件，再讨论承接和排产安排。',sourceIds:[]},
      {heading:'关键缺口',text:'还需逐项目核实合同首款约定、客户实际付款记录和已确认供货计划，才能判断具体项目的风险程度。',sourceIds:[]},
    ],
  },
  infrastructure: {
    topicId:'infrastructure',version:'1.0',cutoff:'2026-11-20',window:'all',
    eventIds:['EV-PUBLIC-004','EV-PUBLIC-002','EV-PUBLIC-003'],
    evidenceSourceIds:['public-investment','public-dispatch','public-price','public-housing','public-housing-sep'],
    blocks:[
      {heading:'核心判断',text:'基建投资整体下降，航空、水运投资仍在增长。集团可关注相关交通工程的商混采购进展，投资增长不等于新增订单。',sourceIds:['public-investment']},
      {heading:'主要依据',text:'国家统计局披露，前十个月全国基础设施投资同比下降 5.1%，航空运输和水上运输等细分领域表现相对突出。与此同时，行业混凝土发运样本下降，说明投资统计与真实材料采购需求之间仍需逐项目验证。',sourceIds:['public-investment','public-dispatch']},
      {heading:'建议行动',text:'优先关注集团经营区域内已进入招标或施工阶段的交通工程，结合商混采购计划、厂站供应范围和产能，评估供货机会。',sourceIds:[]},
      {heading:'关键缺口',text:'需要可验证的项目采购公告、施工进度和可供货区域清单，才能确定哪些机会应进入重点跟踪。',sourceIds:[]},
    ],
  },
  'green-building': {
    topicId:'green-building',version:'1.0',cutoff:'2026-11-20',window:'all',
    eventIds:['EV-PUBLIC-006'],
    evidenceSourceIds:['public-fuzhou-green','public-ezhou-green'],
    blocks:[
      {heading:'核心判断',text:'福州、鄂州更新绿色建材名录，参与当地项目招采时宜关注产品认证等级、适用范围及证书有效期。两地名录不是全国统一要求。',sourceIds:['public-fuzhou-green','public-ezhou-green']},
      {heading:'主要依据',text:'福州发布第八批绿色建材产品信息名录，涉及预拌混凝土等 30 类产品、合计 72 家企业；鄂州更新了包含预拌混凝土的产品信息清单，涉及产品类型、星级和证书状态。',sourceIds:['public-fuzhou-green','public-ezhou-green']},
      {heading:'建议行动',text:'在相关地区参与政府采购或投标前，先对照项目招采条款检查产品品类、证书星级、有效期及适用范围；仅凭入选地方名录不能确认具体项目投标资格。',sourceIds:[]},
      {heading:'关键缺口',text:'仍需核实具体项目采购文件、拟供产品的认证信息与证书有效期。',sourceIds:[]},
    ],
  },
};

export function isPinnedTopic(id:string|undefined):id is PinnedId {
  return typeof id==='string' && pinnedTopicIds.some(pinned=>pinned===id);
}
/** Only exact curated links use the frozen snapshot; custom searches stay dynamic. */
export function isPinnedSnapshotRequest(input:TopicInput):boolean {
  if(!isPinnedTopic(input.topicId) || input.window!=='all')return false;
  const featured=featuredTopics.find(item=>item.id===input.topicId);
  return Boolean(featured && featured.title===input.q);
}

/** Restrict curated topic research to its published canonical event identities. */
export function scopePinnedEvidence(input:TopicInput,research:TopicResearch):TopicResearch {
  if(!isPinnedSnapshotRequest(input))return research;
  const snapshot=fixedTopicSnapshots[input.topicId as PinnedId];
  const allowedEvents=new Set(snapshot.eventIds);
  const events=research.events.filter(event=>allowedEvents.has(event.id));
  const sources=research.sources
    .filter(source=>source.eventIds.some(id=>allowedEvents.has(id)))
    .map(source=>({...source,eventIds:source.eventIds.filter(id=>allowedEvents.has(id))}));
  return {...research,events,sources,publicCount:events.filter(x=>x.public).length,
    demoCount:events.filter(x=>!x.public).length};
}

export function getFixedTopicAnswer(input:TopicInput,research:TopicResearch):FixedTopicAnswer|null {
  if(!isPinnedSnapshotRequest(input))return null;
  const snapshot=fixedTopicSnapshots[input.topicId as PinnedId];
  const eventSet=new Set(research.events.map(event=>event.id));
  const sourceSet=new Set(research.sources.map(source=>source.id));
  if(!snapshot.eventIds.every(id=>eventSet.has(id)))return null;
  // If a source is removed, fail closed: never silently display orphan citations.
  if(!snapshot.evidenceSourceIds.every(id=>sourceSet.has(id)))return null;
  const answer=snapshot.blocks.map(block=>{
    const refs=block.sourceIds.map(id=>{
      const idx=research.sources.findIndex(source=>source.id===id);
      return idx<0?'':`[S${idx+1}]`;
    }).filter(Boolean).join('');
    return `【${block.heading}】${block.text}${refs?' '+refs:''}`;
  }).join('\n\n');
  return {topicId:snapshot.topicId,version:snapshot.version,cutoff:snapshot.cutoff,
    sourceIds:snapshot.evidenceSourceIds,eventIds:snapshot.eventIds,
    answer,stale:research.cutoff>snapshot.cutoff};
}
