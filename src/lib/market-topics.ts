import { findMaterials, type MarketEvent } from './market-data';

export const featuredTopics = [
  {
    id: 'demand', title: '发运下降，需求从哪里分化？',
    description: '对照混凝土发运、房建新开工和基建投资，分辨行业样本与全国统计的口径。',
    queries: ['全国需求', '全国市场', '基建', '基建投资', '民建需求', '房地产', '房建资金'],
    eventIds: ['EV-PUBLIC-002', 'EV-PUBLIC-003', 'EV-PUBLIC-004'],
  },
  {
    id: 'prices', title: '水泥涨价后，混凝土跟涨了吗？',
    description: '从全国指数回到郑州和成都，比较原料价格与当地 C30 报价的周度变化。',
    queries: ['全国水泥价格', '河南水泥', '水泥涨价', '郑州成都', 'C30', '区域价格', '价格分化'],
    eventIds: ['EV-PUBLIC-005', 'EV-PUBLIC-001', 'EV-PUBLIC-002'],
  },
  {
    id: 'housing-cash', title: '房建资金压力如何传导到合同？',
    description: '联动房建到位资金、新开工与行业发运，研究合同首款、垫资和信用条件的核实顺序。',
    queries: ['房建资金压力','房建回款','合同质量','房建新开工'],
    eventIds: ['EV-PUBLIC-003', 'EV-PUBLIC-002'],
  },
  {
    id: 'infrastructure', title: '基建投资分化，机会在哪里？',
    description: '从基建投资结构与行业需求样本出发，区分投资增长信号和真实项目采购机会。',
    queries: ['基建投资分化','基建机会','交通工程','项目机会'],
    eventIds: ['EV-PUBLIC-004', 'EV-PUBLIC-002', 'EV-PUBLIC-003'],
  },
  {
    id: 'regional-price', title: '郑州和成都的价格为何不同？',
    description: '对照区域混凝土与水泥公开报价，核对规格、时间和成本传导口径。',
    queries: ['郑州成都价格','区域价格比较','区域成本'],
    eventIds: ['EV-PUBLIC-005', 'EV-PUBLIC-001'],
  },
  {
    id: 'green-building', title: '绿色建材名录对采购有什么影响？',
    description: '查福州、鄂州新公布的名录，以及需要到招采文件里核对的条件。',
    queries: ['绿色建材', '福州', '鄂州', '认证', '绿色建材名录'],
    eventIds: ['EV-PUBLIC-006'],
  },
] as const;

const normalize = (value: string) => value.normalize('NFKC').toLowerCase().replace(/[\s，。！？、,.?!]/g, '');

export function findTopicEvents(query: string, events: MarketEvent[]) {
  const term = normalize(query);
  if (!term) return [];
  const featuredIds = new Set<string>(featuredTopics.flatMap(topic => {
    const constrainedToCity = ['郑州','成都','河南','福州','鄂州','武汉','重庆'].some(city => term.includes(city));
    const matched = term === normalize(topic.title) ||
      topic.queries.some(alias => constrainedToCity ? term === normalize(alias) : term.includes(normalize(alias)));
    return matched ? [...topic.eventIds] : [];
  }));
  const matches = new Set(findMaterials(query).events.map(event => event.id));
  const keywords = ['全国','河南','郑州','成都','福州','鄂州','武汉','重庆','房建','绿色建材','基建','水泥','混凝土','招标','信用','应收']
    .filter(keyword => term.includes(keyword));
  return events.filter(event => {
    const facts = normalize(`${event.region} ${event.title} ${event.type} ${event.fact}`);
    return featuredIds.has(event.id) || (keywords.length < 2 && matches.has(event.id)) ||
      (keywords.length > 0 && keywords.every(keyword => facts.includes(keyword)));
  });
}
