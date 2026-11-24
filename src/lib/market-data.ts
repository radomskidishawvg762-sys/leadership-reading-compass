export type EventType = '项目机会' | '客户风险' | '竞争价格' | '政策与交付' | '市场需求' | '区域与财政';
export type Source = { id: string; kind: '外部材料' | '内部快照'; organization: string; title: string; date: string; excerpt: string; context: string; url?: string };
export type Question = { label: string; answer: string; sourceIds: string[]; objectId?: string; aliases?: string[] };
export type MarketEvent = {
  id: string; type: EventType; region: string; date: string; title: string; judgment: string;
  fact: string; relation: string; attention: string; trigger: string; impact: string; pending: string[];
  objects: string[]; sources: string[]; timeline: { date: string; title: string; text: string }[];
  questions: Question[]; risk: boolean; public?: boolean;
};
export type MarketObject = { id: string; name: string; kind: '区域' | '客户' | '项目' | '站点' | '竞争对手'; region: string; description: string; aliases: string[] };
export const snapshotDate = '2026-11-15';
export const objects: MarketObject[] = [
  { id: 'national', name: '全国市场', kind: '区域', region: '全国', description: '按公开材料查看需求和价格变化。', aliases: ['全国市场', '全国', '地产', '发运', '全国需求'] },
  { id: 'henan', name: '河南', kind: '区域', region: '河南', description: '按公开材料查看原料价格和供给变化。', aliases: ['河南', '河南水泥', '郑州', '水泥成本'] },
  { id: 'chongqing', name: '重庆', kind: '区域', region: '重庆', description: '重点经营区域。江北城市更新项目已进入采购窗口，需协调属地供货与投标安排。', aliases: ['重庆', '江北'] },
  { id: 'wuhan', name: '武汉', kind: '区域', region: '武汉', description: '重点经营区域。持续关注合同客户信用变化与冬季生产安排。', aliases: ['武汉', '湖北'] },
  { id: 'chengdu', name: '成都', kind: '区域', region: '成都', description: '重点经营区域。竞对价格条件出现变化，可比口径仍需核实。', aliases: ['成都', '四川'] },
  { id: 'jiangbei', name: '江北城市更新项目', kind: '项目', region: '重庆', description: '虚构项目。总包已中标，本月发布商混采购公告，尚未形成我方已签订单。', aliases: ['江北', '城市更新', '项目', '采购'] },
  { id: 'hengyuan', name: '恒远建设（武汉）有限公司', kind: '客户', region: '武汉', description: '虚构客户。我方合同法人，公开信用事项与内部客户主档统一社会信用代码一致。', aliases: ['恒远', '客户', '信用', '应收'] },
  { id: 'hengyuan-sister', name: '恒远置业（湖北）有限公司', kind: '客户', region: '武汉', description: '虚构企业。与我方客户同属恒远集团，但不是我方签约主体。', aliases: ['恒远置业', '姐妹公司', '恒远集团'] },
  { id: 'ronghe', name: '蓉和建材', kind: '竞争对手', region: '成都', description: '虚构竞对。两条独立渠道提及价格调整，尚未取得同口径正式报价单。', aliases: ['蓉和', '竞对', '对手', '价格', '降价'] },
  { id: 'hanyang', name: '汉阳示例站', kind: '站点', region: '武汉', description: '虚构站点。位于冬季扬尘管理文件适用区域，涉及骨料卸料和车辆冲洗工序。', aliases: ['汉阳', '站点', '政策', '交付'] },
  { id: 'qingshan', name: '青山示例站', kind: '站点', region: '武汉', description: '虚构站点。需核实封闭卸料与冲洗设施运行情况，现有订单交付调整未确认。', aliases: ['青山', '站点', '政策', '交付'] },
  { id: 'tianfu', name: '天府科创园二期', kind: '项目', region: '成都', description: '虚构项目。施工许可已发布，商混采购安排尚未披露。', aliases: ['天府', '科创园'] },
];
export const sources: Source[] = [
  {"id":"v31-nat-1030","kind":"外部材料","organization":"百年建筑网","title":"全国混凝土周报（10.23—10.30）","date":"2026-10-30","excerpt":"C30均价299元/方，水泥价格指数341.14元/吨。","context":"公开市场采价或官方统计；不代表集团成交价或经营结果。","url":"https://www.100njz.com/a/26103018/FB649CB312BF44A6.html"},
  {"id":"v31-nat-1106","kind":"外部材料","organization":"百年建筑网","title":"全国混凝土量价驻底修复（10.30—11.06）","date":"2026-11-06","excerpt":"C30均价300元/方，水泥价格指数344.56元/吨。","context":"公开市场采价或官方统计；不代表集团成交价或经营结果。","url":"https://www.100njz.com/a/26110618/888E0B51111EF8E9.html"},
  {"id":"v31-fund-06","kind":"外部材料","organization":"国家统计局","title":"1—6月全国房地产市场基本情况","date":"2026-07-15","excerpt":"房地产开发企业到位资金累计同比下降20.2%。","context":"公开市场采价或官方统计；不代表集团成交价或经营结果。","url":"https://www.stats.gov.cn/sj/zxfbhjd/202607/t20260715_1964126.html"},
  {"id":"v31-fund-07","kind":"外部材料","organization":"国家统计局","title":"1—7月全国房地产市场基本情况","date":"2026-08-17","excerpt":"房地产开发企业到位资金累计同比下降20.3%。","context":"公开市场采价或官方统计；不代表集团成交价或经营结果。","url":"https://www.stats.gov.cn/sj/zxfb/202608/t20260817_1965053.html"},
  {"id":"v31-fund-08","kind":"外部材料","organization":"国家统计局","title":"1—8月全国房地产市场基本情况","date":"2026-09-15","excerpt":"房地产开发企业到位资金累计同比下降21.0%。","context":"公开市场采价或官方统计；不代表集团成交价或经营结果。","url":"https://www.stats.gov.cn/sj/zxfb/202609/t20260915_1965310.html"},
  {"id":"v31-wuhan","kind":"外部材料","organization":"百年建筑网","title":"武汉混凝土价格小幅下行（11.13—11.20）","date":"2026-11-20","excerpt":"C30均价245元/方，周跌5元/方。","context":"公开市场采价或官方统计；不代表集团成交价或经营结果。","url":"https://www.100njz.com/a/26112015/17DBE9A5FC525C71.html"},
  {"id":"v31-chongqing","kind":"外部材料","organization":"百年建筑网","title":"重庆混凝土价格小幅上涨（11.13—11.20）","date":"2026-11-20","excerpt":"C30均价300元/方，周涨20元/方；P.O42.5散装水泥均价370元/吨，周涨50元/吨。","context":"公开市场采价或官方统计；不代表集团成交价或经营结果。","url":"https://www.100njz.com/a/26112015/56B35A3A2A23EE9E.html"},
  {"id":"v31-hefei","kind":"外部材料","organization":"百年建筑网","title":"安徽混凝土弱势态势难改（11.13—11.20）","date":"2026-11-20","excerpt":"合肥C30均价334元/方，周环比持平。","context":"公开市场采价或官方统计；不代表集团成交价或经营结果。","url":"https://www.100njz.com/a/26112017/2EAE297D050BE802.html"},
  {"id":"v31-jinan","kind":"外部材料","organization":"百年建筑网","title":"济南混凝土本周下跌（11.13—11.20）","date":"2026-11-20","excerpt":"C30均价364.33元/方，周环比下降0.55%。","context":"公开市场采价或官方统计；不代表集团成交价或经营结果。","url":"https://www.100njz.com/a/26111814/7F93B3DE9EF4DAE1.html"},
  {"id":"v31-xian","kind":"外部材料","organization":"百年建筑网","title":"西安混凝土价格持稳运行（11.13—11.20）","date":"2026-11-20","excerpt":"C30均价235元/方，周环比持平。","context":"公开市场采价或官方统计；不代表集团成交价或经营结果。","url":"https://www.100njz.com/a/26112017/7A9EEBF5E45AD4BE.html"},
  {"id":"v31-fuzhou","kind":"外部材料","organization":"百年建筑网","title":"福州混凝土发运量略有下滑（11.13—11.20）","date":"2026-11-20","excerpt":"C30均价307元/方，同比下降5.63%。","context":"公开市场采价或官方统计；不代表集团成交价或经营结果。","url":"https://www.100njz.com/a/26112014/9B7C65F572A8AFD9.html"},
  {"id":"v30-util-1027","kind":"外部材料","organization":"百年建筑网","title":"506家混凝土企业发运量调查（10.21—10.27）","date":"2026-10-28","excerpt":"样本产能利用率7.04%，较上一周提升0.10个百分点。","context":"公开市场或年度披露口径，非集团实时经营台账；观测期见指标。","url":"https://www.100njz.com/a/26102808/1E5DA9527E61AB50.html"},
  {"id":"v30-util-1103","kind":"外部材料","organization":"百年建筑网","title":"506家混凝土企业发运量调查（10.28—11.03）","date":"2026-11-04","excerpt":"样本产能利用率7.32%，周环比提高0.28个百分点。","context":"公开市场或年度披露口径，非集团实时经营台账；观测期见指标。","url":"https://www.100njz.com/a/26110323/D86B3D824965EAFC.html"},
  {"id":"v30-util-1110","kind":"外部材料","organization":"百年建筑网","title":"506家混凝土企业发运量调查（11.04—11.10）","date":"2026-11-11","excerpt":"样本产能利用率7.32%，周环比持平。","context":"公开市场或年度披露口径，非集团实时经营台账；观测期见指标。","url":"https://www.100njz.com/a/26111020/94BA79EED4E0E590.html"},
  {"id":"v30-util-1117","kind":"外部材料","organization":"百年建筑网","title":"506家混凝土企业发运量调查（11.11—11.17）","date":"2026-11-18","excerpt":"样本产能利用率6.94%，周环比下降0.38个百分点。","context":"公开市场或年度披露口径，非集团实时经营台账；观测期见指标。","url":"https://www.100njz.com/a/26111717/82AB7F62DF6A231C.html"},
  {"id":"v30-c30-1113","kind":"外部材料","organization":"百年建筑网","title":"全国混凝土周报（11.06—11.13）","date":"2026-11-13","excerpt":"全国C30市场均价300元/方。","context":"公开市场或年度披露口径，非集团实时经营台账；观测期见指标。","url":"https://www.100njz.com/a/26111317/E80D2C1626741824.html"},
  {"id":"v30-c30-1120","kind":"外部材料","organization":"百年建筑网","title":"全国混凝土原材料价格涨跌互现（11.13—11.20）","date":"2026-11-20","excerpt":"全国C30市场均价300元/方，周环比持平。","context":"公开市场或年度披露口径，非集团实时经营台账；观测期见指标。","url":"https://www.100njz.com/a/26112017/41E843D00A9B03EA.html"},
  {"id":"v30-cement-1113","kind":"外部材料","organization":"百年建筑网","title":"11月13日水泥市场行情（全国指数）","date":"2026-11-13","excerpt":"全国水泥价格指数CEMPI为344.32。","context":"公开市场或年度披露口径，非集团实时经营台账；观测期见指标。","url":"https://www.100njz.com/m/26111311/9A15AD9F4CF08190.html"},
  {"id":"v30-sand","kind":"外部材料","organization":"百年建筑网","title":"全国砂石周报（11.14—11.20）","date":"2026-11-20","excerpt":"全国砂石综合均价82.50元/吨，周环比下降0.18%。","context":"公开市场或年度披露口径，非集团实时经营台账；观测期见指标。","url":"https://www.100njz.com/a/26112019/F36137943B2779C6.html"},
  {"id":"v30-slag","kind":"外部材料","organization":"百年建筑网","title":"国内矿渣粉价格周报（11.13—11.20）","date":"2026-11-20","excerpt":"截至11月20日，22个重点城市S95矿渣粉均价157.1元/吨，较上周小幅下跌。","context":"公开市场或年度披露口径，非集团实时经营台账；观测期见指标。","url":"https://www.100njz.com/a/26112018/1DC280C3FB16DA6F.html"},
  {"id":"v30-peer","kind":"外部材料","organization":"观研报告网","title":"2025年上市商混企业经营比较","date":"2026-05-08","excerpt":"公开披露企业中，中国建材、西部建设、海南瑞泽商混销量分别为7577.50、5792.77、204.72万方。","context":"公开市场或年度披露口径，非集团实时经营台账；观测期见指标。","url":"https://www.chinabaogao.com/jingzheng/202605/794791.html"},
  {"id":"v30-peer-own","kind":"外部材料","organization":"中证网","title":"西部建设2025年年报经营数据","date":"2026-04-03","excerpt":"2025年预拌混凝土销量5792.77万方，同比下降1.56%。","context":"公开市场或年度披露口径，非集团实时经营台账；观测期见指标。","url":"https://www.cs.com.cn/ssgs/01/2026/04/03/detail_2026040310001231.html"},
  {"id":"v30-peer-hn","kind":"外部材料","organization":"海南瑞泽2025年年报公告","title":"2025年度报告全文","date":"2026-04-22","excerpt":"混凝土销量204.72万立方米，同比下降2.52%。","context":"公开市场或年度披露口径，非集团实时经营台账；观测期见指标。","url":"https://money.finance.sina.com.cn/corp/view/vCB_AllBulletinDetail.php?id=12133176&stockid=002596"},
  { id:'public-investment', kind:'外部材料', organization:'国家统计局', title:'2026年1—10月份全国固定资产投资基本情况', date:'2026-11-16', excerpt:'前十个月全国基础设施投资同比下降 5.1%。同一统计口径下，航空运输业和水上运输业投资分别增长 12.5%。', context:'累计同比。投资完成额用于看行业结构，不能直接换算成商混用量。', url:'https://www.stats.gov.cn/sj/zxfb/202611/t20261116_1965841.html' },
  { id:'public-cement-week', kind:'外部材料', organization:'百年建筑网 · 水泥周报', title:'全国水泥价格小幅上涨（11月13—20日）', date:'2026-11-20', excerpt:'11 月 20 日全国水泥价格指数为 345.58 元/吨，较 11 月 13 日上涨 0.37%。周报记录华中、西南领涨，华东下跌。', context:'机构采价，价格指数与区域实际到货价口径不同。', url:'https://www.100njz.com/a/26112016/C392039ECE3C44CC.html' },
  { id:'public-zhengzhou', kind:'外部材料', organization:'百年建筑网 · 郑州混凝土周报', title:'郑州混凝土发运量开始回升（11月13—20日）', date:'2026-11-20', excerpt:'郑州 C30 混凝土均价为 258 元/立方米，周度持平。同城 P.O42.5 散装水泥均价为 340 元/吨，周涨 30 元/吨。', context:'市场采价。混凝土和水泥的计量单位不同，不可直接相减。', url:'https://www.100njz.com/a/26112017/0F993FD0FB4C7082.html' },
  { id:'public-chengdu', kind:'外部材料', organization:'百年建筑网 · 成都混凝土周报', title:'成都混凝土成本持续增加（11月13—20日）', date:'2026-11-20', excerpt:'成都 C30 混凝土均价报 374 元/立方米，较上周上涨 5 元/立方米。行情周报同时记录当地样本出货偏低。', context:'两个城市分别采用各自的市场采价，优先看本地同一周变化。跨城市绝对价格比较需核对运距、税费及付款条件。', url:'https://www.100njz.com/a/26112015/9ED59BB92260C18D.html' },
  { id:'public-fuzhou-green', kind:'外部材料', organization:'福州市住房和城乡建设局等三部门', title:'福州市绿色建材产品信息名录（第八批）发布通知', date:'2026-11-16', excerpt:'第八批名录纳入 72 家企业，涉及预拌混凝土等 30 类产品。', context:'72 家为全部材料类别企业合计，具体招采条件看项目文件。', url:'https://zjj.fuzhou.gov.cn/zwgk/tzgg/202611/t20261116_5393717.htm' },
  { id:'public-ezhou-green', kind:'外部材料', organization:'鄂州市住房和城市更新局', title:'鄂州市绿色建材产品信息公告（2026年第二批）', date:'2026-11-18', excerpt:'更新的清单含预拌混凝土，并列明产品类型、星级与证书状态。公告要求相关单位采购或使用绿色建材时查验产品信息和合格性。', context:'地方信息清单只适用于相关市场，不能视为全国统一采购门槛。', url:'https://cjw.ezhou.gov.cn/zxzx/gsgg/202611/t20261119_795785.html' },
  {"id": "public-dispatch", "kind": "外部材料", "organization": "百年建筑网 · 调研", "title": "506 家混凝土企业发运量调查（11 月 11—17 日）", "date": "2026-11-18", "excerpt": "506 家样本共发运 139.09 万方，周环比下降 5.12%。这是样本发运量，统计期与价格指数周评并不完全重合。", "context": "据公开资料整理。文中行业数据与我方经营数据口径不同。", "url": "https://www.100njz.com/a/26111717/82AB7F62DF6A231C.html"},
  {"id": "public-price", "kind": "外部材料", "organization": "中国水泥网行情数据中心", "title": "全国混凝土市场周评（11月16—20日）", "date": "2026-11-20", "excerpt": "全国混凝土价格指数为87.05，较上期上升0.06%。东北工程陆续收尾，中南和西南的原料涨价尚难充分反映到混凝土售价。指数为该机构监测口径。", "context": "据公开资料整理。文中行业数据与我方经营数据口径不同。", "url": "https://data.ccement.com/Report/Detail/65161498585995002.html"},
  {"id": "public-henan", "kind": "外部材料", "organization": "百年建筑网", "title": "河南水泥周评（11月13—20日）", "date": "2026-11-20", "excerpt": "据该机构的区域采价，河南多地水泥每吨上调20至30元。11月15日起，多数熟料生产线开始错峰停窑。实际采购合同价格需另行核实。", "context": "据公开资料整理。文中行业数据与我方经营数据口径不同。", "url": "https://www.100njz.com/a/26112018/304B7F7268B7D9D0.html"},
  {"id": "public-winter", "kind": "外部材料", "organization": "百年建筑网 · 行情解读", "title": "河南水泥行业采暖季错峰安排及市场跟踪", "date": "2026-11-16", "excerpt": "据百年建筑网转述，河南采暖季错峰生产窗口从 2026 年 11 月 15 日至 2027 年 3 月 15 日。具体生产安排依各企业适用要求为准。", "context": "据公开资料整理。文中行业数据与我方经营数据口径不同。", "url": "https://www.100njz.com/a/26111615/5621387943133B84.html"},
  {"id": "public-housing", "kind": "外部材料", "organization": "国家统计局", "title": "全国房地产市场基本情况（1—10月）", "date": "2026-11-16", "excerpt": "全国房地产开发企业前十个月新开工房屋面积为3.70亿平方米，同比减少24.4%；到位资金同比减少21.9%。", "context": "据公开资料整理。文中行业数据与我方经营数据口径不同。", "url": "https://www.stats.gov.cn/sj/zxfbhjd/202611/t20261116_1965840.html"},
  {"id": "public-housing-sep", "kind": "外部材料", "organization": "国家统计局", "title": "全国房地产市场基本情况（1—9月）", "date": "2026-10-19", "excerpt": "前三季度房屋新开工面积同比下降24.9%，房地产开发企业到位资金同比下降21.6%。两项均为全国累计口径。", "context": "据公开资料整理。文中行业数据与我方经营数据口径不同。", "url": "https://www.stats.gov.cn/zwfwck/sjfb/202610/t20261019_1965615.html"},

  { id: 'cq-oct', kind: '内部快照', organization: '集团示例经营快照 · 重庆区域', title: '江北项目十月跟踪记录', date: '2026-10-02', excerpt: '江北城市更新项目列入重庆示例公司跟踪清单。采购主体、招标时间及我方份额尚未确定，未记录已签商混订单。', context: '十月初跟踪基线。后续总包中标与材料采购为同一项目的新进展。' },
  { id: 'hy-oct', kind: '内部快照', organization: '集团示例经营快照 · 客户主档', title: '恒远建设十月合同主体匹配记录', date: '2026-10-08', excerpt: '恒远建设（武汉）有限公司列入武汉示例公司重点客户清单，合同统一社会信用代码为示例91420100HYJS0001。本期只记录主体匹配，未提供账龄、逾期金额或信用异常结论。', context: '内部主档匹配为经营跟踪进展，不是外部信用异常。' },
  { id: 'cd-oct', kind: '内部快照', organization: '集团示例经营快照 · 成都区域', title: '成都东部片区十月竞对清单', date: '2026-10-15', excerpt: '蓉和建材为成都东部片区在册竞对，关联成都示例公司部分在跟踪项目。尚未记录同规格、同运距、同付款账期的正式报价。', context: '十月竞对关联基线，不能据此测算收入和利润损失。' },
  { id: 'wh-oct', kind: '内部快照', organization: '集团示例经营快照 · 武汉区域', title: '武汉站点十月政策跟踪记录', date: '2026-10-09', excerpt: '武汉示例公司跟踪冬季扬尘管理征求意见稿。适用站点需待正式文件和站点清单复核，未确认生效时间、停产安排或订单调整。', context: '草案不代表已生效要求，不认定为全面停产或停供。' },
  { id: 'cq-award', kind: '外部材料', organization: '重庆示例项目采购中心', title: '江北城市更新项目总承包中标公告', date: '2026-10-22', excerpt: '江北城市更新项目总承包中标人为重庆启川建设有限公司。项目总投资约18亿元，工程范围包含住宅、公建及配套设施。混凝土材料采购将由总承包单位另行组织。', context: '项目总投资为建设投资规模，不是商混合同金额；公告未披露混凝土采购量。' },
  { id: 'cq-tender', kind: '外部材料', organization: '重庆启川建设示例采购平台', title: '江北城市更新项目预拌混凝土采购公告', date: '2026-11-19', excerpt: '本次采购预拌混凝土，暂估用量12万立方米，以实际结算量为准。主要规格C30、C35，计划供货期2026年12月至2027年10月。投标截止时间为2026年11月27日17:00。', context: '暂估用量为采购方口径，不代表我方获取份额，也不代表已签订单。' },
  { id: 'cq-snapshot', kind: '内部快照', organization: '集团示例经营快照 · 重庆区域', title: '重庆区域项目跟踪清单及订单快照', date: snapshotDate, excerpt: '项目编号CQ-P-026：江北城市更新项目，属地跟踪单位为重庆示例公司，状态为总包中标后跟进。该项目我方已签商混订单0立方米。江北示例站、渝北示例站列为候选可供站点，运输距离和供货能力尚待核实。', context: '快照截至2026年11月15日。候选站点不等于已确认的供货安排。' },
  { id: 'hy-credit', kind: '外部材料', organization: '武汉示例信用公示中心', title: '恒远建设（武汉）有限公司执行信息公示', date: '2026-11-18', excerpt: '被执行人：恒远建设（武汉）有限公司；统一社会信用代码：示例91420100HYJS0001；本次公示案件执行标的680万元，立案日期2026年11月17日。', context: '公开案件执行标的属于司法事项，不是我方损失或我方应收金额。企业与信用代码均为虚构示例。' },
  { id: 'hy-snapshot', kind: '内部快照', organization: '集团示例经营快照 · 客户与应收', title: '恒远建设合同主体及应收余额快照', date: snapshotDate, excerpt: '合同签约主体：恒远建设（武汉）有限公司；统一社会信用代码：示例91420100HYJS0001。对应我方单位：武汉示例公司；应收余额1,260万元。本期未提供账龄、逾期明细及担保措施明细。', context: '应收余额不等于逾期金额。本快照不能确认逾期金额或预计损失。' },
  { id: 'hy-sister', kind: '外部材料', organization: '湖北示例企业信息中心', title: '恒远置业（湖北）有限公司诉讼信息', date: '2026-10-29', excerpt: '涉事企业为恒远置业（湖北）有限公司，统一社会信用代码示例91420100HYZY0002，与恒远建设（武汉）有限公司同属恒远集团。本次公开案件涉及金额430万元。', context: '同集团关系不代表同一合同法人，不能直接归属我方客户暴露。' },
  { id: 'hy-master', kind: '内部快照', organization: '集团示例经营快照 · 客户主档', title: '恒远集团关联企业合同匹配记录', date: '2026-10-31', excerpt: '我方签约客户为恒远建设（武汉）有限公司。恒远置业（湖北）有限公司在本期客户主档中无直接签约合同，未配置该法人名下应收数据。关联担保及资金往来信息尚未核实。', context: '只能确认集团关联；不能将姐妹公司案件金额或其他法人应收作为涉事法人暴露。' },
  { id: 'cd-price-a', kind: '外部材料', organization: '成都示例渠道A · 独立访谈记录', title: '蓉和建材成都东部片区报价变动线索', date: '2026-10-16', excerpt: '渠道A反馈：蓉和建材C30普通混凝土报价较前期每立方米下降15元，称报价含税。运输费是否包含、适用运距、付款账期未说明，未提供盖章正式报价。', context: '仅单一来源。口述价格线索不构成同条件可比报价，也不能确认区域普遍降价。' },
  { id: 'cd-price-b', kind: '外部材料', organization: '成都示例渠道B · 独立项目访谈', title: '蓉和建材价格变化第二渠道核实记录', date: '2026-11-16', excerpt: '独立渠道B反馈同一片区蓉和建材C30含税报价每立方米下降约15元，报价适用于30公里以内运输，要求月结且次月支付。是否另计泵送费、渠道A口径是否一致尚未核实。', context: '第二个独立来源支持降价线索，但规格细项、运费和付款条件仍需同口径核对。' },
  { id: 'cd-snapshot', kind: '内部快照', organization: '集团示例经营快照 · 成都区域', title: '成都东部片区竞对与项目关联清单', date: snapshotDate, excerpt: '蓉和建材为成都东部片区在册竞对，与我方成都示例公司部分在跟踪项目的运输范围有交集。未提供我方同规格、同运距、同账期报价或已签订单毛利数据。', context: '缺少可比报价及销量数据，不能测算我方收入或利润损失。' },
  { id: 'wh-draft', kind: '外部材料', organization: '武汉示例生态环境管理办公室', title: '冬季扬尘管理措施（征求意见稿）', date: '2026-10-09', excerpt: '拟对适用区域内搅拌站骨料卸料与车辆清洗工序加强管理。征求意见截止日期2026年10月23日，具体实施时间以正式文件为准。', context: '本材料是征求意见稿，不是已生效政策。' },
  { id: 'wh-policy', kind: '外部材料', organization: '武汉示例生态环境管理办公室', title: '冬季搅拌站扬尘管理措施（正式文件）', date: '2026-11-12', excerpt: '本措施自2026年12月1日起施行，适用于汉阳区、青山区指定区域内预拌混凝土站点。骨料卸料须在封闭条件下进行，出场车辆须完成冲洗，重污染天气期间具体调度按预警通知执行。', context: '正式文件替代征求意见稿。文件未要求所有适用站点统一停产。不得推断为全面停供。' },
  { id: 'wh-sites', kind: '内部快照', organization: '集团示例经营快照 · 武汉区域', title: '适用区域站点匹配及交付安排快照', date: snapshotDate, excerpt: '适用区域内匹配汉阳示例站、青山示例站，属地单位为武汉示例公司。需复核封闭卸料、车辆冲洗工序。两站现有供货合同调度调整、跨站代供能力及客户告知方案尚未确认。', context: '只确认适用范围与工序，不能确认停产天数、交付损失或已落实代供。' },
  { id: 'tf-permit', kind: '外部材料', organization: '成都示例建设项目服务中心', title: '天府科创园二期施工许可信息', date: '2026-11-05', excerpt: '天府科创园二期项目于2026年11月5日取得施工许可，建筑面积约8万平方米。建设单位为天府启新置业有限公司。尚未披露商混采购公告及采购量。', context: '建筑面积不等于混凝土用量，不能直接换算我方订单。' },
  { id: 'tf-snapshot', kind: '内部快照', organization: '集团示例经营快照 · 成都区域', title: '天府科创园项目跟踪记录', date: snapshotDate, excerpt: '天府科创园二期已在成都示例公司项目跟踪清单内，状态为施工许可后跟进，未形成我方已签订单；采购主体与商混招标时间待核。', context: '内部跟踪记录不代表确定中标或已形成订单。' },
];
export const events: MarketEvent[] = [
  {
    id:'EV-PUBLIC-004', public:true, type:'区域与财政', region:'全国', date:'2026-11-16', risk:false,
    title:'前十个月基建投资下降，航空、水运投资仍增长',
    judgment:'基建各领域表现有分化，项目机会要按区域和工程阶段判断。',
    fact:'前十个月，全国基础设施投资同比下降 5.1%，同期航空运输业和水上运输业投资分别增长 12.5%。',
    relation:'投资数据可以帮助筛选跟踪方向。可承接业务还需匹配经营区域、施工节点和材料采购公告。',
    attention:'关注集团经营区域内实际进入招标或施工环节的交通工程。',
    trigger:'国家统计局发布前十个月投资数据。',
    impact:'投资增幅提示结构性机会。可供货方量须结合工程类型、材料采购和覆盖范围进一步核对。',
    pending:['当地项目是否进入实际材料采购阶段。'],
    objects:['national'], sources:['public-investment'],
    timeline:[{date:'2026-11-16',title:'发布前十个月投资数据',text:'基建整体同比下降，航空运输和水上运输投资同比增长。'}],
    questions:[{label:'投资增长能看出商混订单吗？',answer:'投资统计可以提示跟踪方向。订单判断还需要具体项目的施工节点、采购公告及集团可供货范围。',sourceIds:['public-investment'],aliases:['混凝土订单','商混订单','港口','机场']}],
  },
  {
    id:'EV-PUBLIC-005', public:true, type:'竞争价格', region:'郑州、成都', date:'2026-11-20', risk:false,
    title:'郑州 C30 混凝土周价持平，成都每方上涨 5 元',
    judgment:'两地混凝土售价表现不同，原料涨幅能传到售价的幅度也要分市场观察。',
    fact:'百年建筑网 11 月 20 日周报记录，郑州 C30 均价 258 元/立方米、周度持平，同城 P.O42.5 散装水泥周涨 30 元/吨；成都 C30 均价 374 元/立方米、周涨 5 元/立方米。',
    relation:'同城相同规格的周度变动可以作方向判断。跨地区比较绝对价格需核对配送、税费、付款条件及采样口径。',
    attention:'在各自区域核对实际水泥到货价和可调整售价的订单，再看成本传导。',
    trigger:'同一机构发布两地混凝土周报。',
    impact:'郑州监测样本显示原料上涨而 C30 持平。成都监测样本售价有所上升。集团毛利变化仍需内部实际采购和成交数据。',
    pending:['各区域同规格、同条件的实际到货和成交记录。'],
    objects:['henan','chengdu'], sources:['public-zhengzhou','public-chengdu','public-cement-week'],
    timeline:[{date:'2026-11-20',title:'两地行情周报发布',text:'郑州混凝土周价持平，成都混凝土周价上涨。'}],
    questions:[{label:'可以直接比较两地利润吗？',answer:'当前可比较两地各自的周价方向。判断利润需要实际成交价、原料消耗和到货成本，并统一运距及税费。',sourceIds:['public-zhengzhou','public-chengdu'],aliases:['利润','毛利','为什么不直接比较','价差']}],
  },
  {
    id:'EV-PUBLIC-006', public:true, type:'政策与交付', region:'福州、鄂州', date:'2026-11-18', risk:false,
    title:'福州、鄂州更新绿色建材清单，涉及预拌混凝土',
    judgment:'地方绿色建材信息进一步细化，跟踪当地政府采购时可同时核对证书和项目要求。',
    fact:'福州 11 月 16 日发布第八批绿色建材产品名录，覆盖预拌混凝土等 30 类产品、72 家企业。鄂州 11 月 18 日更新产品信息清单，列明预拌混凝土的品类、星级和证书状态。',
    relation:'适用于相关地区的市场跟踪。集团现有产品和证书能否满足某个项目要求，需按招采文件核对。',
    attention:'关注当地项目对产品种类、认证等级和证书有效期的具体要求。',
    trigger:'两地主管部门公布更新后的绿色建材信息。',
    impact:'清单帮助核对当地供应和产品资质。是否具备具体项目参与条件，以当地招采文件为准。',
    pending:['具体项目是否要求特定等级或有效期的认证。'],
    objects:[], sources:['public-fuzhou-green','public-ezhou-green'],
    timeline:[{date:'2026-11-16',title:'福州公布第八批名录',text:'名录包含预拌混凝土等产品。'},{date:'2026-11-18',title:'鄂州公布第二批清单',text:'公告要求采购及使用单位核验产品信息。'}],
    questions:[{label:'名录是全国统一的投标门槛吗？',answer:'材料记录福州、鄂州各自发布的地方清单。具体投标和产品证书要求应查当地相关规定及项目招采文件。',sourceIds:['public-fuzhou-green','public-ezhou-green'],aliases:['全国','投标门槛','证书要求']}],
  },
  {
    id: 'EV-PUBLIC-001', public: true, type: '竞争价格', region: '河南', date: '2026-11-20', risk: false,
    title: '河南部分地区水泥报价每吨上涨 20—30 元',
    judgment: '固定价合同可能面临成本压力，经营影响取决于各区域实际采购价。',
    fact: '11 月 20 日，百年建筑网周评记录河南多地水泥报价每吨上调 20—30 元。',
    relation: '固定售价、原料尚未锁价的订单可能承压。我方实际到货价和毛利变化待核。',
    attention: '请河南区域汇总未来两周固定价订单的单方成本和预计毛利。若达到已批准的亏损预警线，提请分管领导定报价策略。',
    trigger: '公开行情出现区域性上涨。',
    impact: '公开涨幅基于地区采价，无法据此确定我方成本增幅或订单损失。',
    pending: ['采购核对实际到货价格。', '区域汇总固定价合同已锁价比例及未来两周的毛利变化。'],
    objects: ['henan'], sources: ['public-henan','public-winter','public-cement-week','public-zhengzhou'],
    timeline: [{date:'2026-11-20',title:'河南水泥报价上涨',text:'百年建筑网记录河南部分地区水泥报价每吨上涨 20—30 元。'}],
    questions: [
      {label:'这会压低河南区域毛利吗？',answer:'固定价订单可能承压。报价涨幅是公开采价。我方毛利要看采购到货价、单位用量和未交付订单，现有材料无法确认实际损失。',sourceIds:['public-henan','public-winter'],objectId:'henan',aliases:['毛利影响','成本影响','固定价订单','利润会少多少']},
      {label:'涨价范围有多大？',answer:'材料记录的是河南部分地区报价变动，不能由此判断河南全省或全国都在涨。实际采购价要看当地合同和到货价。',sourceIds:['public-henan'],objectId:'henan',aliases:['全省涨价','全省统一涨价','哪里涨价','每吨涨了多少','全国都在涨','全国都涨','都在涨价']},
    ],
  },
  {
    id: 'EV-PUBLIC-002', public: true, type: '市场需求', region: '全国', date: '2026-11-20', risk: false,
    title: '样本混凝土发运量下降，全国价格指数基本持平',
    judgment: '全国需求信号偏弱，各区域排产仍须看已确认的订单。',
    fact: '506 家样本的周发运量环比降 5.12%。11 月 20 日全国混凝土价格指数较上周升 0.06%。',
    relation: '发运量与价格来自不同样本，集团销量和区域价格需另据实际业务记录核对。',
    attention: '分管领导先看各区域未来两周已经确认的供货量，再判断哪些区域需要调整排产。',
    trigger: '公开发运调查与价格周评更新。',
    impact: '市场发运样本走弱，价格指数变化小。对我方排产、价格或利润的实际影响需分区域确认。',
    pending: ['各区域已确认订单和未来两周供货计划。'],
    objects: ['national'], sources: ['public-dispatch','public-price'],
    timeline: [{date:'2026-11-18',title:'样本发运量下降',text:'百年建筑网监测的 506 家样本周发运量减少 5.12%。'},{date:'2026-11-20',title:'混凝土价格指数基本持平',text:'全国混凝土价格指数较上周上升 0.06%。'}],
    questions: [
      {label:'发运少了就说明集团销量下降吗？',answer:'发运量下降 5.12% 来自 506 家行业样本，现有来源没有集团同期销量数据。应按统一周期核对区域销量。',sourceIds:['public-dispatch'],objectId:'national',aliases:['集团销量','咱们卖得少了吗','集团也下降了吗']},
      {label:'全国价格同期有下跌吗？',answer:'全国混凝土价格指数较上周上升 0.06%，总体基本持平。价格和发运统计范围不同。',sourceIds:['public-price','public-dispatch'],objectId:'national',aliases:['混凝土价格变了吗','价格涨跌','全国价格']},
    ],
  },
  {
    id: 'EV-PUBLIC-003', public: true, type: '市场需求', region: '全国', date: '2026-11-16', risk: false,
    title: '前十个月房企到位资金同比下降 21.9%',
    judgment: '房建业务立项时，资金来源和首款日需要先落实。',
    fact: '国家统计局公布，前十个月房屋新开工面积同比降 24.4%，房企到位资金同比降 21.9%。',
    relation: '全国数据用于判断市场环境。单个项目的回款条件要按合同和客户核查。',
    attention: '关注待签房建订单的首款约定、预计垫资和该签约方已有的到期未收款。',
    trigger: '全国房地产市场月度数据更新。',
    impact: '新增房建单是否值得承接，应同时看预计供货、垫资和资金回笼。',
    pending: ['拟签合同付款主体、垫资上限和首付款日。'],
    objects: ['national'], sources: ['public-housing','public-housing-sep'],
    timeline: [{date:'2026-11-16',title:'统计局公布前十个月房地产数据',text:'房屋新开工面积和房企到位资金继续同比下降。'}],
    questions: [{label:'全国数据能判断某客户会拖欠吗？',answer:'现有数据统计全国房企到位资金。判断单个客户的风险需要合同、客户付款记录和最新应收。',sourceIds:['public-housing'],objectId:'national',aliases:['客户会拖欠','某家客户回款','对单个项目'] }],
  },
  {
    id: 'EV-2026-001', type: '项目机会', region: '重庆', date: '2026-11-19', risk: false,
    title: '重庆江北城市更新项目进入商混采购阶段',
    judgment: '从总包中标推进到材料采购，属地已有跟踪记录，投标窗口需要及时核实。',
    fact: '11月19日新发布商混采购公告，暂估用量12万立方米；上月该项目仍处于总包中标阶段。',
    relation: '项目已在重庆区域跟踪清单内，投标截止为11月27日；我方尚无已签订单。',
    attention: '重庆区域在投标截止前报可供量、目标毛利及付款条件；确需跨单位保供时请集团协调。',
    trigger: '重庆区域跟踪的项目已发布商混采购公告，11 月 27 日截标。',
    impact: '主要影响规模与订单、产能与交付。总投资18亿元是项目建设规模；12万立方米是采购暂估量；我方已签订单为0立方米（截至2026年11月15日）。三者不能互相替代。',
    pending: ['江北、渝北候选站点的实际运输距离与可用产能。', '投标主体、报价审批和供货节奏尚未确认。', '预计采购量以实际结算为准，我方份额尚无已核实数据。'],
    objects: ['chongqing', 'jiangbei'], sources: ['cq-tender', 'cq-award', 'cq-snapshot', 'cq-oct'],
    timeline: [
      { date: '2026-10-02', title: '项目进入区域跟踪清单', text: '属地确认江北城市更新项目线索，采购主体及时间未披露。' },
      { date: '2026-10-22', title: '总承包中标公告披露', text: '项目总投资约18亿元，商混采购由总包另行组织。' },
      { date: '2026-11-19', title: '商混采购公告发布', text: '暂估用量12万立方米，投标截止11月27日17:00。' },
    ],
    questions: [
      { label: '具体影响哪个区域和单位？', answer: '直接关联重庆区域及重庆示例公司。内部跟踪清单已匹配同一项目；江北、渝北为候选站点，实际运距和可用产能仍待核实，并非已确认供货安排。', sourceIds: ['cq-snapshot', 'cq-tender'], objectId: 'chongqing' },
      { label: '12万方就是我们的订单吗？', answer: '不是。12万立方米是采购公告的暂估采购量；18亿元是项目总投资。截至2026年11月15日内部快照，我方已签订单为0立方米，不能将项目投资或预计用量当作我方订单。', sourceIds: ['cq-tender', 'cq-award', 'cq-snapshot'], objectId: 'jiangbei' },
    ],
  },
  {
    id: 'EV-2026-002', type: '客户风险', region: '武汉', date: '2026-11-18', risk: true,
    title: '武汉恒远建设新增执行案件，我方有在账应收',
    judgment: '主体匹配已确认，应收余额可核对；逾期规模和实际损失仍不能判断。',
    fact: '11月18日公开执行信息涉及恒远建设（武汉）有限公司，案件执行标的680万元。',
    relation: '信用代码与我方签约主体一致；截至11月15日，应收余额1,260万元。',
    attention: '请分管负责人让财资会前补齐账龄、逾期金额和下一次到账计划，再提请决定是否调整新增授信。',
    trigger: '公开执行记录涉及我方签约客户。武汉区域需核查账龄和回款计划。',
    impact: '主要影响现金与风险、市场与客户。我方应收余额1,260万元（截至2026年11月15日）可确认；逾期金额、预计损失尚无已核实数据。680万元是公开案件标的，不是我方损失。',
    pending: ['本期快照缺少应收账龄及逾期明细。', '回款计划、担保措施及是否影响新增授信仍待属地确认。'],
    objects: ['wuhan', 'hengyuan'], sources: ['hy-credit', 'hy-snapshot', 'hy-oct'],
    timeline: [
      { date: '2026-10-08', title: '合同主体完成匹配', text: '恒远建设（武汉）有限公司列入区域重点客户跟踪清单。' },
      { date: '2026-11-18', title: '新增执行信息', text: '统一社会信用代码与我方合同客户一致，触发客户风险专报。' },
    ],
    questions: [
      { label: '涉事公司就是我们的签约主体吗？', aliases:['合同主体','签约主体','是同一家公司'], answer: '是。公开执行信息与内部客户主档的名称、统一社会信用代码均一致，匹配的是恒远建设（武汉）有限公司，不是恒远置业（湖北）有限公司。直接关联武汉示例公司。', sourceIds: ['hy-credit', 'hy-snapshot'], objectId: 'hengyuan' },
      { label: '这笔应收中有多少已逾期？', aliases:['逾期','账龄'], answer: '截至该期快照，可确认应收余额1,260万元；逾期金额尚无已核实数据。本期没有账龄或逾期明细，不能用应收余额代替逾期金额，也不能把公开案件标的680万元当成我方损失。', sourceIds: ['hy-snapshot', 'hy-credit'], objectId: 'hengyuan' },
    ],
  },
  {
    id: 'EV-2026-003', type: '竞争价格', region: '成都', date: '2026-11-16', risk: false,
    title: '成都竞对每方降价15元线索获第二来源支持',
    judgment: '降价线索得到交叉支持，但运费和付款条件尚未完全可比。',
    fact: '11月16日第二个独立渠道提及蓉和建材C30含税报价每方下降约15元。',
    relation: '竞对与我方成都东部片区在跟踪项目存在运输范围交集。',
    attention: '先核对规格、运费及付款账期，再判断是否需要调整报价策略。',
    trigger: '同一区域在册竞对的价格线索新增第二个独立来源。',
    impact: '主要影响盈利与价格、市场与客户。降幅约15元/立方米为渠道线索；我方同条件报价和销量数据缺失，不能据此测算收入或毛利损失。',
    pending: ['C30细项与泵送费是否一致。', '渠道A未说明运费和付款条件，不能与渠道B直接比较。', '尚未获得盖章正式报价单。'],
    objects: ['chengdu', 'ronghe'], sources: ['cd-price-a', 'cd-price-b', 'cd-snapshot', 'cd-oct'],
    timeline: [
      { date: '2026-10-16', title: '单一来源价格线索', text: '渠道A提及每方下降15元，运费及付款条件不详；仅作待核线索。' },
      { date: '2026-11-16', title: '新增第二个独立来源', text: '渠道B支持降价线索，补充30公里内运输及月结次月支付条件。' },
    ],
    questions: [
      { label: '两个报价的条件可比吗？', answer: '尚未完全可比。两渠道均提及C30含税报价下降约15元/立方米；渠道A未说明运费、运距及账期，渠道B提及30公里以内运输、月结次月支付，泵送费仍未知。应取得同规格、同税费、同运费、同付款条件的正式报价后再比较。', sourceIds: ['cd-price-a', 'cd-price-b'], objectId: 'ronghe' },
      { label: '对我方哪个区域有影响？', answer: '关联成都东部片区及成都示例公司。内部清单记录竞对与我方部分在跟踪项目存在运输范围交集；目前缺少我方同条件报价与销量数据，尚不能确认订单或毛利影响金额。', sourceIds: ['cd-snapshot'], objectId: 'chengdu' },
    ],
  },
  {
    id: 'EV-2026-004', type: '政策与交付', region: '武汉', date: '2026-11-12', risk: false,
    title: '武汉冬季扬尘管理文件将于 12 月 1 日施行',
    judgment: '武汉区域需在生效前评估现有订单能否按期交付，并准备区域保供安排。',
    fact: '11月12日正式文件替代10月征求意见稿，自12月1日起施行。',
    relation: '示例快照确认武汉区域部分供货环节适用。是否影响已排订单，仍待区域确认。',
    attention: '武汉区域在 12 月 1 日前报受影响订单、补供安排及是否需要跨单位协调。',
    trigger: '正式文件明确了施行日期，武汉区域需要核查订单能否按期交付。',
    impact: '主要影响产能与交付。受影响工序为封闭骨料卸料、出场车辆冲洗；正式文件未要求统一停产。停产天数、交付损失和订单改配金额均未确认。',
    pending: ['两站设施达标情况待核。', '跨站代供能力、订单调度及客户告知方案尚未确认。'],
    objects: ['wuhan', 'hanyang', 'qingshan'], sources: ['wh-policy', 'wh-draft', 'wh-sites', 'wh-oct'],
    timeline: [
      { date: '2026-10-09', title: '征求意见稿发布', text: '工序管理措施仍为拟议内容，未确定生效日期。' },
      { date: '2026-11-12', title: '正式文件发布', text: '明确12月1日生效。' },
      { date: '2026-11-15', title: '区域经营关联已核对', text: '示例快照确认武汉区域部分供货环节适用。订单调度影响待核。' },
    ],
    questions: [
      { label: '武汉区域要关注什么交付风险？', aliases:['交付风险','保供','涉及哪些站点'], answer: '内部站点快照匹配汉阳示例站、青山示例站，均属武汉示例公司。涉及骨料封闭卸料与出场车辆冲洗；跨站代供与现有订单调度安排仍待确认，不能推断为全面停供。', sourceIds: ['wh-policy', 'wh-sites'], objectId: 'wuhan' },
      { label: '文件何时生效？', aliases:['生效','什么时候施行','执行日期'], answer: '正式文件明确自2026年12月1日起施行，替代10月9日征求意见稿。目前应按正式文件核实工序与供货安排，而不是把草案当作已生效政策。', sourceIds: ['wh-policy', 'wh-draft'], objectId: 'hanyang' },
    ],
  },
  {
    id: 'EV-2026-005', type: '客户风险', region: '武汉', date: '2026-10-29', risk: false,
    title: '恒远集团姐妹公司涉诉，与我方签约主体不同',
    judgment: '仅确认集团关联，尚不能认定我方客户直接暴露。',
    fact: '恒远置业（湖北）有限公司公开涉诉，案件金额430万元。',
    relation: '与我方客户同属恒远集团，但名称及信用代码不同，我方没有该法人直接签约记录。',
    attention: '核实关联担保及资金往来，不跨法人引用应收余额。',
    trigger: '重点客户同集团企业出现信用线索，法律主体未直接命中。',
    impact: '仅属市场与客户、现金与风险关联线索。该法人无已核实的我方应收数据；不能把其他法人应收余额或公开案件430万元当成该法人对我方的暴露。',
    pending: ['关联担保、资金往来和对我方签约客户的传导尚待核实。'],
    objects: ['wuhan', 'hengyuan-sister'], sources: ['hy-sister', 'hy-master'],
    timeline: [{ date: '2026-10-29', title: '姐妹公司诉讼披露', text: '核对后确认非我方合同法人，仅记录集团关联线索。' }],
    questions: [
      { label: '是我方合同客户吗？', answer: '不是。涉事主体是恒远置业（湖北）有限公司，我方签约主体为恒远建设（武汉）有限公司，信用代码不同。只能确认集团关联，不得跨法人引用应收数据。', sourceIds: ['hy-sister', 'hy-master'], objectId: 'hengyuan-sister' },
      { label: '能确认我方直接暴露吗？', answer: '不能。本期客户主档没有恒远置业的直接签约或该法人应收数据；关联担保和资金往来仍未核实。公开案件430万元不等于我方损失。', sourceIds: ['hy-master', 'hy-sister'], objectId: 'hengyuan-sister' },
    ],
  },
  {
    id: 'EV-2026-006', type: '项目机会', region: '成都', date: '2026-11-05', risk: false,
    title: '天府科创园二期取得施工许可，采购时间待核',
    judgment: '在跟踪项目推进到施工许可阶段，尚未进入明确商混采购窗口。',
    fact: '11月5日项目取得施工许可，建筑面积约8万平方米。',
    relation: '已列入成都示例公司跟踪清单，尚无我方已签订单。',
    attention: '核实商混采购主体及招标时间，不将建筑面积换算为订单。',
    trigger: '在跟踪项目出现新的施工许可节点。',
    impact: '主要影响规模与订单。建筑面积8万平方米属于建设口径；商混采购量与我方已签订单尚无已核实数据。',
    pending: ['采购主体、混凝土预计用量和招标日期尚未披露。'],
    objects: ['chengdu', 'tianfu'], sources: ['tf-permit', 'tf-snapshot'],
    timeline: [{ date: '2026-11-05', title: '施工许可披露', text: '项目具备新的施工节点，尚待采购公告。' }],
    questions: [
      { label: '涉及哪个区域和项目？', answer: '涉及成都区域、天府科创园二期，属地为成都示例公司，内部清单已有跟踪记录。', sourceIds: ['tf-permit', 'tf-snapshot'], objectId: 'chengdu' },
      { label: '商混采购时间确定了吗？', answer: '尚未确定。施工许可没有披露商混招标时间或采购量，建筑面积不能直接换算为混凝土订单。', sourceIds: ['tf-permit'], objectId: 'tianfu' },
    ],
  },
];
export type WeeklyIssue = { id: string; start: string; end: string; number: string; refs: { eventId: string; date: string }[] };
export const issues: WeeklyIssue[] = [
  { id: '2026-11-20', start: '2026-11-14', end: '2026-11-20', number: '08', refs: [{ eventId: 'EV-PUBLIC-001', date: '2026-11-20' }, { eventId: 'EV-2026-001', date: '2026-11-19' }, { eventId: 'EV-PUBLIC-002', date: '2026-11-20' }] },
  { id: '2026-11-13', start: '2026-11-07', end: '2026-11-13', number: '07', refs: [{ eventId: 'EV-2026-004', date: '2026-11-12' }] },
  { id: '2026-11-06', start: '2026-10-31', end: '2026-11-06', number: '06', refs: [{ eventId: 'EV-2026-006', date: '2026-11-05' }] },
  { id: '2026-10-30', start: '2026-10-24', end: '2026-10-30', number: '05', refs: [] },
  { id: '2026-10-23', start: '2026-10-17', end: '2026-10-23', number: '04', refs: [{ eventId: 'EV-2026-001', date: '2026-10-22' }] },
  { id: '2026-10-16', start: '2026-10-10', end: '2026-10-16', number: '03', refs: [] },
  { id: '2026-10-09', start: '2026-10-03', end: '2026-10-09', number: '02', refs: [{ eventId: 'EV-2026-004', date: '2026-10-09' }, { eventId: 'EV-2026-002', date: '2026-10-08' }] },
  { id: '2026-10-02', start: '2026-09-26', end: '2026-10-02', number: '01', refs: [{ eventId: 'EV-2026-001', date: '2026-10-02' }] },
];
export const getEvent = (id: string) => events.find(e => e.id === id);
export const getSource = (id: string) => sources.find(s => s.id === id);
export const getObject = (id: string) => objects.find(o => o.id === id);
export function getWeeklyItems(issue: WeeklyIssue) {
  return issue.refs.filter(ref => ref.date >= issue.start && ref.date <= issue.end).slice(0, 3).flatMap(ref => {
    const event = getEvent(ref.eventId);
    if (!event) return [];
    const progress = event.timeline.find(t => t.date === ref.date);
    const historical = ref.date !== event.date;
    return [{ event, date: ref.date, title: historical ? `${event.region} · ${progress?.title ?? event.title}` : event.title,
      fact: historical ? progress?.text ?? event.fact : event.fact,
      judgment: historical ? '本期记录该事件的新进展，后续变化可在完整事件材料中核对。' : event.judgment,
      historical }];
  });
}
type MonthlyItem = {
  eventId: string;
  topic: string;
  change: string;
  implication: string;
  watch: string;
};

export const monthlyIssues: {
  id: string;
  start: string;
  end: string;
  title: string;
  summary: string;
  items: MonthlyItem[];
  updates?: { eventId: string; label: string; previous: string; current: string; watch: string }[];
}[] = [
  {
    id: '2026-11', start: '2026-11-01', end: '2026-11-20',
    title: '样本混凝土发运减少，\n原料价格和基建投资出现分化',
    summary: '11 月中旬，全国混凝土价格指数基本持平，河南原料报价有上涨。前十个月基建投资整体下行，航空和水运投资仍增长。建议关注原料成本传导、房建回款条件，以及重点区域的实际采购节点。',
    items: [
      { eventId: 'EV-PUBLIC-002', topic: '市场需求', change: '11 月中旬，506 家样本混凝土企业发运量周环比下降 5.12%。另一项行业监测的全国价格指数较上周微升 0.06%。', implication: '公开样本提示需求偏弱，集团各区域的销量和价格还要看实际订单与成交。', watch: '各区域未来两周的确认供货量，以及新增订单能否接上。' },
      { eventId: 'EV-PUBLIC-001', topic: '原料成本', change: '全国水泥价格指数一周上涨 0.37%，河南部分地区水泥报价每吨上调 20—30 元。同期郑州监测的 C30 均价持平。', implication: '已经锁定售价、原料尚未锁价的订单，可能先受到成本压力。', watch: '河南区域的水泥实际到货价，以及未交付固定价订单的预计毛利。' },
      { eventId: 'EV-PUBLIC-003', topic: '房建资金', change: '前十个月全国房企到位资金同比下降 21.9%，降幅较前三季度扩大 0.3 个百分点。', implication: '房建新单要把回款条件和预计供货量一起看，尤其是需要先垫资的订单。', watch: '看待签订单的首款日期、预计垫资，以及同一签约方的到期未收款。' },
      { eventId: 'EV-PUBLIC-004', topic: '基建投资', change: '前十个月基建投资同比下降 5.1%，航空运输业和水上运输业投资分别增长 12.5%。', implication: '细分领域表现不同，可结合区域业务覆盖有选择地跟踪。', watch: '哪些交通工程已经进入招标、施工或材料采购环节。' },
      { eventId: 'EV-PUBLIC-006', topic: '绿色建材', change: '福州、鄂州本月更新绿色建材信息，两地清单均涉及预拌混凝土。', implication: '可结合重点区域的招采文件检查产品和认证条件。', watch: '政府采购工程是否明确产品规格、认证等级和证书有效期。' },
    ],
    updates: [
      { eventId: 'EV-2026-001', label: '重庆江北采购', previous: '总包中标，商混采购未披露。', current: '商混采购公告已发，明确投标截止时间。', watch: '采购结果及实际可承接量。' },
      { eventId: 'EV-2026-004', label: '武汉冬季交付', previous: '政策处于征求意见阶段，生效时间待定。', current: '正式文件明确 12 月 1 日施行。', watch: '可能受影响的订单及补供安排。' },
    ],
  },
  {
    id: '2026-10', start: '2026-10-01', end: '2026-10-31',
    title: '房建资金偏紧，\n重庆采购和武汉政策出现新信号',
    summary: '前三季度房企到位资金同比减少。重庆江北项目披露总包中标，武汉冬季扬尘措施进入征求意见阶段。区域影响要等采购公告和政策正式文件进一步明确。',
    items: [
      { eventId: 'EV-PUBLIC-003', topic: '房建资金', change: '截至当期已发布的前三季度数据，全国房企到位资金同比下降 21.6%。', implication: '待签房建订单的回款安排值得单独评估。', watch: '首款约定、实际付款记录和已到期款项。' },
      { eventId: 'EV-2026-001', topic: '重点机会', change: '重庆江北示例项目公布总包中标，商混采购尚未披露。', implication: '项目值得区域继续跟踪，当前可供份额和采购时间仍未知。', watch: '后续的采购公告与参与条件。' },
      { eventId: 'EV-2026-004', topic: '政策与交付', change: '武汉冬季扬尘措施进入征求意见阶段。', implication: '武汉区域可以提前排查，适用范围和交付影响以正式文件及内部核对结果为准。', watch: '文件是否正式发布、何时生效，以及会涉及哪些供货环节。' },
    ],
  },
];
export function eventSourcesForMonth(event: MarketEvent, month: string) {
  const period = monthlyIssues.find(issue => issue.id === month);
  return event.sources.map(getSource).filter((source): source is Source => Boolean(source && period && source.date <= period.end));
}
export function findMaterials(query: string) {
  const q = query.trim().replace(/近期变化|信用动态|查询|看看|查看|查|看/g, '');
  if (!q) return { objects: [], events: [] };
  const matched = objects.filter(o => o.name.includes(q) || o.aliases.some(a => q.includes(a) || a.includes(q)));
  const ids = new Set(matched.map(o => o.id));
  return { objects: matched, events: events.filter(e => e.objects.some(id => ids.has(id)) || `${e.title}${e.region}${e.type}`.includes(q)) };
}
export function resolveQuestion(event: MarketEvent, input: string): Question | undefined {
  const normalize = (value: string) => value.normalize('NFKC').toLowerCase().replace(/[\s，。！？、,.?!]/g, '');
  const text = normalize(input);
  if (!text) return;
  const exact = event.questions.find(question => normalize(question.label) === text);
  if (exact) return exact;
  const compatible = event.questions.filter(question => question.aliases?.some(alias => text.includes(normalize(alias))));
  return compatible.length === 1 ? compatible[0] : undefined;
}
export const insufficientAnswer = '当前示例材料不足以回答这个问题。尚无可引用的已核实依据，不作金额、趋势或经营结论推断。';
export const formatDate = (date: string) => date.replaceAll('-', '.');
export function contentHead(title: string, description: string) {
  return { meta: [{ title: `${title} · 中建西部建设市场业态感知` }, { name: 'description', content: description }, { property: 'og:title', content: `${title} · 中建西部建设` }, { property: 'og:description', content: description }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] };
}
