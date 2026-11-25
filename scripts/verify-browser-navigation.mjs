import { chromium } from 'playwright-core';
const origin=process.env.PREVIEW_ORIGIN ?? 'http://127.0.0.1:4173';
const errors=[];
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BINARY??'/usr/bin/google-chrome',args:['--no-sandbox','--disable-dev-shm-usage']});
const page=await browser.newPage({viewport:{width:1440,height:900},locale:'zh-CN'});
page.on('pageerror', error=>errors.push('pageerror: '+error.message));
page.on('requestfailed', req=>errors.push('request failed: '+req.url()+' '+req.failure()?.errorText));
page.on('console', msg=>{ if(msg.type()==='error')errors.push('console: '+msg.text().slice(0,250)) });
async function assertPage(name, expectedUrl) {
  await page.waitForFunction((name) => document.querySelector('main h1')?.textContent?.trim() === name, name, {timeout:15000});
  const heading=await page.locator('main h1').first().textContent({timeout:15000});
  console.log('page',name,'heading=',heading,'url=',page.url());
  if(heading?.trim()!==name)throw Error(`expected ${name}, got ${heading}, url=${page.url()}, browser errors=${JSON.stringify(errors)}`);
  if(!page.url().endsWith(expectedUrl))throw Error('URL did not update to '+expectedUrl+'; '+page.url());
}
try {
  const start=Date.now();
  await page.goto(origin+'/',{waitUntil:'domcontentloaded',timeout:30000});
  console.log('initial DOMContentLoaded',Date.now()-start+'ms');
  await assertPage('市场态势','/');
  await page.waitForTimeout(1200);
  const nav=page.locator('nav.main-nav');
  for(const [label,url] of [['市场监测','/?view=monitor'],['专题研判','/?view=issues'],['经营简报','/?view=briefs'],['市场态势','/']]){
    const start=Date.now();
    await nav.getByRole('link',{name:label}).click();
    await page.waitForURL(origin+url,{timeout:20000});
    await assertPage(label==='事件专报'?'事件专报':label,url);
    console.log('click',label,Date.now()-start+'ms');
  }
  if(await page.getByRole('button',{name:'一号位',exact:true}).count())throw Error('role switch still present');
  if(await page.getByText('近七日重点变化',{exact:true}).count())throw Error('weekly gate still visible');
  await page.getByRole('heading',{name:'核心市场监测'}).waitFor();
  await page.getByRole('heading',{name:'当前 AI 综合研判'}).waitFor();
  if(await page.locator('main').getAttribute('data-release')!=='v3.9')throw Error('wrong release marker');
  await page.getByText('全国C30市场参考价',{exact:true}).first().waitFor();
  await page.getByRole('heading',{name:'集团经营地区 · 本期价格变化'}).waitFor();
  await page.getByText('河南营业收入',{exact:true}).first().waitFor();
  await page.getByText('河南5项披露项目签约量',{exact:true}).first().waitFor();
  const first=await page.locator('.v30-dynamic').boundingBox();if(!first||first.y>950)throw Error('home header too tall: '+first?.y);
  if(!await page.getByText('AI研判建议',{exact:true}).count())throw Error('published advice missing');
  await page.goto(origin+'/?view=issues',{waitUntil:'domcontentloaded'});
  await page.getByText('AI研判建议',{exact:true}).first().waitFor();
  let modelRequests=0;const observe=req=>{if(req.url().includes('/api/topic-chat'))modelRequests++};page.on('request',observe);
  await page.getByRole('link',{name:'深入研判'}).first().click();
  await page.getByText('详细影响分析',{exact:true}).waitFor();
  if(modelRequests)throw Error('topic opening called model');page.off('request',observe);
  await page.goto(origin+'/',{waitUntil:'domcontentloaded'});
  await page.locator('.v30-evidence summary').first().click();
  if(!await page.locator('.v30-evidence[open] a[target=_blank]').count())throw Error('Missing original evidence link');
  await page.goto(origin+'/?view=monitor',{waitUntil:'domcontentloaded'});
  for(const category of ['需求','价格','成本','资金','市场机会','竞争']){
    await page.getByRole('button',{name:category,exact:true}).click();
    await page.getByRole('heading',{name:'AI 综合结论'}).waitFor();
    if(!await page.locator('.v30-monitor-grid .v30-metric, .v37-data-section').count())throw Error('missing metrics '+category);
  }
  await page.getByRole('button',{name:'价格',exact:true}).click();
  await page.getByText('重点城市C30市场报价与集团经营参照',{exact:true}).waitFor();
  await page.locator('.v32-bar-row[data-region="重庆"]').first().waitFor();
  if(await page.locator('.v32-zero-dot').count()!==3)throw Error('zero changes missing');
  await page.getByRole('button',{name:'正常模式 切换'}).click();
  if(await page.locator('html').getAttribute('data-reading-mode')!=='eye')throw Error('eye mode not applied');
  await page.getByRole('button',{name:'护眼模式 切换'}).click();
  await page.getByRole('button',{name:'成本',exact:true}).click();
  await page.getByText('全国砂石综合均价',{exact:true}).waitFor();
  if(!await page.locator('.v33-metric-note').count())throw Error('missing metric explanations');
  await page.getByText('S95矿渣粉样本均价',{exact:true}).waitFor();
  await page.getByRole('button',{name:'市场机会',exact:true}).click();
  await page.getByRole('heading',{name:'重点区域项目线索'}).waitFor();
  if(await page.locator('.v32-bar-row').count()<7)throw Error('investment categories missing');
  await page.getByRole('button',{name:'竞争',exact:true}).click();
  await page.getByText('公开披露商混销量对比',{exact:true}).waitFor();
  for(const [path,title] of [['/?issue=2026-11-20','本周速览'],['/monthly?month=2026-11','月度简报'],['/reports','事件专报']]){
    await page.goto(origin+path,{waitUntil:'domcontentloaded'});
    await assertPage(title,path);
    await page.getByRole('link',{name:'返回经营简报',exact:true}).click();
    await assertPage('经营简报','/?view=briefs');
  }
  if(errors.length)console.log('Browser warnings/errors',errors);
  console.log('Browser navigation verification PASSED');
}finally {await browser.close();}
