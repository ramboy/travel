/* 新攻略的天气、无人机与海拔章节；使用原攻略资料并保留证据日期。 */
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const md = value => String(value ?? '').replaceAll('|', '\\|').replaceAll('\n', '<br>');
const dateText = value => value ? String(value).replace('T', ' ') : '未记录';
const short = value => String(value).slice(5).replace('-', '.');
const link = (url, label) => /^https?:\/\//.test(url || '') ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>` : esc(label);
const sourceLinks = (sources, label) => `<div class="drone-sources" aria-label="${esc(label)}">${(sources || []).map(s => link(s.url, s.title || '来源')).join('')}</div>`;
const sourceMd = sources => (sources || []).filter(s => /^https?:\/\//.test(s.url || '')).map(s => `[${s.title || '来源'}](${s.url})`).join('；');

// 地点键仅用来匹配当前路线与旧资料，不能把同一地点的其他日期预报挪用过来。
const places = [
  ['gonggar', /贡嘎/, '拉萨贡嘎机场', 'gonggar-county'],
  ['lhasa', /拉萨/, '拉萨市区', 'lhasa'],
  ['lurila', /鲁日拉/, '鲁日拉观景台', 'langkazi-county'],
  ['karola', /卡若拉/, '卡若拉冰川', 'langkazi-county'],
  ['kangmar', /康马/, '康马县', 'kangmar-county'],
  ['xilin', /西林/, '西林观景台', 'dingjie-county'],
  ['gyawula', /加乌拉|加吾拉/, '加乌拉山口', 'tingri-county'],
  ['tingri', /白坝|定日县珠穆朗玛国际/, '定日白坝', 'tingri-county'],
  ['castle', /古堡|东巴/, '珠峰古堡遗址', 'tingri-county'],
  ['everest', /珠峰|珠穆朗玛/, '珠峰景区', 'qomolangma-national-nature-reserve'],
  ['peiku', /佩枯/, '佩枯措', 'gyirong-county'],
  ['saga', /萨嘎/, '萨嘎县', 'saga-county'],
  ['zhari', /扎日/, '扎日南木措北岸', 'cuoqin-county'],
  ['cuoqin', /措勤/, '措勤县', 'cuoqin-county'],
  ['wenbu', /文布|文部|当惹/, '文布南村／当惹雍措', 'nyinma-county'],
  ['nyima', /尼玛/, '尼玛县', 'nyinma-county'],
  ['siling', /色林/, '色林措', 'baingoin-county'],
  ['bangoin', /班戈/, '班戈县', 'baingoin-county'],
  ['elephant', /圣象/, '圣象天门（路线备选）', 'shengxiang-tianmen'],
  ['namtso', /纳木/, '纳木措', 'namtso-national-park']
];
const placeKey = text => places.find(([, pattern]) => pattern.test(text || ''))?.[0];
const placeInfo = key => places.find(row => row[0] === key);
const validWeather = node => ['forecast', 'long_range_trend'].includes(node.status) && Number.isFinite(node.high) && Number.isFinite(node.low);
const weatherKind = node => validWeather(node) ? node.status === 'long_range_trend' ? '原日期远期趋势快照' : '原日期预报快照' : '未取得对应日期数据';
const wxClass = text => !text || /待更新|待核实|未取得/.test(text) ? 'unknown' : /雷/.test(text) ? 'storm' : /雪/.test(text) ? 'snow' : /雨/.test(text) ? 'rain' : /阴/.test(text) ? 'overcast' : /云/.test(text) ? 'cloud' : 'sun';
function wxIcon(condition, size = 30) {
  const kind = wxClass(condition);
  const sun = '<circle cx="19" cy="17" r="8" fill="#e7b550"/><path d="M19 3v3m0 22v3M5 17h3m22 0h3M9 7l2 2m16 16 2 2M9 27l2-2M27 9l2-2" stroke="#e7b550" stroke-width="2" stroke-linecap="round"/>';
  const cloud = '<path d="M10 27a7 7 0 0 1 0-14 10 10 0 0 1 18-1 8 8 0 1 1 2 15Z" fill="#c7d6d3" stroke="#7c9993" stroke-width="1.2"/>';
  const extra = {rain:'<path d="m12 30-2 5m11-5-2 5m11-5-2 5" stroke="#568cb1" stroke-width="2"/>',snow:'<text x="11" y="38" font-size="14" fill="#568cb1">❄</text>',storm:'<path d="m21 25-6 8h5l-2 6 9-10h-6l3-4" fill="#d89b3b"/>'};
  return `<svg class="wx-icon" width="${size}" height="${size}" viewBox="0 0 40 40" role="img" aria-label="${esc(condition || '未取得对应日期数据')}">${kind === 'unknown' ? '<circle cx="20" cy="20" r="13" fill="none" stroke="#8f998d" stroke-width="1.5" stroke-dasharray="3 3"/><text x="20" y="25" text-anchor="middle" fill="#8f998d" font-size="17">?</text>' : (kind === 'sun' ? sun : (kind === 'cloud' ? sun : '') + cloud) + (extra[kind] || '')}</svg>`;
}
function selectWeather(plan, original, weather, conditions) {
  const result = [];
  for (const day of plan.days) {
    const labels = [...day.route, day.stay, ...day.spots.map(key => (plan.spots?.[key] || original.spots?.[key])?.name || '')];
    const keys = [...new Set(labels.map(placeKey).filter(Boolean))];
    for (const key of keys) {
      const existing = (weather.nodes || []).find(node => node.date === day.date && node.places.some(place => placeKey(place) === key));
      if (existing) {
        result.push({...existing, places: existing.places.filter(place => placeKey(place) === key), day: day.day, checkedAt: existing.checkedAt || weather.checkedAt});
        continue;
      }
      const pending = (conditions.weather || []).find(node => node.date === day.date && placeKey(node.place) === key);
      const [, , name, slug] = placeInfo(key);
      // Conditions 只有查询入口时不能仅凭数值把它升级为已核实预报。
      const verified = pending && ['forecast', 'long_range_trend'].includes(pending.status) && pending.verified === true;
      result.push({date: day.date, day: day.day, places: [pending?.place || name], region: pending?.place || name,
        status: verified ? pending.status : 'unverified', high: verified ? pending.high : null, low: verified ? pending.low : null,
        condition: verified ? pending.text : null, wind: verified ? pending.wind : null, provider: pending?.sourceName || '墨迹天气查询入口',
        sourceUrl: pending?.url || `https://tianqi.moji.com/today/china/tibet/${slug}`, checkedAt: pending?.checkedAt || '',
        reason: pending?.note || '资料中没有当前行程日期与此地点相匹配的预报记录，数值留空。'});
    }
  }
  return result;
}
function renderWeather(nodes, plan) {
  const valid = nodes.filter(validWeather), trend = valid.some(node => node.status === 'long_range_trend');
  const width = Math.max(1200, nodes.length * 145 + 90), height = 480, left = 58, right = 30, top = 110, bottom = 297;
  const low = valid.length ? Math.floor((Math.min(...valid.map(n => n.low)) - 2) / 5) * 5 : -5;
  const high = valid.length ? Math.ceil((Math.max(...valid.map(n => n.high)) + 2) / 5) * 5 : 25;
  const step = (width - left - right) / Math.max(1, nodes.length), x = i => left + (i + .5) * step, y = value => bottom - (value - low) / (high - low) * (bottom - top);
  let svg = `<svg class="weather-svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="cuoqin-weather-title cuoqin-weather-desc"><title id="cuoqin-weather-title">按本次行程日期排列的天气资料</title><desc id="cuoqin-weather-desc">红线为最高温、蓝线为日最低温参考。保留相同日期和地点的原预报快照，不代表当日实况。缺失值不插值，调整日期后的天气留空。</desc>`;
  for (let value = low; value <= high; value += 5) svg += `<line x1="${left}" y1="${y(value)}" x2="${width-right}" y2="${y(value)}" stroke="#d9dfd7" stroke-dasharray="3 5"/><text x="${left-12}" y="${y(value)+4}" text-anchor="end" font-size="11" fill="#7a897f">${value}°</text>`;
  nodes.forEach((node, i) => { const dayIndex = plan.days.findIndex(day => day.date === node.date); svg += `<rect x="${x(i)-step/2}" y="12" width="${step}" height="450" fill="${dayIndex%2?'#153b3410':'transparent'}"/><text x="${x(i)}" y="34" text-anchor="middle" font-size="12" font-weight="700" fill="#234339">${short(node.date)} · ${esc(node.day)}</text><g transform="translate(${x(i)-17},44)">${wxIcon(node.condition,34)}</g><text x="${x(i)}" y="94" text-anchor="middle" font-size="10" fill="#627569">${validWeather(node)?'原日期快照':'无对应数据'}</text>`; });
  for (const field of ['high', 'low']) for (const status of ['forecast', 'long_range_trend']) {
    let active = false, path = '';
    nodes.forEach((node, i) => {if (node.status !== status || !validWeather(node)) {active = false; return;} path += `${active?'L':'M'}${x(i).toFixed(2)} ${y(node[field]).toFixed(2)} `; active = true;});
    svg += `<path class="weather-series" data-status="${status}" data-field="${field}" d="${path}" fill="none" stroke="${field==='high'?'#bd5d3e':'#427ea7'}" stroke-width="2.6" stroke-linejoin="round"${status==='long_range_trend'?' stroke-dasharray="7 5"':''}/>`;
  }
  nodes.forEach((node, i) => {
    svg += `<g><title>${esc(`${node.date} ${node.places.join(' / ')}：${validWeather(node)?`${node.high} / ${node.low}℃，${weatherKind(node)}，原核对 ${dateText(node.checkedAt)}`:'没有对应日期数据'}`)}</title>`;
    if (validWeather(node)) for (const field of ['high', 'low']) {const color=field==='high'?'#bd5d3e':'#427ea7'; svg += `<circle cx="${x(i)}" cy="${y(node[field])}" r="4" fill="${node.status==='long_range_trend'?'#fffaf0':color}" stroke="${color}" stroke-width="1.5"/><text x="${x(i)}" y="${y(node[field])+(field==='high'?-12:21)}" text-anchor="middle" font-size="13" font-weight="700" fill="${color}">${node[field]}°</text>`;}
    else svg += `<text x="${x(i)}" y="196" text-anchor="middle" font-size="12" fill="#8a958d">—</text>`;
    const chunks = node.places.join(' / ').match(/.{1,11}/gu) || [];
    svg += `<text x="${x(i)}" y="344" text-anchor="middle" font-size="10" fill="#354f45">${chunks.map((chunk,j)=>`<tspan x="${x(i)}" dy="${j?15:0}">${esc(chunk)}</tspan>`).join('')}</text><text x="${x(i)}" y="438" text-anchor="middle" font-size="9" fill="#758278">${esc(node.wind || '风力未取得')}</text></g>`;
  });
  svg += '</svg>';
  const intro = '按行程日期和地点匹配旧资料；有数值的是原日期预报快照，不代表实际经历的天气。改期后的措勤、文布南村、班戈和纳木措等地点没有对应数据时留空，旧日期温度不平移。县域参考不等于湖岸、山口和酒店实测；日最低温也不是指定时段的实测最低温。';
  const details = nodes.map(node => `<article class="weather-source-card" data-status="${esc(node.status)}"><span class="date-day">${esc(node.date)} · ${esc(node.day)}</span><h4>${esc(node.places.join(' / '))}</h4><b class="weather-kind">${weatherKind(node)}</b><div class="reading">${esc(node.condition || '天气未取得')} · ${validWeather(node)?`<b class="temp-high">${node.high}°C</b> / <b class="temp-low">${node.low}°C</b>`:'— / —'} · ${esc(node.wind || '风力未取得')}</div><p>${esc(node.reason)}</p>${link(node.sourceUrl, `${node.provider} · ${node.region}`)}<p class="weather-checked">${validWeather(node)?'原核对':'原查询尝试'}：${dateText(node.checkedAt)}；本次未刷新天气。</p></article>`).join('');
  const html = `<div id="weather-summary"><div class="weather-note"><div><h3>沿途天气资料与穿衣参考</h3><p>${intro}</p></div><span class="weather-badge">原日期快照 · 缺失留空</span></div></div><div id="weather-chart"><div class="chart-scroll" tabindex="0" aria-label="左右滚动查看逐日天气资料">${svg}</div><p class="chart-help"><span><i class="high"></i>最高温</span><span><i class="low"></i>日最低温参考</span><span><i class="forecast-key"></i>原墨迹预报</span>${trend?'<span><i class="trend-key"></i>原 MSN 远期趋势</span>':''}<span>空白处无对应记录，不插值</span></p></div><details class="source-details"><summary>逐点天气来源、原核对时间与缺失说明</summary><div id="weather-detail"><div class="weather-list">${details}</div></div></details><p class="micro">穿衣按每日行程中的分层建议准备：湖岸、冰川与山口携带保暖中层、羽绒、防风防水外层、帽子和手套；未取得温度的日期不据旧值减衣。</p>`;
  const markdown = `${intro}\n\n| 日期 / 地点 | 数据类型 | 天气 | 最高 / 最低 | 风力 | 来源与原核对时间 |\n| --- | --- | --- | --- | --- | --- |\n${nodes.map(n => `| ${md(`${n.date} ${n.places.join(' / ')}`)} | ${weatherKind(n)} | ${md(n.condition || '未取得')} | ${validWeather(n)?`${n.high} / ${n.low}℃`:'— / —'} | ${md(n.wind || '未取得')} | [${md(n.provider)}](${n.sourceUrl})；${md(dateText(n.checkedAt))}；${md(n.reason)} |`).join('\n')}\n`;
  const byDate = Object.fromEntries(plan.days.map(day => {const all=nodes.filter(n=>n.date===day.date), selected=all.filter(validWeather); return [day.date, {available:!!selected.length, high:selected.length?Math.max(...selected.map(n=>n.high)):null, low:selected.length?Math.min(...selected.map(n=>n.low)):null, text:selected.length?`${[...new Set(selected.map(n=>n.condition).filter(Boolean))].join(' / ')}${selected.length<all.length?' · 部分地点':''}`:'未取得对应日期数据', sourceLabel:selected.length?'原日期预报快照':'未取得对应日期数据'}];}));
  return {html, markdown, byDate};
}

function renderDrone(plan, drone) {
  const rows = plan.days.flatMap(day => day.spots.flatMap(key => (drone.rows || []).filter(row => row.spotKey === key).map(row => ({...row, originalItineraryDate:row.date, date:day.date, day:day.day}))));
  const notes = (drone.notes || []).filter(note => !note.startsWith('改则依据：')).map(note => note.includes('10-07 行程') ? `临时限制只适用于公告中明确的时间和范围；本次日期为 ${plan.days[0].date}—${plan.days.at(-1).date}，起飞前仍需查看当日公告。` : note.replace('西林、珠峰古堡及洞措大地之树尤其', '西林、珠峰古堡等定位不清的点位尤其'));
  const colorsVerified = drone.legend?.colorsVerified === true;
  const statusOf = row => colorsVerified && row.uom?.colorVerified === true && ['blue','white','mixed'].includes(row.uom.status) ? row.uom.status : 'unverified';
  const labels = {blue:'原记录 · UOM 蓝区',white:'原记录 · UOM 白区',mixed:'原记录 · 蓝白交界 / 范围混合',unverified:'待核验 · 不作适飞判断'};
  const checked = rows.filter(row => statusOf(row) !== 'unverified').length;
  const intro = `原资料整理于 ${dateText(drone.checkedAt)}；下表随本次路线重排日期，原观察与查询时间保持不变。本次未重新查询 UOM。颜色只对应当时搜索匹配点，实际起飞位置、飞行范围和景区管理仍需复核；蓝区和白区均不单独构成放飞许可。`;
  let markdown = `${intro}\n\n| 日期 / 地点与定位 | UOM 空域查询 | 景区 / 场地管理 | 当次结论 / 下一步 |\n| --- | --- | --- | --- |\n`;
  const body = rows.map(row => {
    const status=statusOf(row), location=row.location||{}, uom=row.uom||{}, venue=row.venue||{}, observation=uom.observation;
    const coordinates=Array.isArray(location.coordinates)?location.coordinates.join(', '):location.coordinates;
    const queryDate=observation?.observedAt||uom.checkedAt;
    const observationText=observation?`查询词：${observation.queryText||'未记录'}\n匹配结果：${observation.matchedResult||'未记录'}\n地图级别：${observation.zoom??'未记录'}\n原观察 / 尝试时间：${dateText(observation.observedAt)}\n观察说明：${observation.note||'未记录'}`:'';
    const observationHtml=observation?`<div class="drone-observation">${observationText.split('\n').map(text=>`<small>${esc(text)}</small>`).join('')}</div>`:'';
    const venueStatus=['restricted','conditional','no_rule_found','unverified'].includes(venue.status)?venue.status:'unverified';
    markdown += '| '+[`${row.date} · ${row.day} · ${row.place}\n${location.label||'具体起飞点待定位'}\n定位精度：${location.precision||'待核验'}${coordinates?'\n参考坐标：'+coordinates:''}${location.note?'\n'+location.note:''}`,`${labels[status]}\n${uom.detail||'尚无对应记录'}\n原查询时间：${dateText(queryDate)}\n${observationText}\n${sourceMd(uom.sources)}`,`${venue.label||'当地管理待核验'}\n${venue.detail||''}\n${sourceMd(venue.sources)}`,`原结论：${row.conclusion||'尚不能判断适飞'}\n${row.action||'按实际起飞点重新核验。'}`].map(md).join(' | ')+' |\n';
    return `<tr data-drone-id="${esc(row.id)}" data-day="${esc(row.day)}" data-uom-status="${status}"><th scope="row" data-label="日期 / 地点"><a class="drone-day" href="#day-${esc(row.day)}">${esc(row.date)} · ${esc(row.day)}</a><b class="drone-place">${esc(row.place)}</b><p>${esc(location.label||'具体起飞点待定位')}</p><small class="drone-location-precision">定位精度：${esc(location.precision||'待核验')}</small>${coordinates?`<small>参考坐标：${esc(coordinates)}</small>`:''}${location.note?`<small>${esc(location.note)}</small>`:''}</th><td data-label="UOM 空域"><span class="drone-status is-${status}">${labels[status]}</span><p>${esc(uom.detail||'尚无对应记录。')}</p><small class="drone-query-date">原查询时间：${esc(dateText(queryDate))}</small>${observationHtml}${sourceLinks(uom.sources,'UOM 原核验来源')}</td><td data-label="场地 / 管理"><span class="drone-venue-status is-${venueStatus}">${esc(venue.label||'当地管理待核验')}</span><p>${esc(venue.detail||'场地管理尚未核实。')}</p>${sourceLinks(venue.sources,'场地管理来源')}</td><td data-label="结论 / 复查"><b class="drone-conclusion">原结论：${esc(row.conclusion||'尚不能判断适飞')}</b><p>${esc(row.action||'按实际起飞点重新核验。')}</p></td></tr>`;
  }).join('');
  const legend=colorsVerified?'<div class="drone-legend" aria-label="原 UOM 页面实见颜色"><span><i class="drone-swatch is-blue"></i>蓝区 · 原页面实见颜色</span><span><i class="drone-swatch is-white"></i>白区 · 原页面实见颜色</span><span><i class="drone-swatch is-unverified"></i>待核验 ≠ 适飞</span></div>':'<p class="drone-legend-pending">原记录尚未完成 UOM 页面色块核验。</p>';
  const html=`<div class="drone-intro"><div><h3>先看空域，再核对场地。</h3><p>${intro}</p></div><span class="drone-count">${checked} / ${rows.length}<small>原记录已核验颜色的点位</small></span></div><div class="drone-legend-panel">${legend}<p>颜色的法律含义不能直接由页面色块推定，白区不自动等同法定管制区或可飞区。</p>${drone.legend?.observedAt?`<p>原图例观察：${esc(dateText(drone.legend.observedAt))}</p>`:''}${drone.legend?.note?`<p>${esc(drone.legend.note)}</p>`:''}${sourceLinks(drone.legend?.sources,'原 UOM 图例来源')}</div><div class="drone-table-wrap"><table class="drone-table"><caption>按本次行程列出景点。圣象天门保留为条件备选；地点列日期为路线日期，查询与观察日期见对应栏。</caption><colgroup><col class="drone-col-place"><col class="drone-col-uom"><col class="drone-col-venue"><col class="drone-col-action"></colgroup><thead><tr><th scope="col">日期 / 地点与定位</th><th scope="col">UOM 空域查询</th><th scope="col">景区 / 场地管理</th><th scope="col">当次结论 / 下一步</th></tr></thead><tbody>${body}</tbody></table></div>${notes.length?`<div class="drone-notes"><h3>使用这张表前</h3><ul>${notes.map(note=>`<li>${esc(note)}</li>`).join('')}</ul></div>`:''}`;
  markdown += '\n'+notes.map(note=>`- ${note}`).join('\n')+'\n';
  return {html, markdown, rows};
}

function renderAltitude(plan, base) {
  const source = (base.profile || []).flatMap(group => group.points);
  const point = (name, stay = false, label = name) => {const found=source.find(p=>p.name===name); return found?{...found,name:label,stay,sourceName:name}:null;};
  const spotNames={lurila:'鲁日拉观景台',karola:'卡若拉冰川',xilin:'西林观景台',gyawula:'加乌拉山口',everest:'珠峰大本营',castle:'珠峰古堡遗址',peiku:'佩枯措',zhari:'扎日南木措',wenbu:'文布南村',siling:'色林措',namtso:'纳木措'};
  const stayNames=[[/拉萨/,'拉萨'],[/康马/,'康马'],[/定日|白坝/,'定日白坝（县域海拔参考）'],[/萨嘎/,'萨嘎'],[/措勤/,'措勤'],[/文布/,'文布南村'],[/班戈/,'班戈']];
  const groups=[], unknown=[];
  for (const day of plan.days) {
    const pts=[];
    // 尼玛在这版是 10/1 的途经地，不能沿用原版的住宿标记。
    if (day.spots.includes('siling') && day.route.some(name=>/尼玛/.test(name))) pts.push(point('尼玛'));
    for (const key of day.spots) {
      if (key === 'elephant') continue; // 原资料没有圣象天门独立海拔，不用纳木措湖面值代替。
      const name=spotNames[key]; if (name) {const p=point(name); if (p) pts.push(p); else unknown.push(`${day.date} ${name}`);}
    }
    const stay=stayNames.find(([pattern])=>pattern.test(day.stay));
    if (stay) {
      const existing=pts.find(p=>p?.sourceName===stay[1]);
      if (existing) {existing.stay=true; if(stay[1]==='文布南村')existing.name='文布南村（住宿地区参考）';}
      else {const p=point(stay[1],true); if(p)pts.push(p); else unknown.push(`${day.date} ${day.stay}`);}
    }
    if (pts.filter(Boolean).length) groups.push({date:short(day.date), fullDate:day.date, day:day.day,points:pts.filter(Boolean)});
  }
  if(plan.days.some(day=>day.spots.includes('elephant')))unknown.push('圣象天门备选起飞／观景点的独立海拔');
  if(plan.days.some(day=>day.stay==='—'))unknown.push('10/4 贡嘎机场及当日道路海拔');
  const points=groups.flatMap(group=>group.points.map(p=>({...p,date:group.fullDate,day:group.day})));
  if(!points.length)return {html:'<p>当前路线没有可复用的海拔资料。</p>',markdown:'当前路线没有可复用的海拔资料。\n',points};
  const width=Math.max(1680,points.length*84+150),height=690,left=74,right=42,plotTop=150,plotBottom=470,labelY=505;
  const x=i=>left+i*(width-left-right)/Math.max(1,points.length-1),y=alt=>plotBottom-(alt-3400)/2000*(plotBottom-plotTop);
  const coords=points.map((p,i)=>[x(i),y(p.alt)]),line=coords.map(([px,py],i)=>`${i?'L':'M'} ${px.toFixed(1)} ${py.toFixed(1)}`).join(' '),area=`${line} L ${coords.at(-1)[0]} ${plotBottom} L ${coords[0][0]} ${plotBottom} Z`;
  const grid=[3500,4000,4500,5000].map(value=>`<g class="altitude-grid-line"><line x1="${left}" y1="${y(value)}" x2="${width-right}" y2="${y(value)}"/><text x="${left-14}" y="${y(value)+4}" text-anchor="end">${value.toLocaleString()} m</text></g>`).join('');
  let offset=0;const bands=groups.map((group,i)=>{const start=offset,end=offset+group.points.length-1;offset+=group.points.length;const a=start===0?left:(x(start-1)+x(start))/2,b=end===points.length-1?width-right:(x(end)+x(end+1))/2;return `<g class="altitude-date-band ${i%2?'is-even':''}"><rect x="${a}" y="112" width="${b-a}" height="${plotBottom-112}"/><line x1="${a}" y1="112" x2="${a}" y2="${plotBottom}"/><text x="${(a+b)/2}" y="132" text-anchor="middle"><tspan>${group.date}</tspan><tspan class="altitude-day"> · ${group.day}</tspan></text></g>`;}).join('');
  const markers=points.map((p,i)=>{const[px,py]=coords[i];return `<g class="altitude-marker ${p.stay?'is-stay':''}"><title>${esc(`${p.date} ${p.name}，约 ${p.alt} 米${p.stay?'，住宿地区参考，非酒店实测':''}`)}</title><line class="altitude-stem" x1="${px}" y1="${py}" x2="${px}" y2="${plotBottom}"/><circle cx="${px}" cy="${py}" r="${p.stay?8:5}"/>${p.stay?`<text class="stay-badge" x="${px}" y="${py+3}" text-anchor="middle">住</text>`:''}<text class="altitude-value" x="${px}" y="${py-13}" text-anchor="middle">${p.alt.toLocaleString()}</text><text class="altitude-place" transform="translate(${px+2} ${labelY}) rotate(52)">${esc(p.name)}</text></g>`;}).join('');
  const highest=points.reduce((a,b)=>a.alt>b.alt?a:b),lowest=points.reduce((a,b)=>a.alt<b.alt?a:b);
  const note='海拔仅复用原攻略近似值，横轴为路线节点顺序，连线用于比较已知点，不代表完整道路剖面。住宿点是所在地区参考，并非酒店实测；9/30 文布南村约 4,650 米不作为琼宗湖景驿站实测海拔。珠峰大本营为游览点，包含景区接驳，不能据此计算自驾里程。';
  const html=`<article class="altitude-card"><header class="altitude-poster-head"><div><span class="altitude-kicker">ELEVATION PROFILE · REVISED</span><h3>措勤转线逐日海拔曲线</h3><p>主要途经点与当晚住宿地区，按新日期排列。</p></div><dl><div><dt>已列最高点</dt><dd>${highest.alt.toLocaleString()} m</dd><small>${esc(highest.name)}</small></div><div><dt>已列最低点</dt><dd>${lowest.alt.toLocaleString()} m</dd><small>${esc(lowest.name)}</small></div><div><dt>住宿节点</dt><dd>${points.filter(p=>p.stay).length}</dd><small>09.25—10.03</small></div></dl></header><div class="altitude-chart-scroll" tabindex="0" aria-label="横向滚动查看本次路线海拔曲线"><svg class="altitude-svg" viewBox="0 0 ${width} ${height}" style="min-width:${width}px" role="img" aria-labelledby="cuoqin-altitude-title cuoqin-altitude-desc"><title id="cuoqin-altitude-title">9月25日至10月3日主要途经点与住宿地区海拔</title><desc id="cuoqin-altitude-desc">${esc(note)} ${esc(unknown.join('；'))}没有可复用数值，未绘制。</desc><defs><linearGradient id="cuoqin-altitude-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1603a" stop-opacity=".3"/><stop offset="1" stop-color="#f1603a" stop-opacity=".03"/></linearGradient></defs><rect class="altitude-warning-zone" x="${left}" y="${plotTop}" width="${width-left-right}" height="${y(5000)-plotTop}"/>${bands}${grid}<path class="altitude-area" d="${area}" fill="url(#cuoqin-altitude-fill)"/><path class="altitude-line" d="${line}"/>${markers}<text class="altitude-axis-note" x="${left}" y="${height-24}">按路线节点顺序排列，不代表等距离；住宿海拔为所在地区参考，非酒店实测。</text></svg></div><footer class="altitude-legend"><span><i class="legend-route"></i>途经 / 游览点</span><span><i class="legend-stay">住</i>住宿地区</span><span><i class="legend-high"></i>5,000 m 以上</span></footer></article><p class="micro">${note}</p>${unknown.length?`<p class="micro">未绘制：${esc(unknown.join('；'))}。当前资料不足以判断完整行程的最高海拔。</p>`:''}`;
  const markdown=`${note}\n\n${groups.map(group=>`- ${group.fullDate} ${group.day}：${group.points.map(p=>`${p.name}约 ${p.alt.toLocaleString()} m${p.stay?'（住）':''}`).join(' → ')}`).join('\n')}\n\n未绘制：${unknown.join('；')}。\n`;
  return {html,markdown,points};
}

export function referenceDataChapters({plan,base,original,weather,drone,conditions}) {
  const weatherNodes=selectWeather(plan,original,weather,conditions);
  const wx=renderWeather(weatherNodes,plan), flight=renderDrone(plan,drone), altitude=renderAltitude(plan,base);
  return {weatherHtml:wx.html,weatherMarkdown:wx.markdown,weatherByDate:wx.byDate,weatherNodes,
    droneHtml:flight.html,droneMarkdown:flight.markdown,droneRows:flight.rows,
    altitudeHtml:altitude.html,altitudeMarkdown:altitude.markdown,altitudePoints:altitude.points};
}
