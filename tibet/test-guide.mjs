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
for(const name of ['guide-base.js','guide-itinerary.js','guide-weather-trends.js','guide-weather.js','guide-media.js','guide-hotel-media.js','guide-extra-media.js'])vm.runInContext(read(name),c);
const original=read('amap-jsapi/app.js'),old={};vm.createContext(old);vm.runInContext(original.slice(0,original.indexOf('const PLACES ='))+'\nthis.hotels=HOTEL_OPTIONS;',old);
assert.equal(JSON.stringify(c.window.TIBET_BASE.hotels),JSON.stringify(old.hotels),'original hotel values preserved');
assert.equal(c.window.TIBET_BASE.hotels.length,19);
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
assert.ok(c.window.TIBET_WEATHER.nodes.filter(n=>n.date>='2026-10-04').every(n=>n.status!=='unavailable'),'all late-trip temperature nodes populated');
assert.ok(read('tibet-guide.md').includes('creativecommons.org/licenses/by/2.0/'));
const hashes={'amap-jsapi/app.js':'d5b21ed08871d2e7853249c2b7b3d296ee72ca724486bd96eec0febf7d54282f','amap-jsapi/index.html':'82bfbf350700b256038ff8d3717a9ecab128818454b72fa1ca1f2582ed292858','amap-jsapi/styles.css':'d224f3a9f22ab156f2208a012dd0f111c346db5270413af33a110ec02d6ab2f4','amap-jsapi/README.md':'0532002ec438d14e44db00642c01b307a9e4c60eb5a50e0487ee73f6d8c6db88'};
for(const[f,h]of Object.entries(hashes))assert.equal(crypto.createHash('sha256').update(read(f)).digest('hex'),h,`${f} unchanged`);
console.log('Data assertions passed: 19 hotel rows unchanged; 13 dates; 12 stays; source hashes intact.');

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
  }
  await page.screenshot({path:path.join(output,`hero-${width}.png`)});
  if(width===390||width===1440){
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
    results.push({photos});
    await page.emulateMedia({media:'print'});
    const print=await page.evaluate(()=>({width:document.querySelector('.hotel-table').getBoundingClientRect().width,container:document.querySelector('.hotel-table-wrap').getBoundingClientRect().width}));assert.ok(print.width<=print.container+1,'print hotel table fits');
    await page.locator('#hotels').screenshot({path:path.join(output,'hotels-print.png')});
  }
  results.push(metrics);await page.close();
}
assert.deepEqual(errors,[],'no browser JS errors');
const filePage=await browser.newPage();await filePage.goto(`file://${path.join(root,'tibet-guide.html')}`);await filePage.waitForSelector('.hotel-table');assert.equal(await filePage.locator('.day-article').count(),13);await filePage.close();
console.log(JSON.stringify({output,results,errors},null,2));
}finally{await browser.close();}
