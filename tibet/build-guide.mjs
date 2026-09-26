import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const original = read('amap-jsapi/app.js');
const source = {};
vm.createContext(source);
vm.runInContext(original.slice(0, original.indexOf('const PLACES =')) + '\nthis.hotels = HOTEL_OPTIONS; this.profile = ALTITUDE_PROFILES.classic;', source);
const updates = JSON.parse(read('guide-hotel-updates.json'));
for (const hotel of source.hotels) {
  if (updates.backupHotels.includes(hotel.hotel)) hotel.place = hotel.place.replace(/（备选）$/, '') + '（备选）';
}
const insertion = source.hotels.findIndex(h => h.hotel === updates.insertBefore);
if (insertion < 0) throw new Error('Hotel update anchor missing');
source.hotels.splice(insertion, 0, ...updates.hotels);
const profile = JSON.parse(JSON.stringify(source.profile));
// 新攻略按已确认的主酒店衔接；原页面与原数据不修改。
const d2 = profile.find(g => g.day === 'D2');
d2.points = d2.points.filter(p => !p.stay);
d2.points.push({name:'定日白坝（县域海拔参考）',alt:4300,stay:true});
profile.find(g => g.day === 'D5').points = profile.find(g => g.day === 'D5').points.filter(p => p.name !== '普兰');
const d8 = profile.find(g => g.day === 'D8');
d8.points.forEach(p => {delete p.stay;});
d8.points.push({name:'尼玛',alt:4530,stay:true});
const data = {hotels:source.hotels,profile,source:'amap-jsapi/app.js',profileNote:'沿用原海拔曲线的近似值；按主酒店调整定日白坝、塔尔钦及尼玛住宿衔接；定日白坝采用原攻略定日约4300米县域参考，非酒店实测。'};
fs.writeFileSync(path.join(root,'guide-base.js'), '/* 由 build-guide.mjs 从原攻略及 guide-hotel-updates.json 生成；勿手工修改。 */\nwindow.TIBET_BASE = '+JSON.stringify(data,null,2)+';\n');

const c = {window:{}};
vm.createContext(c);
for(const f of ['guide-base.js','guide-itinerary.js','guide-weather-trends.js','guide-weather.js','guide-research.js','guide-media.js','guide-hotel-media.js','guide-extra-media.js','guide-drone-evidence.js','guide-drone.js']) vm.runInContext(read(f),c,{filename:f});
const {TIBET_ITINERARY:guide,TIBET_WEATHER:weather,TIBET_RESEARCH:research,TIBET_HOTEL_MEDIA:hotelMedia,TIBET_DRONE:drone}=c.window;
const media={...c.window.TIBET_MEDIA.assets,...hotelMedia.assets,...c.window.TIBET_EXTRA_MEDIA.assets};
const findPhoto=name=>Object.values(media).find(a=>a.name===name || (a.aliases||[]).includes(name));
const mdValue=v=>String(v??'').replaceAll('\n','<br>').replaceAll('|','\\|');
const hotelLink=h=>hotelMedia.hotels[h.hotel]?.url?`[${h.hotel}](${hotelMedia.hotels[h.hotel].url})`:h.hotel;
const weatherTrends=weather.nodes.filter(n=>n.status==='long_range_trend');
const staleTrend=n=>n.status==='long_range_trend'&&n.checkedAt.slice(0,10)<weather.checkedAt.slice(0,10);
const trendSummary=weatherTrends.length?`采用 MSN 30 天远期趋势的地点：${weatherTrends.map(n=>`${n.date.slice(5)} ${n.places.join(' / ')}（${staleTrend(n)?'旧快照，原核对':'本次核对'}：${n.checkedAt}）`).join('；')}。远期趋势不是短期预报或历史平均值。`:'';
let md = `# ${guide.title}\n\n阿里中北线 · 方案 A · ${guide.dates}\n\n${guide.subtitle}\n\n只含图文攻略；原路线页面保留不变。09.27 住定日白坝珠穆朗玛国际酒店（双床、大床各1间，合计¥952.02），巴松村维也纳保留为备选；09.29 住塔尔钦，10.03 住尼玛。\n\n## 航班\n\n- 09.25 西藏航空 TV9950：10:05 杭州萧山 T3 → 16:30 拉萨贡嘎 T3。\n- 10.07 西藏航空 TV9949：10:55 拉萨贡嘎 T3 → 16:55 杭州萧山 T3。\n\n## 天气\n\n墨迹核对：${weather.checkedAt}，明确日期预报范围为 ${weather.forecastRange.from}—${weather.forecastRange.through}。${trendSummary}最低温为日最低保守参考，不冒充07:00—24:00小时最低；区县参考不等于景点精确温度。\n\n| 日期 | 地点 | 类型 / 天气 | 最高 / 最低 | 风力 | 来源 | 核对时间 |\n| --- | --- | --- | --- | --- | --- | --- |\n`;
for(const n of weather.nodes) md+=`| ${n.date.slice(5)} | ${n.places.join(' / ')} | ${n.status==='long_range_trend'?`MSN 远期趋势（${staleTrend(n)?'保留旧快照':'本次已核验'}）：`:''}${n.condition} | ${Number.isFinite(n.high)&&Number.isFinite(n.low)?`${n.high} / ${n.low}℃`:'待更新'} | ${n.wind} | [${n.provider} · ${n.region}](${n.sourceUrl}) | ${staleTrend(n)?'原核对（本次未更新）：':''}${n.checkedAt||weather.checkedAt} |\n`;
md+='\n### 天气口径与复查\n\n';for(const note of weather.notes)md+=`- ${note}\n`;for(const n of weather.nodes.filter(n=>n.status==='long_range_trend'))md+=`- ${n.date.slice(5)} ${n.places.join(' / ')}：${n.reason} 复查：${n.navigation} 核对：${n.checkedAt}。\n`;
md+='\n## 无人机适飞情况\n\n';
const droneZoneStatus=row=>drone.legend?.colorsVerified===true&&row.uom?.colorVerified===true&&['blue','white','mixed'].includes(row.uom.status)?row.uom.status:'unverified';
const droneChecked=drone.rows.filter(row=>droneZoneStatus(row)!=='unverified').length;
md+=`${droneChecked<drone.rows.length?'核验初稿 · UOM 颜色查询尚未完成。':''}资料整理：${drone.checkedAt}；${drone.rows.length} 条逐日记录中，${droneChecked} 条 UOM 颜色已核验。UOM 颜色与景区、文保和现场管理分开核对；蓝区和白区均不单独构成放飞许可，白区不自动等同法定管制区。\n\n`;
const droneSources=items=>(items||[]).filter(s=>/^https?:\/\//.test(s.url||'')).map(s=>`[${s.title||'来源'}](${s.url})`).join('；');
if(drone.legend?.verified===true)md+=`UOM 已核验图例：蓝色 = ${drone.legend.blue||'UOM 蓝区'}；白色 = ${drone.legend.white||'UOM 白区'}；待核验不等于适飞。\n\n`;
else if(drone.legend?.colorsVerified===true)md+='UOM 页面色块已实见：蓝区 / 白区仅描述页面颜色；法律含义未完整核验，不自动推定适飞或法定管制属性。\n\n';
else md+='UOM 页面色块尚未完成实见核验，暂不填写蓝区 / 白区。\n\n';
if(drone.legend?.observedAt)md+=`图例观察：${drone.legend.observedAt}\n\n`;
if(drone.legend?.note)md+=`${drone.legend.note}\n\n`;
if(drone.legend?.sources?.length)md+=`${droneSources(drone.legend.sources)}\n\n`;
md+='空域结果只对应记录中的位置与查询时间，不代替出发前和起飞前复查。\n\n| 日期 / 地点与定位 | UOM 空域查询 | 景区 / 场地管理 | 当次结论 / 下一步 |\n| --- | --- | --- | --- |\n';
for(const row of drone.rows){
  const location=row.location||{},uom=row.uom||{},venue=row.venue||{};
  const status=droneZoneStatus(row);
  const labels={blue:'UOM 蓝区',white:'UOM 白区',mixed:'蓝白交界 / 范围混合',unverified:'待核验 · 不作适飞判断'};
  const coordinates=Array.isArray(location.coordinates)?location.coordinates.join(', '):location.coordinates;
  const observation=uom.observation;
  const uomLabel=status==='unverified'?(uom.status==='unverified'&&(uom.attempt||observation)?uom.label||labels.unverified:labels.unverified):uom.label||labels[status];
  const observationText=observation?`\n查询词：${observation.queryText||'未记录'}\n匹配结果：${observation.matchedResult||'未记录'}\n地图级别：${observation.zoom??'未记录'}${status!=='unverified'?'\n观察时间：'+(observation.observedAt||'未记录'):''}\n${status==='unverified'?'尝试说明':'观察说明'}：${observation.note||'未记录'}`:'';
  const queryDate=status==='unverified'&&observation?`尝试日期：${observation.observedAt||'未记录'}`:`颜色核验：${uom.checkedAt||'未完成逐点查询'}`;
  const cells=[`${row.date} · ${row.day} · ${row.place}\n${location.label||'具体起飞点待定位'}\n定位精度：${location.precision||'待核验'}${coordinates?'\n参考坐标：'+coordinates:''}${location.note?'\n'+location.note:''}`,`${uomLabel}\n${uom.detail||'没有可用于判断此起飞点的 UOM 核验记录。'}\n${queryDate}${observationText}\n${droneSources(uom.sources)}`,`${venue.label||'当地管理待核验'}\n${venue.detail||'未核实场地管理要求；缺少公告不代表允许飞行。'}\n${droneSources(venue.sources)}`,`${row.conclusion||'尚不能判断适飞'}\n${row.action||'确定实际起飞点后，重新查询 UOM 并核对现场管理要求。'}`];
  md+='| '+cells.map(mdValue).join(' | ')+' |\n';
}
md+='\n';for(const note of drone.notes||[])md+=`- ${note}\n`;
md+='\n## 酒店信息表\n\n| 入住日 | 晚数 / 间数 | 地点 | 酒店名 | 单间价格 | 房型 | 可取消时间 | 面积 | 床型 | 供氧方式 | 早餐 |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |\n';
for(const h of source.hotels) md+='| '+[h.checkin,h.span,h.place+(h.alert?`（${h.alert}）`:''),hotelLink(h),h.price,h.room,h.cancel,h.area,h.bed,h.oxygen,h.breakfast].map(mdValue).join(' | ')+' |\n';
md+='\n## 海拔曲线\n\n完整按日期曲线见配套 HTML；海拔沿用原攻略近似值，横轴是节点顺序而非等距离。\n\n';
for(const g of profile) md+=`- ${g.date} ${g.day}：${g.points.map(p=>`${p.name}约${p.alt}m${p.stay?'（住）':''}`).join(' → ')}\n`;
md+='\n## 每日行程\n\n时间窗为建议，车程不含游览、吃饭、检查站和休息；调整住宿后的里程不套用旧值。\n\n';
for(const d of guide.days){
  md+=`### ${d.day} · ${d.date} ${d.weekday}｜${d.title}\n\n${d.route.join(' → ')}\n\n${d.drive}${d.metricNote?'。'+d.metricNote:''}\n\n住宿：${d.hotelIndexes.length?d.hotelIndexes.map(i=>hotelLink(source.hotels[i])).join(' / '):'无'}\n\n穿衣：${d.clothing}\n\n随身：${d.carry}\n\n`;
  for(const key of d.spots){const s=guide.spots[key],a=findPhoto(s.name);md+=`#### ${s.name}｜${s.duration}\n\n${s.play}\n\n`;if(a?.src&&!a.requiresPermission&&a.display!=='source-link')md+=`![${a.alt}](${a.src})\n\n`;if(a?.sourceUrl)md+=`[图片来源](${a.sourceUrl}) · ${a.credit}${a.licenseUrl?` · [${a.license||'图片许可'}](${a.licenseUrl}) · 图片经缩放与格式转换`:''}\n\n`;if(a?.requiresPermission)md+='图源需转载授权，本稿仅提供原文看图入口。\n\n';md+=`[小红书搜索攻略](https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(s.name+' 攻略')})\n\n`;}
  for(const h of source.hotels.filter(h=>h.checkin.split('\n').includes(d.date))){
    const entry=hotelMedia.hotels[h.hotel],exterior=media[entry?.image]||findPhoto(h.hotel);
    md+=`#### ${h.hotel}${h.place.endsWith('（备选）')?'（备选）':''}｜外观与房型\n\n`;
    if(h.address) md+=`地址：${h.address}\n\n${h.roomNote}；${h.stayNote}\n\n`;
    const photos=[{label:'酒店外观',asset:exterior},...h.room.split('\n').map(room=>({label:room,asset:media[entry?.rooms?.find(r=>r.room===room)?.image]}))];
    for(const {label,asset:a} of photos){
      md+=`**${label}**\n\n`;
      if(a?.src&&a.status==='verified')md+=`![${a.alt}](${a.src})\n\n[图片来源](${a.sourceUrl}) · ${a.credit}${a.sourceRoomName&&a.sourceRoomName!==label?' · 来源房型：'+a.sourceRoomName:''}${a.matchNote?' · '+a.matchNote:''}\n\n`;
      else md+='图片待核实：未找到可确认对应关系的实拍图，不以其他酒店或房型替代。\n\n';
    }
    md+='图片只展示对应房型，具体楼层、朝向、布置和入住时现状以酒店安排为准。\n\n';
  }
  md+='| 时间窗 | 安排 | 说明 |\n| --- | --- | --- |\n';for(const row of d.schedule)md+='| '+row.map(mdValue).join(' | ')+' |\n';md+=`\n**当日取舍：** ${d.decision}\n\n`;
}
md+='## 景点取舍\n\n';for(const p of research.priorities)md+=`- **${p.category}**：优先${p.keep}；可舍弃${p.optional}。${p.reason}\n`;
md+='\n## 购票与预约\n\n';for(const t of research.tickets)md+=`### ${t.name} · ${t.day}\n\n${t.booking}。${t.price}。\n\n渠道：${t.channel}。${t.note}\n\n[核验来源](${t.url})\n\n`;
md+='## 全程注意事项\n\n';for(const n of research.notes)md+=`- **${n.title}**：${n.text} [来源](${n.url})\n`;
md+='\n## 图片与资料\n\n酒店信息来自用户原攻略与订单；公开图片仅作旅行参考，版权归原作者。远程图需要联网。未获取小红书笔记原文，链接为搜索入口而非已引用笔记。\n';
fs.writeFileSync(path.join(root,'tibet-guide.md'),md);
console.log(`Generated guide-base.js and tibet-guide.md: ${source.hotels.length} hotels, ${profile.length} elevation groups, ${guide.days.length} days.`);
