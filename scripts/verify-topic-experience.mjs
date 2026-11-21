import { chromium } from 'playwright-core';
const origin=process.env.PREVIEW_ORIGIN??'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BINARY??'/usr/bin/google-chrome',args:['--no-sandbox','--disable-dev-shm-usage']});
const page=await browser.newPage({viewport:{width:1440,height:900}});
const errors=[];
page.on('pageerror',err=>errors.push(err.message));
try{
  let aiCalls=0;
  await page.route('**/api/topic-chat',route=>{
    aiCalls++;
    return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
      answer:'【核心判断】先核实合同首款与资金保障。[S1]',
      sourceIds:['public-housing'],eventIds:['EV-PUBLIC-003'],
    })});
  });
  await page.goto(origin+'/topics',{waitUntil:'domcontentloaded'});
  await page.locator('main h1').getByText('专题研判').waitFor();
  await page.locator('.topic-v21-entry').filter({hasText:'房建资金压力如何传导到合同？'}).getByRole('button',{name:/进入专题/}).click();
  await page.waitForURL(/topicId=housing-cash/,{timeout:15000});
  await page.locator('.topic-v21-event').first().waitFor({timeout:15000});
  const count=await page.locator('.topic-v21-event').count();
  console.log('featured topic event cards',count);
  if(count!==2)throw Error('Pinned housing topic must contain 2 canonical events');
  const ids=await page.locator('.topic-v21-event h4 a').evaluateAll(items=>items.map(el=>el.getAttribute('href')));
  if(new Set(ids).size!==ids.length)throw Error('Duplicate event links');
  if(!ids.every(href=>href?.startsWith('/events/EV-')))throw Error('Missing event deep-link');
  await page.locator('.topic-fixed-meta').first().waitFor();
  if(!(await page.locator('.topic-v21-analysis').innerText()).includes('资金'))throw Error('Pinned static analysis missing');
  if(aiCalls!==0)throw Error('Pinned topic initial opening must not call model API');
  await page.getByLabel('专题连续追问').fill('先核实什么？');
  await page.getByRole('button',{name:'追问'}).click();
  await page.locator('.topic-v21-turn').last().getByText(/先核实合同首款/).waitFor({timeout:10000});
  if(aiCalls!==1)throw Error('Follow-up should trigger exactly one model request');
  console.log('Pinned topic instant render, zero initial API requests, one follow-up request');
  await page.getByLabel('专题时间窗').selectOption('7d');
  await page.waitForURL(/window=7d/);
  await page.locator('.topic-v21-event').first().waitFor();
  console.log('window filter verified');
  await page.getByLabel('专题问题或区域').fill('成都混凝土');
  await page.getByRole('button',{name:'研判分析'}).click();
  await page.waitForURL(/q=/);
  await page.waitForFunction(()=>document.querySelector('.topic-v21-heading h2')?.textContent==='成都混凝土');
  const scoped=await page.locator('.topic-v21-event').count();
  if(scoped!==1)throw Error('City-scoped search should show exactly one canonical event, got '+scoped);
  await page.locator('.topic-v21-analysis').getByText(/AI 服务尚未配置|正在组织|研判摘要/).first().waitFor({timeout:10000});
  console.log('topic search, features, time range, deep links passed');
  if(errors.length)throw Error('Browser errors: '+errors.join('; ').slice(0,600));
}finally{await browser.close();}
