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
  for(const [label,url] of [['重点议题','/?view=issues'],['专题研判','/topics'],['经营简报','/?view=briefs'],['市场态势','/']]){
    const start=Date.now();
    await nav.getByRole('link',{name:label}).click();
    await page.waitForURL(origin+url,{timeout:20000});
    await assertPage(label==='事件专报'?'事件专报':label,url);
    console.log('click',label,Date.now()-start+'ms');
  }
  if(await page.getByRole('button',{name:'一号位',exact:true}).count())throw Error('role switch still present');
  if(await page.getByText('近七日重点变化',{exact:true}).count())throw Error('weekly gate still visible');
  await page.getByRole('heading',{name:'集团经营影响与建议'}).waitFor();
  await page.getByText('天府科创园二期取得施工许可，采购时间待核',{exact:true}).first().waitFor();
  for(const [path,title] of [['/?issue=2026-11-20','本周速览'],['/monthly?month=2026-11','月度简报'],['/reports','事件专报']]){
    await page.goto(origin+path,{waitUntil:'domcontentloaded'});
    await assertPage(title,path);
    await page.getByRole('link',{name:'返回经营简报',exact:true}).click();
    await assertPage('经营简报','/?view=briefs');
  }
  if(errors.length)console.log('Browser warnings/errors',errors);
  console.log('Browser navigation verification PASSED');
}finally {await browser.close();}
