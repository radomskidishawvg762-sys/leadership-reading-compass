import { chromium } from 'playwright-core';
const origin=process.env.PREVIEW_ORIGIN??'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BINARY??'/usr/bin/google-chrome',args:['--no-sandbox','--disable-dev-shm-usage']});
const page=await browser.newPage({viewport:{width:1440,height:900},locale:'zh-CN'});
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
try{
  await page.goto(origin+'/topics',{waitUntil:'domcontentloaded'});
  if(await page.locator('.topic-v21-entry').count()!==6)throw Error('Expected six curated topic cards');
  if(await page.locator('.topic-v21-chip').count()!==6)throw Error('Expected six quick topic choices');
  console.log('Six curated topics displayed');
  await page.route('**/api/topic-chat',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
    answer:'【核心判断】郑州水泥成本上行，但混凝土市场售价持平，不能推定集团利润已下降。[S1][E1]\n【主要依据】郑州市场 C30 报价周度持平。[S1]\n【建议行动】1. 优先筛查固定价格合同。\n2. 核实实际到货价。\n【关键缺口】实际成交与采购记录。',
    sourceIds:['public-zhengzhou'],eventIds:['EV-PUBLIC-005'],
  })}));
  await page.goto(origin+'/topics?q=郑州成都价格&window=all&topicId=regional-price',{waitUntil:'domcontentloaded'});
  await page.locator('.topic-narrative-heading').first().waitFor({timeout:15000});
  const headings=await page.locator('.topic-v21-analysis .topic-narrative-heading').allTextContents();
  console.log('Formatted headings',headings);
  if(headings.length!==4)throw Error('Expected 4 narrative sections, got '+headings.length);
  const text=await page.locator('.topic-v21-analysis').innerText();
  if(text.includes('[S1]')||text.includes('[E1]'))throw Error('Raw technical references leaked to UI');
  const source=page.locator('.topic-v21-analysis a[href*="public-zhengzhou"]').first();
  await source.waitFor({timeout:10000});
  if(await page.locator('.topic-v21-analysis .topic-citation').count()<2)throw Error('Missing inline evidence citations');
  console.log('AI citations are rendered as linked, compact reference markers');
  await page.locator('.topic-v21-source-list summary').click();
  if(await page.locator('.topic-v21-source-rows a').count()<1)throw Error('Source details failed to expand');
  await page.goto(origin+'/reports',{waitUntil:'domcontentloaded'});
  await page.locator('.report-editorial-intro').waitFor({timeout:15000});
  if(await page.locator('.report-editorial-card').count()<1)throw Error('No editorial report cards');
  await page.locator('.report-editorial-card').first().click();
  await page.locator('.detail-editorial-overline').waitFor({timeout:15000});
  await page.locator('.detail-judgment-label').getByText('当前研判').waitFor();
  console.log('Report list, deep link, detail editorial header verified');
  if(errors.length)throw Error('Browser errors: '+errors.join('; '));
}finally{await browser.close();}
