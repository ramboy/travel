/* Progressive enhancement only: the complete guide is readable without JavaScript. */
const printButton = document.getElementById('print-guide');
printButton?.addEventListener('click', () => window.print());
const openedForPrint = [];
window.addEventListener('beforeprint', () => {
  document.querySelectorAll('details:not([open])').forEach(item => {
    openedForPrint.push(item);
    item.open = true;
  });
});
window.addEventListener('afterprint', () => {
  openedForPrint.splice(0).forEach(item => { item.open = false; });
});
document.querySelectorAll('img').forEach(img => {
  const fail = () => {
    if (img.nextElementSibling?.classList.contains('image-note')) return;
    img.hidden = true;
    const note = document.createElement('p');
    note.className = 'image-note';
    note.textContent = '图片暂未载入，可通过图片来源查看。';
    img.insertAdjacentElement('afterend', note);
  };
  img.addEventListener('error', fail);
  if (img.complete && !img.naturalWidth) fail();
});

// Match the original guide's current-chapter indicator without hiding static content.
const chapterLinks=[...document.querySelectorAll('.quick-nav a')];
if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>{
    for(const entry of entries)if(entry.isIntersecting){
      chapterLinks.forEach(link=>{
        const active=link.hash===`#${entry.target.id}`;
        link.classList.toggle('is-active',active);
        if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');
      });
    }
  },{rootMargin:'-90px 0px -68% 0px',threshold:0});
  document.querySelectorAll('main>section[id]').forEach(section=>observer.observe(section));
}
