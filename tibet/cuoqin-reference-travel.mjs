/** Travel chapters use the legacy guide's components with the revised dates and stays. */
const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const lines = value => esc(value).replaceAll('\n', '<br>');
const md = value => String(value ?? '').replaceAll('|', '\\|').replaceAll('\n', '<br>');
const short = date => date.slice(5).replace('-', '.');
const safeUrl = url => typeof url === 'string' && /^https?:\/\//.test(url);
const link = (url, label, className = '') => safeUrl(url) ? `<a href="${esc(url)}"${className ? ` class="${esc(className)}"` : ''} target="_blank" rel="noopener noreferrer">${esc(label)}</a>` : esc(label);
const usablePhoto = asset => asset?.src && safeUrl(asset.sourceUrl) && !asset.requiresPermission && asset.display !== 'source-link';
const photo = (asset, alt) => usablePhoto(asset) ? `<div class="photo-wrap"><img src="${esc(asset.src)}" alt="${esc(asset.alt || alt)}" loading="lazy" decoding="async" referrerpolicy="no-referrer">${link(asset.sourceUrl, asset.credit || '图片来源', 'photo-credit')}</div>` : '';
const photoMarkdown = (asset, alt) => usablePhoto(asset) ? `![${asset.alt || alt}](${asset.src})\n\n[图片来源](${asset.sourceUrl}) · ${asset.credit || '原作者'}${asset.licenseUrl ? ` · [${asset.license || '图片许可'}](${asset.licenseUrl})` : ''}\n\n` : '';

export function referenceTravelChapters({plan, original, base, research, hotelMedia, media, hotelRows}) {
  const days = plan.days;
  const stays = plan.confirmedStays || [];
  const assets = media || {};
  const findPhoto = name => Object.values(assets).find(asset => asset.name === name || (asset.aliases || []).includes(name));
  const spots = {
    ...original.spots,
    zhari: {...original.spots.zhari, play: '按开放入口到北岸观景点，不跟着车辙抄湖滨近路。9 月 30 日当晚住文布南村琼宗湖景驿站，安排好到村时间，再留湖畔慢走与休息的余量。'},
  };
  const actualStay = day => stays.find(stay => day.date >= stay.checkin && day.date < stay.checkout);
  const hotelEntry = stay => hotelMedia?.hotels?.[stay.hotel];
  const hotelName = stay => link(hotelEntry(stay)?.url, stay.hotel, 'hotel-link');
  const imageContext = asset => !asset ? '' : asset.name === '珠峰大本营' ? '图为珠峰北坡／绒布寺一带，非营地设施实拍。' : asset.src === 'guide-images/karuola.webp' ? '照片摄于 2011 年，冰川现状可能不同。' : asset.license ? `${asset.credit} · 图片经尺寸与格式调整。` : '';
  function spotCard(spot) {
    const asset = findPhoto(spot.name);
    const context = imageContext(asset);
    const searchUrl = `https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(spot.name + ' 攻略')}`;
    return `<article class="photo-card">${photo(asset, spot.name)}<div class="photo-caption"><span class="card-tag">${esc(spot.priority)} · ${esc(spot.duration)}</span><h4>${esc(spot.name)}</h4><p>${esc(spot.play)}</p>${context ? `<p class="photo-context">${esc(context)}</p>` : ''}${asset?.requiresPermission ? '<p class="photo-context">图源需转载授权，仅提供原文看图入口。</p>' : ''}<div class="card-links">${link(searchUrl, '小红书搜索 ↗', 'xhs-link')}${asset?.sourceUrl ? link(asset.sourceUrl, asset.requiresPermission ? '原文看图 ↗' : '图片来源 ↗') : ''}${asset?.licenseUrl ? link(asset.licenseUrl, '图片许可 ↗') : ''}</div></div></article>`;
  }
  function hotelPhotos(stay) {
    const entry = hotelEntry(stay);
    const exterior = entry?.status === 'verified' ? assets[entry.image] : null;
    return [
      {label: '酒店外观', asset: exterior?.status === 'verified' ? exterior : null},
      ...(stay.rooms || []).map(room => {
        const match = entry?.rooms?.find(item => item.room === room.name && item.status === 'verified');
        const asset = match ? assets[match.image] : null;
        return {label: room.name, room: room.name, asset: asset?.status === 'verified' ? asset : null};
      }),
    ];
  }
  function hotelPhotoFigure({asset, label, room}) {
    const available = usablePhoto(asset);
    return `<figure class="hotel-photo"${room ? ` data-room="${esc(room)}"` : ''}>${available ? photo(asset, label) : '<div class="hotel-photo-missing"><span>图片待核实</span><small>尚无可确认对应酒店与房型的实拍资料。</small></div>'}<figcaption><b>${esc(label)}</b>${available && asset.sourceRoomName && asset.sourceRoomName !== label ? `<span>来源房型：${esc(asset.sourceRoomName)}</span>` : ''}${available && asset.matchNote ? `<span>${esc(asset.matchNote)}</span>` : ''}${available ? link(asset.sourceUrl, '查看图片来源 ↗') : ''}</figcaption></figure>`;
  }
  function staySummary(stay) {
    const rows = (hotelRows || []).filter(row => row.origin === 'confirmed' && row.stayId === stay.id);
    return rows.map(row => `${row.room} · ${row.span} · ${row.oxygen}`).join('\n') || (stay.rooms || []).map(room => `${room.name} · ${room.count || '未提供'} 间 · ${room.oxygen || '供氧未提供'}`).join('\n');
  }
  function hotelStrip(day) {
    const stay = actualStay(day);
    if (!stay) return '';
    return `<aside class="hotel-strip" id="hotel-photo-${esc(stay.id)}-${esc(day.day)}" data-hotel="${esc(stay.hotel)}"><div class="hotel-summary"><p class="eyebrow">TONIGHT / ${day.date === stay.checkin ? '当晚住宿' : '同店续住'}</p><h4>${hotelName(stay)}</h4><p>${short(stay.checkin)} 入住 — ${short(stay.checkout)} 退房 · ${esc(stay.status)}</p><p>${lines(staySummary(stay))}<br>早餐：${esc(stay.breakfast || '未提供')}</p>${stay.address ? `<p>${esc(stay.address)}</p>` : ''}<div class="card-links"><a href="#stay-${esc(stay.id)}">查看房价与完整酒店信息 ↗</a></div></div><div class="hotel-photo-grid">${hotelPhotos(stay).map(hotelPhotoFigure).join('')}</div><p class="hotel-photo-note">实拍资料仅展示已核对的酒店及房型；具体楼层、朝向与布置以入住安排为准。缺少图片的房型保留待核实。</p></aside>`;
  }
  const dailyHtml = `<div class="editor-note"><b>十天完整行程</b><p>每日路线、公里数和实际酒店按本版资料排列。住宿已经确认；景点玩法和时间窗保留为路线资料，未逐项认定为已完成的游览记录。</p></div><div class="day-nav" id="day-nav" aria-label="每日行程跳转">${days.map(day => `<a href="#day-${esc(day.day)}"><b>${esc(day.day)}</b>${short(day.date)}</a>`).join('')}</div><div id="days-content">${days.map(day => {
    const daySpots = (day.spots || []).map(key => spots[key]).filter(Boolean);
    const photos = daySpots.filter(spot => spot.priority !== '补给');
    const stops = daySpots.filter(spot => spot.priority === '补给');
    return `<article class="day-article day" id="day-${esc(day.day)}" data-date="${esc(day.date)}"><header class="day-heading"><div class="day-number">${esc(day.day)}<small>${short(day.date)} · ${esc(day.weekday)}</small></div><div><p class="eyebrow">${esc(day.chapter || '路线留档')}</p><h3>${esc(day.title)}</h3><p class="route-line">${esc(day.route.join(' → '))}</p></div></header><div class="day-meta"><div><p><b>${esc(day.drive)}</b></p>${day.metricNote ? `<p class="metric-note">${esc(day.metricNote)}</p>` : ''}<small>${esc(day.pace || '按路况与身体状态安排停留')}</small></div><div class="day-weather"><div class="day-weather-text"><b>穿衣与随身</b><p>${esc(day.clothing)}</p><small>随身：${esc(day.carry)}</small><p><a href="#weather">查看天气资料与穿衣参考 ↗</a></p></div></div></div>${photos.length ? `<div class="photo-grid count-${photos.length}">${photos.map(spotCard).join('')}</div>` : ''}${stops.map(spot => `<div class="stop-text"><b>${esc(spot.name)} · ${esc(spot.duration)}</b><p>${esc(spot.play)}</p></div>`).join('')}${hotelStrip(day)}<div class="schedule" aria-label="${esc(day.day)} 时间安排">${day.schedule.map(row => `<div class="schedule-row"><time>${esc(row[0])}</time><h4>${esc(row[1])}</h4><p>${esc(row[2])}</p></div>`).join('')}</div><div class="day-decision"><b>当天取舍</b><p>${esc(day.decision)}</p></div></article>`;
  }).join('')}</div>`;
  let dailyMarkdown = '## 每日行程\n\n住宿按实际记录确认；景点玩法和时间窗为路线资料，未逐项确认是否到访。\n\n';
  for (const day of days) {
    dailyMarkdown += `### ${day.day} · ${day.date} ${day.weekday}｜${day.title}\n\n${day.route.join(' → ')}\n\n${day.drive}${day.metricNote ? '。' + day.metricNote : ''}\n\n穿衣：${day.clothing}\n\n随身：${day.carry}\n\n`;
    for (const key of day.spots || []) {
      const spot = spots[key];
      if (!spot) continue;
      const asset = findPhoto(spot.name);
      dailyMarkdown += `#### ${spot.name}｜${spot.priority} · ${spot.duration}\n\n${spot.play}\n\n${photoMarkdown(asset, spot.name)}${imageContext(asset) ? imageContext(asset) + '\n\n' : ''}[小红书搜索入口](https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(spot.name + ' 攻略')})\n\n`;
      if (asset?.requiresPermission) dailyMarkdown += `[原文看图](${asset.sourceUrl})；图片需转载授权。\n\n`;
    }
    const stay = actualStay(day);
    if (stay) {
      dailyMarkdown += `#### 当晚住宿｜${stay.hotel}\n\n${stay.checkin} 入住—${stay.checkout} 退房；${stay.status}。\n\n${staySummary(stay).replaceAll('\n', '；')}\n\n早餐：${stay.breakfast || '未提供'}。${stay.address ? '\n\n地址：' + stay.address : ''}\n\n`;
      for (const {asset, label} of hotelPhotos(stay)) dailyMarkdown += `**${label}**\n\n${usablePhoto(asset) ? photoMarkdown(asset, `${stay.hotel} · ${label}`) : '图片待核实：尚无可确认对应酒店与房型的实拍资料。\n\n'}`;
    }
    dailyMarkdown += '| 时间窗 | 安排 | 说明 |\n| --- | --- | --- |\n' + day.schedule.map(row => '| ' + row.map(md).join(' | ') + ' |').join('\n') + `\n\n**当天取舍：** ${day.decision}\n\n`;
  }

  const priorities = [
    {category: '雪山与冰川 · 9/26—28', keep: '鲁日拉、加乌拉与珠峰的代表性视角', optional: '卡若拉深入、珠峰古堡久停、云雾中长时间等候', reason: '前段安排以短停为主。珠峰自驾到环保车换乘中心，景区接驳和游览另留时间；9/28 后半程还要衔接萨嘎住宿。'},
    {category: '萨嘎到措勤 · 9/29', keep: 'G216 主路转场、沿途正规停车点与补给', optional: '达格架喷泉、草帽山等额外支线', reason: '本版高德路线为萨嘎如家直达措勤锦江之星，286.6 公里。增加景点支线时需要另算导航，不能仍用直达里程。'},
    {category: '湖景与村落 · 9/30', keep: '扎日南木措北岸、文布南村与当惹雍错', optional: '重复湖岸机位、未经核实的湖滨近路', reason: '当晚实际住琼宗湖景驿站。北岸短停后把时间留给到村、湖畔慢走与休息，次日再经尼玛去班戈。'},
    {category: '羌塘湖群 · 10/1', keep: '色林措一个正式开放观景点', optional: '大地之树、恰归错及长距离湖岸支线', reason: '文布南村经尼玛到班戈当天已列路线为 453.1 公里。新增机位不能挤占转场余量；实际住宿以华庭酒店收尾。'},
    {category: '纳木措体验 · 10/2', keep: '纳木措开放观景区与圣象天门二选一', optional: '扎西岛与圣象天门同日深游、北岸新增过夜', reason: '当天回拉萨如家。当前主汇总按纳木措游客集散中心 377.7 公里；圣象天门停车场替代路线为 490.2 公里，选用时同步替换概览中的全程合计。'},
    {category: '拉萨人文与返程 · 10/3—4', keep: '有有效预约的市区参观、休息、值机与还车准备', optional: '雪城附加线路、远郊景点与临时赶场', reason: '10/3 住拉萨如家，10/4 乘 TV9949 返杭州。布达拉宫主体与雪城分开售票；按已取得的预约排参观，再按新票面起飞时刻安排机场交通。'},
  ];
  const choicesHtml = `<div class="choices-grid" id="choices-content">${priorities.map(item => `<article class="choice-card"><h3>${esc(item.category)}</h3><strong>优先保留</strong><b>${esc(item.keep)}</b><p><strong>可以舍弃 / 压缩</strong>${esc(item.optional)}</p><p>${esc(item.reason)}</p></article>`).join('')}</div>`;
  const choicesMarkdown = '## 景点取舍\n\n' + priorities.map(item => `### ${item.category}\n\n优先保留：${item.keep}。\n\n可以舍弃 / 压缩：${item.optional}。\n\n${item.reason}\n\n`).join('');

  const ticketDates = new Map([
    ['鲁日拉观景台', '09.26 · D1'], ['卡若拉冰川', '09.26 · D1'], ['珠峰景区与观光车', '09.28 · D3'],
    ['扎日南木措、当惹雍错与色林措', '09.30—10.01 · D5—D6'], ['纳木措扎西岛', '10.02 · D7'],
    ['圣象天门（条件性备选）', '10.02 · D7'], ['布达拉宫主体参观', '10.03 · D8（须有有效预约）'], ['大昭寺', '10.03 · D8（须有有效预约）'],
  ]);
  const tickets = research.tickets.filter(ticket => ticketDates.has(ticket.name)).map(ticket => {
    const adapted = {...ticket, day: ticketDates.get(ticket.name)};
    if (ticket.name === '布达拉宫主体参观') {
      adapted.booking = '按官方小程序的可预约日期和时段安排 10/3 参观，实际预约与余票未在本次更新中核验';
      adapted.note = '原攻略引用 2026 年 7 月预约指引及 9 月恢复周一闭馆公告，法定节假日安排以官方系统为准。资料中的预约提前天数与开馆时间需对应出行日期；10/3 是否参观以有效预约为准。雪城票不包含宫殿主体。';
    }
    if (ticket.name === '扎日南木措、当惹雍错与色林措') adapted.note = '旧景区简介不能证明每个湖岸都可自由进入。9/30 安排扎日南木措北岸、文布南村与当惹雍错，10/1 途经色林措；各入口分别确认停车、村道服务费与保护区要求。';
    const source = (research.sources || []).find(item => item.url === ticket.url);
    adapted.sourceDate = source?.date || '原攻略资料，发布日期见原文';
    return adapted;
  });
  const ticketIntro = '沿用老攻略的票务字段，按本版游览日期排列。以下为原资料与历史价格，本次没有重新核实收费、余票或运营；各来源日期保留原值。';
  const ticketsHtml = `<div class="editor-note"><b>购票口径</b><p>${esc(ticketIntro)}</p></div><div class="ticket-list" id="tickets-content">${tickets.map(ticket => `<article class="ticket-card"><span class="date-day">${esc(ticket.day)}</span><h3>${esc(ticket.name)}</h3><dl><dt>提前</dt><dd>${esc(ticket.booking)}</dd><dt>价格</dt><dd>${esc(ticket.price)}</dd><dt>渠道</dt><dd>${esc(ticket.channel)}</dd></dl><details><summary>开放、历史票价与行程提醒</summary><p>${esc(ticket.note)}</p></details><p class="micro">原资料日期：${esc(ticket.sourceDate)}</p>${link(ticket.url, '原资料来源 ↗')}</article>`).join('')}</div>`;
  const ticketsMarkdown = `## 购票与预约\n\n${ticketIntro}\n\n` + tickets.map(ticket => `### ${ticket.day}｜${ticket.name}\n\n提前：${ticket.booking}\n\n价格：${ticket.price}\n\n渠道：${ticket.channel}\n\n${ticket.note}\n\n原资料日期：${ticket.sourceDate}。[原资料来源](${ticket.url})\n\n`).join('');

  const notes = research.notes.map(note => {
    if (note.title.startsWith('边境通行证：')) return {...note, text: '原攻略引用 2026-04-14 电子边境通行证服务指南（4 月 15 日起施行）。按康马、定日珠峰、萨嘎及实际通行县域核对有效期和覆盖范围；办理条件、未成年人材料与通行范围向受理机构或 12367 确认。'};
    if (note.title.startsWith('圣象天门9月26日')) return {...note, text: '原 9 月 26 日公告记载景区雪后恢复开园；施工绕行与出园衔接另按对应公告判断。10/2 的纳木措方案选择影响停车点、驾驶距离和返拉时间，概览同时保留主路线与圣象天门替代路线。具体道路资料见本章路况记录。'};
    if (note.title.startsWith('布达拉宫：')) return {...note, text: '原 2026-09-16 公告区分雪城线路与宫殿主体；雪城另售门票，游览范围不含主体。10/3 若参观主体，核对手中凭证的一号线或二号线、入场时段及证件信息；雪城仅在时间允许时增加。'};
    if (note.title === '10.06保留拉萨预约日') return {...note, title: '10/3 留给拉萨，10/4 返杭州', text: '10/2—4 实际住宿为拉萨如家酒店·neo（布达拉宫广场店）。10/3 按有效预约安排市区参观，并完成行李、值机、加油与还车准备；10/4 乘 TV9949，按改期后的票面时刻倒推离店，酒店退房权益不作为机场出发时间。'};
    if (note.title === '旧优惠、旧开放公告不等于本次承诺') return {...note, text: '卡若拉历史免费公告、纳木措高考季优惠及各类援藏免票有各自适用时段与资格。本版保留原价格来源；结算以实际购买项目和票据为准，旧公告不直接用于扣减本次费用。'};
    return {...note};
  });
  const notesHtml = `<div class="notes-grid" id="notes-content">${notes.map(note => `<article class="note-card"><h3>${esc(note.title)}</h3><p>${esc(note.text)}</p>${link(note.url, '原官方资料 ↗')}</article>`).join('')}</div>`;
  const notesMarkdown = '## 行前提醒\n\n' + notes.map(note => `### ${note.title}\n\n${note.text}\n\n[原官方资料](${note.url})\n\n`).join('');

  return {dailyHtml, dailyMarkdown, choicesHtml, choicesMarkdown, ticketsHtml, ticketsMarkdown, notesHtml, notesMarkdown};
}
