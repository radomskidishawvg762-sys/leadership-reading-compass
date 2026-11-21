import { getEvent, getSource, issues, monthlyIssues, type MarketEvent } from './market-data';

export type ReadingScope = { issue?: string; month?: string };
export const currentCutoff = issues[0]?.end ?? '';

export function readScope(search: Record<string, unknown>): ReadingScope {
  if (typeof search['issue'] === 'string') return { issue: search['issue'] };
  if (typeof search['month'] === 'string') return { month: search['month'] };
  return {};
}

export function getReadingEdition(scope: ReadingScope) {
  if (scope.issue !== undefined) {
    const issue = issues.find(edition => edition.id === scope.issue);
    return issue && { label: `第 ${issue.number} 期周报`, cutoff: issue.end };
  }
  if (scope.month !== undefined) {
    const issue = monthlyIssues.find(edition => edition.id === scope.month);
    return issue && { label: `${issue.id.replace('-', ' 年 ')} 月简报`, cutoff: issue.end };
  }
  return { label: '最新已收录材料', cutoff: currentCutoff };
}

const history: Record<string, { availableOn: string; copy: Partial<MarketEvent> }[]> = {
  'EV-2026-001': [
    { availableOn:'2026-10-02', copy:{
      title:'重庆江北城市更新项目进入跟踪清单', judgment:'请重庆区域确认采购安排。',
      fact:'区域已跟进该项目，尚无可引用的采购公告。', relation:'项目已在区域跟踪清单内。',
      attention:'请重庆区域报告采购主体和下一次可以核对的时间。', trigger:'跟踪记录更新。',
      impact:'现有材料还不能测算商混采购量或我方份额。', pending:['采购主体、招标时间和预计份额。'],
    } },
    { availableOn:'2026-10-22', copy:{
      title:'重庆江北城市更新项目总承包中标', judgment:'下一步等商混采购公告。',
      fact:'总承包中标公告披露，材料采购由总包另行组织。', relation:'我方区域清单已跟进。',
      attention:'请重庆区域报告总包采购计划，待采购公告出具后再测算供货量。', trigger:'跟踪项目新增总承包中标节点。',
      impact:'公告披露的投资是项目建设规模，商混采购量和我方份额尚缺依据。', pending:['采购主体和商混招标时间。'],
      questions:[{ label:'公告能确认我方订单吗？', answer:'公告只确认总承包中标，混凝土材料采购仍待另行组织。目前没有可用于确认我方订单的依据。', sourceIds:['cq-award','cq-oct'], aliases:['订单','采购量'] }],
    } },
  ],
  'EV-2026-002': [{ availableOn:'2026-10-08', copy:{
    title:'武汉恒远建设完成合同主体核对', judgment:'客户主档已核对，信用和应收情况待补证。',
    fact:'当期只有合同主体匹配记录。', relation:'区域将该签约主体列入重点客户清单。',
    attention:'需要评价信用风险时，请财资补充当期应收、逾期和回款资料。', trigger:'客户主档更新。',
    impact:'当期可以确认签约主体，材料尚不足以判断应收或逾期。', pending:['核对应收、账龄及还款安排。'],
    questions:[{label:'当期掌握哪些客户信息？', answer:'当期快照记录了签约主体及统一社会信用代码。应收、逾期和外部信用变化均缺少当期依据。',sourceIds:['hy-oct'],aliases:['应收','逾期','签约主体']}],
  } }],
  'EV-2026-004': [
    { availableOn:'2026-10-09', copy:{
      title:'武汉征求冬季扬尘管理意见', judgment:'区域可以提前检查交付安排，政策待正式发布。',
      fact:'10 月 9 日公布征求意见稿。', relation:'武汉区域已开始跟踪，尚未确认适用业务。',
      attention:'请武汉区域关注正式文件及执行日期。', trigger:'公开征求意见稿发布。',
      impact:'征求意见稿尚无已确认的交付影响。', pending:['正式文件、实施日期、适用业务。'],
      questions:[{label:'政策已经生效了吗？',answer:'当期只有征求意见稿，具体实施时间以正式文件为准。',sourceIds:['wh-draft'],aliases:['生效','何时施行']}],
    } },
    { availableOn:'2026-11-12', copy:{
      title:'武汉冬季扬尘管理文件将于 12 月 1 日施行', judgment:'正式文件已出，区域交付影响仍待核。',
      fact:'11 月 12 日发布正式文件，明确 12 月 1 日施行。', relation:'当期尚无完成核对的我方业务清单。',
      attention:'请武汉区域在政策实施前反馈受影响的订单和保供安排。', trigger:'正式政策替代征求意见稿。',
      impact:'本期能确认执行日期及涉及工序。实际受影响订单、补供安排尚待核。',
      pending:['武汉区域核对现有订单和可能需要的保供协调。'],
      questions:[
        {label:'文件何时生效？',answer:'正式文件明确自 2026 年 12 月 1 日施行。',sourceIds:['wh-policy'],aliases:['生效','什么时候施行','几号执行']},
        {label:'本期能确认会影响交付吗？',answer:'本期可确认文件及适用区域，还没有有效的我方区域业务匹配快照，无法确认实际受影响订单。',sourceIds:['wh-policy','wh-oct'],aliases:['交付','保供','哪些站点','快照']},
      ],
    } },
  ],
  'EV-2026-006': [{ availableOn:'2026-11-05', copy:{
    relation:'该期只有施工许可，我方跟进情况尚待核。',
    judgment:'施工许可已披露，材料采购节点尚不明确。',
    impact:'现有材料未披露采购量和我方订单。', pending:['采购主体、预计用量和采购日期。'],
  } }],
  'EV-PUBLIC-003': [{ availableOn:'2026-10-19', copy:{
    title:'前三季度房企到位资金同比下降 21.6%', judgment:'房建业务的付款来源需要先核实。',
    fact:'国家统计局公布，前三季度房企到位资金同比下降 21.6%，房屋新开工面积同比下降 24.9%。',
    questions:[{label:'全国数据能判断某客户会拖欠吗？',answer:'这是全国统计。判断某个客户需要合同、实际付款记录及应收资料。',sourceIds:['public-housing-sep'],aliases:['客户会拖欠','某家客户回款']}],
    timeline:[{date:'2026-10-19',title:'前三季度房地产数据发布',text:'房企到位资金比上年同期下降 21.6%。'}],
  } }],
};

const copyFields = ['title','judgment','fact','relation','attention','trigger','impact','pending'] as const;

export function eventAt(eventId: string, scope: ReadingScope): MarketEvent | undefined {
  const edition = getReadingEdition(scope);
  const event = getEvent(eventId);
  if (!edition || !event) return;
  const { cutoff } = edition;
  const sources = event.sources.filter(id => {
    const source = getSource(id);
    return source && source.date <= cutoff;
  });
  if (!sources.length) return;
  const byDate = history[eventId] ?? [];
  const latestComplete = eventId === 'EV-2026-004' ? '2026-11-15' : eventId === 'EV-2026-006' ? '2026-11-15' : event.date;
  const revision = cutoff < latestComplete ? byDate.filter(version => version.availableOn <= cutoff).at(-1) : undefined;
  if (cutoff < latestComplete && !revision) return;
  const view = { ...event, ...revision?.copy };
  if (revision && cutoff < event.date) {
    for (const field of copyFields) {
      if (!(field in revision.copy)) {
        if (field === 'pending') view.pending = [];
        else if (field !== 'relation' && field !== 'attention' && field !== 'impact' || eventId !== 'EV-PUBLIC-003') {
          view[field] = '当期材料尚未说明。';
        }
      }
    }
  }
  const timeline = view.timeline.filter(item => item.date <= cutoff);
  const questions = (revision?.copy.questions ?? event.questions)
    .filter(question => question.sourceIds.length > 0 && question.sourceIds.every(id => sources.includes(id)));
  return { ...view, date: timeline.at(-1)?.date ?? sources.map(id => getSource(id)!.date).sort().at(-1)!,
    sources, timeline, questions };
}
