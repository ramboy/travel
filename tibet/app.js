const ROUTES = {
  classic: {
    letter: 'A', name: '阿里中北线', tag: '小红书整理', color: '#f1603a',
    subtitle: '内容根据小红书路线调整，串联康马、珠峰、阿里西部与羌塘湖群。',
    recommendation: '中北线完整串联，里程与时长来自地图截图', days: 10, km: '4,479.4 km', maxAlt: '约 5,200 m', buffer: '1 天拉萨市区',
    kmLabel: '截图逐段合计',
    startEnd: '拉萨市 → 拉萨市',
    fit: ['至少 2 名熟练司机', '想覆盖珠峰、古格与羌塘湖群', '能接受多日连续 7–9 小时驾驶'],
    warning: 'D1—D10 地图纯驾驶时间合计约 77 小时 12 分，未包含游览、检查站、加油与临时管制。10 月 6 日留在拉萨市区游玩，10 月 7 日按 10:55 航班返程。',
    itineraryNote: '路线内容根据小红书调整；D1—D10 里程与时间由高德地图截图逐段相加，实际用时随路况变化。',
    stops: ['拉萨','鲁日拉观景台','卡若拉冰川','康马','西林观景台','加乌拉山口','巴松村','珠峰大本营','珠峰古堡遗址','佩枯措','萨嘎','玛旁雍措','拉昂措','普兰','玛朗峡谷观景台','古格王国遗址','札达','霞义沟','狮泉河','革吉','物玛措','改则','雀登村（大地之树、洞措）','措勤','扎日南木措','文布南村（当惹雍错）','尼玛','色林措','班戈','纳木措','拉萨'],
    daysList: [
      {day:'D0', date:'09.25', route:'杭州 → 拉萨', highlights:'16:30 抵达拉萨，取车并办理入住。', distance:'飞机', stay:'拉萨市', type:'transit'},
      {day:'D1', date:'09.26', route:'拉萨市 → 康马县', highlights:'鲁日拉观景台、卡若拉冰川景区售票处。', distance:'442.1 km / 8小时43分', stay:'康马县（备选：日喀则市）'},
      {day:'D2', date:'09.27', route:'康马县 → 巴松村', highlights:'西林观景台、加乌拉山口观景平台。', distance:'476.6 km / 8小时17分', stay:'巴松村'},
      {day:'D3', date:'09.28', route:'巴松村 → 萨嘎县', highlights:'珠峰大本营、珠峰古堡遗址、佩枯措希峰观景台。', distance:'421.7 km / 8小时19分', stay:'萨嘎县'},
      {day:'D4', date:'09.29', route:'萨嘎县 → 普兰县', highlights:'玛旁雍措观景点、拉昂措观景台。', distance:'559.5 km / 8小时22分', stay:'普兰县（备选：塔尔钦）'},
      {day:'D5', date:'09.30', route:'普兰县 → 札达县', highlights:'玛朗峡谷观景台、古格王国遗址。', distance:'398.3 km / 7小时05分', stay:'札达县'},
      {day:'D6', date:'10.01', route:'札达县 → 革吉县', highlights:'霞义沟土林景区、狮泉河镇；住宿点为维也纳酒店阿里革吉店。', distance:'357.4 km / 6小时', stay:'革吉县'},
      {day:'D7', date:'10.02', route:'革吉县 → 措勤县', highlights:'物玛措、改则县、雀登村（大地之树、洞措）。', distance:'621.3 km / 8小时18分', stay:'措勤县'},
      {day:'D8', date:'10.03', route:'措勤县 → 文布南村', highlights:'扎日南木措北岸观景台、文布南村（当惹雍错）；尼玛县可作为备选住宿地。', distance:'265.6 km / 6小时30分', stay:'文布南村（备选：尼玛县）'},
      {day:'D9', date:'10.04', route:'文布南村 → 班戈县', highlights:'尼玛县、色林措。', distance:'491.3 km / 7小时08分', stay:'班戈县'},
      {day:'D10', date:'10.05', route:'班戈县 → 拉萨市', highlights:'纳木措自然保护区、圣象天门。', distance:'445.6 km / 8小时30分', stay:'拉萨市'},
      {day:'D11', date:'10.06', route:'拉萨市区游玩', highlights:'布达拉宫、大昭寺、八廓街；还车并整理行李。', distance:'0 km', stay:'拉萨市', type:'buffer'},
      {day:'D12', date:'10.07', route:'拉萨 → 杭州', highlights:'10:55 航班，预留充足时间前往贡嘎机场。', distance:'飞机', stay:'—', type:'transit'}
    ]
  },
  south: {
    letter: 'C', name: '阿里北线', tag: '小红书整理', color: '#41675c',
    subtitle: '内容根据小红书路线调整，用普兰、札达等相对低海拔住宿点缓冲后进入羌塘。',
    recommendation: '景点最全，住宿策略最细', days: 10, km: '约 4,000 km', maxAlt: '约 5,200 m', buffer: '1 天拉萨市区',
    fit: ['想覆盖古格、狮泉河与大北线', '愿意连续长途驾驶', '会根据高反主动删减行程'],
    warning: 'Day 1 在抵达后不足 24 小时即开始长途并升至日喀则，不符合循序渐进原则；且“拉萨—日喀则 630 km”明显需要导航复核。若抵达当晚睡眠或血氧异常，应留在拉萨，不能硬赶。',
    itineraryNote: '路线内容根据小红书调整；里程、房价与住宿为原始记录，疑问项目已加“导航/临行复核”提示。',
    stops: ['拉萨','羊卓雍措','卡若拉冰川','满拉水库','日喀则','定日','珠峰大本营','希夏邦马峰','佩枯措','萨嘎','玛旁雍措','拉昂措','普兰','札达','霞义沟','狮泉河','改则','尼玛','当惹雍措','色林措','班戈','纳木措','拉萨'],
    daysList: [
      {day:'D0', date:'09.25', route:'杭州 → 拉萨', highlights:'16:30 抵达，取车并办理入住。', distance:'飞机', stay:'拉萨市政府亚朵 · 约 ¥393/晚', alt:'约 3,650 m', strategy:'抵达后不剧烈运动、不饮酒。', type:'transit'},
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
      {day:'D11', date:'10.06', route:'拉萨市区游玩', highlights:'布达拉宫、大昭寺、八廓街；还车并整理行李。', distance:'0 km', stay:'拉萨', alt:'约 3,650 m', type:'buffer'},
      {day:'D12', date:'10.07', route:'拉萨 → 杭州', highlights:'10:55 航班。', distance:'飞机', stay:'—', alt:'—', type:'transit'}
    ]
  }
};

const PLACES = {
  '拉萨':[91.1322,29.6604], '羊卓雍措':[90.742,28.95], '日喀则':[88.885,29.267],
  '鲁日拉观景台':[90.74,28.95], '西林观景台':[88.45,28.45], '加乌拉山口':[86.82,28.52], '巴松村':[86.86,28.28],
  '珠峰古堡遗址':[87.05,28.70], '玛朗峡谷观景台':[80.42,31.18], '古格王国遗址':[79.68,31.47],
  '珠峰大本营':[86.852,28.194], '萨嘎':[85.234,29.329], '塔尔钦':[81.30,31.06],
  '玛旁雍措':[81.47,30.68], '普兰':[81.177,30.294], '札达':[79.803,31.479],
  '狮泉河':[80.10,32.50], '革吉':[81.15,32.39], '物玛措':[82.75,32.10], '改则':[84.063,32.305],
  '雀登村（大地之树、洞措）':[84.70,31.65], '尼玛':[87.236,31.785], '贡嘎机场':[90.90,29.30],
  '文布南村':[85.55,30.71], '文布南村（当惹雍错）':[85.55,30.71], '班戈':[90.01,31.39], '纳木措':[90.60,30.72],
  '普莫雍措':[90.40,28.55], '康马':[89.68,28.56], '定日':[87.12,28.66],
  '佩枯措':[85.60,28.85], '措勤':[85.16,31.02], '扎日南木措':[85.62,31.04],
  '当惹雍措':[86.65,31.10], '色林措':[89.00,31.80], '巴木措':[90.33,31.25],
  '卡若拉冰川':[90.18,28.90], '满拉水库':[89.54,28.88], '希夏邦马峰':[85.78,28.35],
  '拉昂措':[81.22,30.68], '霞义沟':[79.98,31.32]
};

let activeId = new URLSearchParams(location.search).get('route') || 'classic';
if (!ROUTES[activeId]) activeId = 'classic';
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
    <div class="round-trip">自驾起终点：${r.startEnd || '拉萨 → 拉萨'}</div>
    <div class="metric-row">
      <div class="metric"><b>${r.days} 天</b><small>自驾段</small></div>
      <div class="metric"><b>${r.km}</b><small>${r.kmLabel || '规划估算'}</small></div>
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
  const rows = r.daysList.map((entry, i) => {
    const day = Array.isArray(entry) ? {
      day: `D${i + 1}`, date: entry[0], route: entry[1], highlights: entry[2], distance: entry[3]
    } : entry;
    const lodging = [day.stay, day.alt].filter(Boolean).join(' · ');
    return `<tr class="${esc(day.type || '')}">
      <td><span class="table-date">${esc(day.date)}</span><small>${esc(day.day || `D${i + 1}`)}</small></td>
      <td><strong>${esc(day.route)}</strong></td>
      <td>${esc(day.highlights || '—')}${day.strategy ? `<small class="table-note">提示：${esc(day.strategy)}</small>` : ''}</td>
      <td class="nowrap">${esc(day.distance || '—')}</td>
      <td>${esc(lodging || '—')}</td>
    </tr>`;
  }).join('');
  dayGrid.innerHTML = `<div class="itinerary-table-wrap"><table class="itinerary-table">
    <thead><tr><th>日期</th><th>行程</th><th>途经 / 备注</th><th>里程 / 时长</th><th>住宿 / 海拔</th></tr></thead>
    <tbody>${rows}</tbody>
  </table></div>`;
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
