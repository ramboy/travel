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
const profile = JSON.parse(JSON.stringify(source.profile));
// 新攻略按已确认的主酒店衔接；原页面与原数据不修改。
profile.find(g => g.day === 'D5').points = profile.find(g => g.day === 'D5').points.filter(p => p.name !== '普兰');
const d8 = profile.find(g => g.day === 'D8');
d8.points.forEach(p => {delete p.stay;});
d8.points.push({name:'尼玛',alt:4530,stay:true});
const data = {hotels:source.hotels,profile,source:'amap-jsapi/app.js',profileNote:'沿用原海拔曲线的近似值；按主酒店调整塔尔钦及尼玛住宿衔接。'};
fs.writeFileSync(path.join(root,'guide-base.js'), '/* 由 build-guide.mjs 从原攻略生成；酒店信息原样保留。 */\nwindow.TIBET_BASE = '+JSON.stringify(data,null,2)+';\n');

const c = {window:{}};
vm.createContext(c);
for(const f of ['guide-base.js','guide-itinerary.js','guide-weather-trends.js','guide-weather.js','guide-research.js','guide-media.js','guide-hotel-media.js','guide-extra-media.js']) vm.runInContext(read(f),c,{filename:f});
const {TIBET_ITINERARY:guide,TIBET_WEATHER:weather,TIBET_RESEARCH:research,TIBET_HOTEL_MEDIA:hotelMedia}=c.window;
const media={...c.window.TIBET_MEDIA.assets,...hotelMedia.assets,...c.window.TIBET_EXTRA_MEDIA.assets};
const findPhoto=name=>Object.values(media).find(a=>a.name===name || (a.aliases||[]).includes(name));
const mdValue=v=>String(v??'').replaceAll('\n','<br>').replaceAll('|','\\|');
const hotelLink=h=>hotelMedia.hotels[h.hotel]?.url?`[${h.hotel}](${hotelMedia.hotels[h.hotel].url})`:h.hotel;
let md = `# ${guide.title}\n\n阿里中北线 · 方案 A · ${guide.dates}\n\n${guide.subtitle}\n\n只含图文攻略；原路线页面保留不变。09.29 住塔尔钦，10.03 住尼玛。\n\n## 航班\n\n- 09.25 西藏航空 TV9950：10:05 杭州萧山 T3 → 16:30 拉萨贡嘎 T3。\n- 10.07 西藏航空 TV9949：10:55 拉萨贡嘎 T3 → 16:55 杭州萧山 T3。\n\n## 天气\n\n墨迹核对：${weather.checkedAt}，15 天预报覆盖至 ${weather.forecastRange.through}。MSN 核对：${weather.trendCheckedAt}；10 月 4—7 日暂用 30 天远期趋势，不是短期预报或历史平均值。最低温为日最低保守参考，不冒充07:00—24:00小时最低；区县参考不等于景点精确温度。\n\n| 日期 | 地点 | 类型 / 天气 | 最高 / 最低 | 风力 | 来源 |\n| --- | --- | --- | --- | --- | --- |\n`;
for(const n of weather.nodes) md+=`| ${n.date.slice(5)} | ${n.places.join(' / ')} | ${n.status==='long_range_trend'?'MSN 远期趋势：':''}${n.condition} | ${Number.isFinite(n.high)&&Number.isFinite(n.low)?`${n.high} / ${n.low}℃`:'待更新'} | ${n.wind} | [${n.provider} · ${n.region}](${n.sourceUrl}) |\n`;
md+='\n### 天气口径与复查\n\n';for(const note of weather.notes)md+=`- ${note}\n`;for(const n of weather.nodes.filter(n=>n.status==='long_range_trend'))md+=`- ${n.date.slice(5)} ${n.places.join(' / ')}：${n.reason} 复查：${n.navigation} 核对：${n.checkedAt}。\n`;
md+='\n## 酒店信息表\n\n| 入住日 | 晚数 / 间数 | 地点 | 酒店名 | 单间价格 | 房型 | 可取消时间 | 面积 | 床型 | 供氧方式 | 早餐 |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |\n';
for(const h of source.hotels) md+='| '+[h.checkin,h.span,h.place+(h.alert?`（${h.alert}）`:''),hotelLink(h),h.price,h.room,h.cancel,h.area,h.bed,h.oxygen,h.breakfast].map(mdValue).join(' | ')+' |\n';
md+='\n## 海拔曲线\n\n完整按日期曲线见配套 HTML；海拔沿用原攻略近似值，横轴是节点顺序而非等距离。\n\n';
for(const g of profile) md+=`- ${g.date} ${g.day}：${g.points.map(p=>`${p.name}约${p.alt}m${p.stay?'（住）':''}`).join(' → ')}\n`;
md+='\n## 每日行程\n\n时间窗为建议，车程不含游览、吃饭、检查站和休息；调整住宿后的里程不套用旧值。\n\n';
for(const d of guide.days){
  md+=`### ${d.day} · ${d.date} ${d.weekday}｜${d.title}\n\n${d.route.join(' → ')}\n\n${d.drive}${d.metricNote?'。'+d.metricNote:''}\n\n住宿：${d.hotelIndexes.length?d.hotelIndexes.map(i=>hotelLink(source.hotels[i])).join(' / '):'无'}\n\n穿衣：${d.clothing}\n\n随身：${d.carry}\n\n`;
  for(const key of d.spots){const s=guide.spots[key],a=findPhoto(s.name);md+=`#### ${s.name}｜${s.duration}\n\n${s.play}\n\n`;if(a?.src&&!a.requiresPermission&&a.display!=='source-link')md+=`![${a.alt}](${a.src})\n\n`;if(a?.sourceUrl)md+=`[图片来源](${a.sourceUrl}) · ${a.credit}${a.licenseUrl?` · [${a.license||'图片许可'}](${a.licenseUrl}) · 图片经缩放与格式转换`:''}\n\n`;if(a?.requiresPermission)md+='图源需转载授权，本稿仅提供原文看图入口。\n\n';md+=`[小红书搜索攻略](https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(s.name+' 攻略')})\n\n`;}
  for(const i of d.hotelIndexes){const h=source.hotels[i],a=findPhoto(h.hotel);if(a?.src)md+=`![${h.hotel}外景](${a.src})\n\n[酒店详情](${a.sourceUrl})\n\n`;}
  md+='| 时间窗 | 安排 | 说明 |\n| --- | --- | --- |\n';for(const row of d.schedule)md+='| '+row.map(mdValue).join(' | ')+' |\n';md+=`\n**当日取舍：** ${d.decision}\n\n`;
}
md+='## 景点取舍\n\n';for(const p of research.priorities)md+=`- **${p.category}**：优先${p.keep}；可舍弃${p.optional}。${p.reason}\n`;
md+='\n## 购票与预约\n\n';for(const t of research.tickets)md+=`### ${t.name} · ${t.day}\n\n${t.booking}。${t.price}。\n\n渠道：${t.channel}。${t.note}\n\n[核验来源](${t.url})\n\n`;
md+='## 全程注意事项\n\n';for(const n of research.notes)md+=`- **${n.title}**：${n.text} [来源](${n.url})\n`;
md+='\n## 图片与资料\n\n酒店信息来自用户原攻略与订单；公开图片仅作旅行参考，版权归原作者。远程图需要联网。未获取小红书笔记原文，链接为搜索入口而非已引用笔记。\n';
fs.writeFileSync(path.join(root,'tibet-guide.md'),md);
console.log(`Generated guide-base.js and tibet-guide.md: ${source.hotels.length} hotels, ${profile.length} elevation groups, ${guide.days.length} days.`);
