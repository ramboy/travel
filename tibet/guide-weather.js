/* 浏览器渲染快照；墨迹预报优先，未覆盖日期可用明确标注的 MSN 30 天趋势，缺失不插值。 */
window.TIBET_WEATHER = (() => {
  const checkedAt = '2026-09-25T06:20:58.299+08:00';
  const base = 'https://tianqi.moji.com/';
  const regionNames = {
    lhasa: '拉萨市',
    'gonggar-county': '贡嘎县',
    'langkazi-county': '浪卡子县',
    'kangmar-county': '康马县',
    'dingjie-county': '定结县',
    'tingri-county': '定日县',
    'qomolangma-national-nature-reserve': '珠穆朗玛峰国家级自然保护区',
    'gyirong-county': '吉隆县',
    'saga-county': '萨嘎县',
    'burang-county': '普兰县',
    'himalaya-gang-rinpoche': '喜马拉雅·冈仁波齐酒店天气点',
    'zanda-county': '札达县',
    'shiquanhe-town': '狮泉河镇',
    'geji-county': '革吉县',
    'gaize-county': '改则县',
    'cuoqin-county': '措勤县',
    'nyinma-county': '尼玛县',
    'baingoin-county': '班戈县',
    'namtso-national-park': '纳木措国家公园',
    'shengxiang-tianmen': '圣象天门'
  };

  // [区县/景区页面, 日期, 最高温, 日最低温, 白天天气, 夜间天气, 已核实风力]
  // 2026-09-25 浏览器渲染核验；同日风力与日期日历温度交叉核对。
  // 十月风力未取得；逐页实际时间及证据见 guide-weather-evidence.json。
  const observations = [
  [
    "lhasa",
    "09-25",
    18,
    7,
    "阵雨",
    "多云",
    "西南风 2级"
  ],
  [
    "lhasa",
    "10-05",
    16,
    6,
    "阴",
    "多云",
    null
  ],
  [
    "lhasa",
    "10-06",
    17,
    5,
    "多云",
    "晴",
    null
  ],
  [
    "lhasa",
    "10-07",
    17,
    5,
    "阴",
    "多云",
    null
  ],
  [
    "gonggar-county",
    "09-25",
    17,
    6,
    "阵雨",
    "多云",
    "东北风 3级"
  ],
  [
    "gonggar-county",
    "10-07",
    16,
    6,
    "多云",
    "多云",
    null
  ],
  [
    "langkazi-county",
    "09-26",
    15,
    2,
    "多云",
    "多云",
    "东南风 2级"
  ],
  [
    "kangmar-county",
    "09-26",
    14,
    3,
    "多云",
    "多云",
    "南风 3级"
  ],
  [
    "kangmar-county",
    "09-27",
    15,
    2,
    "多云",
    "晴",
    "西南风 3级"
  ],
  [
    "dingjie-county",
    "09-27",
    15,
    0,
    "阴",
    "晴",
    "西南风 3级"
  ],
  [
    "tingri-county",
    "09-27",
    14,
    1,
    "阴",
    "阴",
    "东南风 2级"
  ],
  [
    "tingri-county",
    "09-28",
    15,
    0,
    "多云",
    "多云",
    "东南风 3级"
  ],
  [
    "qomolangma-national-nature-reserve",
    "09-28",
    16,
    0,
    "少云",
    "少云",
    "东南风 3级"
  ],
  [
    "gyirong-county",
    "09-28",
    12,
    0,
    "多云",
    "晴",
    "西南风 1级"
  ],
  [
    "saga-county",
    "09-28",
    12,
    -1,
    "多云",
    "晴",
    "南风 3级"
  ],
  [
    "saga-county",
    "09-29",
    14,
    -3,
    "晴",
    "晴",
    "西南风 3级"
  ],
  [
    "burang-county",
    "09-29",
    11,
    -4,
    "晴",
    "雪",
    "南风 2级"
  ],
  [
    "himalaya-gang-rinpoche",
    "09-29",
    0,
    -6,
    "阵雪",
    "晴",
    "东北风 1级"
  ],
  [
    "zanda-county",
    "09-30",
    4,
    -11,
    "晴",
    "晴",
    "南风 4级"
  ],
  [
    "zanda-county",
    "10-01",
    10,
    1,
    "多云",
    "晴",
    null
  ],
  [
    "shiquanhe-town",
    "10-01",
    10,
    -1,
    "晴",
    "晴",
    null
  ],
  [
    "geji-county",
    "10-01",
    7,
    -5,
    "多云",
    "多云",
    null
  ],
  [
    "geji-county",
    "10-02",
    8,
    -5,
    "多云",
    "晴",
    null
  ],
  [
    "gaize-county",
    "10-02",
    10,
    -2,
    "晴",
    "晴",
    null
  ],
  [
    "cuoqin-county",
    "10-02",
    11,
    -1,
    "晴",
    "晴",
    null
  ],
  [
    "cuoqin-county",
    "10-03",
    10,
    -1,
    "晴",
    "阴",
    null
  ],
  [
    "nyinma-county",
    "10-03",
    11,
    -2,
    "晴",
    "多云",
    null
  ],
  [
    "nyinma-county",
    "10-04",
    9,
    -1,
    "阴",
    "晴",
    null
  ],
  [
    "baingoin-county",
    "10-04",
    8,
    -1,
    "阴",
    "阴",
    null
  ],
  [
    "baingoin-county",
    "10-05",
    4,
    -1,
    "晴",
    "晴",
    null
  ],
  [
    "namtso-national-park",
    "10-05",
    9,
    5,
    "雨",
    "雨",
    null
  ]
];
  const checkedBySlug = {"lhasa":"2026-09-25T06:13:02.736+08:00","gonggar-county":"2026-09-25T06:13:04.593+08:00","langkazi-county":"2026-09-25T06:13:06.243+08:00","kangmar-county":"2026-09-25T06:13:07.991+08:00","dingjie-county":"2026-09-25T06:13:28.793+08:00","tingri-county":"2026-09-25T06:13:30.444+08:00","qomolangma-national-nature-reserve":"2026-09-25T06:13:32.187+08:00","gyirong-county":"2026-09-25T06:13:34.338+08:00","saga-county":"2026-09-25T06:14:26.028+08:00","burang-county":"2026-09-25T06:13:36.843+08:00","himalaya-gang-rinpoche":"2026-09-25T06:14:27.792+08:00","zanda-county":"2026-09-25T06:14:29.502+08:00","shiquanhe-town":"2026-09-25T06:14:31.271+08:00","geji-county":"2026-09-25T06:14:32.956+08:00","gaize-county":"2026-09-25T06:14:34.751+08:00","cuoqin-county":"2026-09-25T06:16:17.304+08:00","nyinma-county":"2026-09-25T06:15:45.269+08:00","baingoin-county":"2026-09-25T06:17:06.962+08:00","namtso-national-park":"2026-09-25T06:15:52.774+08:00","shengxiang-tianmen":"2026-09-25T06:18:25.513+08:00"};
  const byKey = new Map(observations.map(record => [`${record[0]}|${record[1]}`, record]));
  const trends = window.TIBET_WEATHER_TRENDS || {observations:[],checkedAt:null};
  const trendByKey = new Map(trends.observations.map(record => [`${record.slug}|${record.date.slice(5)}`, record]));
  const proxy = '县区级参考，不等同于景点或酒店门口预报；山口、冰川与湖岸体感需现场复核。';

  // 日期、D 编号、地点、墨迹天气点、代理说明。相同县区也保留高海拔景点与住宿节点。
  const itinerary = [
    ['09-25', 'D0', ['拉萨贡嘎机场'], 'gonggar-county', '贡嘎县预报作为机场区域参考。'],
    ['09-25', 'D0', ['拉萨市区', '拉萨住宿'], 'lhasa', '拉萨市区预报。'],
    ['09-26', 'D1', ['鲁日拉观景台'], 'langkazi-county', proxy],
    ['09-26', 'D1', ['卡若拉冰川'], 'langkazi-county', proxy],
    ['09-26', 'D1', ['康马住宿'], 'kangmar-county', '康马县预报，供当晚两家酒店参考。'],
    ['09-27', 'D2', ['康马出发'], 'kangmar-county', '康马县预报。'],
    ['09-27', 'D2', ['西林观景台'], 'dingjie-county', proxy],
    ['09-27', 'D2', ['加乌拉山口'], 'tingri-county', proxy],
    ['09-27', 'D2', ['定日白坝住宿'], 'tingri-county', '定日县级预报供白坝珠穆朗玛国际酒店住宿参考；县级旧快照并非酒店实时天气。'],
    ['09-28', 'D3', ['珠峰大本营'], 'qomolangma-national-nature-reserve', '墨迹珠峰保护区天气点参考，不是 5,200 m 大本营实测，也不是峰顶天气。'],
    ['09-28', 'D3', ['珠峰古堡遗址'], 'tingri-county', proxy],
    ['09-28', 'D3', ['佩枯措'], 'gyirong-county', proxy],
    ['09-28', 'D3', ['萨嘎住宿'], 'saga-county', '萨嘎县预报。'],
    ['09-29', 'D4', ['萨嘎出发'], 'saga-county', '萨嘎县预报。'],
    ['09-29', 'D4', ['玛旁雍措', '拉昂措'], 'burang-county', '普兰县级参考，两湖并无单独预报；不要将县城温度当作湖岸精确温度。'],
    ['09-29', 'D4', ['塔尔钦住宿'], 'himalaya-gang-rinpoche', '采用塔尔钦邻近喜马拉雅·冈仁波齐酒店天气点；并非本次所订酒店门口实测。'],
    ['09-30', 'D5', ['玛朗峡谷'], 'zanda-county', proxy],
    ['09-30', 'D5', ['古格王国遗址', '札达住宿'], 'zanda-county', '札达县级参考，遗址山坡与县城体感不同。'],
    ['10-01', 'D6', ['霞义沟土林'], 'zanda-county', proxy],
    ['10-01', 'D6', ['狮泉河'], 'shiquanhe-town', '狮泉河镇预报。'],
    ['10-01', 'D6', ['革吉住宿'], 'geji-county', '革吉县预报。'],
    ['10-02', 'D7', ['革吉出发'], 'geji-county', '革吉县预报。'],
    ['10-02', 'D7', ['物玛措', '改则'], 'gaize-county', '物玛措位于改则县物玛乡，采用改则县级参考。'],
    ['10-02', 'D7', ['雀登村（大地之树）', '洞措沿线'], 'gaize-county', '采用改则县级参考，洞措沿线及观景点没有单独逐点预报。'],
    ['10-02', 'D7', ['措勤住宿'], 'cuoqin-county', '措勤县预报。'],
    ['10-03', 'D8', ['扎日南木措'], 'cuoqin-county', proxy],
    ['10-03', 'D8', ['文布南村', '当惹雍措'], 'nyinma-county', '尼玛县级参考；村庄和湖岸与县城相距较远，不能视为精确景点预报。'],
    ['10-03', 'D8', ['尼玛住宿'], 'nyinma-county', '尼玛县预报；已按最新非备选酒店确定当晚住宿点。'],
    ['10-04', 'D9', ['尼玛出发'], 'nyinma-county', '尼玛县级参考，不等同于沿线山口天气。'],
    ['10-04', 'D9', ['色林措', '班戈住宿'], 'baingoin-county', '采用班戈县级参考；色林措湖岸与县城温度、风力可能不同。'],
    ['10-05', 'D10', ['班戈出发'], 'baingoin-county', '班戈县级参考。'],
    ['10-05', 'D10', ['纳木措'], 'namtso-national-park', '景区天气点参考，不是整片湖区的实测；入园须临行核验。'],
    ['10-05', 'D10', ['圣象天门（条件备选）'], 'shengxiang-tianmen', '景点天气点参考，不是现场实测；路况和准入仍须临行核验。'],
    ['10-05', 'D10', ['拉萨住宿'], 'lhasa', '拉萨市区参考，不等同于酒店门口实测。'],
    ['10-06', 'D11', ['布达拉宫', '大昭寺', '八廓街', '拉萨住宿'], 'lhasa', '拉萨市区参考。'],
    ['10-07', 'D12', ['拉萨市区'], 'lhasa', '拉萨市区参考。'],
    ['10-07', 'D12', ['拉萨贡嘎机场'], 'gonggar-county', '贡嘎机场区域参考，不是拉萨市区数据。']
  ];
  const sourceUrl = (slug, kind = 'today') => `${base}${kind}/china/tibet/${slug}`;
  const nodes = itinerary.map(([date, day, places, slug, reason]) => {
    const record = byKey.get(`${slug}|${date}`);
    const trend = record ? null : trendByKey.get(`${slug}|${date}`);
    if(trend) return {
      ...trend, day, places, provider:'MSN', status:'long_range_trend',
      dayCondition:null, nightCondition:null, lowBasis:'daily_lower_bound',
      mojiCheckedAt:checkedAt, mojiSourceUrl:sourceUrl(slug),
      reason:`${reason} 墨迹页面本次核验返回 404，未取得同日预报；改用 ${trend.checkedAt.slice(0,10)} 浏览器核验的 MSN 30 天远期趋势；温度已刷新，天气文字和风速尚未核实，不等同短期预报，非历史平均值。${trend.locationNote || ''}`,
      forecastThrough:trend.forecastThrough || trend.date
    };
    const [, , high, low, dayCondition, nightCondition, wind] = record || [];
    return {
      date: `2026-${date}`, day, places, slug,
      provider:'墨迹', checkedAt:checkedBySlug[slug] || checkedAt,
      region: regionNames[slug],
      sourceUrl: sourceUrl(slug),
      status: record ? 'forecast' : 'unavailable',
      high: record ? high : null,
      low: record ? low : null,
      condition: record ? (dayCondition === nightCondition ? dayCondition : `${dayCondition}转${nightCondition}`) : '待更新',
      dayCondition: dayCondition || null,
      nightCondition: nightCondition || null,
      wind: wind || '风力待更新',
      windSourceUrl: wind ? sourceUrl(slug, 'weather') : null,
      lowBasis: record ? 'daily_lower_bound' : 'unavailable',
      reason: reason + (slug === 'zanda-county' && date === '09-30' ? ' 本次墨迹显示 4℃／−11℃，预报列表与同日天气日历一致，较上一快照明显降温；按来源记录，临近日期须复核，不视为实测。' : ''),
      sourcePageDate: '2026-09-25',
      forecastThrough: '2026-10-09'
    };
  });
  const usedSlugs = [...new Set(itinerary.filter(record=>byKey.has(`${record[3]}|${record[0]}`)).map(record => record[3]))];
  const sources = usedSlugs.map(slug => ({
    title: `墨迹天气 · ${regionNames[slug]} · 带日期的 15 天预报`,
    url: sourceUrl(slug), checkedAt:checkedBySlug[slug]
  }));
  [...new Set(observations.filter(record => record[6]).map(record => record[0]))].forEach(slug => {
    sources.push({title: `墨迹天气 · ${regionNames[slug]} · 日期日历风力`, url: sourceUrl(slug, 'weather'), checkedAt});
  });
  nodes.filter(n=>n.status==='long_range_trend').forEach(n=>sources.push({title:`MSN · ${n.region} · ${n.date} · 30 天趋势`,url:n.sourceUrl,checkedAt:n.checkedAt,navigation:n.navigation}));

  return {
    checkedAt,
    trendCheckedAt: trends.checkedAt,
    sourcePolicy: '墨迹天气优先；2026-09-25 通过 Chrome 浏览器渲染核验 20 个既定地点页面，19 个有效页面覆盖到 10 月 9 日。10 月 5 日圣象天门墨迹仍为 404，改用本次重新核验的 MSN 30 天趋势温度。未采用历史平均值、搜索摘要、错误定位页或天气 API。',
    forecastRange: {from: '2026-09-25', through: '2026-10-09'},
    notes: [
      '2026 年 9 月 25 日 06:13—06:21（北京时间）逐页核对墨迹：19 个有效地点页面均显示明确日期列表，未来预报覆盖 09.25—10.09；31 个唯一地点／日期记录映射全程 36 个墨迹行程节点。',
      '10 月 5 日圣象天门（条件备选）的墨迹页面仍为 404；09.25 06:28 已在 MSN 精确选中景点，更新 30 天趋势为最高 10℃、日最低 0℃。天气文字与风速未核实，清空旧值；不以纳木措或拉萨替代。',
      '行程日期暂未取得 07:00—24:00 小时预报，所以最低温均为日最低温的保守参考，不冒充白天最低温；临近出发需重新核对小时预报。',
      '天气“转”表示白天预报到夜间预报的变化。温度多为县区代理，山口、冰川、湖岸以及保护区内部不能当作同一温度。',
      '9 月 25—30 日风力已重新核对墨迹同日天气日历，并匹配同日高低温；10 月 1—7 日墨迹风力未取得，保留“风力待更新”，不沿用旧风力或当前风向。圣象天门本次未取得对应日期风速，标为待更新。',
      'MSN 景点定位名和日期证据均有留存；本次只更新其趋势温度，不猜测天气图标。MSN 可能把地址改写为市级入口，复查须重新选中对应地点，不能拿默认城市替代。',
      '札达 09.30 的 4℃／−11℃已在墨迹预报列表与同日天气日历交叉核对；较前次快照明显降温，按来源记录并提示临近日期复查，不擅自平滑或改回旧值。',
      '合并相邻天气点时，最高温取最大值、最低温取最小值，不取平均；存在缺失点时不能宣称已经覆盖整日温度范围。',
      '这是带核对时间的静态快照，不是页面自动更新服务。远期预报可能变化，出发前及每日出门前应重新核对墨迹天气和当地气象预警。'
    ],
    nodes,
    sources
  };
})();
