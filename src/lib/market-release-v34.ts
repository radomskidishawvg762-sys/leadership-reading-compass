// Initial published research authored by ChatGPT during the V3.4 release, from the repository's cited public evidence.
// This is an AI-authored release artifact, not a response from the production Worker, and not live market data.
import type {MarketSnapshot} from './market-snapshot';
export const releaseDetails={
  "EV-PUBLIC-001": "河南部分地区水泥报价上涨20—30元/吨，郑州C30报价同期持平；采暖季错峰生产可能延长供给约束。对尚未锁定原料成本的固定价业务，采购成本上涨可能压缩单方盈利空间。河南上半年收入约7502万元，同比下降33.96%；三季度简报列出的五项河南项目签约量合计60.81万方。公司在当地有实际业务，但签约量并不是当前未完成的供货量。若这些合同仍在供货，且售价不能随采购价调整，就值得关注订单利润。",
  "EV-PUBLIC-002": "506家样本企业周发运139.09万方，环比减少5.12%；另一机构全国混凝土价格指数微升0.06%。量缩而价格相对稳定，可能反映季节性施工变化及局部供需分化。两项数据统计样本和时间窗口不同，不宜直接计算量价弹性。集团经营判断应结合各区域同周期的实际销量及订单储备，而非把行业样本降幅等同于集团销量降幅。",
  "EV-PUBLIC-003": "前十个月房企到位资金同比下降21.9%，较前三季度降幅扩大0.3个百分点，新开工面积同比下降24.4%。下游资金与新增施工需求均存在压力，可能影响业务承接和回款节奏。全国统计不代表具体客户信用状态；需结合付款主体、合同首款条件及实际回款判断个别业务。半年报披露公司应收账款净额约225.57亿元，前五大客户应收占39.60%。这是全公司数据，不能等同于房建客户应收。",
  "EV-PUBLIC-004": "全国前十个月基础设施投资同比下降5.1%，航空、水上运输业投资分别增长12.5%。细分领域与整体走势不同，公司上半年城市外基础设施签约773万方，占总签约量15%，说明已有这类业务。投资完成额并非材料采购计划，不能直接换算为商混订单。可结合项目施工阶段、经营区域与可供货条件研究实际需求。",
  "EV-PUBLIC-005": "郑州C30均价258元/方、周度持平，同城散装水泥周涨30元/吨；成都C30均价374元/方、周涨5元。价格反映各地市场采价，不同地区运输与付款条件可能不同，水泥与商混计量单位也不同。集团四川和河南地区公开收入占比可帮助确定观察优先级，但不能据此估算盈利影响。实际判断仍应结合当地采购价格、单方材料用量及合同售价。",
  "EV-PUBLIC-006": "福州公布第八批绿色建材名录，涉及预拌混凝土等30类产品、72家企业；鄂州更新产品信息，包含品类、星级与证书状态。地方清单变化有助于识别招采资格要求，但不代表全国统一门槛，也不证明集团取得订单或资格。建议结合具体项目采购文件及产品证书适用范围，持续观察相关政策。"
} as Record<string,string>;
export const releaseSnapshot:MarketSnapshot={
  "summary": "混凝土需求仍弱，部分地区水泥涨价，但混凝土售价没有跟涨。房建项目回款风险仍值得关注，航空和水运建设投资则有所增长。",
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
      "conclusion": "河南水泥涨价，郑州混凝土售价没涨。如果公司采购价也上涨，不能调价的合同可能少赚钱。",
      "advice": "建议关注河南不能调价的合同，尤其是水泥采购价上涨后，订单还能保留多少利润。",
      "sourceIds": [
        "public-henan",
        "public-winter",
        "public-zhengzhou"
      ]
    },
    {
      "eventId": "EV-PUBLIC-002",
      "conclusion": "行业混凝土发运量下降，价格基本没变，市场需求仍未明显好转。",
      "advice": "建议关注各地实际订单和销量，避免需求不足时安排过多生产。",
      "sourceIds": [
        "public-dispatch",
        "public-price"
      ]
    },
    {
      "eventId": "EV-PUBLIC-003",
      "conclusion": "房企资金和新开工都在减少，新增业务可能更少，客户付款也可能更慢。",
      "advice": "新增房建业务可优先关注客户付款能力、首款安排和垫资金额。",
      "sourceIds": [
        "public-housing",
        "public-housing-sep"
      ]
    },
    {
      "eventId": "EV-PUBLIC-004",
      "conclusion": "基建投资整体下降，但航空和水运建设投资仍在增长。",
      "advice": "建议多关注现有经营区域内的机场、港口及航道建设项目，看看是否有供货机会。",
      "sourceIds": [
        "public-investment"
      ]
    },
    {
      "eventId": "EV-PUBLIC-005",
      "conclusion": "郑州混凝土售价没变，成都有所上涨，各地成本和售价变化并不一致。",
      "advice": "建议分别观察各地采购价和混凝土售价，判断当地订单利润是否受到影响。",
      "sourceIds": [
        "public-zhengzhou",
        "public-chengdu",
        "public-cement-week"
      ]
    },
    {
      "eventId": "EV-PUBLIC-006",
      "conclusion": "福州、鄂州更新了绿色建材清单，当地部分项目可能有新的采购要求。",
      "advice": "建议关注当地招标文件中的绿色建材认证要求，以及现有证书能否满足要求。",
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
  "generatedAt": "2026-11-24T10:37:40Z",
  "cutoff": "2026-11-20",
  "fingerprint": "release-v35-20261124",
  "origin": "release-ai"
};
