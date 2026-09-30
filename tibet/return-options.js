const plans=[...document.querySelectorAll('.plan')];
const controls=document.querySelector('.plan-controls');
const buttons=[...document.querySelectorAll('[data-filter]')];
const status=document.querySelector('#view-status');
let current='all';
function selectPlan(id){
  if(id!=='all'&&!plans.some(p=>p.id===id))return;
  current=id;
  for(const p of plans)p.hidden=id!=='all'&&p.id!==id;
  for(const b of buttons)b.setAttribute('aria-pressed',String(b.dataset.filter===id));
  status.textContent=id==='all'?'全部 4 套方案 · 点开每日详情查看时间安排':`正在查看方案 ${id.slice(-1)} · 其他方案可随时切换`;
}
function followHash(){
  const match=location.hash.match(/^#(plan-[1-4])(?:-|$)/);
  if(!match)return;
  selectPlan(match[1]);
  document.getElementById(location.hash.slice(1))?.scrollIntoView({block:'start'});
}
controls.hidden=false;
for(const b of buttons)b.addEventListener('click',()=>{
  selectPlan(b.dataset.filter);
  history.replaceState(null,'',b.dataset.filter==='all'?'#compare':`#${b.dataset.filter}`);
  document.getElementById(b.dataset.filter==='all'?'compare':b.dataset.filter)?.scrollIntoView({block:'start'});
});
document.addEventListener('click',event=>{
  const link=event.target.closest('a[href^="#plan-"]');
  if(!link)return;
  const match=link.hash.match(/^#(plan-[1-4])(?:-|$)/);
  if(match)selectPlan(match[1]);
});
window.addEventListener('hashchange',followHash);
followHash();
let printState=null;
window.addEventListener('beforeprint',()=>{
  if(printState)return;
  printState={selected:current,details:[...document.querySelectorAll('details')].map(el=>[el,el.open])};
  selectPlan('all');
  for(const [el] of printState.details)el.open=true;
});
window.addEventListener('afterprint',()=>{
  if(!printState)return;
  for(const [el,open] of printState.details)el.open=open;
  selectPlan(printState.selected);
  printState=null;
});
for(const button of document.querySelectorAll('.print-guide')){
  button.hidden=false;button.addEventListener('click',()=>window.print());
}
