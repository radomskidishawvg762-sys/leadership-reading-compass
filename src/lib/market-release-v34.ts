// Initial published research authored by ChatGPT during the V3.4 release, from the repository's cited public evidence.
// This is an AI-authored release artifact, not a response from the production Worker, and not live market data.
import type {MarketSnapshot} from './market-snapshot';
export const releaseDetails={
  "EV-PUBLIC-001": "河南部分地区水泥报价上涨20—30元/吨，郑州C30报价同期持平；采暖季错峰生产可能延长供给约束。对尚未锁定原料成本的固定价业务，采购成本上涨可能压缩单方盈利空间。河南地区收入占比可以作为集团关联参照，但不能用来推算实际损失。建议结合当地采购与销售合同的调价条件，观察成本是否持续传导；不宜将公开市场报价直接折算为集团毛利。",
  "EV-PUBLIC-002": "506家样本企业周发运139.09万方，环比减少5.12%；另一机构全国混凝土价格指数微升0.06%。量缩而价格相对稳定，可能反映季节性施工变化及局部供需分化。两项数据统计样本和时间窗口不同，不宜直接计算量价弹性。集团经营判断应结合各区域同周期的实际销量及订单储备，而非把行业样本降幅等同于集团销量降幅。",
  "EV-PUBLIC-003": "前十个月房企到位资金同比下降21.9%，较前三季度降幅扩大0.3个百分点，新开工面积同比下降24.4%。下游资金与新增施工需求均存在压力，可能影响业务承接和回款节奏。全国统计不代表具体客户信用状态；需结合付款主体、合同首款条件及实际回款判断个别业务。集团内部应收数据尚未纳入本专题。",
  "EV-PUBLIC-004": "全国前十个月基础设施投资同比下降5.1%，航空、水上运输业投资分别增长12.5%。细分领域与整体走势不同，集团公开半年报披露城市外基础设施业务签约，可作为业务方向参照。投资完成额并非材料采购计划，不能直接换算为商混订单。可结合项目施工阶段、经营区域与可供货条件研究实际需求。",
  "EV-PUBLIC-005": "郑州C30均价258元/方、周度持平，同城散装水泥周涨30元/吨；成都C30均价374元/方、周涨5元。价格反映各地市场采价，不同地区运输与付款条件可能不同，水泥与商混计量单位也不同。集团四川和河南地区公开收入占比可帮助确定观察优先级，但不能据此估算盈利影响。实际判断仍应结合当地采购价格、单方材料用量及合同售价。",
  "EV-PUBLIC-006": "福州公布第八批绿色建材名录，涉及预拌混凝土等30类产品、72家企业；鄂州更新产品信息，包含品类、星级与证书状态。地方清单变化有助于识别招采资格要求，但不代表全国统一门槛，也不证明集团取得订单或资格。建议结合具体项目采购文件及产品证书适用范围，持续观察相关政策。"
} as Record<string,string>;
export const releaseSnapshot:MarketSnapshot={
  "summary": "需求偏弱、区域成本与售价传导分化。房建资金环境仍承压，交通基建存在结构性机会，建议结合集团经营区域关注盈利与回款质量。",
  "sourceIds": [
    "public-dispatch",
    "public-price",
    "public-henan",
    "public-housing",
    "public-investment"
  ],
  "items": [
    {
      "eventId": "EV-PUBLIC-001",
      "conclusion": "河南局部水泥报价上涨，郑州商混售价未同步调整，固定价业务可能承压。",
      "advice": "可重点关注河南固定价业务的实际采购成本与售价传导。",
      "sourceIds": [
        "public-henan",
        "public-winter",
        "public-zhengzhou"
      ]
    },
    {
      "eventId": "EV-PUBLIC-002",
      "conclusion": "行业样本发运回落、价格指数基本持平，需求恢复尚不稳固。",
      "advice": "建议结合区域订单储备与实际销量，关注供需匹配和经营质量。",
      "sourceIds": [
        "public-dispatch",
        "public-price"
      ]
    },
    {
      "eventId": "EV-PUBLIC-003",
      "conclusion": "房企到位资金及新开工同比下降，房建业务增量与付款保障均值得关注。",
      "advice": "可更加关注新增房建业务的付款保障、垫资条件与回款质量。",
      "sourceIds": [
        "public-housing",
        "public-housing-sep"
      ]
    },
    {
      "eventId": "EV-PUBLIC-004",
      "conclusion": "基建投资整体收缩，但航空、水运投资增长，存在结构性市场方向。",
      "advice": "可结合现有经营区域，关注交通基建领域具备供货条件的项目增量。",
      "sourceIds": [
        "public-investment"
      ]
    },
    {
      "eventId": "EV-PUBLIC-005",
      "conclusion": "郑州商混售价持平、成都上涨，区域价格及成本传导表现不同。",
      "advice": "建议按经营区域观察售价与采购成本变化，避免跨地区直接比较利润。",
      "sourceIds": [
        "public-zhengzhou",
        "public-chengdu",
        "public-cement-week"
      ]
    },
    {
      "eventId": "EV-PUBLIC-006",
      "conclusion": "福州、鄂州绿色建材清单更新，涉及当地采购适用条件。",
      "advice": "可关注相关区域政府采购的产品认证要求及证书适用范围。",
      "sourceIds": [
        "public-fuzhou-green",
        "public-ezhou-green"
      ]
    }
  ],
  "focusIds": [
    "EV-PUBLIC-001",
    "EV-PUBLIC-002",
    "EV-PUBLIC-003",
    "EV-PUBLIC-004"
  ],
  "observations": [
    {
      "metricId": "regional",
      "text": "区域价格表现分化，重庆和成都上涨，武汉下跌，宜分别观察当地成本传导。",
      "sourceIds": [
        "v31-chongqing",
        "public-chengdu",
        "v31-wuhan"
      ]
    },
    {
      "metricId": "group-regions",
      "text": "四川、广东等已披露地区收入占比较高，可作为相关市场变化的经营关联参照。",
      "sourceIds": [
        "v32-group"
      ]
    },
    {
      "metricId": "investment",
      "text": "基建整体下降与航空、水运增长并存，宜结合项目阶段观察结构性需求。",
      "sourceIds": [
        "v32-investment"
      ]
    }
  ],
  "generatedAt": "2026-11-24T10:24:04Z",
  "cutoff": "2026-11-20",
  "fingerprint": "release-v34-20261124",
  "origin": "release-ai"
};
