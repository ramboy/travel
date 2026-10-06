/** Render the dated AMap evidence without substituting estimates for missing days. */
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const km = value => Number(value).toLocaleString('en-US', {minimumFractionDigits:1, maximumFractionDigits:1});
export function mileageSummary(evidence, days) {
  const records = new Map(evidence.days.map(day => [day.date, day]));
  if (records.size !== evidence.days.length) throw new Error('Duplicate mileage date');
  for (const record of evidence.days) {
    if (!days.some(day => day.date === record.date) || !Number.isFinite(record.km) || record.km < 0 || !record.url?.startsWith('https://www.amap.com/')) throw new Error(`Invalid mileage record: ${record.date}`);
  }
  const total = Math.round(evidence.days.reduce((sum, day) => sum + day.km * 10, 0)) / 10;
  const airport = Math.round(evidence.days.filter(day => ['2026-09-25','2026-10-04'].includes(day.date)).reduce((sum, day) => sum + day.km * 10, 0)) / 10;
  return {rows:days.map(day => ({date:day.date, stay:day.stay, ...records.get(day.date)})), total, airport, loop:Math.round((total-airport)*10)/10};
}
const notes = evidence => [evidence.scope.basis, evidence.scope.october2, evidence.scope.airport, evidence.scope.october3, evidence.scope.shuttle].filter(Boolean);
function alternateTotals(evidence, total) {
  return (evidence.alternatives || []).map(option => {
    const replaced = evidence.days.find(day => day.date === option.date);
    if (!replaced || !Number.isFinite(option.km) || !option.url.startsWith('https://www.amap.com/')) throw new Error('Invalid alternate mileage');
    return {...option, total:Math.round((total - replaced.km + option.km)*10)/10};
  });
}
export function drivingMileageHtml(evidence, days) {
  const summary = mileageSummary(evidence, days);
  return `<p><b>已列路线合计 ${km(summary.total)} 公里</b> · 含机场往返 ${km(summary.airport)} 公里；不含机场的环线 ${km(summary.loop)} 公里。</p><p class="muted">高德查询日期：${esc(evidence.query_date)}。${notes(evidence).map(esc).join('；')}。</p><div class="table-wrap" tabindex="0" aria-label="每日高德驾车公里数"><table class="mileage-table"><thead><tr><th>日期</th><th>导航路线</th><th>公里数</th><th>高德依据</th></tr></thead><tbody>${summary.rows.map(row => `<tr><td>${esc(row.date.slice(5))}</td><td>${row.route ? esc(row.route.join(' → ')) : '拉萨市区活动，未提供完整驾车路线'}</td><td>${Number.isFinite(row.km) ? km(row.km) : '未计入'}</td><td>${row.url ? `<a href="${esc(row.url)}" target="_blank" rel="noopener noreferrer">查看路线 ↗</a><small>${esc(row.note)}</small>` : '不以 0 公里代替未知里程'}</td></tr>`).join('')}</tbody><tfoot><tr><th colspan="2">已列路线合计</th><th>${km(summary.total)} 公里</th><td>按高德显示的 0.1 公里数值相加</td></tr></tfoot></table></div>${alternateTotals(evidence,summary.total).map(option=>`<p class="muted"><b>${esc(option.label)}：</b>当天 ${km(option.km)} 公里，替换后全程 ${km(option.total)} 公里。<a href="${esc(option.url)}" target="_blank" rel="noopener noreferrer">查看高德路线 ↗</a><br>${esc(option.note)}</p>`).join('')}`;
}
export function drivingMileageMarkdown(evidence, days) {
  const summary = mileageSummary(evidence, days);
  return `## 每日自驾公里数\n\n高德查询日期：${evidence.query_date}。${notes(evidence).join('；')}。\n\n| 日期 | 导航路线 | 公里数 | 依据 |\n| --- | --- | ---: | --- |\n${summary.rows.map(row => `| ${row.date} | ${row.route?.join(' → ') || '拉萨市区活动，路线未提供'} | ${Number.isFinite(row.km) ? km(row.km) : '未计入'} | ${row.url ? `[高德路线](${row.url})` : '不按 0 公里处理'} |`).join('\n')}\n| **合计** | **已列路线** | **${km(summary.total)}** | 当前导航规划 |\n\n其中机场往返 ${km(summary.airport)} 公里，不含机场的环线 ${km(summary.loop)} 公里。\n\n${alternateTotals(evidence,summary.total).map(option=>`**${option.label}**：当天 ${km(option.km)} 公里，替换后全程 **${km(option.total)} 公里**。[高德路线](${option.url})。${option.note}\n\n`).join('')}${evidence.days.map(row=>`- ${row.date}：${row.note}`).join('\n')}\n\n`;
}
