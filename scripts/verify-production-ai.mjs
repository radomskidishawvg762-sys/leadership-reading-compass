// A single uncached, public-evidence request to the actual production model route.
// No credentials or model response content are printed.
const origin='https://leadership-reading-compass.pages.dev';
const version=process.env.EXPECTED_RELEASE;
if(!version)throw Error('Expected release required');
let live=false;
for(let i=0;i<45;i++){try{const r=await fetch(origin+'/?verify='+encodeURIComponent(version)+'-'+i,{signal:AbortSignal.timeout(12000),cache:'no-store'});if(r.ok&&(await r.text()).includes('data-release="'+version+'"')){live=true;break}}catch{}await new Promise(r=>setTimeout(r,12000))}
if(!live)throw Error('New production release not available');
const snapshot=await fetch(origin+'/api/market-snapshot',{signal:AbortSignal.timeout(15000),cache:'no-store'});const saved=await snapshot.json();if(!snapshot.ok||!saved.snapshot?.summary||!saved.snapshot?.items?.length)throw Error('Published AI snapshot unavailable: '+snapshot.status);
const request={topic:{q:'河南水泥价格',window:'all'},question:'请根据已收录公开资料说明郑州水泥价格及其周度变化，引用来源。',history:[]};
const response=await fetch(origin+'/api/topic-chat',{method:'POST',headers:{'Content-Type':'application/json','Origin':origin},body:JSON.stringify(request),signal:AbortSignal.timeout(40000)});
const result=await response.json();if(!response.ok||typeof result.answer!=='string'||!result.answer.trim()||!result.sourceIds?.length)throw Error('Production AI check failed: HTTP '+response.status+' '+(result.error??'missing answer or citations'));
console.log('Production version '+version+'; AI snapshot HTTP '+snapshot.status+'; live topic AI HTTP '+response.status+'; cited sources '+result.sourceIds.length);
