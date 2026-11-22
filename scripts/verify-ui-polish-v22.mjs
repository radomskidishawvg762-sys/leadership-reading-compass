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
  if(illustrations.some(item=>!item.loaded || !item.src?.startsWith('/market/') || !item.src?.endsWith('.webp')))
    throw Error('Topic photographs must be loaded as local WebP assets');
  const columns=await page.locator('.topic-v21-intro-grid').evaluate(element=>getComputedStyle(element).gridTemplateColumns.split(' ').length);
  if(columns!==3)throw Error('Desktop research selection must use exactly three equal columns');
  const coordinates=await page.locator('.topic-v21-entry').evaluateAll(items=>items.map(el=>Math.round(el.getBoundingClientRect().top)));
  if(new Set(coordinates).size!==1)throw Error('Desktop research triptych must occupy one single row');
  const remotePhotoRequests=await page.evaluate(()=>performance.getEntriesByType('resource')
    .filter(item=>item.name.includes('images.unsplash.com')));
  if(remotePhotoRequests.length)throw Error('Topic images still depend on external Unsplash CDN');
  console.log('Three locally hosted photographs align across one desktop row');
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
  await page.locator('.report-cover-photo img[src="/market/report-market-v27.webp"]').waitFor({timeout:15000});
  await page.waitForFunction(()=>{
    const img=document.querySelector('.report-cover-photo img');
    return img?.complete&&img.naturalWidth>0;
  },null,{timeout:20000});
  const cover=await page.locator('.report-cover').evaluate(element=>{
    const image=element.querySelector('img').getBoundingClientRect();
    const copy=element.querySelector('.report-cover-copy').getBoundingClientRect();
    const parent=element.getBoundingClientRect();
    const header=document.querySelector('.masthead').getBoundingClientRect();
    const caption=element.querySelector('.report-cover-photo figcaption');
    return {imageWidth:image.width,imageHeight:image.height,gap:image.x-copy.right,
      top:parent.y,headerHeight:header.height,copyHeight:copy.height,
      radius:getComputedStyle(element.querySelector('.report-cover-photo')).borderTopLeftRadius,
      aspect:image.width/image.height,figcaption:caption?.textContent??''};
  });
  if(cover.imageWidth<300 || cover.imageHeight<125 || cover.imageHeight>225 || cover.gap>80)
    throw Error('Report photo size/gap outside compact editorial range: '+JSON.stringify(cover));
  if(cover.radius!=='6px' || cover.aspect<2.25 || cover.aspect>2.8)
    throw Error('Report photograph needs a 6px radius and wide 2.55:1 viewport: '+JSON.stringify(cover));
  const widths=await page.evaluate(()=>{
    const rect=s=>document.querySelector(s).getBoundingClientRect();
    return {cover:rect('.report-cover').x,filters:rect('.filters').x,list:rect('.report-reading-list').x};
  });
  if(Math.max(...Object.values(widths))-Math.min(...Object.values(widths))>2)
    throw Error('Cover, filters and report list must share their left edge: '+JSON.stringify(widths));
  if(cover.headerHeight>90)throw Error('Global header is still excessively tall');
  const reportRemote=await page.evaluate(()=>performance.getEntriesByType('resource')
    .filter(item=>item.name.includes('images.unsplash.com')));
  if(reportRemote.length)throw Error('Report still loads external image assets');
  console.log('Local WebP report image loaded, compact heading/photo balance',cover);
  if(await page.locator('.report-reading-item').count()<1)throw Error('No editorial report rows');
  await page.locator('.report-reading-item').first().click();
  await page.locator('.detail-editorial-overline').waitFor({timeout:15000});
  await page.locator('.detail-judgment-label').getByText('研判').waitFor();
  console.log('Editorial list, deep link, detail reading hierarchy verified');
  await page.setViewportSize({width:390,height:844});
  await page.goto(origin+'/reports',{waitUntil:'domcontentloaded'});
  await page.locator('.report-cover-photo img').waitFor();
  const mobile=await page.locator('.report-cover-photo').evaluate(element=>({
    w:element.getBoundingClientRect().width,
    h:element.getBoundingClientRect().height,
    radius:getComputedStyle(element).borderTopLeftRadius,
  }));
  if(mobile.w<230 || mobile.h<90 || mobile.radius!=='6px')
    throw Error('Mobile report photo broken: '+JSON.stringify(mobile));
  await page.goto(origin+'/topics',{waitUntil:'domcontentloaded'});
  const columnCount=await page.locator('.topic-v21-intro-grid').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length);
  if(columnCount!==1)throw Error('Mobile topics must stack into one column');
  if(errors.length)throw Error('Browser errors: '+errors.join('; '));
}finally{await browser.close();}
