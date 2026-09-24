import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),root=path.dirname(fileURLToPath(import.meta.url));
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const c={window:{}};vm.createContext(c);
for(const name of ['guide-base.js','guide-itinerary.js','guide-weather-trends.js','guide-weather.js','guide-media.js','guide-hotel-media.js','guide-extra-media.js','guide-drone-evidence.js','guide-drone.js'])vm.runInContext(read(name),c);
const original=read('amap-jsapi/app.js'),old={};vm.createContext(old);vm.runInContext(original.slice(0,original.indexOf('const PLACES ='))+'\nthis.hotels=HOTEL_OPTIONS;',old);
assert.equal(JSON.stringify(c.window.TIBET_BASE.hotels),JSON.stringify(old.hotels),'original hotel values preserved');
assert.equal(c.window.TIBET_BASE.hotels.length,19);
const hotelMedia=c.window.TIBET_HOTEL_MEDIA,hotelRows=c.window.TIBET_BASE.hotels;
for(const h of hotelRows){
  const entry=hotelMedia.hotels[h.hotel];assert.ok(entry,`photo entry for ${h.hotel}`);
  assert.equal(JSON.stringify(entry.rooms.map(r=>r.room)),JSON.stringify(h.room.split('\n')),`booked room order for ${h.hotel}`);
  if(entry.image){const a=hotelMedia.assets[entry.image];assert.equal(a.kind,'hotel');assert.equal(a.status,'verified');assert.equal(a.sourceUrl,entry.url);}
  for(const room of entry.rooms){
    if(!room.image){assert.equal(h.hotel,'尼玛五龙宾馆');assert.equal(room.status,'unavailable');assert.ok(room.note);continue;}
    const a=hotelMedia.assets[room.image];assert.equal(a.kind,'hotel-room');assert.equal(a.status,'verified');assert.equal(a.sourceUrl,entry.url);assert.ok(a.sourceRoomName);assert.ok(a.evidence);assert.ok(a.src.startsWith('https://dimg04.c-ctrip.com/'));
    if(a.sourceKind==='guest_review_photo'){assert.ok(a.roomId);assert.ok(a.reviewId);assert.ok(a.imageId);assert.equal(a.picTypeId,9);assert.equal(a.categoryId,null);assert.ok(a.credit.includes('住客实拍'));}
    else{assert.equal(a.categoryId,9);assert.ok(a.pictureId);}
  }
}
assert.equal(Object.values(hotelMedia.hotels).filter(h=>h.image).length,18,'18 verified hotel exteriors');
assert.equal(Object.values(hotelMedia.hotels).flatMap(h=>h.rooms).filter(r=>r.image).length,23,'23 verified booked room categories');
assert.equal(c.window.TIBET_ITINERARY.days.length,13);
for(const d of c.window.TIBET_ITINERARY.days){const week=new Intl.DateTimeFormat('zh-CN',{weekday:'short',timeZone:'Asia/Shanghai'}).format(new Date(`2026-${d.date.replace('.','-')}T12:00:00+08:00`));assert.equal(d.weekday,week);}
const profile=c.window.TIBET_BASE.profile;
assert.equal(profile.flatMap(g=>g.points).filter(p=>p.stay).length,12);
assert.equal(profile.find(g=>g.day==='D8').points.find(p=>p.stay).name,'尼玛');
for(const n of c.window.TIBET_WEATHER.nodes){
  if(n.status==='long_range_trend'){
    assert.ok(n.sourceUrl.startsWith('https://www.msn.cn/'));assert.equal(n.provider,'MSN');
    assert.ok(n.sourceLabel.includes('30天趋势'));assert.ok(n.navigation);assert.ok(n.locationName);assert.ok(n.checkedAt);
    const source=c.window.TIBET_WEATHER_TRENDS.observations.find(r=>r.slug===n.slug&&r.date===n.date);
    assert.ok(source);assert.equal(n.high,source.high);assert.equal(n.low,source.low);assert.ok(n.reason.includes('远期趋势'));
  }else assert.ok(n.sourceUrl.startsWith('https://tianqi.moji.com/'));
  if(n.status==='unavailable'){assert.equal(n.high,null);assert.equal(n.low,null);}
  else{assert.ok(Number.isFinite(n.high)&&Number.isFinite(n.low));assert.ok(n.high>=n.low);}
}
assert.equal(c.window.TIBET_WEATHER.nodes.length,37,'separate Namtso and Shengxiang Tianmen sources');
const weatherData=c.window.TIBET_WEATHER,forecastNodes=weatherData.nodes.filter(n=>n.status==='forecast'),activeTrends=weatherData.nodes.filter(n=>n.status==='long_range_trend');
const weatherSlug=n=>n.slug||new URL(n.sourceUrl).pathname.split('/').at(-1);
const weatherEvidence=JSON.parse(read('guide-weather-evidence.json'));
assert.equal(weatherEvidence.sourcePageDate,weatherData.checkedAt.slice(0,10),'browser evidence belongs to this refresh');
assert.equal(JSON.stringify(weatherEvidence.forecastRange),JSON.stringify(weatherData.forecastRange),'published range matches browser evidence');
for(const n of weatherData.nodes){
  assert.ok(n.checkedAt&&Number.isFinite(Date.parse(n.checkedAt)),'each node retains its actual verification time');
  if(n.status==='forecast'){
    assert.equal(n.provider,'墨迹');assert.equal(n.checkedAt.slice(0,10),weatherData.checkedAt.slice(0,10),'Moji node checked in this refresh');
    assert.ok(n.sourceUrl.endsWith('/'+weatherSlug(n)));assert.ok(n.dayCondition&&n.nightCondition);
    assert.equal(n.sourcePageDate,weatherEvidence.sourcePageDate);
    const evidence=weatherEvidence.sources.find(s=>s.slug===weatherSlug(n)),row=evidence?.rows?.find(r=>r[0]===n.date.slice(5));
    assert.ok(row,`explicit browser date evidence for ${weatherSlug(n)} ${n.date}`);
    assert.equal(JSON.stringify([n.high,n.low,n.dayCondition,n.nightCondition]),JSON.stringify(row.slice(1)),'temperatures and day/night weather match browser evidence');
    assert.ok(n.date>=weatherData.forecastRange.from&&n.date<=n.forecastThrough,'forecast date inside published range');
    assert.equal(n.lowBasis,'daily_lower_bound','daily low is not a 07:00–24:00 low');
    if(!n.windSourceUrl)assert.equal(n.wind,'风力待更新','unverified wind is not copied from current conditions');
    else{
      const windRow=evidence.windRows?.find(r=>r[0]===n.date.slice(5));assert.ok(windRow&&evidence.windCheckedAt,'wind has dated calendar evidence');
      assert.equal(n.wind.replace(/\s/g,''),windRow[2].replace(/\s/g,''),'wind matches same-date calendar evidence');
      assert.equal(windRow[1],`${n.low}/${n.high}°`,'wind calendar temperatures match the same forecast point/date');
    }
  }
  if(n.status==='long_range_trend'){
    const original=c.window.TIBET_WEATHER_TRENDS.observations.find(r=>r.slug===n.slug&&r.date===n.date);
    assert.equal(n.checkedAt,original.checkedAt,'retained trends keep their original verification date');
  }
}
for(const [place,slug] of [['班戈出发','baingoin-county'],['班戈住宿','baingoin-county'],['纳木措','namtso-national-park'],['拉萨贡嘎机场','gonggar-county']]){
  const matching=weatherData.nodes.filter(n=>n.places.includes(place));assert.ok(matching.length);
  assert.ok(matching.every(n=>weatherSlug(n)===slug),`${place} keeps its own weather location instead of Lhasa`);
}
if(weatherData.checkedAt.startsWith('2026-09-23')){
  assert.equal(forecastNodes.length,36,'2026-09-23 refresh has 36 Moji itinerary nodes');assert.equal(activeTrends.length,1);
  assert.equal(new Set(forecastNodes.map(weatherSlug)).size,19,'19 verified Moji pages');
  assert.equal(new Set(forecastNodes.map(n=>weatherSlug(n)+'|'+n.date)).size,31,'31 verified Moji location/date records');
  assert.deepEqual({...weatherData.forecastRange},{from:'2026-09-23',through:'2026-10-07'});
  assert.equal(activeTrends[0].slug,'shengxiang-tianmen');assert.equal(activeTrends[0].date,'2026-10-05');assert.ok(activeTrends[0].checkedAt.startsWith('2026-09-19'));
  assert.equal(forecastNodes.filter(n=>n.date>='2026-10-04').length,8,'8 of 9 late-trip trend nodes replaced with Moji');
  assert.ok(forecastNodes.filter(n=>n.date>='2026-10-01').every(n=>n.wind==='风力待更新'&&!n.windSourceUrl),'October wind stays explicitly unverified');
  assert.equal(new Set(forecastNodes.filter(n=>n.windSourceUrl).map(n=>weatherSlug(n)+'|'+n.date)).size,15,'15 September location/date wind records refreshed');
}
const weatherMarkdown=read('tibet-guide.md').split('## 天气\n')[1]?.split('\n## ')[0];assert.ok(weatherMarkdown,'generated Markdown has weather section');
if(weatherData.checkedAt.startsWith('2026-09-25')){
  assert.equal(forecastNodes.length,36);assert.equal(activeTrends.length,1);
  assert.equal(new Set(forecastNodes.map(weatherSlug)).size,19);
  assert.equal(new Set(forecastNodes.map(n=>weatherSlug(n)+'|'+n.date)).size,31);
  assert.deepEqual({...weatherData.forecastRange},{from:'2026-09-25',through:'2026-10-09'});
  assert.equal(activeTrends[0].slug,'shengxiang-tianmen');
  assert.ok(activeTrends[0].checkedAt.startsWith('2026-09-25'));
  assert.equal(activeTrends[0].high,10);assert.equal(activeTrends[0].low,0);
  assert.equal(activeTrends[0].condition,'天气状态待核实');assert.equal(activeTrends[0].wind,'风速待更新');
  assert.ok(!activeTrends[0].reason.includes('本次未刷新'));
  assert.equal(new Set(forecastNodes.filter(n=>n.windSourceUrl).map(n=>weatherSlug(n)+'|'+n.date)).size,15);
}
assert.ok(weatherMarkdown.includes(weatherData.checkedAt)&&weatherMarkdown.includes(weatherData.forecastRange.through),'generated weather metadata is current');
assert.ok(!weatherMarkdown.includes('10 月 4—7 日暂用'),'Markdown no longer labels all four late days as MSN');
for(const n of activeTrends){assert.ok(weatherMarkdown.includes(n.checkedAt)&&weatherMarkdown.includes(n.places.join(' / ')),'Markdown names every retained trend and its original verification time');}
if(!activeTrends.length)assert.ok(!weatherMarkdown.includes('仍保留 MSN'),'no active-trend claim when no trends remain');
assert.ok(read('tibet-guide.md').includes('creativecommons.org/licenses/by/2.0/'));
const drone=c.window.TIBET_DRONE,droneRows=drone.rows,days=c.window.TIBET_ITINERARY.days;
const droneEvidence=c.window.TIBET_DRONE_EVIDENCE;
const droneZoneStatus=row=>drone.legend?.colorsVerified===true&&row.uom?.colorVerified===true&&['blue','white','mixed'].includes(row.uom.status)?row.uom.status:'unverified';
assert.ok(drone.checkedAt,'drone dataset records preparation date');
assert.equal(new Set(droneRows.map(r=>r.id)).size,droneRows.length,'unique drone record IDs');
assert.ok(Array.isArray(droneEvidence.observations),'drone evidence has observation list');
assert.equal(new Set(droneEvidence.observations.map(o=>o.rowId)).size,droneEvidence.observations.length,'one current observation per drone row');
for(const o of droneEvidence.observations)assert.ok(droneRows.some(r=>r.id===o.rowId),'observation matches a real itinerary row');
assert.deepEqual([...new Set(droneRows.map(r=>r.day))],Array.from(days.map(d=>d.day)),'drone table covers every day in itinerary order');
for(const day of days){
  const rows=droneRows.filter(r=>r.day===day.day);
  assert.ok(rows.length,`drone table includes ${day.day}, including arrival and departure`);
  for(const key of day.spots)assert.ok(rows.some(r=>r.spotKey===key),`drone entry for ${day.day}/${key}`);
  for(const row of rows){
    assert.equal(row.date.includes('-')?row.date.slice(-5).replace('-','.'):row.date,day.date);assert.ok(row.id&&row.place&&row.location?.label&&row.location?.precision);
    assert.ok(['blue','white','mixed','unverified'].includes(row.uom?.status));assert.ok(row.uom.detail);
    assert.ok(['restricted','conditional','unverified','no_rule_found'].includes(row.venue?.status));assert.ok(row.venue.label&&row.venue.detail);
    assert.ok(row.conclusion&&row.action,'each point provides conclusion and next check');
    for(const source of [...(row.uom.sources||[]),...(row.venue.sources||[])])assert.ok(source.title&&/^https?:\/\//.test(source.url),'drone sources are named web links');
    if(row.uom.attempt){
      const attempt=row.uom.attempt;
      assert.ok(attempt.attemptedAt&&Number.isFinite(Date.parse(attempt.attemptedAt))&&attempt.queryText&&attempt.matchedResult,'search attempt has a dated visible result');
      assert.ok(attempt.zoom>=9&&attempt.blockedReason,'incomplete observation records its map zoom and blocker');
      if(row.uom.status==='unverified')assert.equal(row.uom.checkedAt,'','attempt date is never a successful color verification date');
    }
    if(row.uom.status!=='unverified'){
      assert.equal(drone.legend.colorsVerified,true,'colors require observed page color swatches, not assumed legal meanings');
      assert.equal(row.uom.colorVerified,true,'confirmed colors come from complete point evidence');
      const o=row.uom.observation;
      assert.ok(o&&o.queryText&&o.matchedResult&&Number.isFinite(o.zoom)&&o.zoom>=9&&o.note,'observed color has query, matched point, map level and visual note');
      assert.ok(o.observedAt&&Number.isFinite(Date.parse(o.observedAt)),'observed color has actual observation time');
      assert.equal(o.status,row.uom.status);assert.equal(o.observedAt,row.uom.checkedAt);
      assert.ok(row.uom.checkedAt&&row.uom.sources.length,'confirmed color has query date and sources');
      assert.equal(row.location.precision.includes('实际起飞点未确认')||row.location.precision.includes('待确认实际起飞点'),true,'search color does not certify the actual launch location');
    }
  }
}
if(drone.legend?.verified){assert.ok(drone.legend.blue&&drone.legend.white&&drone.legend.sources.length);}
if(drone.legend?.colorsVerified){assert.ok(drone.legend.observedAt&&Number.isFinite(Date.parse(drone.legend.observedAt)));assert.ok(drone.legend.note&&drone.legend.sources.length);}
// Synthetic observations validate the gate; these never overwrite real UOM evidence.
const testObservation={rowId:'drone-karola',status:'white',queryText:'test query',matchedResult:'test matched result',zoom:15,observedAt:'2026-09-24T12:00:00+08:00',note:'Synthetic test only'};
function evaluateDroneEvidence(observations,colorsVerified=true){
  const model={window:{TIBET_DRONE_EVIDENCE:{legend:{verified:false,colorsVerified},observations}}};vm.createContext(model);vm.runInContext(read('guide-drone.js'),model);
  return model.window.TIBET_DRONE.rows.find(r=>r.id==='drone-karola');
}
assert.equal(evaluateDroneEvidence([testObservation]).uom.status,'white','raw page white is supported without verified legal meaning');
assert.equal(evaluateDroneEvidence([{...testObservation,observedAt:'2026-09-24'}]).uom.status,'white','date-only observation is accepted without fabricating a time');
assert.ok(!evaluateDroneEvidence([testObservation]).uom.detail.includes('白区为法定管制区'),'white has no automatic legal classification');
assert.equal(evaluateDroneEvidence([testObservation],false).uom.status,'unverified','unobserved map legend does not certify color');
for(const field of ['queryText','matchedResult','observedAt','note'])assert.equal(evaluateDroneEvidence([{...testObservation,[field]:''}]).uom.status,'unverified',`missing ${field} stays unverified`);
assert.equal(evaluateDroneEvidence([{...testObservation,zoom:8}]).uom.status,'unverified','zoom too low stays unverified');
assert.equal(evaluateDroneEvidence([{...testObservation,observedAt:'invalid'}]).uom.status,'unverified','invalid observation timestamp stays unverified');
assert.ok(read('tibet-guide.md').includes('## 无人机适飞情况'),'Markdown exports separate drone section');
for(const row of droneRows.filter(r=>r.uom.observation)){
  const o=row.uom.observation,markdown=read('tibet-guide.md');
  for(const value of [o.queryText,o.matchedResult,o.observedAt,o.note])if(value)assert.ok(markdown.includes(String(value).replaceAll('|','\\|')),'Markdown retains raw UOM observation metadata');
}
const hashes={'amap-jsapi/app.js':'d5b21ed08871d2e7853249c2b7b3d296ee72ca724486bd96eec0febf7d54282f','amap-jsapi/index.html':'82bfbf350700b256038ff8d3717a9ecab128818454b72fa1ca1f2582ed292858','amap-jsapi/styles.css':'d224f3a9f22ab156f2208a012dd0f111c346db5270413af33a110ec02d6ab2f4','amap-jsapi/README.md':'0532002ec438d14e44db00642c01b307a9e4c60eb5a50e0487ee73f6d8c6db88'};
for(const[f,h]of Object.entries(hashes))assert.equal(crypto.createHash('sha256').update(read(f)).digest('hex'),h,`${f} unchanged`);
console.log('Data assertions passed: 19 hotel rows unchanged; 13 dates; 12 stays; source hashes intact.');
console.log(`Weather assertions passed: ${forecastNodes.length} Moji nodes; ${activeTrends.length} retained MSN nodes; checked ${weatherData.checkedAt}.`);
if(process.env.GUIDE_DATA_ONLY==='1'){console.log('GUIDE_DATA_ONLY=1: browser regression skipped.');process.exit(0);}

const library=process.env.GUIDE_PLAYWRIGHT_PATH||path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {chromium}=require(library);
const browser=await chromium.launch({headless:true,executablePath:process.env.GUIDE_CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const url=process.env.GUIDE_TEST_URL||'http://127.0.0.1:8766/tibet-guide.html';
const output=fs.mkdtempSync(path.join(os.tmpdir(),'tibet-guide-qa-'));
const errors=[],results=[];
try{
for(const width of [360,390,768,1440]){
  const page=await browser.newPage({viewport:{width,height:1000}});page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url,{waitUntil:'domcontentloaded'});await page.waitForSelector('.day-article');
  const metrics=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,days:document.querySelectorAll('.day-article').length,hotels:document.querySelectorAll('.hotel-table tbody tr').length,backup:[...document.querySelectorAll('.hotel-table .hotel-backup')].map(e=>getComputedStyle(e).color),alert:[...document.querySelectorAll('.hotel-table .hotel-alert')].map(e=>getComputedStyle(e).color),aligned:[...document.querySelectorAll('.hotel-table td,.hotel-table th')].every(e=>getComputedStyle(e).verticalAlign==='middle'),stays:document.querySelectorAll('.altitude-marker.is-stay').length}));
  assert.equal(metrics.width,metrics.scroll,`no page overflow at ${width}`);assert.equal(metrics.days,13);assert.equal(metrics.hotels,19);assert.equal(metrics.stays,12);assert.equal(metrics.aligned,true);assert.ok(metrics.backup.every(c=>c==='rgb(4, 111, 251)'));assert.ok(metrics.alert.every(c=>c==='rgb(255, 30, 0)'));
  assert.equal(await page.locator('.quick-nav a[href="#drone"]').count(),1,'drone section in main navigation');
  assert.equal(await page.locator('.drone-table tbody tr').count(),droneRows.length,'every drone point rendered');
  const droneCells=await page.locator('.drone-table tbody tr').evaluateAll(rows=>rows.map(row=>({id:row.dataset.droneId,day:row.dataset.day,status:row.dataset.uomStatus,cells:row.children.length,date:row.querySelector('.drone-query-date')?.textContent,precision:row.querySelector('.drone-location-precision')?.textContent})));
  assert.equal(JSON.stringify(droneCells.map(r=>r.id)),JSON.stringify(droneRows.map(r=>r.id)),'drone row order preserved');
  assert.ok(droneCells.every(r=>r.cells===4&&r.date&&r.precision),'separate location, UOM, venue and action columns');
  assert.equal(droneCells.filter(r=>r.status==='unverified').length,droneRows.filter(r=>droneZoneStatus(r)==='unverified').length,'unverified airspace never rendered as confirmed color');
  assert.equal(await page.locator('.drone-observation').count(),droneRows.filter(r=>r.uom.observation).length,'raw UOM observations are visible in the table');
  if(droneCells.some(r=>r.status==='unverified'))assert.ok((await page.locator('#drone .drone-intro').innerText()).includes('核验初稿'),'incomplete UOM dataset explicitly marked draft');
  const hotelCards=await page.locator('.hotel-strip').evaluateAll(cards=>cards.map(card=>({id:card.id,hotel:card.dataset.hotel,rooms:[...card.querySelectorAll('.hotel-photo[data-room]')].map(p=>p.dataset.room),missing:card.querySelectorAll('.hotel-photo-missing').length,images:[...card.querySelectorAll('img')].map(i=>i.src)})));
  const expectedCards=c.window.TIBET_ITINERARY.days.flatMap(d=>hotelRows.filter(h=>h.checkin.split('\n').includes(d.date)).map(h=>({hotel:h.hotel,rooms:Array.from(h.room.split('\n'))})));
  assert.equal(JSON.stringify(hotelCards.map(({hotel,rooms})=>({hotel,rooms}))),JSON.stringify(expectedCards),'all primary and backup hotels follow date and room order');
  assert.equal(new Set(hotelCards.map(h=>h.id)).size,hotelCards.length,'unique repeat-stay anchors');
  assert.equal(hotelCards.length,20);assert.equal(new Set(hotelCards.map(h=>h.hotel)).size,19);
  assert.deepEqual(hotelCards.filter(h=>h.missing).map(h=>h.hotel),['尼玛五龙宾馆']);assert.equal(hotelCards.find(h=>h.missing).missing,2);
  assert.equal(await page.locator('.hotel-photo[data-room]').count(),25);assert.equal(await page.locator('.hotel-photo-jump').count(),19);
  const merged=await page.evaluate(()=>window.TIBET_GUIDE_VIEW.mergedWeatherNodes);
  for(const n of merged){if(n.members.length>1){assert.ok(n.members.every(m=>m.date===n.date&&m.status===n.status&&m.provider===n.provider));assert.ok(Math.max(...n.members.map(m=>m.high))-Math.min(...n.members.map(m=>m.high))<=2);assert.ok(Math.max(...n.members.map(m=>m.low))-Math.min(...n.members.map(m=>m.low))<=2);assert.equal(n.high,Math.max(...n.members.map(m=>m.high)));assert.equal(n.low,Math.min(...n.members.map(m=>m.low)));}}
  assert.equal(merged.flatMap(n=>n.members).length,37);
  const trendNodes=c.window.TIBET_WEATHER.nodes.filter(n=>n.status==='long_range_trend');
  if(trendNodes.length){
    assert.equal(await page.locator('.weather-series[data-status="long_range_trend"][stroke-dasharray="7 5"]').count(),2);
    assert.equal(await page.locator('.weather-source-card[data-status="long_range_trend"]').count(),trendNodes.length);
    for(const day of new Set(trendNodes.map(n=>n.day))){
      const actual=await page.evaluate(d=>window.TIBET_GUIDE_VIEW.dayWeather(d),day),sources=c.window.TIBET_WEATHER.nodes.filter(n=>n.day===day&&Number.isFinite(n.high));
      assert.equal(actual.high,Math.max(...sources.map(n=>n.high)));assert.equal(actual.low,Math.min(...sources.map(n=>n.low)));assert.ok(actual.text.includes('远期趋势'));
      assert.ok((await page.locator(`#day-${day} .day-weather`).innerText()).includes('远期趋势'));
    }
    const summary=await page.locator('#weather-summary').innerText();
    for(const n of trendNodes)assert.ok(summary.includes(n.places.join(' / '))&&summary.includes(n.checkedAt.slice(0,10)),'summary names retained trend and old verification date');
    assert.ok(!summary.includes('后四天暂用'),'partial fallback is not described as four full days');
  }else{
    assert.equal(await page.locator('.weather-source-card[data-status="long_range_trend"]').count(),0);
    assert.ok(!(await page.locator('#weather-stamp').innerText()).includes('MSN'));
    assert.ok(!(await page.locator('#weather-summary').innerText()).includes('MSN'));
    assert.ok(!(await page.locator('#weather .chart-help').innerText()).includes('MSN'));
    assert.ok((await page.locator('.weather-series[data-status="long_range_trend"]').evaluateAll(paths=>paths.map(p=>p.getAttribute('d')))).every(d=>!d),'no drawn trend series without trend nodes');
  }
  const nodeChecks=await page.locator('.weather-source-card .weather-checked').allTextContents();assert.equal(nodeChecks.length,weatherData.nodes.length);
  weatherData.nodes.forEach((n,i)=>assert.ok(nodeChecks[i].includes(n.checkedAt.slice(0,16).replace('T',' ')),'source card displays actual node verification time'));
  await page.screenshot({path:path.join(output,`hero-${width}.png`)});
  if(width===390||width===1440){
    await page.locator('#drone .drone-intro').screenshot({path:path.join(output,`drone-header-${width}.png`)});
    await page.locator('.drone-table tbody tr').first().screenshot({path:path.join(output,`drone-first-row-${width}.png`)});
    for(const selector of ['#overview','#weather','#day-D1','#day-D4','#hotels','#altitude']){
      await page.locator(selector).scrollIntoViewIfNeeded();
      await page.locator(selector).evaluate(el=>el.querySelectorAll('img').forEach(i=>i.loading='eager'));
      await page.waitForFunction(sel=>[...document.querySelectorAll(`${sel} img`)].every(i=>i.complete),selector,{timeout:15000}).catch(()=>{});
      await page.locator(selector).screenshot({path:path.join(output,`${selector.slice(1)}-${width}.png`),timeout:15000});
    }
  }
  const anchorErrors=await page.evaluate(()=>[...document.querySelectorAll('a[href^="#"]')].filter(a=>a.hash&&!document.getElementById(a.hash.slice(1))).map(a=>a.hash));assert.deepEqual(anchorErrors,[]);
  if(width===1440){
    await page.evaluate(()=>document.querySelectorAll('img').forEach(i=>i.loading='eager'));
    await page.waitForFunction(()=>[...document.images].every(i=>i.complete),{},{timeout:25000}).catch(()=>{});
    const photos=await page.evaluate(()=>[...document.images].map(i=>({alt:i.alt,loaded:i.complete&&i.naturalWidth>0,src:i.src,fallback:i.parentElement.querySelector('.photo-fallback')?.hidden===false})));
    assert.ok(photos.every(i=>!i.loaded||!i.fallback),'loaded images are not covered by fallback');
    const failedHotelPhotos=await page.locator('.hotel-strip img').evaluateAll(images=>images.filter(i=>!i.complete||i.naturalWidth===0).map(i=>({alt:i.alt,src:i.src})));
    assert.deepEqual(failedHotelPhotos,[],'every verified exterior and room photo loads');
    for(const index of [0,4,15,16])await page.locator(`.hotel-strip[data-hotel="${hotelRows[index].hotel}"]`).first().screenshot({path:path.join(output,`hotel-photo-${index}-${width}.png`)});
    results.push({photos});
    await page.emulateMedia({media:'print'});
    const print=await page.evaluate(()=>({width:document.querySelector('.hotel-table').getBoundingClientRect().width,container:document.querySelector('.hotel-table-wrap').getBoundingClientRect().width,droneWidth:document.querySelector('.drone-table').getBoundingClientRect().width,droneContainer:document.querySelector('.drone-table-wrap').getBoundingClientRect().width}));assert.ok(print.width<=print.container+1,'print hotel table fits');assert.ok(print.droneWidth<=print.droneContainer+1,'print drone table fits');
    await page.locator('#hotels').screenshot({path:path.join(output,'hotels-print.png')});
    await page.locator('.drone-table tbody tr').first().screenshot({path:path.join(output,'drone-first-row-print.png')});
  }
  results.push(metrics);await page.close();
}
assert.deepEqual(errors,[],'no browser JS errors');
const filePage=await browser.newPage();await filePage.goto(`file://${path.join(root,'tibet-guide.html')}`);await filePage.waitForSelector('.hotel-table');assert.equal(await filePage.locator('.day-article').count(),13);assert.equal(await filePage.locator('.drone-table tbody tr').count(),droneRows.length);await filePage.close();
console.log(JSON.stringify({output,results,errors},null,2));
}finally{await browser.close();}
