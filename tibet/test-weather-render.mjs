// Offline template regression: evaluates local page scripts with inert DOM sinks.
// No browser, layout engine, network requests or external image loading.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.dirname(fileURLToPath(import.meta.url));
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const html=read('tibet-guide.html');
const scripts=[...html.matchAll(/<script src="([^"]+)"/g)].map(m=>m[1]);
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
function render(transform=()=>{}){
  const elements=new Map(ids.map(id=>[id,{innerHTML:'',textContent:'',addEventListener(){}}]));
  const document={getElementById:id=>elements.get(id)||null,querySelectorAll:()=>[]};
  const c={window:{},document};vm.createContext(c);
  for(const script of scripts){
    assert.ok(!script.includes('..')&&!script.includes('://'),'only local page scripts');
    if(script==='guide.js')transform(c.window.TIBET_WEATHER);
    vm.runInContext(read(script),c,{filename:script});
  }
  return {c,get:id=>elements.get(id).innerHTML};
}
const count=(text,pattern)=>[...text.matchAll(pattern)].length;
const current=render(),weather=current.c.window.TIBET_WEATHER;
assert.equal(count(current.get('weather-detail'),/class="weather-source-card"/g),37);
assert.equal(count(current.get('weather-detail'),/data-status="forecast"/g),36);
assert.equal(count(current.get('weather-detail'),/data-status="long_range_trend"/g),1);
assert.ok(current.get('weather-summary').includes('10.05 圣象天门'));
const activeTrend=weather.nodes.find(n=>n.status==='long_range_trend');
assert.ok(current.get('weather-summary').includes(activeTrend.checkedAt.slice(0,10)));
assert.ok(current.get('weather-stamp').includes(weather.checkedAt.slice(0,16).replace('T',' ')));
assert.ok(!current.get('weather-summary').includes('后四天暂用'));
assert.ok(current.get('weather-detail').includes('本次已核验'));
assert.ok(!current.get('weather-detail').includes('原核对（本次未更新）'));
assert.ok(current.get('weather-detail').includes('404'));
assert.equal(count(current.get('days-content'),/class="day-article"/g),13);
assert.equal(count(current.get('hotel-grid'),/<tr>/g),20,'19 hotel rows plus header');
assert.equal(count(current.get('altitude-poster'),/altitude-marker is-stay/g),12);
const view=current.c.window.TIBET_GUIDE_VIEW;
assert.equal(view.mergedWeatherNodes.flatMap(n=>n.members).length,37);
for(const day of current.c.window.TIBET_ITINERARY.days){
  const actual=view.dayWeather(day.day),nodes=weather.nodes.filter(n=>n.day===day.day);
  assert.equal(actual.high,Math.max(...nodes.map(n=>n.high)));
  assert.equal(actual.low,Math.min(...nodes.map(n=>n.low)));
  assert.equal(actual.trend,day.day==='D10','only the day with retained Shengxiang trend has a trend label');
}
for(const n of view.mergedWeatherNodes){
  assert.ok(n.members.every(m=>m.date===n.date&&m.provider===n.provider&&m.status===n.status));
  assert.equal(n.high,Math.max(...n.members.map(m=>m.high)));
  assert.equal(n.low,Math.min(...n.members.map(m=>m.low)));
  assert.ok(Math.max(...n.members.map(m=>m.high))-Math.min(...n.members.map(m=>m.high))<=2);
  assert.ok(Math.max(...n.members.map(m=>m.low))-Math.min(...n.members.map(m=>m.low))<=2);
}
// Simulated input only, never written back to actual forecasts.
const oldTrend=render(w=>{w.nodes.find(n=>n.status==='long_range_trend').checkedAt='2026-09-19T11:38:32+08:00';});
assert.ok(oldTrend.get('weather-detail').includes('原核对（本次未更新）'));
assert.ok(oldTrend.get('weather-detail').includes('保留旧快照'));
const noTrends=render(w=>{w.nodes=w.nodes.filter(n=>n.status!=='long_range_trend');});
assert.ok(!noTrends.get('weather-summary').includes('仍保留 MSN'));
assert.ok(!noTrends.get('weather-stamp').includes('MSN'));
assert.ok(!noTrends.get('weather-detail').includes('保留旧快照'));
const partial=render(w=>{const n=w.nodes.find(n=>n.day==='D0');Object.assign(n,{status:'unavailable',high:null,low:null,condition:'待更新'});});
assert.ok(partial.c.window.TIBET_GUIDE_VIEW.dayWeather('D0').partial);
assert.ok(partial.get('overview-content').includes('部分地点参考'));
const empty=render(w=>{for(const n of w.nodes)Object.assign(n,{status:'unavailable',high:null,low:null,condition:'待更新'});});
assert.equal(empty.c.window.TIBET_GUIDE_VIEW.dayWeather('D0').available,false);
assert.ok(!/NaN|Infinity/.test(empty.get('weather-chart')));
assert.ok(empty.get('weather-chart').includes('待更新'));
console.log('Offline page-template regression passed: current / no trend / partial / unavailable; 37 weather nodes, 19 hotels, 12 stays, 13 days. Visual layout and remote assets not tested.');
