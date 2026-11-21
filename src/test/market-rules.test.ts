import { describe, expect, it } from 'vitest';
import { eventAt } from '@/lib/reading-editions';
import { featuredTopics, findTopicEvents } from '@/lib/market-topics';
import { advanceReport, isPublishedReport } from '@/lib/report-workflow';
import { events, eventSourcesForMonth, findMaterials, getEvent, getSource, getWeeklyItems, issues, monthlyIssues, resolveQuestion } from '@/lib/market-data';
describe('经营判断与证据边界', () => {
  it('每期最多三条且只引用最近七天的新进展', () => {
    for (const issue of issues) {
      expect(issue.refs.length).toBeLessThanOrEqual(3);
      expect((Date.parse(issue.end)-Date.parse(issue.start))/86400000).toBe(6);
      expect(getWeeklyItems(issue).length).toBe(issue.refs.length);
      for (const ref of issue.refs) { expect(ref.date >= issue.start && ref.date <= issue.end).toBe(true); expect(getEvent(ref.eventId)?.timeline.some(t=>t.date===ref.date)).toBe(true); }
    }
  });
  it('无本期进展时不使用旧闻补足', () => { expect(getWeeklyItems({id:'empty',number:'09',start:'2026-11-21',end:'2026-11-27',refs:[{eventId:'EV-2026-001',date:'2026-11-19'}]})).toEqual([]); });
  it('项目投资和采购量不作为我方订单', () => { const event=getEvent('EV-2026-001'); expect(event?.impact).toContain('18亿元'); expect(event?.impact).toContain('12万立方米'); expect(event?.impact).toContain('已签订单为0立方米'); });
  it('只确认应收余额，不用余额或案件标的替代逾期及损失', () => { const event=getEvent('EV-2026-002'); if (!event) throw new Error('missing'); const answer=resolveQuestion(event,'这笔应收中有多少已逾期？'); expect(answer?.answer).toContain('应收余额1,260万元'); expect(answer?.answer).toContain('逾期金额尚无已核实数据'); expect(answer?.answer).toContain('不能把公开案件标的680万元当成我方损失'); });
  it('姐妹公司不直接命中合同法人，不引用其他法人应收', () => { const event=getEvent('EV-2026-005'); expect(event?.objects).not.toContain('hengyuan'); expect(event?.questions[0]?.answer).toContain('不是'); expect(event?.impact).toContain('不能把其他法人应收余额'); expect(event?.impact).not.toContain('1,260'); });
  it('价格事件保留来源独立性及规格税费运费付款条件边界', () => { const event=getEvent('EV-2026-003'); expect(event?.timeline[0]?.text).toContain('仅作待核线索'); expect(event?.timeline[1]?.title).toContain('第二个独立来源'); expect(event?.questions[0]?.answer).toContain('尚未完全可比'); expect(event?.questions[0]?.answer).toContain('C30含税'); expect(event?.questions[0]?.answer).toContain('30公里'); expect(event?.questions[0]?.answer).toContain('月结次月支付'); });
  it('正式政策明确生效日期及两座站点，但不推断全面停供', () => { const event=getEvent('EV-2026-004'); expect(event?.objects).toContain('hanyang'); expect(event?.objects).toContain('qingshan'); expect(event?.questions[1]?.answer).toContain('2026年12月1日'); expect(event?.questions[0]?.answer).toContain('不能推断为全面停供'); });
  it('所有事件和回答来源都有唯一可读取的原文', () => { expect(new Set(events.map(e=>e.id)).size).toBe(events.length); for (const event of events) { for (const id of [...event.sources,...event.questions.flatMap(q=>q.sourceIds)]) expect(getSource(id)?.excerpt.length).toBeGreaterThan(20); } });
  it('超出已有材料的问题不编造回答', () => { const event=getEvent('EV-2026-002'); if (!event) throw new Error('missing'); expect(resolveQuestion(event,'预测明年损失多少')).toBeUndefined(); expect(findMaterials('上海陌生公司').events).toEqual([]); });
  it('地区与客户查询可以找回统一事件', () => { expect(findMaterials('看重庆近期变化').events.map(e=>e.id)).toContain('EV-2026-001'); expect(findMaterials('查恒远建设信用动态').events.map(e=>e.id)).toContain('EV-2026-002'); });
  it('十月简报按来源性质核对证据，不引用十一月材料', () => {
    const october = monthlyIssues.find(issue => issue.id === '2026-10');
    if (!october) throw new Error('missing October issue');
    expect(october.items.length).toBeGreaterThanOrEqual(3);
    expect(october.items.length).toBeLessThanOrEqual(5);
    for (const {eventId:id} of october.items) {
      const event = getEvent(id);
      if (!event) throw new Error('missing event');
      const records = eventSourcesForMonth(event, '2026-10');
      expect(records.some(s => s.kind === '外部材料')).toBe(true);
      expect(records.some(s => s.kind === '内部快照')).toBe(!event?.public);
      expect(records.every(s => s.date <= '2026-10-31')).toBe(true);
    }
  });
  it('十一月的五个主题都能下钻，页尾进展来自上一期同一事件', () => {
    const november = monthlyIssues.find(issue => issue.id === '2026-11')!;
    const october = monthlyIssues.find(issue => issue.id === '2026-10')!;
    expect(new Set(november.items.map(item => item.topic)).size).toBe(5);
    for (const item of november.items) expect(eventAt(item.eventId, {month:november.id})?.sources.length).toBeGreaterThan(0);
    for (const update of november.updates ?? []) {
      expect(october.items.some(item => item.eventId === update.eventId)).toBe(true);
      const event = eventAt(update.eventId, {month:november.id});
      expect(event?.timeline.some(item => item.date >= november.start && item.date <= november.end)).toBe(true);
    }
    const henan = eventAt('EV-PUBLIC-001', {month:november.id})!;
    expect(resolveQuestion(henan, '这是全国都在涨，还是只有河南部分地区？')?.sourceIds).toEqual(['public-henan']);
  });
  it('专题可跨来源检索，也能按城市限制结果', () => {
    const publicEvents = events.filter(event => event.public);
    expect(findTopicEvents(featuredTopics[0].title, publicEvents).map(event => event.id)).toEqual(expect.arrayContaining(['EV-PUBLIC-002','EV-PUBLIC-003','EV-PUBLIC-004']));
    expect(findTopicEvents('成都混凝土', publicEvents).map(event => event.id)).toEqual(['EV-PUBLIC-005']);
    expect(findTopicEvents('鄂州', publicEvents).map(event => event.id)).toEqual(['EV-PUBLIC-006']);
    expect(findTopicEvents('未知材料代号ZY2026', publicEvents)).toEqual([]);
  });
  it('11月13日从周报打开武汉政策，详情和追问不读取11月15日关联快照', () => {
    const event = eventAt('EV-2026-004', {issue:'2026-11-13'});
    expect(event?.sources).toEqual(['wh-policy','wh-draft','wh-oct']);
    expect(event?.timeline.every(t=>t.date<='2026-11-13')).toBe(true);
    expect(event?.relation).not.toContain('汉阳');
    expect(event && resolveQuestion(event,'请问政策几号执行？')?.sourceIds).toEqual(['wh-policy']);
    expect(event && resolveQuestion(event,'哪些站点受影响')?.answer).toContain('无法确认实际受影响订单');
    expect(isPublishedReport('EV-2026-004','published','2026-11-13')).toBe(false);
  });
  it('先确认再审核和发布，待核案例不进入专报', () => {
    expect(advanceReport('pending','publish')).toBe('pending');
    const reviewed = advanceReport(advanceReport('pending','confirm'),'approve');
    expect(isPublishedReport('EV-2026-002',reviewed)).toBe(false);
    expect(isPublishedReport('EV-2026-002',advanceReport(reviewed,'publish'))).toBe(true);
    expect(isPublishedReport('EV-2026-003','published')).toBe(false);
    expect(isPublishedReport('EV-2026-005','published')).toBe(false);
  });
  it('当前有四条公开资料专报和两条演示专报，历史期不提前展示', () => {
    const published = events.filter(event => isPublishedReport(event.id,'pending'));
    expect(published.filter(event => event.public)).toHaveLength(4);
    expect(published.filter(event => !event.public)).toHaveLength(2);
    for (const event of published.filter(event => event.public)) {
      expect(isPublishedReport(event.id,'pending','2026-11-13')).toBe(false);
      expect(event.sources.every(id => Boolean(getSource(id)?.url))).toBe(true);
    }
  });
});
