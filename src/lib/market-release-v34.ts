// Initial published research authored by ChatGPT during the V3.4 release, from the repository's cited public evidence.
// This is an AI-authored release artifact, not a response from the production Worker, and not live market data.
import type {MarketSnapshot} from './market-snapshot';
export const releaseDetails={
  "EV-PUBLIC-001": "河南部分地区水泥报价上涨20—30元/吨，郑州C30报价同期持平；采暖季错峰生产可能延长供应偏紧。对尚未锁定原料成本的固定价格合同，采购成本上涨可能压缩单方盈利空间。河南上半年收入约7502万元，同比下降33.96%；三季度简报列出的五项河南项目签约量合计60.81万方。公司在当地有实际业务，但签约量并不是当前未完成的供货量。若相关合同仍处于履约期，固定价格合同的利润可能受采购成本上涨影响，建议持续关注项目盈利情况。",
  "EV-PUBLIC-002": "506家样本企业周发运139.09万方，环比减少5.12%；另一机构全国混凝土价格指数微升0.06%。发运下降、价格相对稳定，可能反映季节性施工变化及局部供需分化。两项数据统计样本和时间窗口不同，不宜直接计算量价弹性。集团经营判断应结合各区域同周期的实际销量及订单储备，而非把行业样本降幅等同于集团销量降幅。",
  "EV-PUBLIC-003": "前十个月房企到位资金同比下降21.9%，较前三季度降幅扩大0.3个百分点，新开工面积同比下降24.4%。下游资金与新增施工需求均存在压力，可能影响业务承接和回款节奏。全国统计不代表具体客户信用状态；需结合付款主体、合同首款条件及实际回款判断个别业务。半年报披露公司应收账款净额约225.57亿元，前五大客户应收占39.60%。这是全公司数据，不能等同于房建客户应收。",
  "EV-PUBLIC-004": "全国前十个月基础设施投资同比下降5.1%，航空、水上运输业投资分别增长12.5%。细分领域与整体走势不同，公司上半年城市外基础设施签约773万方，占总签约量15%，说明已有这类业务。投资完成额并非材料采购计划，不能直接换算为商混订单。可结合项目施工阶段、经营区域与可供货条件研究实际需求。",
  "EV-PUBLIC-005": "成都C30参考价374元/方、周涨5元；重庆上涨20元/方，武汉下降5元/方，郑州、西安、合肥持平。郑州同城散装水泥周涨30元/吨。价格反映各地市场采价，不同地区运输与付款条件可能不同，水泥与商混计量单位也不同。集团四川、重庆、湖北及河南地区公开收入占比可帮助确定观察优先级，但不能据此估算盈利影响。实际判断仍应结合当地采购价格、单方材料用量及合同售价。",
  "EV-PUBLIC-006": "福州公布第八批绿色建材名录，涉及预拌混凝土等30类产品、72家企业；鄂州更新产品信息，包含品类、星级与证书状态。地方清单变化有助于识别招采资格要求，但不代表全国统一门槛，也不证明集团取得订单或资格。建议结合具体项目采购文件及产品证书适用范围，持续观察相关政策。"
} as Record<string,string>;
export const releaseSnapshot:MarketSnapshot={
  "summary": "混凝土需求仍偏弱。成都、重庆市场售价上涨，武汉下降；郑州水泥涨价而混凝土售价持平。近期重点关注四川、重庆、湖北量价变化，河南固定价格合同盈利情况及川渝项目采购进展。",
  "sourceIds": [
    "public-dispatch",
    "public-price",
    "public-henan",
    "public-housing",
    "public-investment","v31-chongqing","public-chengdu","v31-wuhan","public-zhengzhou","v38-cq-sichuan"
  ],
  "items": [
    {
      "eventId": "EV-PUBLIC-001",
      "conclusion": "河南水泥价格上涨，郑州混凝土售价维持稳定。若实际采购成本同步上升，固定价格合同的利润空间可能收窄。",
      "advice": "建议优先关注河南地区正在履约的固定价格合同，评估采购成本变化对项目利润的影响。",
      "sourceIds": [
        "public-henan",
        "public-winter",
        "public-zhengzhou"
      ]
    },
    {
      "eventId": "EV-PUBLIC-002",
      "conclusion": "行业混凝土发运量下降，价格整体稳定，市场需求尚未明显恢复。",
      "advice": "建议关注重点区域在手订单及实际供货进度，合理安排生产。",
      "sourceIds": [
        "public-dispatch",
        "public-price"
      ]
    },
    {
      "eventId": "EV-PUBLIC-003",
      "conclusion": "房企到位资金降幅扩大，新开工面积仍低于上年同期，新增业务和回款进度值得关注。",
      "advice": "新增房建业务宜重点关注客户资信、首款安排和垫资规模，兼顾业务增量与回款质量。",
      "sourceIds": [
        "public-housing",
        "public-housing-sep"
      ]
    },
    {
      "eventId": "EV-PUBLIC-004",
      "conclusion": "基建投资整体下降，但航空和水运建设投资仍在增长。",
      "advice": "建议关注川渝地区交通、港口及产业园项目的施工与采购进展，评估实际供应机会。",
      "sourceIds": [
        "public-investment"
      ]
    },
    {
      "eventId": "EV-PUBLIC-005",
      "conclusion": "成都上涨5元/方、重庆上涨20元/方、武汉下降5元/方，郑州、西安、合肥持平。",
      "advice": "建议优先关注四川、重庆、湖北地区的销售定价和实际采购成本变化。",
      "sourceIds": [
        "public-zhengzhou",
        "public-chengdu",
        "v31-chongqing","v31-wuhan","v31-xian","v31-hefei"
      ]
    },
    {
      "eventId": "EV-PUBLIC-006",
      "conclusion": "福州、鄂州更新了绿色建材清单，当地部分项目可能有新的采购要求。",
      "advice": "建议关注福州、鄂州项目招采的绿色建材要求及现有产品认证情况。",
      "sourceIds": [
        "public-fuzhou-green",
        "public-ezhou-green"
      ]
    }
  ],
  "focusIds": [
    "EV-PUBLIC-001",
    "EV-PUBLIC-005",
    "EV-PUBLIC-003",
    "EV-PUBLIC-004"
  ],
  "observations": [
    {
      "metricId": "regional",
      "text": "重庆和成都价格上涨，武汉下降。可分别关注当地水泥采购价是否也有变化。",
      "sourceIds": [
        "v31-chongqing",
        "public-chengdu",
        "v31-wuhan"
      ]
    },
    {
      "metricId": "group-regions",
      "text": "四川和广东收入占比较高，这些地区的市场变化值得优先关注。",
      "sourceIds": [
        "v32-group"
      ]
    },
    {
      "metricId": "investment",
      "text": "基建整体投资下降，但机场和水运相关投资增长，可关注当地实际施工需求。",
      "sourceIds": [
        "v32-investment"
      ]
    }
  ],
  "generatedAt": "2026-11-25T02:39:45Z",
  "cutoff": "2026-11-20",
  "fingerprint": "release-v39-20261125",
  "origin": "release-ai"
};
