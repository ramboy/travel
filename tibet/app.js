const ROUTES = {
  classic: {
    letter: 'A', name: '经典大环线', tag: '完整闭环', color: '#f1603a',
    subtitle: '把南线人文、阿里西部与羌塘湖群一次串完。',
    recommendation: '风景密度最高，也最考验体力', days: 10, km: '约 3,900 km', maxAlt: '约 5,200 m', buffer: '0.5–1 天',
    fit: ['至少 2 名熟练司机', '想完整走 G219 + G317', '能接受多数日 7–10 小时在车上'],
    warning: '时间卡得最紧，10 月 6 日必须回到拉萨并完成还车。若遇降雪、道路管制或明显高反，优先砍珠峰或古格支线，不能拿次日早班机冒险。',
    stops: ['拉萨','羊卓雍措','日喀则','珠峰大本营','萨嘎','塔尔钦','札达','狮泉河','改则','尼玛','班戈','纳木措','拉萨'],
    daysList: [
      ['09.27','拉萨 → 日喀则','羊湖、卡若拉冰川','约 350 km'],
      ['09.28','日喀则 → 珠峰','加乌拉山口、绒布寺','约 340 km'],
      ['09.29','珠峰 → 萨嘎','佩枯措、希夏邦马','约 450 km'],
      ['09.30','萨嘎 → 塔尔钦','玛旁雍措、拉昂措','约 520 km'],
      ['10.01','塔尔钦 → 札达','土林、古格王朝','约 250 km'],
      ['10.02','札达 → 狮泉河','霞义沟、补给整备','约 260 km'],
      ['10.03','狮泉河 → 改则','革吉、物玛措','约 490 km'],
      ['10.04','改则 → 尼玛','洞措、羌塘荒原','约 450 km'],
      ['10.05','尼玛 → 班戈','达则措、色林措','约 350 km'],
      ['10.06','班戈 → 拉萨','巴木措、纳木措','约 400 km']
    ]
  },
  north: {
    letter: 'B', name: '康马小北线', tag: '截图方案', color: '#467f8f',
    subtitle: '经普莫雍措、康马、珠峰与神山圣湖，再从措勤切入“一措再措”。',
    recommendation: '10 月 4 日回拉萨，缓冲最多', days: 8, km: '约 3,300 km', maxAlt: '约 5,200 m', buffer: '2 整天',
    fit: ['想加入普莫雍措与康马', '重点看羌塘湖群', '希望提前两天回拉萨兜底'],
    warning: '截图中的住宿海拔多为约数，且文布南村、班戈连续两晚约 4,700 米；务必在定日前确认身体状态。10 月初景区开放、道路与住宿要逐日复核。',
    itineraryNote: '已按截图录入，并将旧日期调整到本次 9 月 25 日抵达、10 月 7 日返杭的时间框架。',
    stops: ['拉萨','羊卓雍措','普莫雍措','康马','定日','珠峰大本营','佩枯措','萨嘎','塔尔钦','措勤','扎日南木措','文布南村','当惹雍措','尼玛','色林措','班戈','巴木措','纳木措','拉萨'],
    daysList: [
      {day:'D0', date:'09.25', route:'杭州 → 拉萨', highlights:'16:30 抵达，办理入住、准备物资。', distance:'飞机', stay:'拉萨', alt:'约 3,600–3,650 m', type:'transit'},
      {day:'适应日', date:'09.26', route:'拉萨', highlights:'物资准备、车辆检查，不安排高强度活动。', distance:'0 km', stay:'拉萨', alt:'约 3,600–3,650 m', strategy:'完整保留一天适应高原。', type:'buffer'},
      {day:'D1', date:'09.27', route:'拉萨 → 羊卓雍措 → 普莫雍措 → 康马', highlights:'羊湖；沿途 1 号日拉观景台、2 号普莫雍措观景台，可望见托寺。', distance:'截图未标注·导航复核', stay:'康马', alt:'约 4,500 m'},
      {day:'D2', date:'09.28', route:'康马 → 崇八雍措 → 西林观景台 → 定日', highlights:'岗巴县城出口远眺干城章嘉峰；奇林峡、十万沙丘、西林观景台。避开日喀则，走 G219。', distance:'截图未标注·导航复核', stay:'定日', alt:'约 4,500 m'},
      {day:'D3', date:'09.29', route:'定日 → 加乌拉山口 → 曲当寺 → 珠峰古堡 → 佩枯措 → 萨嘎', highlights:'佩枯措、珠峰、洛子峰、卓奥友峰、希夏邦马峰。', distance:'截图未标注·导航复核', stay:'萨嘎', alt:'约 4,600 m'},
      {day:'D4', date:'09.30', route:'萨嘎 → 仲巴五彩沙漠 → 公珠措 → 玛旁雍措 → 拉昂措 → 塔尔钦', highlights:'冈仁波齐、圣湖玛旁雍措、鬼湖拉昂措、纳木那尼峰。', distance:'截图未标注·导航复核', stay:'塔尔钦', alt:'约 4,600 m'},
      {day:'D5', date:'10.01', route:'塔尔钦 → 帕羊 → 措勤', highlights:'冈仁波齐大本营；若不安排神山活动，直接赶往措勤。', distance:'截图未标注·导航复核', stay:'措勤', alt:'约 4,500 m'},
      {day:'D6', date:'10.02', route:'措勤 → 扎日南木措 → 当惹雍措 → 文布南村', highlights:'湖群与达果雪山。', distance:'截图未标注·导航复核', stay:'文布南村', alt:'约 4,700 m', strategy:'连续高海拔住宿第一晚，晚间不洗澡、不饮酒。'},
      {day:'D7', date:'10.03', route:'文布南村 → 当穹措 → 尼玛 → 色林措 → 班戈', highlights:'“一措再措”湖群。', distance:'截图未标注·导航复核', stay:'班戈', alt:'约 4,700 m', strategy:'第二个高海拔夜晚；如高反明显，应在尼玛中止并调整线路。'},
      {day:'D8', date:'10.04', route:'班戈 → 巴木措 → 纳木措 → 拉萨', highlights:'各类高原湖泊与唐古拉山脉远景。', distance:'截图未标注·导航复核', stay:'拉萨', alt:'约 3,600–3,650 m'},
      {day:'休整', date:'10.05', route:'拉萨市区', highlights:'布达拉宫；预约后参观。', distance:'0 km', stay:'拉萨', alt:'约 3,650 m', type:'buffer'},
      {day:'机动日', date:'10.06', route:'拉萨休整 / 还车', highlights:'应对前段延误、还车、整理行李。', distance:'0 km', stay:'拉萨', alt:'约 3,650 m', type:'buffer'},
      {day:'返程', date:'10.07', route:'拉萨 → 杭州', highlights:'10:55 航班。', distance:'飞机', stay:'—', alt:'—', type:'transit'}
    ]
  },
  south: {
    letter: 'C', name: '大北线避高版', tag: '详细方案', color: '#41675c',
    subtitle: '用普兰、札达等相对低海拔住宿点缓冲，再从狮泉河进入羌塘大北线。',
    recommendation: '景点最全，住宿策略最细', days: 10, km: '约 4,000 km', maxAlt: '约 5,200 m', buffer: '1 整天',
    fit: ['想覆盖古格、狮泉河与大北线', '愿意连续长途驾驶', '会根据高反主动删减行程'],
    warning: 'Day 1 在抵达后不足 24 小时即开始长途并升至日喀则，不符合循序渐进原则；且“拉萨—日喀则 630 km”明显需要导航复核。若抵达当晚睡眠或血氧异常，应留在拉萨，不能硬赶。',
    itineraryNote: '里程、房价与住宿为用户方案原始信息；明显存在疑问的项目已加“导航/临行复核”提示。',
    stops: ['拉萨','羊卓雍措','卡若拉冰川','满拉水库','日喀则','定日','珠峰大本营','希夏邦马峰','佩枯措','萨嘎','玛旁雍措','拉昂措','普兰','札达','霞义沟','狮泉河','改则','尼玛','当惹雍措','色林措','班戈','纳木措','拉萨'],
    daysList: [
      {day:'D0', date:'09.25', route:'杭州 → 拉萨', highlights:'16:30 抵达；布达拉宫、大昭寺、八廓街按体力择一。', distance:'飞机', stay:'拉萨市政府亚朵 · 约 ¥393/晚', alt:'约 3,650 m', strategy:'抵达后不剧烈运动、不饮酒。', type:'transit'},
      {day:'D1', date:'09.26', route:'拉萨 → 羊卓雍措 → 卡若拉冰川 → 满拉水库 → 日喀则', highlights:'岗巴拉山口看羊湖，打卡卡若拉冰川。', distance:'用户记录约 630 km / 7h（导航复核）', stay:'日喀则；亚朵/全季/维也纳/丽枫等', alt:'约 3,860 m', strategy:'日喀则海拔高于拉萨、含氧量更低，不能视为更好适应；若有不适应留在拉萨。'},
      {day:'D2', date:'09.27', route:'日喀则 → 拉孜 → 嘉措拉山口 → 定日 → 珠峰巴松村', highlights:'撒隆达、挂经幡，远眺珠峰与日照金山。阴历十七，星空条件可能受月光影响。', distance:'约 340 km / 6.5h', stay:'巴松村维也纳 · 约 ¥400/晚', alt:'约 4,000–4,100 m', strategy:'不住绒布寺帐篷区；选择巴松村或乌江村降低夜间海拔。'},
      {day:'D3', date:'09.28', route:'珠峰 → 岗嘎古堡 → 希夏邦马峰 → 佩枯措 → 萨嘎', highlights:'岗嘎古堡遗迹、希夏邦马峰、佩枯措。', distance:'约 330 km / 6h', stay:'萨嘎', alt:'约 4,500 m', strategy:'吉隆镇虽低至约 2,805 m，但往返约多 4 小时；本方案放弃绕行。'},
      {day:'D4', date:'09.29', route:'萨嘎 → 公珠措 → 玛旁雍措 → 拉昂措 → 普兰', highlights:'冈仁波齐、玛旁雍措、拉昂措同框。', distance:'约 551 km / 5.5–8.5h', stay:'普兰', alt:'约 3,900 m', strategy:'普兰为本段相对低海拔住宿点，用于恢复睡眠。'},
      {day:'D5', date:'09.30', route:'普兰 → 札达土林 → 古格王朝 → 札达', highlights:'土林地貌、古格王朝遗址日落。', distance:'约 328 km / 5h', stay:'札达', alt:'约 3,700 m', strategy:'札达位于河谷，是进入狮泉河前的重要低海拔缓冲。'},
      {day:'D6', date:'10.01', route:'札达 → 霞义沟 → 阿里暗夜公园 → 狮泉河', highlights:'霞义沟土林；暗夜公园位于狮泉河以南约 25–30 km，观星通常较晚。', distance:'约 300 km / 6h', stay:'狮泉河', alt:'约 4,300–4,400 m', strategy:'革吉海拔并不比狮泉河低，不能作为“避高”替代；如不适，优先减少夜间观星并就医/下撤。'},
      {day:'D7', date:'10.02', route:'狮泉河 → 改则', highlights:'“一措再措”，羌塘风光；沿途洞措、邦巴措等湖泊。', distance:'约 500 km / 6.5h', stay:'改则', alt:'约 4,350 m', strategy:'建议备氧并早休息；明显高反时不要洗澡。'},
      {day:'D8', date:'10.03', route:'改则 → 当惹雍措 → 尼玛', highlights:'苯教圣湖当惹雍措。', distance:'约 280 km / 6h', stay:'尼玛县或文布南村', alt:'约 4,300–4,500 m', strategy:'住宿海拔仍高，提前电话确认供氧与医疗条件。'},
      {day:'D9', date:'10.04', route:'尼玛 → 色林措 → 班戈 / 纳木措北岸', highlights:'中国第二大咸水湖色林措。', distance:'约 350 km / 6.5h', stay:'班戈或申措/纳木措北岸', alt:'约 4,600–4,700 m', strategy:'湖边水汽不等于含氧量更高；优先选择供氧、保暖和通信条件更可靠的住宿。'},
      {day:'D10', date:'10.05', route:'班戈 → 巴木措 → 纳木措环湖小段 → 那根拉山口 → 拉萨', highlights:'纳木措；圣象天门视当日开放、预约及路况决定。', distance:'约 387 km / 6h', stay:'拉萨', alt:'约 3,650 m', strategy:'必须回到拉萨，不在当雄过夜，以确保 10 月 7 日航班。'},
      {day:'D11', date:'10.06', route:'拉萨休整一天', highlights:'还车、整理行李、应对前段延误。', distance:'0 km', stay:'拉萨', alt:'约 3,650 m', type:'buffer'},
      {day:'D12', date:'10.07', route:'拉萨 → 杭州', highlights:'10:55 航班。', distance:'飞机', stay:'—', alt:'—', type:'transit'}
    ]
  }
};

const PLACES = {
  '拉萨':[91.1322,29.6604], '羊卓雍措':[90.742,28.95], '日喀则':[88.885,29.267],
  '珠峰大本营':[86.852,28.194], '萨嘎':[85.234,29.329], '塔尔钦':[81.30,31.06],
  '玛旁雍措':[81.47,30.68], '普兰':[81.177,30.294], '札达':[79.803,31.479],
  '狮泉河':[80.10,32.50], '改则':[84.063,32.305], '尼玛':[87.236,31.785],
  '文布南村':[85.55,30.71], '班戈':[90.01,31.39], '纳木措':[90.60,30.72],
  '普莫雍措':[90.40,28.55], '康马':[89.68,28.56], '定日':[87.12,28.66],
  '佩枯措':[85.60,28.85], '措勤':[85.16,31.02], '扎日南木措':[85.62,31.04],
  '当惹雍措':[86.65,31.10], '色林措':[89.00,31.80], '巴木措':[90.33,31.25],
  '卡若拉冰川':[90.18,28.90], '满拉水库':[89.54,28.88], '希夏邦马峰':[85.78,28.35],
  '拉昂措':[81.22,30.68], '霞义沟':[79.98,31.32]
};

let activeId = new URLSearchParams(location.search).get('route') || 'north';
if (!ROUTES[activeId]) activeId = 'north';
let amap = null;
let amapApi = null;
let amapOverlays = [];

const tabs = document.querySelector('#route-tabs');
const summary = document.querySelector('#route-summary');
const dayGrid = document.querySelector('#day-grid');
const schematic = document.querySelector('#schematic-map');
const amapContainer = document.querySelector('#amap-container');

function esc(value) {
  return String(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
}

function renderTabs() {
  tabs.innerHTML = Object.entries(ROUTES).map(([id, route]) => `
    <button class="route-tab" role="tab" data-route="${id}" aria-selected="${id === activeId}">
      <span class="letter">${route.letter}</span><span class="tag">${route.tag}</span>
      <h3>${route.name}</h3><p>${route.subtitle}</p>
    </button>`).join('');
  tabs.querySelectorAll('button').forEach(button => button.addEventListener('click', () => selectRoute(button.dataset.route)));
}

function renderSummary() {
  const r = ROUTES[activeId];
  summary.innerHTML = `
    <span class="badge">${r.recommendation}</span>
    <h3>${r.letter}. ${r.name}</h3>
    <p class="desc">${r.subtitle}</p>
    <div class="round-trip">自驾起终点：拉萨 → 拉萨</div>
    <div class="metric-row">
      <div class="metric"><b>${r.days} 天</b><small>自驾段</small></div>
      <div class="metric"><b>${r.km}</b><small>规划估算</small></div>
      <div class="metric"><b>${r.maxAlt}</b><small>路线最高点附近</small></div>
      <div class="metric"><b>${r.buffer}</b><small>机动余量</small></div>
    </div>
    <h4>适合你，如果：</h4><ul>${r.fit.map(x => `<li>${x}</li>`).join('')}</ul>
    <div class="warning"><b>风险提示</b><br>${r.warning}</div>`;
}

function project([lng, lat], width = 900, height = 620) {
  const minLng = 78.7, maxLng = 92.1, minLat = 27.6, maxLat = 33.2;
  return [42 + (lng - minLng) / (maxLng - minLng) * (width - 84), 35 + (maxLat - lat) / (maxLat - minLat) * (height - 70)];
}

function renderSchematic() {
  const r = ROUTES[activeId];
  const width = 900, height = 620;
  const points = r.stops.map(name => ({name, xy: project(PLACES[name], width, height)}));
  const path = points.map((p, i) => `${i ? 'L' : 'M'} ${p.xy[0].toFixed(1)} ${p.xy[1].toFixed(1)}`).join(' ');
  const unique = [];
  points.forEach((p, index) => {
    if (!unique.some(x => x.name === p.name)) unique.push({...p, index});
  });
  const markers = unique.map((p, i) => {
    const start = p.name === '拉萨';
    const anchor = p.xy[0] > 670 ? 'end' : 'start';
    const dx = anchor === 'end' ? -13 : 13;
    return `<g class="poi" tabindex="0">
      <circle cx="${p.xy[0]}" cy="${p.xy[1]}" r="${start ? 9 : 6}" fill="${start ? '#f4c95d' : r.color}" stroke="#fffaf0" stroke-width="3"/>
      <text x="${p.xy[0] + dx}" y="${p.xy[1] - 11}" text-anchor="${anchor}" fill="#132c2b" font-size="13" font-weight="700">${esc(p.name)}</text>
    </g>`;
  }).join('');
  schematic.innerHTML = `<svg class="map-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(r.name)}路线示意图">
    <defs><filter id="shadow"><feDropShadow dx="0" dy="3" stdDeviation="5" flood-opacity=".2"/></filter></defs>
    <path d="M120 125 C210 66 340 86 420 62 C540 26 642 75 754 54 C842 37 878 105 850 190 C822 274 879 330 812 402 C746 472 688 551 570 548 C460 544 402 591 296 549 C196 510 73 494 55 394 C36 288 32 184 120 125Z" fill="#c8cebd" stroke="#a5ad9d" stroke-width="1.5"/>
    <text x="112" y="111" fill="#76847a" font-size="12" letter-spacing="3">阿里 · 羌塘</text>
    <text x="676" y="505" fill="#76847a" font-size="12" letter-spacing="3">日喀则 · 拉萨</text>
    <path d="${path}" fill="none" stroke="#fffaf0" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" opacity=".8" filter="url(#shadow)"/>
    <path d="${path}" fill="none" stroke="${r.color}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
    ${markers}
    <g transform="translate(46 550)"><rect width="186" height="40" rx="20" fill="#132c2b"/><circle cx="23" cy="20" r="5" fill="${r.color}"/><text x="38" y="25" fill="#fffaf0" font-size="12">${esc(r.name)} · 示意线</text></g>
  </svg>`;
}

function renderDays() {
  const r = ROUTES[activeId];
  document.querySelector('#itinerary-note').textContent = r.itineraryNote || '所有公里数均为规划估算，景区接驳和临时绕行不含在内。';
  dayGrid.style.setProperty('--route-color', r.color);
  dayGrid.innerHTML = r.daysList.map((entry, i) => {
    const day = Array.isArray(entry) ? {
      day: `D${i + 1}`, date: entry[0], route: entry[1], highlights: entry[2], distance: entry[3]
    } : entry;
    const details = [
      day.distance && ['里程/时长', day.distance],
      day.stay && ['住宿', day.stay],
      day.alt && ['住宿海拔', day.alt]
    ].filter(Boolean);
    return `<article class="day-card ${esc(day.type || '')}">
      <span class="date">${esc(day.date)}</span><span class="day-no">${esc(day.day || `D${i + 1}`)}</span>
      <h3>${esc(day.route)}</h3><p>${esc(day.highlights || '')}</p>
      ${details.length ? `<div class="detail-list">${details.map(([label, value]) => `<div><b>${esc(label)}</b><span>${esc(value)}</span></div>`).join('')}</div>` : ''}
      ${day.strategy ? `<div class="strategy"><b>避高提示</b><br>${esc(day.strategy)}</div>` : ''}
    </article>`;
  }).join('');
}

function selectRoute(id) {
  activeId = id;
  history.replaceState({}, '', `?route=${id}`);
  renderTabs(); renderSummary(); renderSchematic(); renderDays();
  if (amap) renderAmapRoute();
}

async function loadAmap(key, secret) {
  if (!window.AMapLoader) throw new Error('高德加载器未能载入，请检查网络。');
  window._AMapSecurityConfig = { securityJsCode: secret };
  const AMap = await AMapLoader.load({key, version: '2.0', plugins: ['AMap.Scale','AMap.ToolBar']}).then((AMap) => {
    AMap.getConfig().appname = 'amap-jsapi-skill';
    return AMap;
  });
  schematic.hidden = true;
  amapContainer.hidden = false;
  amapApi = AMap;
  amap = new AMap.Map('amap-container', {viewMode: '3D', zoom: 5, center: [85.5, 30.8], pitch: 12});
  amap.addControl(new AMap.Scale());
  amap.addControl(new AMap.ToolBar({position: {right: '18px', top: '18px'}}));
  renderAmapRoute();
  document.querySelector('#map-mode').textContent = '高德交互底图 · 规划示意线';
}

function renderAmapRoute() {
  if (!amap || !amapApi) return;
  if (amapOverlays.length) amap.remove(amapOverlays);
  const r = ROUTES[activeId];
  const path = r.stops.map(name => PLACES[name]);
  const polyline = new amapApi.Polyline({path, isOutline: true, outlineColor: '#fffaf0', borderWeight: 3, strokeColor: r.color, strokeWeight: 6, lineJoin: 'round', lineCap: 'round', showDir: true, zIndex: 50});
  const seen = new Set();
  const markers = r.stops.flatMap((name, i) => {
    if (seen.has(name)) return [];
    seen.add(name);
    const marker = new amapApi.Marker({position: PLACES[name], title: name, content: `<div style="width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:${name === '拉萨' ? '#f4c95d' : r.color};color:#fff;border:2px solid #fff;font:700 11px sans-serif;box-shadow:0 3px 10px rgba(0,0,0,.25)">${name === '拉萨' ? '起' : i}</div>`, offset: new amapApi.Pixel(-14,-14)});
    marker.on('click', () => new amapApi.InfoWindow({content: `<div style="padding:8px 10px"><b>${esc(name)}</b><br><small>${esc(r.name)}停靠点</small></div>`, offset: new amapApi.Pixel(0,-18), closeWhenClickMap: true}).open(amap, PLACES[name]));
    return [marker];
  });
  amapOverlays = [polyline, ...markers];
  amap.add(amapOverlays);
  amap.setFitView(amapOverlays, false, [70,70,70,70]);
}

document.querySelector('#fit-route').addEventListener('click', () => amap ? amap.setFitView(amapOverlays, false, [70,70,70,70]) : schematic.scrollIntoView({behavior:'smooth', block:'center'}));
document.querySelector('#print-route').addEventListener('click', () => window.print());
const dialog = document.querySelector('#settings-dialog');
document.querySelector('#amap-settings').addEventListener('click', () => dialog.showModal());
document.querySelector('#settings-form').addEventListener('submit', async event => {
  if (event.submitter?.value === 'cancel') return;
  event.preventDefault();
  const key = document.querySelector('#amap-key').value.trim();
  const secret = document.querySelector('#amap-secret').value.trim();
  const error = document.querySelector('#form-error');
  if (!key || !secret) { error.textContent = '请同时填写 Key 和安全密钥。'; return; }
  error.textContent = '正在加载…';
  try {
    localStorage.setItem('ali-amap-key', key); localStorage.setItem('ali-amap-secret', secret);
    await loadAmap(key, secret); dialog.close(); error.textContent = '';
  } catch (e) { error.textContent = `加载失败：${e.message || e}`; }
});

renderTabs(); renderSummary(); renderSchematic(); renderDays();
