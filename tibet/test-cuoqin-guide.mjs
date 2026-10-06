import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {referenceDataChapters} from './cuoqin-reference-data.mjs';

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
  ['2026-09-29','措勤县'],['2026-09-30','文布南村'],['2026-10-01','班戈县'],['2026-10-02','拉萨市']
]);
assert.deepEqual(plan.days.slice(5,8).map(day=>day.spots),original.days.slice(8,11).map(day=>day.spots),'keeps the original later sightseeing order');
assert.ok(plan.days[5].route.at(-1).includes('琼宗')&&plan.days[6].route[0].includes('琼宗'),'September 30 overnight matches October 1 departure');
assert.ok(plan.days[7].decision.includes('条件备选')&&plan.days[7].schedule.some(row=>row.join(' ').includes('替换')),'elephant gate remains a conditional alternative');
assert.ok(plan.days.slice(0,4).every(day=>day.status==='historical'));
assert.ok(plan.days[3].hotelNote.includes('如家')&&plan.days[3].decision.includes('未逐项确认'));
assert.ok(plan.days[4].drive.includes('286.6')&&plan.days[4].drive.includes('高德'),'Saga mileage comes from the checked AMap route');
assert.ok(plan.days[5].drive.includes('2026-10-06')&&plan.days[5].metricNote.includes('历史'));
assert.ok(plan.days[6].drive.includes('2026-10-06')&&plan.days[6].metricNote.includes('历史'));
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
assert.ok(jinjiang.source.includes('实际住宿记录')&&jinjiang.source.includes('截图'));
assert.ok(jinjiang.note.includes('各 ¥528')&&jinjiang.note.includes('不是'),'accounting split is not substituted for order prices');
const huating=plan.confirmedStays.find(stay=>stay.hotel.includes('华庭'));
const homeinn=plan.confirmedStays.find(stay=>stay.hotel.includes('如家')&&stay.hotel.includes('布达拉宫广场'));
assert.ok(huating&&homeinn,'October 3 screenshots supply both additional hotel records');
assert.equal(plan.confirmedStays.length,8,'eight actual hotels cover nine nights');
assert.equal(plan.confirmedStays.reduce((n,stay)=>n+stay.nights,0),9);
assert.ok(plan.confirmedStays.every(stay=>stay.status.includes('已入住')&&stay.source.includes('实际住宿记录')));
const qiongzong=plan.confirmedStays.find(stay=>stay.id==='qiongzong-lake-20260930');
assert.ok(qiongzong&&qiongzong.hotel==='琼宗湖景驿站');
assert.deepEqual([qiongzong.checkin,qiongzong.checkout,qiongzong.rooms[0].name,qiongzong.rooms[0].count,qiongzong.total],['2026-09-30','2026-10-01','豪华套房',1,952]);
for(const key of ['area','bed','oxygen'])assert.equal(qiongzong.rooms[0][key],'未提供','unprovided Qiongzong facilities remain unknown');
const tingri=plan.confirmedStays.find(stay=>stay.id==='tingri-everest-20260927');
assert.deepEqual(tingri.rooms.map(room=>[room.name,room.amount]),[['天际富氧双床房',492],['天际富氧大床房',460.02]],'user-corrected Tingri room-price mapping');
const saga=plan.confirmedStays.find(stay=>stay.id==='saga-homeinn-20260928');
assert.deepEqual([saga.rooms[0].count,saga.rooms[0].amount,saga.total],[2,1799,1799]);
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
assert.ok(homeinn.paymentStatus.includes('10/3')&&homeinn.paymentStatus.includes('待扣款')&&homeinn.paymentStatus.includes('后续扣款状态未核实'),'past payment evidence is dated and does not imply a current charge status');
assert.ok(homeinn.status.includes('已入住')&&homeinn.source.includes('实际住宿记录'),'actual stay confirmation comes from the user record');
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
assert.ok(plan.days[4].hotelNote.includes('锦江之星')&&/已入住|实际入住/.test(plan.days[4].hotelNote));
assert.ok(!/住宿待落实|房间仍需落实|今晚没房/.test(plan.days[4].hotelNote),'today lodging is no longer marked unresolved');
assert.ok(!plan.hotelChanges.some(hotel=>hotel.newDate.includes('新增 3 晚')),'obsolete Lhasa extension is removed');
assert.ok(conditions.weather.length);
for(const weather of conditions.weather){
  assert.equal(weather.status,'待更新');
  for(const field of ['high','low','text','wind'])assert.equal(weather[field],null,'unverified revised-date weather stays empty');
  assert.ok(weather.checkedAt&&weather.url&&weather.note);
}
assert.ok(!html.includes('guide-weather.js'),'old date-based weather is not loaded');
assert.ok(markdown.includes('锦江之星')&&markdown.includes('已入住')&&/旧天气没有平移|没有把旧天气平移|未把旧天气平移/.test(markdown));
assert.ok(!html.includes('4,479.4')&&!markdown.includes('4,479.4'),'old full-loop mileage is not republished as the revised route');

// Offline publication contracts. Responsive layout and browser interaction are verified in CUA.
const decoded=value=>String(value).replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&#124;/g,'|');
const plain=value=>normalize(decoded(String(value).replace(/<br\s*\/?>/g,' ').replace(/<[^>]*>/g,' ')));
const attribute=(tag,name)=>decoded(tag.match(new RegExp(`(?:\\s|^)${name}="([^"]*)"`))?.[1]||'');
const classIs=(tag,name)=>attribute(tag,'class').split(/\s+/).includes(name);
const sections=[...html.matchAll(/<section\b[^>]*\bid="([^"]+)"[^>]*>/g)].map(match=>match[1]);
const chapterIds=['overview','weather','daily','drone','hotels','altitude','choices','tickets','notes'];
const navigation=source=>[...(source.match(/<nav\b[^>]*class="quick-nav"[^>]*>([\s\S]*?)<\/nav>/)?.[1]||'').matchAll(/href="#([^"]+)"/g)].map(match=>match[1]);
assert.deepEqual(sections,chapterIds,'all nine chapters follow the legacy order');
assert.deepEqual(navigation(html),navigation(read('tibet-guide.html')),'chapter navigation follows the old guide');
assert.deepEqual(navigation(html),chapterIds);
const sectionBody=id=>html.match(new RegExp(`<section\\b[^>]*\\bid="${id}"[^>]*>([\\s\\S]*?)<\\/section>`))?.[1]||'';
const overview=sectionBody('overview');
assert.ok(overview.includes('id="mileage"')&&overview.includes('mileage-table'),'total, daily driving distances and evidence are inside the overview');
assert.ok(!sections.includes('mileage'),'mileage is part of the overview, not a separate chapter');
assert.equal((overview.match(/class="overview-table"/g)||[]).length,1);
const overviewTable=overview.match(/<table class="overview-table"[^>]*>([\s\S]*?)<\/table>/)?.[1]||'';
assert.equal((overviewTable.match(/<tbody>([\s\S]*?)<\/tbody>/)?.[1].match(/<tr\b/g)||[]).length,10,'all ten days appear in the overview');
assert.equal((overviewTable.match(/<th\b/g)||[]).length,5,'overview keeps route, lodging, weather and clothing fields');
assert.ok(overview.includes('2,732.4')&&overview.includes('2,844.9'),'main and alternative total remain distinguishable');
assert.ok(markdown.indexOf('### 每日自驾公里数')>markdown.indexOf('## 全程概览')&&markdown.indexOf('### 每日自驾公里数')<markdown.indexOf('## 天气与穿衣'),'Markdown mileage is nested in the overview');

const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(match=>decoded(match[1]));
assert.equal(new Set(ids).size,ids.length,'all published IDs are unique');
for(const match of html.matchAll(/href="#([^"]*)"/g))if(match[1])assert.ok(ids.includes(decodeURIComponent(decoded(match[1]))),`internal anchor resolves: #${match[1]}`);
const dayArticles=[...html.matchAll(/<article\b[^>]*>/g)].filter(match=>classIs(match[0],'day-article'));
assert.equal(dayArticles.length,10,'all ten dates have complete day articles');
assert.deepEqual(dayArticles.map(match=>attribute(match[0],'id')),plan.days.map(day=>`day-${day.day}`));
assert.equal([...html.matchAll(/<aside\b[^>]*>/g)].filter(match=>classIs(match[0],'hotel-strip')).length,9,'nine nights each have a hotel panel');
for(const [index,day] of plan.days.entries()){
  const body=html.slice(dayArticles[index].index,dayArticles[index+1]?.index||html.indexOf('<section id="drone"'));
  assert.equal(attribute(dayArticles[index][0],'data-date'),day.date);
  for(const value of [day.title,day.drive,day.clothing,day.carry,day.decision])assert.ok(plain(body).includes(normalize(value)),`${day.day}: complete daily information`);
  assert.equal((body.match(/class="schedule-row"/g)||[]).length,day.schedule.length,`${day.day}: full schedule`);
  for(const row of day.schedule)for(const value of row)assert.ok(plain(body).includes(normalize(value)),`${day.day}: schedule text retained`);
  const stay=plan.confirmedStays.find(stay=>day.date>=stay.checkin&&day.date<stay.checkout);
  if(stay){assert.ok(body.includes(`data-hotel="${stay.hotel}"`),`${day.day}: actual overnight hotel panel`);assert.ok(body.includes(`href="#stay-${stay.id}"`));}
  else assert.ok(!body.includes('class="hotel-strip"'),'return day has no additional stay');
}

const hotelSection=sectionBody('hotels');
const hotelTable=hotelSection.match(/<table\b[^>]*class="hotel-information-table hotel-table"[^>]*>([\s\S]*?)<\/table>/)?.[1]||'';
assert.ok(hotelTable,'complete hotel information table is static HTML');
assert.deepEqual([...hotelTable.matchAll(/<th\b[^>]*>([\s\S]*?)<\/th>/g)].map(match=>plain(match[1])),hotelHeaders);
const hotelRows=[...hotelTable.matchAll(/<tr\b([^>]*)>([\s\S]*?)<\/tr>/g)].filter(match=>match[1].includes('data-stay-id')).map(match=>({
  id:attribute(match[1],'data-stay-id'),date:attribute(match[1],'data-checkin'),text:plain(match[2]),
  cells:[...match[2].matchAll(/<td\b([^>]*)>([\s\S]*?)<\/td>/g)].map(cell=>({key:attribute(cell[1],'data-col'),text:plain(cell[2])}))
}));
assert.equal(hotelRows.length,19,'hotel table preserves nineteen actual room and historical alternative rows');
assert.ok(hotelRows.every(row=>row.cells.length===11&&/^2026-\d{2}-\d{2}$/.test(row.date)),'all eleven hotel fields and dates remain present');
assert.deepEqual(hotelRows.map(row=>row.date),hotelRows.map(row=>row.date).sort(),'hotel rows remain chronological');
for(const stay of plan.confirmedStays){
  const rows=hotelRows.filter(row=>row.id===stay.id);
  assert.equal(rows.length,stay.rooms.length,'one actual hotel row per room type');
  const text=normalize(rows.map(row=>row.text).join(' '));
  assert.ok(!/\d{12,}/.test(text),'hotel cells omit long order and card numbers');
  for(const value of [stay.hotel,stay.status,stay.paymentStatus,stay.breakfast].filter(Boolean))assert.ok(text.includes(normalize(value)),'stay, payment and meal evidence retain separate wording');
  assert.ok(rows.every(row=>row.date===stay.checkin));
  assert.equal(ids.filter(id=>id===`stay-${stay.id}`).length,1,'each stay keeps one unique deep link');
  for(const [index,room] of stay.rooms.entries()){
    const cells=Object.fromEntries(rows[index].cells.map(cell=>[cell.key,cell.text]));
    assert.ok(cells.room.includes(room.name));
    assert.ok(new RegExp(`${stay.nights}\\s*晚`).test(cells.span)&&new RegExp(`${room.count}\\s*间`).test(cells.span),'nights and room count remain separate from price');
    assert.ok(cells.checkin.includes(stay.checkout)||cells.checkin.includes(stay.checkout.slice(5).replace('-','.')),'checkout stays visible');
    const price=cells.price.replaceAll(',','');
    for(const amount of [room.amount,stay.total,room.amount/(room.count*stay.nights)])assert.ok(price.includes(String(amount)),`${stay.id}: amount and per-room basis retained`);
    if(stay.id===homeinn.id)assert.ok(/均摊/.test(price)&&/每间每晚|\/间\/晚|间.*晚/.test(price));
    for(const field of ['area','bed','oxygen'])if(room[field])assert.ok(cells[field].includes(normalize(room[field])),`${field} remains in its own column`);
  }
}
for(const old of base.hotels.filter(hotel=>['09.25','09.26','09.27','09.28'].includes(hotel.checkin))){
  const matching=hotelRows.filter(row=>row.date===`2026-${old.checkin.replace('.','-')}`&&row.text.includes(old.hotel));
  assert.ok(matching.length&&old.room.split('\n').every(room=>matching.some(row=>row.text.includes(room))),'early actual hotels and historical alternatives retain their room records');
}
const villageRows=hotelRows.filter(row=>row.date==='2026-09-30');
assert.equal(villageRows.length,1);
assert.ok(villageRows[0].text.includes('琼宗湖景驿站')&&villageRows[0].text.includes('952')&&!villageRows[0].text.includes('尚客优'));
const villageCells=Object.fromEntries(villageRows[0].cells.map(cell=>[cell.key,cell.text]));
for(const key of ['area','bed','oxygen','breakfast'])assert.equal(villageCells[key],'未提供');
assert.ok(!hotelSection.includes(cancelled.hotel)&&!retiredHotelUI.test(hotelSection));
const returnText=plain(html.match(/<div id="return-flight">([\s\S]*?)<\/div>/)?.[1]||'');
assert.ok(returnText.includes('TV9949')&&returnText.includes('杭州')&&/10\s*(?:月|\/|\.|-)\s*0?4/.test(returnText));
assert.ok(!/10:55|16:55/.test(returnText)&&/待|未提供|未确认/.test(returnText),'rescheduled flight times remain unconfirmed');

for(const file of ['guide-weather-trends.js','guide-weather.js','guide-drone-evidence.js','guide-drone.js'])vm.runInContext(read(file),context,{filename:file});
const weather=JSON.parse(JSON.stringify(context.window.TIBET_WEATHER));
const drone=JSON.parse(JSON.stringify(context.window.TIBET_DRONE));
const input={plan,base,original,weather,drone,conditions},before=JSON.stringify(input);
const data=referenceDataChapters(input);
assert.equal(JSON.stringify(input),before,'chapter rendering does not mutate source evidence');
for(const [id,body] of [['weather',data.weatherHtml],['drone',data.droneHtml],['altitude',data.altitudeHtml]])assert.ok(sectionBody(id).includes(body),`${id}: complete data chapter is present without JavaScript`);
assert.equal(Object.keys(data.weatherByDate).length,10);
for(const node of data.weatherNodes){
  assert.ok(plan.days.some(day=>day.date===node.date),'weather dates stay within the revised trip');
  if(Number.isFinite(node.high)){
    const source=weather.nodes.find(old=>old.date===node.date&&old.sourceUrl===node.sourceUrl&&old.high===node.high&&old.low===node.low&&old.checkedAt===node.checkedAt&&node.places.every(place=>old.places.includes(place)));
    assert.ok(source,'every temperature retains its exact original date, location, values, URL and check time');
  }
  if(node.date>='2026-09-30')assert.ok(node.high===null&&node.low===null,'rescheduled dates have no substituted temperatures');
}
for(const day of plan.days.slice(0,4))assert.equal(data.weatherByDate[day.date].sourceLabel,'原日期预报快照');
assert.ok(data.weatherHtml.includes('缺失值不插值')&&data.weatherHtml.includes('不代表实际经历的天气'));
assert.equal(data.droneRows.length,12);
assert.equal((data.droneHtml.match(/<tr data-drone-id=/g)||[]).length,12);
for(const row of data.droneRows){
  const source=drone.rows.find(old=>old.id===row.id);
  assert.ok(source&&plan.days.find(day=>day.date===row.date)?.spots.includes(row.spotKey));
  assert.deepEqual(row.uom,source.uom,'UOM status, original observation and sources are not rewritten as fresh evidence');
  assert.deepEqual(row.venue,source.venue,'original venue evidence is retained');
  assert.equal(row.originalItineraryDate,source.date);
}
const stays=data.altitudePoints.filter(point=>point.stay);
assert.equal(stays.length,9);
assert.deepEqual(stays.map(point=>point.date),plan.days.slice(0,9).map(day=>day.date));
assert.equal(stays.find(point=>point.date==='2026-09-30').alt,4650,'village uses the existing approximate area elevation');
assert.ok(data.altitudeHtml.includes('非酒店实测'),'rendered text identifies area elevation, not a measured hotel value');
assert.ok(data.altitudeHtml.includes('不作为琼宗湖景驿站实测海拔'));
assert.ok(!data.altitudePoints.some(point=>/玛旁|塔尔钦|札达|古格|革吉|改则|物玛|雀登/.test(point.name)),'cancelled western route nodes are absent');
for(const point of data.altitudePoints)assert.ok(base.profile.flatMap(group=>group.points).some(old=>old.name===point.sourceName&&old.alt===point.alt),'all altitude values come from the original known points');
for(const artifact of [html,markdown]){
  assert.ok(!/订单号|信用卡|尾号|银行卡|支付账号/.test(artifact),'public artifacts omit hotel payment and order identifiers');
  assert.ok(!/codex:\/\/threads/.test(artifact),'internal task links are not published');
}
console.log('Offline guide checks passed: 9 legacy chapters, mileage in overview, 10 full days, 9 hotel panels, 19 hotel rows, 12 drone records and 9 altitude stay nodes. Browser layout is checked separately with CUA.');
