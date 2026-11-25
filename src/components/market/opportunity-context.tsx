import {marketLeads,informationPriceChanges,changedRegions} from '@/lib/market-opportunities';
import {EvidenceNote} from './market-visual';
export function RegionChanges({cutoff}:{cutoff?:string}){
 const rows=changedRegions(cutoff);if(!rows.length)return null;
 return <section className="v38-region-changes"><h3>集团经营地区 · 本期价格变化</h3><div className="v38-region-grid">{rows.map(r=><div key={r.city}><span>{r.province===r.city?r.city:r.province+' · '+r.city}</span><strong className={r.change<0?'v38-down':'v38-up'}>{r.change>0?'+':''}{r.change}<small> 元/方</small></strong>{r.share!==undefined&&<small>对应地区收入占比 {r.share.toFixed(2)}%</small>}</div>)}</div><p>11月13—20日城市C30市场报价变化；收入占比为公司半年报地区口径，不代表公司成交价变化。</p><EvidenceNote ids={rows.flatMap(r=>r.sourceIds)}/></section>;
}
export function InformationPrice(){
 return <section className="v37-data-section"><h2>武汉工程信息价变动</h2><div className="v38-region-grid">{informationPriceChanges.map(p=><div key={p.month}><span>{p.month}</span><strong>约 +{p.change}<small> 元/方</small></strong></div>)}</div><p>市级造价机构通知所列商品混凝土价格变动，非特定强度等级绝对价格。工程信息价与市场参考价口径不同，暂不与集团销售均价计算价差。</p><EvidenceNote ids={informationPriceChanges.map(p=>p.sourceId)}/></section>;
}
export function OpportunityContext({cutoff,compact=false}:{cutoff?:string;compact?:boolean}){
 const rows=marketLeads(cutoff);if(!rows.length)return null;
 return <section className="v37-data-section v38-opportunities"><h2>重点区域项目线索</h2><p>公开项目线索 · 重庆 · 按项目阶段区分，非集团储备或已签订单。</p><div className="v34-table-scroll"><table className="v37-table v38-project-table"><thead><tr><th>项目 / 采购线索</th><th>区域</th><th>阶段</th>{!compact&&<th>资料日期</th>}</tr></thead><tbody>{rows.map(p=><tr key={p.id}><td><strong>{p.name}</strong><small>{p.note}</small><EvidenceNote ids={[p.sourceId]}/></td><td>{p.region}</td><td>{p.stage}</td>{!compact&&<td>{p.date}</td>}</tr>)}</tbody></table></div>{(!cutoff||cutoff>="2026-11-10")&&<div className="v38-opportunity-observation"><strong>川渝建设环境</strong><p>截至10月底，川渝350个共建重点项目累计完成投资4,805.97亿元。渝万高铁已进入联调联试、重庆枢纽港产业园部分主体封顶；应关注仍处于适宜供货阶段的工程，而非将全部投资额视为新增需求。</p><EvidenceNote ids={['v38-cq-sichuan']}/></div>}</section>;
}
