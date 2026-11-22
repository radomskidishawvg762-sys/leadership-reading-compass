/**
 * Small, original illustrations for the three curated research subjects.
 * No event image is claimed to be documentary evidence.
 * Key figures below quote the dated fixed-topic snapshot, not live company data.
 */
export const topicVisuals = {
  'housing-cash': {
    src:'/market/topic-housing.svg',
    alt:'城市住房建设与塔吊的原创场景插画',
    tag:'资金与合同',
    highlights:[
      {value:'−21.9%',label:'房企到位资金同比'},
      {value:'−24.4%',label:'房屋新开工面积同比'},
    ],
    note:'2026年前十个月 · 国家统计局口径',
  },
  infrastructure: {
    src:'/market/topic-infrastructure.svg',
    alt:'交通桥梁与基建工程的原创场景插画',
    tag:'投资与项目机会',
    highlights:[
      {value:'−5.1%',label:'基建投资同比'},
      {value:'航空 / 水运',label:'存在结构性分化'},
    ],
    note:'2026年前十个月 · 国家统计局口径',
  },
  'green-building': {
    src:'/market/topic-green-building.svg',
    alt:'绿色建材生产线与储料筒仓的原创场景插画',
    tag:'政策与采购',
    highlights:[
      {value:'福州',label:'绿色建材名录更新'},
      {value:'鄂州',label:'相关产品清单更新'},
    ],
    note:'地方名录更新 · 截至 2026.11.20',
  },
} as const;

export function getTopicVisual(id:string|undefined) {
  if(!id || !(id in topicVisuals))return undefined;
  return topicVisuals[id as keyof typeof topicVisuals];
}
