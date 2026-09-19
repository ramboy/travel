/* 墨迹天气浏览器渲染快照；只录入带明确日期的预报，缺失日期不插值。 */
window.TIBET_WEATHER = (() => {
  const checkedAt = '2026-09-19T09:03:37+08:00';
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
    'namtso-national-park': '纳木措国家公园'
  };

  // [区县/景区页面, 日期, 最高温, 日最低温, 白天天气, 夜间天气, 已核实风力]
  // 9 月风力取 weather 页同日天气日历，并与 today 页高低温逐条核对；10 月风力未取得。
  const observations = [
    ['lhasa', '09-25', 20, 8, '小雨', '小雨', '西南风 2 级'],
    ['gonggar-county', '09-25', 19, 6, '小雨', '小雨', '东北风 3 级'],
    ['langkazi-county', '09-26', 10, 2, '阴', '阴', '东北风 3 级'],
    ['kangmar-county', '09-26', 10, 4, '阴', '阴', '南风 3 级'],
    ['kangmar-county', '09-27', 12, 3, '阴', '阴', '西南风 3 级'],
    ['dingjie-county', '09-27', 10, 3, '小雨', '小雨', '东南风 2 级'],
    ['tingri-county', '09-27', 10, 3, '阴', '小雨', '东南风 2 级'],
    ['tingri-county', '09-28', 12, 2, '小雨', '多云', '东南风 2 级'],
    ['qomolangma-national-nature-reserve', '09-28', 15, 2, '少云', '少云', '东南风 2 级'],
    ['gyirong-county', '09-28', 8, 1, '小雨', '阴', '西南风 2 级'],
    ['saga-county', '09-28', 9, 1, '小雨', '阴', '南风 2 级'],
    ['saga-county', '09-29', 7, 1, '小雨', '阴', '南风 2 级'],
    ['burang-county', '09-29', 14, 1, '小雨', '雨夹雪', '西南风 3 级'],
    ['himalaya-gang-rinpoche', '09-29', 8, -2, '雨', '阵雪', '西南风 3 级'],
    ['zanda-county', '09-30', 16, 5, '阴', '多云', '西南风 5 级'],
    ['zanda-county', '10-01', 15, 4, '多云', '晴', null],
    ['shiquanhe-town', '10-01', 8, 0, '小雨', '多云', null],
    ['geji-county', '10-01', 10, -1, '阴', '晴', null],
    ['geji-county', '10-02', 8, -2, '阴', '阴', null],
    ['gaize-county', '10-02', 9, 0, '小雨', '雨夹雪', null],
    ['cuoqin-county', '10-02', 11, 0, '阴', '阴', null],
    ['cuoqin-county', '10-03', 11, 0, '阴', '阴', null],
    ['nyinma-county', '10-03', 11, 1, '小雨', '雨夹雪', null]
  ];
  const byKey = new Map(observations.map(record => [`${record[0]}|${record[1]}`, record]));
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
    ['09-27', 'D2', ['巴松村住宿'], 'tingri-county', '定日县级预报供巴松村住宿参考；不是巴松措景区天气。'],
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
    ['10-04', 'D9', ['尼玛出发'], 'nyinma-county', '截至核对时尚未覆盖 10 月 4 日。'],
    ['10-04', 'D9', ['色林措', '班戈住宿'], 'baingoin-county', '截至核对时尚未覆盖 10 月 4 日；取得预报后仍需注明湖区与县区的差异。'],
    ['10-05', 'D10', ['班戈出发'], 'baingoin-county', '截至核对时尚未覆盖 10 月 5 日。'],
    ['10-05', 'D10', ['纳木措', '圣象天门（条件备选）'], 'namtso-national-park', '截至核对时尚未覆盖 10 月 5 日；入园仍须临行核验路况和准入。'],
    ['10-05', 'D10', ['拉萨住宿'], 'lhasa', '截至核对时尚未覆盖 10 月 5 日。'],
    ['10-06', 'D11', ['布达拉宫', '大昭寺', '八廓街', '拉萨住宿'], 'lhasa', '截至核对时尚未覆盖 10 月 6 日。'],
    ['10-07', 'D12', ['拉萨市区'], 'lhasa', '截至核对时尚未覆盖 10 月 7 日。'],
    ['10-07', 'D12', ['拉萨贡嘎机场'], 'gonggar-county', '截至核对时尚未覆盖 10 月 7 日。']
  ];
  const sourceUrl = (slug, kind = 'today') => `${base}${kind}/china/tibet/${slug}`;
  const nodes = itinerary.map(([date, day, places, slug, reason]) => {
    const record = byKey.get(`${slug}|${date}`);
    const [, , high, low, dayCondition, nightCondition, wind] = record || [];
    return {
      date: `2026-${date}`, day, places,
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
      reason,
      sourcePageDate: '2026-09-19',
      forecastThrough: '2026-10-03'
    };
  });
  const usedSlugs = [...new Set(itinerary.map(record => record[3]))];
  const sources = usedSlugs.map(slug => ({
    title: `墨迹天气 · ${regionNames[slug]} · 带日期的 15 天预报`,
    url: sourceUrl(slug), checkedAt
  }));
  [...new Set(observations.filter(record => record[6]).map(record => record[0]))].forEach(slug => {
    sources.push({title: `墨迹天气 · ${regionNames[slug]} · 日期日历风力`, url: sourceUrl(slug, 'weather'), checkedAt});
  });

  return {
    checkedAt,
    sourcePolicy: '墨迹天气为主，通过本地 Chrome / Playwright 浏览器渲染读取；只采用页面明确标注日期的预报。未采用搜索摘要、无日期的今日卡片、MSN 错误定位页或 Open-Meteo。',
    forecastRange: {from: '2026-09-19', through: '2026-10-03'},
    notes: [
      '本次核对的墨迹页面均标明 2026 年 9 月 19 日，15 天预报最远到 10 月 3 日；10 月 4—7 日保留“待更新”，不以往年或气候平均值补齐。',
      '行程日期暂未取得 07:00—24:00 小时预报，所以最低温均为日最低温的保守参考，不冒充白天最低温；临近出发需重新核对小时预报。',
      '天气“转”表示白天预报到夜间预报的变化。温度多为县区代理，山口、冰川、湖岸以及保护区内部不能当作同一温度。',
      '9 月 25—30 日已显示的风力来自同日天气日历并与高低温核对；10 月日期风力尚未取得，留作待更新。',
      '合并相邻天气点时，最高温取最大值、最低温取最小值，不取平均；存在缺失点时不能宣称已经覆盖整日温度范围。',
      '这是带核对时间的静态快照，不是页面自动更新服务。远期预报可能变化，出发前及每日出门前应重新核对墨迹天气和当地气象预警。'
    ],
    nodes,
    sources
  };
})();
