export type ReportStage = 'pending' | 'review' | 'approved' | 'published';
export type ReportAction = 'confirm' | 'approve' | 'publish';
export const reviewExample = 'EV-2026-002';

const transitions = {
  pending: { action:'confirm', next:'review' },
  review: { action:'approve', next:'approved' },
  approved: { action:'publish', next:'published' },
} as const;

export function advanceReport(stage: ReportStage, action: ReportAction): ReportStage {
  if (stage === 'published') return stage;
  const transition = transitions[stage];
  return transition.action === action ? transition.next : stage;
}

const briefs: Record<string, { date: string; reason: string; checkpoint: string }> = {
  'EV-2026-001': {
    date:'2026-11-19',
    reason:'示例项目从总包中标推进到商混采购，投标窗口已经明确，属地可评估是否参与。',
    checkpoint:'11 月 27 日截标前核对可供货量、预计毛利和付款条款，截标后跟踪采购结果。',
  },
  'EV-2026-004': {
    date:'2026-11-15',
    reason:'示例政策由草案转为正式文件，武汉区域需要在施行前评估在手订单的交付安排。',
    checkpoint:'12 月 1 日施行前，复核受影响订单和可用补供方案。',
  },
  'EV-PUBLIC-003': {
    date:'2026-11-16',
    reason:'累计到位资金降幅较前三季度扩大 0.3 个百分点，同时新开工面积同比下降。两项指标分别提示潜在需求和回款条件值得跟踪。',
    checkpoint:'待签房建合同进入报价确认前，核对首款日期、预计垫资及同一签约方的到期未收款。',
  },
  'EV-PUBLIC-004': {
    date:'2026-11-16',
    reason:'基建投资整体下行，航空与水运投资仍增长。行业分化有助于缩小区域项目排查范围。',
    checkpoint:'下一次投资数据发布后看分化是否延续。其间以目标区域实际招标、施工和采购节点检验机会。',
  },
  'EV-PUBLIC-005': {
    date:'2026-11-20',
    reason:'同一周内郑州水泥成本端上涨、当地混凝土报价持平，成都混凝土报价有所上涨。不同区域的原材涨价与售价调整需要分开核对。',
    checkpoint:'下次原材询价及区域报价更新时，用同规格、同运距和同付款条件对比实际进货与成交记录。',
  },
  'EV-PUBLIC-006': {
    date:'2026-11-18',
    reason:'福州和鄂州相继更新绿色建材名录，两地均涉及预拌混凝土，可用于核对当地政府采购工程的产品条件。',
    checkpoint:'当地项目招采文件发布后、投标前，核对产品类别、认证等级和证书有效期。',
  },
};

export function getReportBrief(eventId: string) {
  return briefs[eventId];
}

export function isPublishedReport(eventId: string, stage: ReportStage, cutoff = '2026-11-20') {
  const date = getReportBrief(eventId)?.date ?? (eventId === reviewExample && stage === 'published' ? '2026-11-20' : undefined);
  return date !== undefined && date <= cutoff;
}

export function isLeaderMaterial(eventId: string, stage: ReportStage) {
  return !['EV-2026-003','EV-2026-005'].includes(eventId) &&
    (eventId !== reviewExample || isPublishedReport(eventId, stage));
}
