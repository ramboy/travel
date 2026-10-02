const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const md=value=>String(value??'').replaceAll('|','\\|').replaceAll('\n','<br>');
const money=value=>'¥'+Number(value).toLocaleString('en-US',{maximumFractionDigits:2});
const details=h=>[
  h.address&&['地址',h.address],
  h.paymentStatus&&['付款状态',h.paymentStatus],
  (h.checkinTime||h.checkoutTime)&&['入住 / 退房时间',`${h.checkinTime||'待确认'} / ${h.checkoutTime||'待确认'}`],
  h.breakfast&&['早餐',h.breakfast],
  h.cancellation&&['取消规则',h.cancellation],
].filter(Boolean);

export function confirmedStayHtml(h){
  return `<article class="confirmed-stay notice" id="stay-${esc(h.id)}" data-stay-id="${esc(h.id)}"><span class="pill">${esc(h.status)} · ${esc(h.source)}</span><h3>${esc(h.hotel)}</h3><p>${esc(h.checkin)} 入住 → ${esc(h.checkout)} 退房 · ${h.nights} 晚 · ${h.rooms.reduce((sum,r)=>sum+r.count,0)} 间 · <strong>订单合计 ${money(h.total)}</strong></p><div class="table-wrap"><table class="confirmed-room-table"><thead><tr><th>房型</th><th>间数</th><th>金额与范围</th><th>房间信息</th></tr></thead><tbody>${h.rooms.map(r=>`<tr><td>${esc(r.name)}</td><td>${r.count} 间</td><td>${money(r.amount)}<small>${esc(r.amountLabel||`${r.count}间 × ${h.nights}晚，该行合计`)}</small></td><td>${esc(r.features)}${r.details?`<small>${esc(r.details)}</small>`:''}</td></tr>`).join('')}</tbody></table></div>${details(h).length?`<dl class="booking-meta">${details(h).map(([label,text])=>`<div><dt>${label}</dt><dd>${esc(text)}</dd></div>`).join('')}</dl>`:''}<p class="stay-note">${esc(h.note)}</p></article>`;
}

export function confirmedStayMarkdown(h){
  let text=`### ${h.hotel} · ${h.status}\n\n${h.checkin} 入住 → ${h.checkout} 退房；${h.nights} 晚 ${h.rooms.reduce((sum,r)=>sum+r.count,0)} 间，订单合计 **${money(h.total)}**。来源：${h.source}。\n\n| 房型 | 间数 | 金额与范围 | 房间信息 |\n| --- | --- | --- | --- |\n`;
  for(const r of h.rooms)text+=`| ${md(r.name)} | ${r.count} 间 | ${money(r.amount)}；${md(r.amountLabel||`${r.count}间 × ${h.nights}晚，该行合计`)} | ${md(r.features)}${r.details?'<br>'+md(r.details):''} |\n`;
  text+='\n'+details(h).map(([label,value])=>`- **${label}：** ${value}`).join('\n')+`\n\n${h.note}\n\n`;
  return text;
}
