/**
 * Locally hosted, optimized licensed photography for curated research subjects.
 * No runtime request to third-party photo CDN. Sources documented in PHOTO_EDITORIAL_V26.md.
 * Key figures below quote the dated fixed-topic snapshot, not live company data.
 */
export const topicVisuals = {
  'housing-cash': {
    src:'/market/topic-housing-v27.webp',
    alt:'真实施工摄影：城市在建高层建筑与塔吊',
    tag:'资金与合同',
    photoCredit:'Daniel Romero / Unsplash',
    photoPage:'https://unsplash.com/photos/a-skyscraper-under-construction-with-a-crane-6xEpAeKHgTw',
    highlights:[
      {value:'−21.9%',label:'房企到位资金同比'},
      {value:'−24.4%',label:'房屋新开工面积同比'},
    ],
    note:'2026年前十个月 · 国家统计局口径',
  },
  infrastructure: {
    src:'/market/topic-infrastructure-v27.webp',
    alt:'真实工程摄影：穿越自然地貌的铁路高架桥',
    tag:'投资与项目机会',
    photoCredit:'Adem Percem / Unsplash',
    photoPage:'https://unsplash.com/photos/elevated-train-tracks-crossing-a-rural-landscape-NUp3tI3Ti1w',
    highlights:[
      {value:'−5.1%',label:'基建投资同比'},
      {value:'航空 / 水运',label:'存在结构性分化'},
    ],
    note:'2026年前十个月 · 国家统计局口径',
  },
  'green-building': {
    src:'/market/topic-green-building-v27.webp',
    alt:'真实绿色建筑摄影：立面覆盖植物的建筑',
    tag:'政策与采购',
    photoCredit:'WILLIAN REIS / Unsplash',
    photoPage:'https://unsplash.com/photos/modern-building-facade-covered-in-lush-green-plants-TeAKpJznZAY',
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
