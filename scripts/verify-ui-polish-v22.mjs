import { chromium } from 'playwright-core';
const origin=process.env.PREVIEW_ORIGIN??'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BINARY??'/usr/bin/google-chrome',args:['--no-sandbox','--disable-dev-shm-usage']});
const page=await browser.newPage({viewport:{width:1440,height:900},locale:'zh-CN'});
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
try{
  await page.goto(origin+'/topics',{waitUntil:'domcontentloaded'});
  if(await page.locator('.topic-v21-entry').count()!==3)throw Error('Expected three curated topic cards');
  if(await page.locator('.topic-v21-chip').count()!==0)throw Error('Do not duplicate pinned shortcuts on landing');
  await page.locator('.topic-feature-image').first().scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>{
    const imgs=[...document.querySelectorAll('.topic-feature-image')];
    return imgs.length===3 && imgs.every(img=>img.complete && img.naturalWidth>0);
  },null,{timeout:20000});
  const illustrations=await page.locator('.topic-feature-image').evaluateAll(images=>images.map(image=>({
    src:image.getAttribute('src'),loaded:image.complete && image.naturalWidth>0,
  })));
  if(illustrations.length!==3 || new Set(illustrations.map(item=>item.src)).size!==3)
    throw Error('Three illustrated themes must use separate assets');
  if(illustrations.some(item=>!item.loaded || !item.src?.startsWith('https://images.unsplash.com/photo-')))
    throw Error('Missing actual photography — SVG illustrations are not acceptable');
  const columns=await page.locator('.topic-v21-intro-grid').evaluate(element=>getComputedStyle(element).gridTemplateColumns.split(' ').length);
  if(columns!==3)throw Error('Desktop research selection must use exactly three equal columns');
  const coordinates=await page.locator('.topic-v21-entry').evaluateAll(items=>items.map(el=>Math.round(el.getBoundingClientRect().top)));
  if(new Set(coordinates).size!==1)throw Error('Desktop research triptych must occupy one single row');
  console.log('Three distinct REAL PHOTOGRAPHS align across one desktop row');
  await page.route('**/api/topic-chat',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
    answer:'【核心判断】郑州水泥成本上行，但混凝土市场售价持平，不能推定集团利润已下降。[S1][E1]\n【主要依据】郑州市场 C30 报价周度持平。[S1]\n【建议行动】1. 优先筛查固定价格合同。\n2. 核实实际到货价。\n【关键缺口】实际成交与采购记录。',
    sourceIds:['public-zhengzhou'],eventIds:['EV-PUBLIC-005'],
  })}));
  await page.goto(origin+'/topics?q=房建资金压力如何传导到合同？&window=all&topicId=housing-cash',{waitUntil:'domcontentloaded'});
  await page.locator('.topic-evidence-pulse-item').first().waitFor({timeout:15000});
  if(await page.locator('.topic-evidence-pulse-item').count()!==2)throw Error('Expected evidence-bound snapshot highlights');
  if(!(await page.locator('.topic-evidence-pulse').innerText()).includes('2026年前十个月'))
    throw Error('Topic headline metrics missing dated statistical period');
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
  await page.locator('.report-cover-photo img[src^="https://images.unsplash.com/photo-"]').waitFor({timeout:15000});
  await page.waitForFunction(()=>{
    const img=document.querySelector('.report-cover-photo img');
    return img?.complete&&img.naturalWidth>0;
  },null,{timeout:20000});
  const cover=await page.locator('.report-cover').evaluate(element=>{
    const image=element.querySelector('img').getBoundingClientRect();
    const copy=element.querySelector('.report-cover-copy').getBoundingClientRect();
    const parent=element.getBoundingClientRect();
    const header=document.querySelector('.masthead').getBoundingClientRect();
    return {imageWidth:image.width,imageHeight:image.height,gap:image.x-copy.right,
      top:parent.y,headerHeight:header.height,copyHeight:copy.height};
  });
  if(cover.imageWidth<300 || cover.imageHeight<170 || cover.gap>80)
    throw Error('Report editorial photo too small or separated from heading: '+JSON.stringify(cover));
  if(cover.headerHeight>90)throw Error('Global header is still excessively tall');
  console.log('Real report photograph loaded, compact heading/photo balance',cover);
  if(await page.locator('.report-reading-item').count()<1)throw Error('No editorial report rows');
  await page.locator('.report-reading-item').first().click();
  await page.locator('.detail-editorial-overline').waitFor({timeout:15000});
  await page.locator('.detail-judgment-label').getByText('研判').waitFor();
  console.log('Editorial list, deep link, detail reading hierarchy verified');
  if(errors.length)throw Error('Browser errors: '+errors.join('; '));
}finally{await browser.close();}
