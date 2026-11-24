import {groupContext,groupNotes,henanProjects,priceCostComparison,regionalComparison} from '@/lib/group-context';
import {EvidenceNote} from './market-visual';
export function GroupContext({eventId,cutoff}:{eventId:string;cutoff?:string}){
 const refs=groupContext(eventId,cutoff);if(!refs.length)return null;
 const periods=[...new Set(refs.map(r=>r.period??'公开披露'))];
 const projects=eventId==='EV-PUBLIC-001'&&refs.some(r=>r.sourceId==='v35-q3-operations');
 return <section className="v34-group v35-group"><h4>集团经营关联 <small>公开披露</small></h4>
 {periods.map(period=><div key={period} className="v35-group-period"><div className="v35-period">{period}</div><div className="v34-group-values">{refs.filter(r=>(r.period??'公开披露')===period).map(r=><div key={r.label}><strong>{r.value.toLocaleString('zh-CN',{maximumFractionDigits:2})}<span className="v35-unit">{r.unit}</span></strong><span>{r.label}</span></div>)}</div></div>)}
 {projects&&<details className="v35-projects"><summary>查看5项已披露签约项目</summary><table><thead><tr><th>项目</th><th>签约量（万方）</th></tr></thead><tbody>{henanProjects.map(p=><tr key={p.name}><td>{p.name}</td><td>{p.volume.toFixed(2)}</td></tr>)}</tbody></table></details>}
 <p className="v35-group-note">{groupNotes[eventId]}</p><EvidenceNote ids={refs.map(r=>r.sourceId)}/></section>;
}
export function RegionalComparison(){
 const rows=regionalComparison();if(!rows.length)return null;
 return <section className="v34-comparison"><h2>区域市场与集团经营对照</h2><p>同周城市报价变化与半年报省级收入占比；仅作经营关联，不是城市收入或损失金额。</p><div className="v34-table-scroll"><table className="v31-compare-table"><thead><tr><th>城市</th><th>周价变化（元/方）</th><th>对应地区</th><th>公司收入占比</th></tr></thead><tbody>{rows.map(r=><tr key={r.city}><td>{r.city}</td><td>{r.change===0?'持平':(r.change>0?'+':'')+r.change}</td><td>{r.province}</td><td>{r.share.toFixed(2)}%</td></tr>)}</tbody></table></div><EvidenceNote ids={rows.flatMap(r=>r.sourceIds)}/></section>;
}
export function PriceCostComparison(){
 const {rows,sourceIds}=priceCostComparison();if(rows.length<2)return null;
 const values=rows.flatMap(r=>[r.sale,r.cost]),lo=Math.min(...values)-.15,hi=Math.max(...values)+.15,range=hi-lo||1;
 const x=(i:number)=>35+i*280/(rows.length-1),y=(n:number)=>125-(n-lo)/range*100;
 return <section className="v34-comparison"><h2>市场售价与原料行情对照</h2><p>同日期匹配，以首期为100；比较相对变化，不直接测算集团毛利。</p><svg viewBox="0 0 340 155" className="v34-relative-chart" role="img" aria-label="全国C30和水泥行情基期指数比较"><path d="M35 15V125H315" stroke="currentColor" opacity=".25" fill="none"/>{(['sale','cost'] as const).map(k=><g key={k}><polyline points={rows.map((r,i)=>x(i)+','+y(r[k])).join(' ')} fill="none" stroke={k==='sale'?'#7657b3':'#b47727'} strokeWidth="2.5"/>{rows.map((r,i)=><circle key={r.date} cx={x(i)} cy={y(r[k])} r="3" fill={k==='sale'?'#7657b3':'#b47727'}><title>{r.date} {r[k].toFixed(2)}</title></circle>)}</g>)}{rows.map((r,i)=><text key={r.date} x={x(i)} y="142" textAnchor="middle" fontSize="10" fill="currentColor">{r.date}</text>)}</svg><div className="v34-legend"><span style={{color:'#7657b3'}}>● C30市场均价</span><span style={{color:'#b47727'}}>● 水泥行情</span></div><details><summary>查看指数数据</summary><table className="v31-compare-table"><thead><tr><th>观测期</th><th>C30</th><th>水泥</th></tr></thead><tbody>{rows.map(r=><tr key={r.date}><td>{r.date}</td><td>{r.sale.toFixed(2)}</td><td>{r.cost.toFixed(2)}</td></tr>)}</tbody></table></details><EvidenceNote ids={sourceIds}/></section>;
}
