import { describe, expect, it } from 'vitest';
import { eventAt } from '@/lib/reading-editions';
import { events, resolveQuestion } from '@/lib/market-data';
import { aiMessages, evidenceForAi, fixedAnswer, getAllowedEvent, type ChatRequest } from '@/lib/hybrid-ai';

// Evaluation seeds: rules, source scope, task context and regression.
// These do NOT claim the actual third-party model's answers have been graded.
const cases = [
  ['EV-PUBLIC-005','河南水泥上涨但混凝土不涨，区域固定价订单该优先检查什么？','ai'],
  ['EV-PUBLIC-005','当前证据还存在哪些需要再验证的假设','ai'],
  ['EV-PUBLIC-005','郑州与成都两地成本传导路径最大的不同是什么？','ai'],
  ['EV-PUBLIC-005','各地报价不同会如何影响下阶段经营策略？','ai'],
  ['EV-PUBLIC-005','如果水泥上涨但订单售价锁定，应先筛哪些订单？','ai'],
  ['EV-PUBLIC-005','能否对实际利润进行精确测算，需要哪些最小字段？','ai'],
  ['EV-PUBLIC-005','可以直接比较两地利润吗？','fixed'],
  ['EV-PUBLIC-005','利润','fixed'],
  ['EV-PUBLIC-004','航空和水运投资增长就代表我们能拿到订单吗？','ai'],
  ['EV-PUBLIC-004','当前哪些行业变化值得优先做区域项目排查？','ai'],
  ['EV-PUBLIC-004','下一步查项目施工节点还是招标公告更有价值？','ai'],
  ['EV-PUBLIC-004','混凝土订单','fixed'],
  ['EV-PUBLIC-006','区域投标时绿色建材认证该怎么筛查？','ai'],
  ['EV-PUBLIC-006','福州和鄂州的名录更新是否等于全国采购门槛？','ai'],
  ['EV-PUBLIC-006','无法判断资质满足时应该先看什么资料？','ai'],
  ['EV-PUBLIC-003','房建资金下降会不会直接说明某个客户拖欠？','ai'],
  ['EV-PUBLIC-003','房建新项目应该优先审查哪些回款条款？','ai'],
  ['EV-PUBLIC-003','如何区分行业现金流趋势和实际应收风险？','ai'],
  ['EV-PUBLIC-002','发运量下降能否判断集团销售同比下降？','ai'],
  ['EV-PUBLIC-002','为什么样本出货量不能外推全国企业？','ai'],
  ['EV-PUBLIC-002','先做订单核实还是调价策略？','ai'],
  ['EV-PUBLIC-001','河南原料成本变化对合同质量的潜在影响是什么？','ai'],
  ['EV-PUBLIC-001','如何区分真实到货成本和公开报价？','ai'],
  ['EV-PUBLIC-001','该采取哪些可验证的经营动作？','ai'],
  ['EV-2026-004','如果保供方案不足，应该如何安排部门协同？','ai'],
] as const;

const request=(id:string,question:string,scope:ChatRequest['scope']={}):ChatRequest=>({eventId:id,question,scope,history:[]});

describe('25-case decision Q&A regression seeds',()=>{
  it('preserves original buttons, but routes unrelated long free-text questions to the model',()=>{
    expect(cases).toHaveLength(25);
    for(const [id,question,expected] of cases){
      const event=getAllowedEvent(request(id,question));
      expect(event, id).toBeDefined();
      const got=fixedAnswer(event!,question)?'fixed':'ai';
      expect(got, question).toBe(expected);
    }
    for(const event of events){
      const allowed=getAllowedEvent(request(event.id,'test'));
      if(!allowed)continue;
      for(const item of allowed.questions){
        expect(fixedAnswer(allowed,item.label)?.answer).toBe(item.answer);
        expect(resolveQuestion(allowed,item.label)?.sourceIds).toEqual(item.sourceIds);
      }
    }
  });
  it('includes allowed event business context and concrete analysis instructions',()=>{
    const event=eventAt('EV-PUBLIC-005',{})!;
    const input=request(event.id,'若实际水泥到货价持续上涨，对固定价格合同如何初筛？');
    const evidence=evidenceForAi(event,input);
    const messages=aiMessages(input,event,evidence);
    expect(messages[1]!.content).toContain(event.judgment);
    expect(messages[1]!.content).toContain(event.relation);
    expect(messages[1]!.content).toContain(event.impact);
    expect(messages[1]!.content).toContain(event.attention);
    expect(messages[0]!.content).toContain('【建议动作】');
    expect(messages[0]!.content).toContain('【关键缺口】');
    expect(messages[0]!.content).toContain('如果');
    expect(messages[1]!.content).not.toContain('应收余额1,260万元');
  });
  it('keeps historical event evidence bounded by the report cutoff and excludes internal snapshots',()=>{
    const input=request('EV-PUBLIC-003','房建到位资金变化有什么影响？',{month:'2026-10'});
    const event=getAllowedEvent(input)!;
    expect(event).toBeDefined();
    const evidence=evidenceForAi(event,input);
    expect(evidence.length).toBeGreaterThan(0);
    expect(evidence.every(e=>e.date<='2026-10-31')).toBe(true);
    expect(evidence.every(e=>!!e.id && !e.id.includes('snapshot'))).toBe(true);
    const messages=aiMessages(input,event,evidence);
    expect(messages[1]!.content).toContain('2026-10-31');
  });
  it('related material is public, relevant and never from a future issue',()=>{
    const input=request('EV-PUBLIC-005','河南水泥价格变化与市场成本有何关联？');
    const event=getAllowedEvent(input)!;
    const evidence=evidenceForAi(event,input);
    expect(evidence.length).toBeLessThanOrEqual(8);
    expect(evidence.every(e=>!e.demo && e.date<='2026-11-20')).toBe(true);
    expect(new Set(evidence.map(e=>e.id)).size).toBe(evidence.length);
  });
  it('demo events must be labeled and never include raw internal snapshot text',()=>{
    const input=request('EV-2026-004','如果武汉冬季政策影响交付，怎么安排？');
    const event=getAllowedEvent(input)!;
    const evidence=evidenceForAi(event,input);
    const messages=aiMessages(input,event,evidence);
    expect(messages[1]?.content).toContain('虚构业务演示情境');
    expect(messages[1]?.content).not.toContain('应收余额1,260万元');
    expect(evidence.every(e=>e.demo)).toBe(true);
  });
});
