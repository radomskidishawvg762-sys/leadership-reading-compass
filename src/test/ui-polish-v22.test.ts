import { describe, expect, it } from 'vitest';
import { featuredTopics } from '@/lib/market-topics';
import { getTopicResearch, validateMarketReferences } from '@/lib/topic-research';
import { parseTopicNarrative, tokenizeCitations, formatInlineSegments } from '@/components/market/topic-narrative';

describe('专题/专报 V2.2 阅读体验回归',()=>{
  it('recognizes AI analysis sections and does not expose the technical labels as prose',()=>{
    const answer='【核心判断】发运下降不等于需求消失。[E1][S1][S2]\n\n【主要依据】一是样本发运环比下降5.12%。[S1] 二是房建投资下降。[S3]\n【建议行动】1. 按区域核对。\n2. 检查资金来源。[E2]\n【关键缺口】缺企业内部订单。';
    const sections=parseTopicNarrative(answer);
    expect(sections.map(x=>x.heading)).toEqual(['核心判断','主要依据','建议行动','关键缺口']);
    expect(sections[0]?.lines[0]).toContain('发运下降不等于需求消失');
    expect(sections[2]?.lines.join(' ')).toContain('按区域核对');
    const tokens=tokenizeCitations(sections[0]!.lines[0]!);
    expect(tokens.filter(x=>x.type==='source')).toHaveLength(2);
    expect(tokens.filter(x=>x.type==='event')).toHaveLength(1);
  });
  it('preserves the original wording, numbers and unknown references without fabricating citations',()=>{
    const text='同比下降21.9%，但不能代替集团实际销量。[S1][E2]';
    const tokens=tokenizeCitations(text);
    expect(tokens[0]).toEqual({type:'text',text:'同比下降21.9%，但不能代替集团实际销量。'});
    expect(tokens.at(-1)).toEqual({type:'event',index:1});
    expect(tokenizeCitations('系统提示里的 [S999] 不应凭空出现超大编号。').filter(x=>x.type==='source')).toHaveLength(0);
    expect(parseTopicNarrative('【判断】不确定。[S1]')[0]?.heading).toBe('核心判断');
    expect(parseTopicNarrative('普通提问回复。[S1]')[0]?.heading).toBe('');
  });
  it('renders Markdown emphasis and preserves numeric citations without raw stars',()=>{
    const line='**合同风险** 应先核实 *实际采购价* 和 `C30` [S1]';
    expect(formatInlineSegments(line)).toEqual([
      {type:'bold',text:'合同风险'},{type:'text',text:' 应先核实 '},
      {type:'italic',text:'实际采购价'},{type:'text',text:' 和 '},
      {type:'code',text:'C30'},{type:'text',text:' [S1]'},
    ]);
    expect(parseTopicNarrative('**【核心判断】** 价格变化 [S1]\\n**【主要依据】** **重点**：样本数据。')
      .map(part=>part.heading)).toEqual(['核心判断','主要依据']);
  });
  it('all six suggestions reference canonical events instead of inventing stories',()=>{
    expect(featuredTopics).toHaveLength(6);
    expect(new Set(featuredTopics.map(x=>x.id)).size).toBe(featuredTopics.length);
    expect(validateMarketReferences()).toEqual([]);
    for(const topic of featuredTopics){
      const result=getTopicResearch({q:topic.title,topicId:topic.id,window:'all'});
      expect(result.events.length,topic.title).toBeGreaterThan(0);
      for(const event of result.events)expect(event.id).toMatch(/^EV-/);
      expect(new Set(result.events.map(x=>x.id)).size).toBe(result.events.length);
      expect(new Set(result.sources.map(x=>x.id)).size).toBe(result.sources.length);
    }
  });
});
