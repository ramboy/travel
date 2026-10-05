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
for(const file of ['guide-itinerary.js','guide-cuoqin-plan.js','guide-base.js'])vm.runInContext(read(file),context,{filename:file});
const plan=JSON.parse(JSON.stringify(context.window.TIBET_CUOQIN_PLAN));
const original=JSON.parse(JSON.stringify(context.window.TIBET_ITINERARY));
const base=JSON.parse(JSON.stringify(context.window.TIBET_BASE));
const conditions=JSON.parse(read('guide-cuoqin-conditions.json'));
const html=read('tibet-cuoqin-guide.html');
const markdown=read('tibet-cuoqin-guide.md');
const weekday=['周日','周一','周二','周三','周四','周五','周六'];
const hotelHeaders=['入住日','晚数 / 间数','地点','酒店名','单间价格','房型','可取消时间','面积','床型','供氧方式','早餐'];
const normalize=value=>String(value).replace(/\s+/g,' ').trim();
const retiredHotelUI=/酒店改期|订单对照与旧单待办|原入住日|新计划入住日|待办与状态/;

assert.equal(plan.days.length,10,'revised trip has 10 calendar days and 9 nights');
assert.equal(plan.meta.startDate,'2026-09-25');
assert.equal(plan.meta.endDate,'2026-10-04');
assert.equal(plan.days[0].date,'2026-09-25');
assert.equal(plan.days.at(-1).date,'2026-10-04');
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
assert.ok(plan.days[8].stay.includes('拉萨'),'October 3 retains Lhasa lodging');
assert.ok(plan.days[9].route.join(' ').includes('杭州'),'D9 returns to Hangzhou');
assert.ok(!/拉萨.*(?:住|住宿)|(?:住|住宿).*拉萨/.test(plan.days[9].stay),'October 4 does not add another Lhasa overnight');
for(const hotel of plan.hotelChanges){
  assert.ok(/旧订单|本笔新订单/.test(hotel.oldCancelDeadline),'cancellation terms identify their applicable order');
}
for(const [name,date] of [['尚客优','2026-09-30']]){
  const hotel=plan.hotelChanges.find(row=>row.hotel.includes(name));
  assert.ok(hotel.newDate.includes(date));assert.ok(/核实|确认/.test(`${hotel.status} ${hotel.action}`));
}
const jinjiang=plan.confirmedStays.find(stay=>stay.id==='coqen-jinjiang-20260929');
assert.ok(jinjiang,'order screenshot supplies a confirmed Coqen stay');
assert.equal(jinjiang.hotel,'锦江之星酒店（阿里措勤国道216店）');
assert.equal(jinjiang.checkin,'2026-09-29');
assert.equal(jinjiang.checkout,'2026-09-30');
assert.equal(jinjiang.nights,1);
assert.equal(jinjiang.status,'已入住');
assert.deepEqual(jinjiang.rooms.map(room=>[room.name,room.count,room.amount]),[
  ['高级大床房',1,536],['标准大床房',1,520]
]);
assert.equal(jinjiang.total,1056);
assert.equal(jinjiang.rooms.reduce((total,room)=>total+room.amount,0),jinjiang.total,'two screenshot orders total ¥1,056');
assert.equal(jinjiang.rooms.reduce((total,room)=>total+room.count,0),2);
assert.ok(jinjiang.rooms.every(room=>room.features==='弥散供氧、全屋智控、加湿器'));
assert.equal(jinjiang.source,'用户提供的订单截图');
const huating=plan.confirmedStays.find(stay=>stay.hotel.includes('华庭'));
const homeinn=plan.confirmedStays.find(stay=>stay.hotel.includes('如家')&&stay.hotel.includes('布达拉宫广场'));
assert.ok(huating&&homeinn,'October 3 screenshots supply both additional hotel records');
assert.equal(plan.confirmedStays.length,3,'only the three screenshot-backed stays are current records');
for(const [stay,expected] of [[huating,{checkin:'2026-10-01',checkout:'2026-10-02',nights:1,rooms:1,total:632,room:'特惠大床'}],[homeinn,{checkin:'2026-10-02',checkout:'2026-10-04',nights:2,rooms:2,total:1932,room:'高级双床'}]]){
  assert.equal(stay.checkin,expected.checkin);assert.equal(stay.checkout,expected.checkout);assert.equal(stay.nights,expected.nights);
  assert.equal((new Date(stay.checkout)-new Date(stay.checkin))/86400000,stay.nights);
  assert.equal(stay.rooms.length,1,'one room type is present in each new order');
  assert.ok(stay.rooms[0].name.includes(expected.room));
  assert.equal(stay.rooms.reduce((sum,room)=>sum+room.count,0),expected.rooms);
  assert.equal(stay.total,expected.total);
  assert.equal(stay.rooms.reduce((sum,room)=>sum+room.amount,0),stay.total,'row amounts are order totals, not per-room rates');
  assert.ok(stay.rooms.every(room=>room.amountLabel&&/合计|总/.test(room.amountLabel)),'amount scope is explicitly recorded');
  assert.ok(stay.source.includes('用户')&&stay.source.includes('截图'));
}
assert.ok(huating.status.includes('已完成'),'Huating order is complete');
assert.ok(/扣款成功|已扣款/.test(huating.paymentStatus)&&!huating.paymentStatus.includes('待扣款'),'Huating payment has been taken');
assert.ok(homeinn.paymentStatus.includes('离店扣款')&&homeinn.paymentStatus.includes('待扣款'),'Home Inn payment is still pending');
assert.ok(/未显示|未确认|未知/.test(`${homeinn.status} ${homeinn.note}`),'Home Inn check-in remains unverified');
assert.ok(!/^已入住$|^已完成$/.test(homeinn.status),'pending payment is not interpreted as check-in or completion');
const breakfast=homeinn.breakfast.replace(/\s+/g,'');
for(const day of [3,4])assert.ok(new RegExp(`10(?:月|/|\\.|-)${day}(?:日)?`).test(breakfast),`breakfast explicitly covers October ${day}`);
assert.ok(/每间[^。；]*2份/.test(breakfast)&&/(?:两间|2间)[^。；]*4份/.test(breakfast),'two rooms provide two breakfasts each, four each day');
assert.ok(/每天|每日|各|均/.test(breakfast),'breakfast quantities are daily rather than a whole-stay total');
assert.equal(plan.returnFlight.date,'2026-10-04');
assert.equal(plan.returnFlight.number,'TV9949');
assert.ok(plan.returnFlight.from.includes('拉萨')&&plan.returnFlight.to.includes('杭州'));
assert.equal(plan.returnFlight.departureTime,null,'old outbound time is not carried onto the rescheduled return');
assert.equal(plan.returnFlight.arrivalTime,null,'new return arrival time remains unconfirmed');
for(const artifact of [html,markdown]){
  assert.ok(!retiredHotelUI.test(artifact),'the revised guide presents hotel information without the old change-order interface');
  assert.ok(artifact.includes('酒店信息')&&artifact.includes('单间价格'),'HTML and Markdown both publish the hotel information table');
  assert.ok(/483/.test(artifact)&&/均摊/.test(artifact),'Home Inn unit price is labelled as an average');
  for(const stay of [huating,homeinn]){
    assert.ok(artifact.includes(stay.hotel)&&artifact.includes(stay.status)&&artifact.includes(stay.paymentStatus),'published actual order keeps its status and payment separate');
    assert.ok(artifact.includes(stay.breakfast||''),'published breakfast agrees with the order');
  }
  assert.ok(!/10\s*月\s*[5-7]\s*日[^。\n]*(?:继续游览|安排还车|仅安排返程)/.test(artifact),'obsolete future days are not still scheduled');
}
const cancelled=plan.cancelledBookings.find(booking=>booking.hotel==='措勤行者无疆旅游酒店');
assert.ok(cancelled,'cancelled screenshot order is retained for reconciliation');
assert.equal(cancelled.checkin,'2026-09-29');
assert.equal(cancelled.checkout,'2026-09-30');
assert.equal(cancelled.amount,803.17);
assert.equal(cancelled.status,'已取消');
assert.ok(!plan.confirmedStays.some(stay=>stay.hotel===cancelled.hotel),'cancelled booking is excluded from valid stays');
const oldHanting=plan.hotelChanges.find(hotel=>hotel.hotel.includes('汉庭'));
assert.ok(oldHanting&&oldHanting.oldDate==='2026-10-02','original Hanting booking remains visible');
assert.notEqual(oldHanting.newDate,'2026-09-29','Hanting is no longer the current Coqen lodging candidate');
assert.ok(/待/.test(oldHanting.status),'handling of the original Hanting order is not inferred from another order screenshot');
assert.ok(plan.days[4].hotelNote.includes('锦江之星')&&plan.days[4].hotelNote.includes('已入住'));
assert.ok(!/住宿待落实|房间仍需落实|今晚没房/.test(plan.days[4].hotelNote),'today lodging is no longer marked unresolved');
assert.ok(!plan.hotelChanges.some(hotel=>hotel.newDate.includes('新增 3 晚')),'obsolete Lhasa extension is removed');
assert.ok(conditions.weather.length);
for(const weather of conditions.weather){
  assert.equal(weather.status,'待更新');
  for(const field of ['high','low','text','wind'])assert.equal(weather[field],null,'unverified revised-date weather stays empty');
  assert.ok(weather.checkedAt&&weather.url&&weather.note);
}
assert.ok(!html.includes('guide-weather.js'),'old date-based weather is not loaded');
assert.ok(markdown.includes('锦江之星')&&markdown.includes('已入住')&&/旧天气没有平移|没有把旧天气平移/.test(markdown));
assert.ok(!html.includes('4,479.4')&&!markdown.includes('4,479.4'),'old full-loop mileage is not republished as the revised route');
console.log('Data checks passed: 10 dates, actual hotel orders and October 4 return checked.');

if(process.env.GUIDE_DATA_ONLY==='1')process.exit(0);
const library=process.env.GUIDE_PLAYWRIGHT_PATH||path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {chromium}=require(library);
const browser=await chromium.launch({headless:true,executablePath:process.env.GUIDE_CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const url=process.env.GUIDE_TEST_URL||'http://127.0.0.1:8766/tibet-cuoqin-guide.html';
const output=fs.mkdtempSync(path.join(os.tmpdir(),'tibet-cuoqin-qa-'));
const errors=[],results=[],screenshots=[];
const trackErrors=page=>page.on('pageerror',error=>errors.push(error.message));

async function checkStaticContent(page,label){
  assert.equal(await page.locator('.overview-table tbody tr').count(),plan.days.length,`${label}: complete revised calendar`);
  assert.equal(await page.locator('.day').count(),plan.days.filter(day=>day.status!=='historical').length,`${label}: each detailed day renders`);
  assert.equal(await page.locator('.history-row').count(),plan.days.filter(day=>day.status==='historical').length,`${label}: historical rows render`);
  const rows=await page.locator('.overview-table tbody tr').evaluateAll(rows=>rows.map(row=>[
    row.cells[0].innerText,[...row.cells[2].childNodes].filter(node=>node.nodeType===Node.TEXT_NODE).map(node=>node.textContent).join('').trim()
  ]));
  for(let index=0;index<plan.days.length;index++){
    assert.ok(rows[index][0].includes(plan.days[index].date.slice(5).replace('-','.')));
    assert.ok(rows[index][0].includes(plan.days[index].weekday));
    assert.equal(rows[index][1],plan.days[index].stay);
  }
  const anchors=await page.evaluate(()=>[...document.querySelectorAll('a[href^="#"]')].filter(a=>a.hash&&!document.getElementById(decodeURIComponent(a.hash.slice(1)))).map(a=>a.hash));
  assert.deepEqual(anchors,[],`${label}: internal links resolve`);
  const ids=await page.locator('[id]').evaluateAll(nodes=>nodes.map(node=>node.id));
  assert.equal(new Set(ids).size,ids.length,`${label}: unique anchor IDs`);
  assert.equal(normalize(await page.locator('.nav a[href="#hotels"]').innerText()),'酒店信息');
  assert.equal(normalize(await page.locator('#hotels h2').innerText()),'酒店信息表');
  const hotelTable=page.locator('#hotels .hotel-information-table');
  assert.equal(await hotelTable.count(),1,'one complete hotel information table replaces the old card and to-do layout');
  assert.deepEqual((await hotelTable.locator('thead th').allTextContents()).map(normalize),hotelHeaders);
  const hotelRows=await hotelTable.locator('tbody tr').evaluateAll(rows=>rows.map(row=>({
    id:row.dataset.stayId,date:row.dataset.checkin,text:row.innerText,cells:[...row.cells].map(cell=>({key:cell.dataset.col,text:cell.innerText}))
  })));
  assert.ok(hotelRows.every(row=>row.cells.length===11&&/^2026-\d{2}-\d{2}$/.test(row.date)),'every hotel row retains all eleven fields and its date');
  assert.deepEqual(hotelRows.map(row=>row.date),hotelRows.map(row=>row.date).sort(),'hotel rows follow chronological order');
  for(const stay of plan.confirmedStays){
    const rows=hotelRows.filter(row=>row.id===stay.id);
    assert.equal(rows.length,stay.rooms.length,'one row per booked room type');
    const text=normalize(rows.map(row=>row.text).join(' '));
    for(const value of [stay.hotel,stay.status,stay.paymentStatus,stay.breakfast].filter(Boolean))assert.ok(text.includes(normalize(value)),`${label}: order status, payment and breakfast survive the table`);
    assert.ok(rows.every(row=>row.date===stay.checkin));
    assert.equal(await hotelTable.locator(`#stay-${stay.id}`).count(),1,'each order keeps one unique deep link');
    for(const [index,room] of stay.rooms.entries()){
      const cells=Object.fromEntries(rows[index].cells.map(cell=>[cell.key,normalize(cell.text)]));
      assert.ok(cells.room.includes(room.name));
      assert.ok(new RegExp(`${stay.nights}\\s*晚`).test(cells.span)&&new RegExp(`${room.count}\\s*间`).test(cells.span),'room count and nights are separate from price');
      assert.ok(cells.checkin.includes(stay.checkout)||cells.checkin.includes(stay.checkout.slice(5).replace('-','.')),'checkout date remains visible');
      const price=cells.price.replaceAll(',','');
      for(const amount of [room.amount,stay.total,room.amount/(room.count*stay.nights)])assert.ok(price.includes(String(amount)),`price preserves total and unit basis for ${stay.id}`);
      if(stay.id===homeinn.id)assert.ok(/均摊/.test(price)&&/每间每晚|\/间\/晚|间.*晚/.test(price),'¥483 is clearly a per-room per-night average');
      for(const field of ['area','bed','oxygen'])if(room[field])assert.ok(cells[field].includes(normalize(room[field])),`${field} remains in its own column`);
    }
    assert.ok(!/\d{12,}/.test(text),'public hotel information omits long order and card numbers');
  }
  for(const old of base.hotels.filter(hotel=>['09.25','09.26','09.27'].includes(hotel.checkin)))assert.ok(hotelRows.some(row=>row.date===`2026-${old.checkin.replace('.','-')}`&&row.text.includes(old.hotel)&&old.room.split('\n').every(room=>row.text.includes(room))),'early original hotels and alternatives remain in the information table');
  const nima=hotelRows.filter(row=>row.date==='2026-09-30');
  assert.ok(nima.some(row=>row.text.includes('尚客优')),'September 30 Nyima candidate remains visible');
  for(const row of nima){
    const cells=Object.fromEntries(row.cells.map(cell=>[cell.key,cell.text]));
    assert.ok(/未提供|未确认|待确认/.test(cells.price)&&/未提供|未确认|待确认/.test(cells.span),'Nyima candidate does not inherit old price or room count as confirmed');
  }
  const bedWidths=await hotelTable.locator('tbody td[data-col="bed"]').evaluateAll(cells=>cells.map(cell=>{
    const style=getComputedStyle(cell);
    return {content:cell.getBoundingClientRect().width-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight),font:parseFloat(style.fontSize)};
  }));
  assert.ok(bedWidths.every(cell=>cell.content>=4*cell.font),`${label}: bed descriptions fit at least four Chinese characters per line`);
  const tableBox=await page.locator('#hotels .hotel-information-scroll').evaluate(node=>({width:node.clientWidth,scroll:node.scrollWidth,overflow:getComputedStyle(node).overflowX}));
  if(page.viewportSize().width<=768){
    assert.ok(tableBox.scroll>tableBox.width&&/auto|scroll/.test(tableBox.overflow),'mobile hotel table has local horizontal scrolling');
    await page.locator('#hotels .hotel-information-scroll').evaluate(node=>{node.scrollLeft=node.scrollWidth;});
    assert.ok(await page.locator('#hotels .hotel-information-scroll').evaluate(node=>node.scrollLeft>0),'rightmost hotel fields are reachable');
    await page.locator('#hotels .hotel-information-scroll').evaluate(node=>{node.scrollLeft=0;});
  }
  const returnText=await page.locator('#return-flight').innerText();
  assert.ok(returnText.includes('TV9949')&&returnText.includes('杭州')&&/10\s*(?:月|\/|\.|-)\s*0?4/.test(returnText),'latest flight is October 4 to Hangzhou');
  assert.ok(!/10:55|16:55/.test(returnText),'old October 7 flight times are not shown as current');
  assert.ok(/待确认|未提供|未确认/.test(returnText),'new flight times are explicitly unconfirmed');
  const hotelText=await page.locator('#hotels').innerText();
  assert.ok(!retiredHotelUI.test(hotelText)&&!hotelText.includes(cancelled.hotel),'old change-order controls and cancelled bookings are absent from the hotel information table');
  const dayD4=await page.locator('#day-D4').innerText();
  assert.ok(dayD4.includes('锦江之星')&&dayD4.includes('已入住'));
  assert.ok(!/今晚措勤的房间仍需落实|今晚房间仍需落实|措勤 9 月 29 日住宿待落实|用户此前反馈今晚没房/.test(`${dayD4} ${hotelText}`),'stale tonight-unbooked wording is removed');
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
      assert.ok(!photos.filter(photo=>photo.group==='hotel').some(photo=>photo.alt.includes('汉庭')),'old Hanting photo is no longer a current hotel candidate');
      assert.equal(photos.filter(photo=>photo.group==='spot').length,plan.days.filter(day=>day.status!=='historical').reduce((count,day)=>count+day.spots.length,0),'every retained sightseeing stop has a source image');
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
      for(const selector of ['#day-D4','#day-D5','#hotels','#weather','#return-flight']){
        const shot=path.join(output,`${selector.slice(1)}-${width}.png`);
        await page.locator(selector).screenshot({path:shot,timeout:15000});screenshots.push(shot);
      }
      await page.locator(`#stay-${homeinn.id}`).scrollIntoViewIfNeeded();
      for(const side of ['left','right']){
        await page.locator('#hotels .hotel-information-scroll').evaluate((node,side)=>{node.scrollLeft=side==='left'?0:node.scrollWidth;},side);
        const shot=path.join(output,`hotel-table-${side}-${width}.png`);await page.screenshot({path:shot});screenshots.push(shot);
      }
      await page.locator('#hotels .hotel-information-scroll').evaluate(node=>{node.scrollLeft=0;});
    }
    if(width===1440){
      await details.locator('summary').click();
      const states=await page.locator('details').evaluateAll(nodes=>nodes.map(node=>node.open));
      await page.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));
      assert.ok((await page.locator('details').evaluateAll(nodes=>nodes.map(node=>node.open))).every(Boolean),'printing expands all details');
      await page.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));
      await page.emulateMedia({media:'print'});
      const print=await page.locator('.table-wrap,.hotel-information-scroll').evaluateAll(nodes=>nodes.map(node=>({container:node.getBoundingClientRect().width,table:node.querySelector('table').getBoundingClientRect().width})));
      assert.ok(print.every(row=>row.table<=row.container+1),'all print tables fit their containers');
      const printShot=path.join(output,'hotel-information-print.png');await page.locator('#hotels').screenshot({path:printShot});screenshots.push(printShot);
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
  await noJSPage.emulateMedia({media:'print'});
  assert.ok(await noJSPage.locator('.hotel-information-scroll').evaluate(node=>node.querySelector('table').getBoundingClientRect().width<=node.getBoundingClientRect().width+1),'hotel print layout also fits without JavaScript');
  await noJS.close();
  assert.deepEqual(errors,[],'no page errors');
  console.log(JSON.stringify({output,results,screenshots,errors,fileReadable:true,noJSReadable:true},null,2));
}finally{
  await browser.close();
}
