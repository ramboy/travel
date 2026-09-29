import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import vm from 'node:vm';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';

const require=createRequire(import.meta.url);
const root=path.dirname(fileURLToPath(import.meta.url));
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const context={window:{}};
vm.createContext(context);
for(const file of ['guide-itinerary.js','guide-cuoqin-plan.js'])vm.runInContext(read(file),context,{filename:file});
const plan=JSON.parse(JSON.stringify(context.window.TIBET_CUOQIN_PLAN));
const original=JSON.parse(JSON.stringify(context.window.TIBET_ITINERARY));
const conditions=JSON.parse(read('guide-cuoqin-conditions.json'));
const html=read('tibet-cuoqin-guide.html');
const markdown=read('tibet-cuoqin-guide.md');
const weekday=['周日','周一','周二','周三','周四','周五','周六'];

assert.equal(plan.days.length,13,'retains all 13 calendar days');
assert.equal(plan.days[0].date,'2026-09-25');
assert.equal(plan.days.at(-1).date,'2026-10-07');
for(const [index,day] of plan.days.entries()){
  assert.equal(day.day,`D${index}`);
  assert.equal(day.weekday,weekday[new Date(`${day.date}T12:00:00Z`).getUTCDay()]);
  if(index)assert.equal(new Date(day.date)-new Date(plan.days[index-1].date),86400000,'calendar is continuous');
  assert.ok(day.route.length&&day.stay&&day.drive&&day.decision);
  assert.ok(day.schedule.every(row=>row.length===3));
  for(const key of day.spots)assert.ok(original.spots[key],`known spot ${key}`);
}
assert.deepEqual(plan.days.slice(4,8).map(day=>[day.date,day.stay]),[
  ['2026-09-29','措勤县'],['2026-09-30','尼玛县'],['2026-10-01','班戈县'],['2026-10-02','拉萨市']
]);
assert.deepEqual(plan.days.slice(5,8).map(day=>day.spots),original.days.slice(8,11).map(day=>day.spots),'keeps the original later sightseeing order');
assert.deepEqual(plan.days.slice(5,7).map(day=>day.route),original.days.slice(8,10).map(day=>day.route),'retains Wenbu as a stop and Nyima as the overnight destination');
assert.ok(plan.days[7].decision.includes('条件备选')&&plan.days[7].schedule.some(row=>row.join(' ').includes('替换')),'elephant gate remains a conditional alternative');
assert.ok(plan.days.slice(0,4).every(day=>day.status==='historical'));
assert.ok(plan.days[3].decision.includes('用户已确认')&&plan.days[3].decision.includes('尚未逐项确认'));
assert.ok(plan.days[4].drive.includes('待')&&!/\d+(?:\.\d+)?\s*(?:km|公里|小时)/.test(plan.days[4].drive),'new Saga drive has no invented navigation values');
assert.ok(plan.days[5].metricNote.includes('不含文布南村')&&plan.days[5].metricNote.includes('不能用作'));
assert.ok(plan.days[6].metricNote.includes('从文布南村出发')&&plan.days[6].metricNote.includes('不能沿用'));
assert.ok(plan.days.slice(8,12).every(day=>day.status==='flexible'));
assert.ok(plan.days[12].decision.includes('10 月 7 日'));
for(const hotel of plan.hotelChanges){
  assert.ok(hotel.oldCancelDeadline.includes('旧订单'),'cancellation terms retain their old-order label');
  assert.ok(/待|未确认|拟保留/.test(hotel.status),'new hotel actions are not reported complete');
}
for(const [name,date] of [['汉庭','2026-09-29'],['尚客优','2026-09-30'],['华庭','2026-10-01']]){
  const hotel=plan.hotelChanges.find(row=>row.hotel.includes(name));
  assert.equal(hotel.newDate,date);assert.ok(/确认/.test(`${hotel.status} ${hotel.action}`));
}
assert.ok(plan.hotelChanges.some(hotel=>hotel.newDate.includes('新增 3 晚')),'adds Lhasa lodging for the early return');
assert.ok(conditions.weather.length);
for(const weather of conditions.weather){
  assert.equal(weather.status,'待更新');
  for(const field of ['high','low','text','wind'])assert.equal(weather[field],null,'unverified revised-date weather stays empty');
  assert.ok(weather.checkedAt&&weather.url&&weather.note);
}
assert.ok(!html.includes('guide-weather.js'),'old date-based weather is not loaded');
assert.ok(markdown.includes('新入住日期均需确认')&&markdown.includes('没有把旧天气平移'));
assert.ok(!html.includes('4,479.4')&&!markdown.includes('4,479.4'),'old full-loop mileage is not republished as the revised route');
console.log('Data checks passed: 13 consecutive dates, later route preserved, hotel changes pending, weather unverified.');

if(process.env.GUIDE_DATA_ONLY==='1')process.exit(0);
const library=process.env.GUIDE_PLAYWRIGHT_PATH||path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {chromium}=require(library);
const browser=await chromium.launch({headless:true,executablePath:process.env.GUIDE_CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const url=process.env.GUIDE_TEST_URL||'http://127.0.0.1:8766/tibet-cuoqin-guide.html';
const output=fs.mkdtempSync(path.join(os.tmpdir(),'tibet-cuoqin-qa-'));
const errors=[],results=[],screenshots=[];
const trackErrors=page=>page.on('pageerror',error=>errors.push(error.message));

async function checkStaticContent(page,label){
  assert.equal(await page.locator('.overview-table tbody tr').count(),13,`${label}: 13 calendar rows`);
  assert.equal(await page.locator('.day').count(),9,`${label}: 9 upcoming daily articles`);
  assert.equal(await page.locator('.history-row').count(),4,`${label}: 4 historical rows`);
  const rows=await page.locator('.overview-table tbody tr').evaluateAll(rows=>rows.map(row=>[row.cells[0].innerText,row.cells[2].innerText]));
  for(let index=0;index<plan.days.length;index++){
    assert.ok(rows[index][0].includes(plan.days[index].date.slice(5).replace('-','.')));
    assert.ok(rows[index][0].includes(plan.days[index].weekday));
    assert.equal(rows[index][1],plan.days[index].stay);
  }
  const anchors=await page.evaluate(()=>[...document.querySelectorAll('a[href^="#"]')].filter(a=>a.hash&&!document.getElementById(decodeURIComponent(a.hash.slice(1)))).map(a=>a.hash));
  assert.deepEqual(anchors,[],`${label}: internal links resolve`);
  const ids=await page.locator('[id]').evaluateAll(nodes=>nodes.map(node=>node.id));
  assert.equal(new Set(ids).size,ids.length,`${label}: unique anchor IDs`);
  assert.ok((await page.locator('#hotels').innerText()).includes('新日期待确认'));
  assert.ok((await page.locator('#weather').innerText()).includes('旧预报没有平移'));
  const weather=await page.locator('.weather-table tbody tr').evaluateAll(rows=>rows.map(row=>[row.cells[2].innerText,row.cells[3].innerText]));
  assert.ok(weather.every(row=>row[0]==='待更新'&&row[1]==='待更新'));
  for(const [day,names] of [['D5',['扎日南木措','文布南村']],['D6',['色林措']],['D7',['纳木措','圣象天门']]]){
    const titles=await page.locator(`#day-${day} .spot figcaption b`).allTextContents();
    assert.deepEqual(titles,names,`${label}: original spot sequence for ${day}`);
  }
}

try{
  for(const width of [360,390,768,1440]){
    const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
    trackErrors(page);
    await page.goto(url,{waitUntil:'domcontentloaded'});
    await page.locator('.day').first().waitFor();
    await checkStaticContent(page,`${width}px`);
    const initial=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,body:document.body.scrollWidth}));
    assert.ok(initial.scroll<=width+1&&initial.body<=width+1,`no page overflow at ${width}px: ${JSON.stringify(initial)}`);
    const details=page.locator('#day-D5 details');
    assert.equal(await details.evaluate(node=>node.open),false,'day detail starts collapsed');
    await details.locator('summary').click();
    assert.equal(await details.evaluate(node=>node.open),true,'native detail opens');
    assert.ok(await details.locator('.spot-grid').isVisible());
    const expanded=await page.evaluate(()=>document.documentElement.scrollWidth);
    assert.ok(expanded<=width+1,`expanded detail does not overflow at ${width}px`);
    await details.locator('summary').click();
    assert.equal(await details.evaluate(node=>node.open),false,'native detail closes');

    if(width===1440){
      await page.evaluate(()=>document.querySelectorAll('img').forEach(image=>image.loading='eager'));
      await page.waitForFunction(()=>[...document.images].every(image=>image.complete),null,{timeout:20000}).catch(()=>{});
      const photos=await page.locator('img').evaluateAll(images=>images.map(image=>({
        alt:image.alt,src:image.src,loaded:image.complete&&image.naturalWidth>0,
        hidden:image.hidden,fallback:image.nextElementSibling?.classList.contains('image-note')||false,
        group:image.closest('.hotel-card')?'hotel':image.closest('.spot')?'spot':'hero'
      })));
      assert.equal(photos.filter(photo=>photo.group==='hotel').length,4,'four hotel candidate images are rendered');
      assert.ok(photos.filter(photo=>photo.group==='spot').length>=6,'later sightseeing photos are present');
      assert.ok(photos.every(photo=>photo.loaded||photo.hidden&&photo.fallback),'every failed image has a readable source fallback');
      assert.ok(photos.every(photo=>!photo.loaded||!photo.hidden),'loaded images are visible');
      results.push({photos});
    }

    await page.locator('.day-tabs a[href="#day-D5"]').click();
    await page.waitForFunction(()=>location.hash==='#day-D5');
    const anchorPosition=await page.evaluate(()=>({
      dayTop:document.querySelector('#day-D5').getBoundingClientRect().top,
      navBottom:document.querySelector('.nav').getBoundingClientRect().bottom
    }));
    assert.ok(anchorPosition.dayTop>=anchorPosition.navBottom-1,`daily anchor is not covered by navigation at ${width}px`);
    assert.ok(anchorPosition.dayTop<600,`daily anchor is on screen at ${width}px`);
    results.push({width,anchorPosition});
    if(width===390||width===1440){
      const shot=path.join(output,`day-D5-anchor-${width}.png`);
      await page.screenshot({path:shot});screenshots.push(shot);
    }

    if(width===390||width===1440){
      await page.evaluate(()=>scrollTo(0,0));
      await page.waitForFunction(()=>document.querySelector('.hero-photo img')?.complete,null,{timeout:15000}).catch(()=>{});
      const hero=path.join(output,`hero-${width}.png`);await page.screenshot({path:hero});screenshots.push(hero);
      for(const selector of ['#day-D5','#hotels','#weather']){
        const shot=path.join(output,`${selector.slice(1)}-${width}.png`);
        await page.locator(selector).screenshot({path:shot,timeout:15000});screenshots.push(shot);
      }
    }
    if(width===1440){
      await details.locator('summary').click();
      const states=await page.locator('details').evaluateAll(nodes=>nodes.map(node=>node.open));
      await page.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));
      assert.ok((await page.locator('details').evaluateAll(nodes=>nodes.map(node=>node.open))).every(Boolean),'printing expands all details');
      await page.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));
      await page.emulateMedia({media:'print'});
      const print=await page.locator('.table-wrap').evaluateAll(nodes=>nodes.map(node=>({container:node.getBoundingClientRect().width,table:node.querySelector('table').getBoundingClientRect().width})));
      assert.ok(print.every(row=>row.table<=row.container+1),'all print tables fit their containers');
      await page.emulateMedia({media:'screen'});
      await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));
      assert.deepEqual(await page.locator('details').evaluateAll(nodes=>nodes.map(node=>node.open)),states,'printing restores exactly the previous detail state');
      await page.evaluate(()=>{window.__printCalls=0;window.print=()=>window.__printCalls++;});
      await page.locator('#print-guide').click();
      assert.equal(await page.evaluate(()=>window.__printCalls),1,'print button invokes print');
      await page.locator('.hero-photo img').evaluate(image=>image.dispatchEvent(new Event('error')));
      const fallback=await page.locator('.hero-photo').evaluate(figure=>({
        display:getComputedStyle(figure.querySelector('img')).display,
        note:figure.querySelector('.image-note')?.textContent,
        sourceLinks:figure.querySelectorAll('figcaption a').length
      }));
      assert.equal(fallback.display,'none','failed image is actually hidden, including with global img display rules');
      assert.ok(fallback.note.includes('图片暂未载入')&&fallback.sourceLinks>0,'failed image leaves a readable fallback and source link');
      await page.locator('.hero-photo img').evaluate(image=>image.dispatchEvent(new Event('error')));
      assert.equal(await page.locator('.hero-photo .image-note').count(),1,'repeated image failures do not duplicate fallback notices');
      results.push({simulatedImageFallback:fallback});
      results.push({printTables:print});
    }
    results.push({width,...initial,expandedScroll:expanded});
    await page.close();
  }
  const filePage=await browser.newPage({viewport:{width:390,height:1000}});trackErrors(filePage);
  await filePage.goto(pathToFileURL(path.join(root,'tibet-cuoqin-guide.html')).href,{waitUntil:'domcontentloaded'});
  await checkStaticContent(filePage,'file://');
  assert.ok(await filePage.locator('#day-D4 .schedule').isVisible(),'local file has readable schedule');
  await filePage.close();

  const noJS=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:1000}});
  const noJSPage=await noJS.newPage();trackErrors(noJSPage);
  await noJSPage.goto(url,{waitUntil:'domcontentloaded'});
  await checkStaticContent(noJSPage,'no JavaScript');
  await noJSPage.locator('#day-D5 summary').click();
  assert.ok(await noJSPage.locator('#day-D5 .spot-grid').isVisible(),'native details still work without JavaScript');
  await noJSPage.goto(pathToFileURL(path.join(root,'tibet-cuoqin-guide.html')).href,{waitUntil:'domcontentloaded'});
  await checkStaticContent(noJSPage,'file:// without JavaScript');
  assert.ok(await noJSPage.locator('#day-D4 .schedule').isVisible(),'offline no-JS schedule remains readable');
  await noJS.close();
  assert.deepEqual(errors,[],'no page errors');
  console.log(JSON.stringify({output,results,screenshots,errors,fileReadable:true,noJSReadable:true},null,2));
}finally{
  await browser.close();
}
