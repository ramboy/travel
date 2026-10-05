/** Shared hotel information for the two revised guides. No booking mutations. */
const MISSING = '未提供';
const COLUMNS = [
  ['checkin', '入住日'], ['span', '晚数 / 间数'], ['place', '地点'],
  ['hotel', '酒店名'], ['price', '单间价格'], ['room', '房型'],
  ['cancel', '可取消时间'], ['area', '面积'], ['bed', '床型'],
  ['oxygen', '供氧方式'], ['breakfast', '早餐'],
];
const value = item => item === undefined || item === null || String(item).trim() === '' ? MISSING : String(item);
const escapeHtml = item => String(item ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const htmlLines = item => escapeHtml(value(item)).replaceAll('\n', '<br>');
const markdown = item => escapeHtml(value(item)).replaceAll('|', '&#124;').replaceAll('\n', '<br>');
const money = amount => Number.isFinite(amount) ? '¥' + amount.toLocaleString('en-US', {maximumFractionDigits: 2}) : MISSING;
const positive = item => Number.isFinite(Number(item)) && Number(item) > 0 ? Number(item) : null;
const amountValue = item => item !== null && item !== undefined && item !== '' && Number.isFinite(Number(item)) ? Number(item) : null;
const shortDate = date => /^\d{4}-\d{2}-\d{2}$/.test(date || '') ? date.slice(5).replace('-', '.') : value(date);
const safeUrl = url => typeof url === 'string' && /^https?:\/\//i.test(url) ? url : '';
const mediaUrl = (media, hotel) => safeUrl(media?.hotels?.[hotel]?.url);

/**
 * Each row is one displayed hotel/room entry. amount is the entire room-row
 * amount, total is the stay total, and unitAmount = amount / count / nights.
 * Historical rows preserve original information. Candidate rows carry no old
 * price, cancellation terms, room count or room configuration.
 */
export function hotelInformationRows(plan = {}, base = {}, hotelMedia = {}) {
  const year = /^\d{4}/.exec(plan.meta?.startDate || '')?.[0] || '2026';
  const ids = new Map();
  const rows = [];
  for (const hotel of base.hotels || []) {
    const match = /^(09)\.(25|26|27|28)$/.exec(hotel.checkin || '');
    if (!match) continue;
    const checkin = `${year}-${match[1]}-${match[2]}`;
    const key = `${checkin}:${hotel.hotel}`;
    if (!ids.has(key)) ids.set(key, `original-${checkin.replaceAll('-', '')}-${ids.size + 1}`);
    rows.push({
      stayId: ids.get(key), origin: 'historical', checkin, checkout: '',
      span: value(hotel.span), place: value(hotel.place), hotel: value(hotel.hotel),
      hotelUrl: mediaUrl(hotelMedia, hotel.hotel), price: value(hotel.price), priceNote: '',
      room: value(hotel.room), cancel: value(hotel.cancel), area: value(hotel.area),
      bed: value(hotel.bed), oxygen: value(hotel.oxygen), breakfast: value(hotel.breakfast),
      status: '原订单信息，未确认入住', source: '原攻略订单资料',
      paymentStatus: '', address: hotel.address || '', checkinTime: '', checkoutTime: '',
      features: '', details: hotel.roomNote || '',
      notes: [hotel.stayNote, hotel.alert ? `原记录：${hotel.alert}` : ''].filter(Boolean),
      nights: null, count: null, amount: null, total: null, unitAmount: null,
    });
  }

  for (const stay of plan.confirmedStays || []) {
    if (!stay.checkin || stay.checkin < `${year}-09-29` || stay.checkin > `${year}-10-03` || /已取消/.test(stay.status || '')) continue;
    const nights = positive(stay.nights);
    const total = amountValue(stay.total);
    const roomEntries = stay.rooms?.length ? stay.rooms : [{}];
    for (const room of roomEntries) {
      const count = positive(room.count);
      const amount = amountValue(room.amount);
      const unitAmount = amount !== null && nights && count ? amount / nights / count : null;
      const split = Boolean(nights && count && nights * count > 1);
      const scope = room.amountLabel || (count && nights ? `${count} 间 × ${nights} 晚订单总额` : '本房型订单总额');
      const priceParts = amount !== null ? [`${scope} ${money(amount)}`] : [];
      if (roomEntries.length > 1 && total !== null) priceParts.push(`本酒店合计 ${money(total)}`);
      if (stay.paymentStatus) priceParts.push(stay.paymentStatus);
      rows.push({
        stayId: value(stay.id), origin: 'confirmed', checkin: stay.checkin, checkout: stay.checkout || '',
        span: `${nights ?? MISSING} 晚 / ${count ?? MISSING} 间`,
        place: value(stay.place), hotel: value(stay.hotel), hotelUrl: mediaUrl(hotelMedia, stay.hotel),
        price: unitAmount === null ? MISSING : `${money(unitAmount)} / 间 / 晚${split ? '（均摊）' : ''}`,
        priceNote: priceParts.join('\n'), room: value(room.name), cancel: value(stay.cancellation),
        area: value(room.area), bed: value(room.bed), oxygen: value(room.oxygen),
        breakfast: value(stay.breakfast), status: value(stay.status), source: value(stay.source),
        paymentStatus: stay.paymentStatus || '', address: stay.address || '',
        checkinTime: stay.checkinTime || '', checkoutTime: stay.checkoutTime || '',
        features: room.features || '', details: room.details || '', notes: [],
        nights, count, amount, total, unitAmount,
      });
    }
  }

  const candidateName = '尚客优酒店（那曲尼玛县政府客运站店）';
  rows.push({
    stayId: 'nima-shangkeyou-20260930-candidate', origin: 'candidate',
    checkin: `${year}-09-30`, checkout: '', span: '1 晚（计划） / 间数未提供',
    place: '尼玛县', hotel: candidateName, hotelUrl: mediaUrl(hotelMedia, candidateName),
    price: MISSING, priceNote: '', room: MISSING, cancel: MISSING, area: MISSING,
    bed: MISSING, oxygen: MISSING, breakfast: MISSING,
    status: '住宿候选，未确认订单或入住', source: '9 月 30 日路线住宿候选',
    paymentStatus: '', address: '', checkinTime: '', checkoutTime: '',
    features: '', details: '', notes: [], nights: 1, count: null,
    amount: null, total: null, unitAmount: null,
  });
  return rows.sort((a, b) => a.checkin.localeCompare(b.checkin));
}

function cellParts(row, key) {
  if (key === 'checkin') return [shortDate(row.checkin),
    row.checkout ? `${shortDate(row.checkout)} 退房` : '',
    row.checkinTime ? `入住 ${row.checkinTime}` : '',
    row.checkoutTime ? `退房 ${row.checkoutTime}` : ''].filter(Boolean);
  if (key === 'hotel') return [row.hotel, row.status, row.source, row.address, ...(row.notes || [])].filter(Boolean);
  if (key === 'price') return [row.price, row.priceNote].filter(Boolean);
  if (key === 'room') return [row.room, row.features, row.details].filter(Boolean);
  return [value(row[key])];
}

function cellHtml(row, key) {
  const [first, ...rest] = cellParts(row, key);
  const content = key === 'hotel' && safeUrl(row.hotelUrl)
    ? `<a class="hotel-information-link" href="${escapeHtml(row.hotelUrl)}" target="_blank" rel="noopener noreferrer">${htmlLines(first)}</a>`
    : htmlLines(first);
  const lead = ['checkin', 'hotel', 'price'].includes(key) ? `<strong>${content}</strong>` : content;
  return lead + rest.map(text => `<small>${htmlLines(text)}</small>`).join('');
}

export function hotelInformationHtml(rows = []) {
  const seen = new Set();
  const body = rows.map(row => {
    const id = seen.has(row.stayId) ? '' : ` id="stay-${escapeHtml(row.stayId)}"`;
    seen.add(row.stayId);
    return `<tr${id} data-stay-id="${escapeHtml(row.stayId)}" data-checkin="${escapeHtml(row.checkin)}" data-origin="${escapeHtml(row.origin)}">${COLUMNS.map(([key]) => `<td data-col="${key}" data-field="${key}">${cellHtml(row, key)}</td>`).join('')}</tr>`;
  }).join('');
  return `<div class="hotel-information"><p class="hotel-information-help">按入住日期排列；可左右滑动查看全部 11 列。原订单信息与住宿候选均保留状态标注，缺失字段显示“未提供”。多间多晚的单间价格按订单总额均摊。</p><div class="hotel-information-scroll" tabindex="0" role="region" aria-label="可横向滚动的酒店信息表"><table class="hotel-information-table hotel-table"><caption>酒店信息 · 房型、价格与服务</caption><colgroup>${COLUMNS.map(([key]) => `<col class="hotel-information-col-${key}">`).join('')}</colgroup><thead><tr>${COLUMNS.map(([, title]) => `<th scope="col">${title}</th>`).join('')}</tr></thead><tbody>${body}</tbody></table></div></div>`;
}

export function hotelInformationMarkdown(rows = []) {
  const header = `| ${COLUMNS.map(([, title]) => title).join(' | ')} |\n| ${COLUMNS.map(() => '---').join(' | ')} |\n`;
  const body = rows.map(row => `| ${COLUMNS.map(([key]) => cellParts(row, key).map(markdown).join('<br>')).join(' | ')} |`).join('\n');
  return '原订单信息与住宿候选保留状态标注；缺失字段为“未提供”。多间多晚单间价格按订单总额均摊。\n\n' + header + body + '\n';
}
