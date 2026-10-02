import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import vm from 'node:vm';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const root = path.dirname(fileURLToPath(import.meta.url));
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const data = JSON.parse(read('guide-return-options.json'));
const html = read('tibet-return-options.html');
const markdown = read('tibet-return-options.md');
const ids = ['plan-1', 'plan-2', 'plan-3', 'plan-4'];
const dates = ['2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03'];
const normalize = value => String(value).replace(/\s+/g, ' ').trim();

assert.deepEqual(data.plans.map(plan => plan.id), ids, 'user plan plus three earlier alternatives remain distinct and ordered');
assert.deepEqual(data.plans.map(plan => plan.number), [1, 2, 3, 4]);
const sourceIds = new Set(data.sources.map(source => source.id));
assert.equal(sourceIds.size, data.sources.length, 'source IDs are unique');
for (const source of data.sources) {
  assert.ok(/^https?:\/\//.test(source.url), `${source.id}: source has an external URL`);
  assert.ok(source.kind && source.date && source.note, `${source.id}: provenance and its limits are stated`);
}
for (const plan of data.plans) {
  assert.deepEqual(plan.days.map(day => day.date), dates, `${plan.id}: all four dates are present`);
  assert.ok(plan.days[0].route[0].includes('措勤'), `${plan.id}: starts at the current overnight location`);
  assert.ok(plan.days.at(-1).stay.includes('拉萨'), `${plan.id}: returns to Lhasa on October 3`);
  assert.ok(plan.days.at(-1).route.at(-1).includes('拉萨'), `${plan.id}: final route agrees with final overnight`);
  assert.equal(plan.overnights.length, 4);
  assert.ok(plan.prerequisites.length && plan.bookingActions.length, `${plan.id}: conditions and hotel work remain explicit`);
  for (const day of plan.days) {
    assert.equal(day.weekday, ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][new Date(`${day.date}T12:00:00Z`).getUTCDay()], `${plan.id} ${day.date}: correct weekday`);
    assert.ok(day.route.length >= 2 && day.hotel && day.driving && day.decision);
    assert.ok(/原候选|订单|记录/.test(day.hotel), `${plan.id} ${day.date}: historical candidate or actual order is identified`);
    if(day.date==='2026-10-02'&&!day.stay.includes('拉萨'))assert.ok(day.hotel.includes('原候选'),`${plan.id}: superseded October 2 overnight is labelled as a historical candidate`);
    assert.ok(!/如家[^。；]*已入住/.test(day.hotel), `${plan.id} ${day.date}: payment does not imply Home Inn check-in`);
    assert.ok(day.schedule.length >= 2 && day.schedule.every(item => item.when && item.title && item.detail));
    assert.ok(day.priorities.length && day.cutFirst.length, `${plan.id} ${day.date}: executable choices are present`);
    for (const id of day.sourceIds || []) assert.ok(sourceIds.has(id), `${plan.id} ${day.date}: source ${id} exists`);
    for (const field of ['title', 'stay', 'hotel', 'driving', 'decision']) {
      assert.ok(markdown.includes(String(day[field]).replaceAll('|', '\\|')), `Markdown preserves ${plan.id} ${day.date} ${field}`);
    }
    assert.ok(markdown.includes(day.route.join(' → ')), `Markdown preserves ${plan.id} ${day.date} route order`);
  }
  assert.ok(markdown.includes(plan.title) && html.includes(plan.title), `${plan.id}: title agrees across artifacts`);
}
const context = { window: {} };
vm.createContext(context);
vm.runInContext(read('guide-cuoqin-plan.js'), context);
const stay = context.window.TIBET_CUOQIN_PLAN.confirmedStays.find(item => item.id === 'coqen-jinjiang-20260929');
const current = JSON.parse(JSON.stringify(context.window.TIBET_CUOQIN_PLAN));
const huating = current.confirmedStays.find(item => item.hotel.includes('华庭'));
const homeinn = current.confirmedStays.find(item => item.hotel.includes('如家') && item.hotel.includes('布达拉宫广场'));
assert.ok(huating && homeinn, 'actual-order summary includes the October 3 updates');
assert.ok(stay && stay.checkin === '2026-09-29' && stay.checkout === '2026-09-30' && stay.status === '已入住', 'starting overnight is historical and verified');
assert.equal(stay.total, 1056);
assert.deepEqual([huating.checkin,huating.checkout,huating.nights,huating.rooms.reduce((sum,room)=>sum+room.count,0),huating.total],['2026-10-01','2026-10-02',1,1,632]);
assert.deepEqual([homeinn.checkin,homeinn.checkout,homeinn.nights,homeinn.rooms.reduce((sum,room)=>sum+room.count,0),homeinn.total],['2026-10-02','2026-10-04',2,2,1932]);
assert.ok(huating.status.includes('已完成')&&/已扣款|扣款成功/.test(huating.paymentStatus));
assert.ok(homeinn.paymentStatus.includes('待扣款')&&homeinn.paymentStatus.includes('离店扣款'));
assert.ok(/未显示|未确认|未知/.test(`${homeinn.status} ${homeinn.note}`),'current check-in is not inferred from the order');
assert.equal(current.returnFlight.date,'2026-10-04');
assert.equal(current.returnFlight.number,'TV9949');
assert.equal(current.returnFlight.departureTime,null);
assert.equal(current.returnFlight.arrivalTime,null);
for (const artifact of [html, markdown]) {
  assert.ok(artifact.includes(stay.hotel) && artifact.includes('已入住') && /1,?056/.test(artifact), 'historical hotel and amount survive publication');
  assert.ok(artifact.includes('87.5') && artifact.includes('35.3'), 'the specific detour and unpaved portion survive publication');
  for(const record of [huating,homeinn]){
    assert.ok(artifact.includes(record.hotel)&&artifact.includes(record.status)&&artifact.includes(record.paymentStatus),'both artifacts publish each actual order status and payment separately');
    assert.ok(artifact.includes(record.breakfast||''),'both artifacts publish the same breakfast allowance');
    for(const room of record.rooms)assert.ok(artifact.includes(room.amountLabel),'both artifacts retain the room-price scope');
  }
}
assert.ok(data.plans[0].days.flatMap(day => day.route).some(place => place.includes('天空之树')), 'user option retains the correctly named tree stop');
assert.ok(!data.plans.flatMap(plan => plan.days).flatMap(day => day.route).some(place => place.includes('天空之书')), 'route stops do not use the incorrect tree name');
assert.ok(html.includes('return-options.css') && html.includes('return-options.js'));
assert.ok(markdown.length > 1000, 'Markdown contains the complete route comparison');
assert.equal(data.updatedAt,'2026-10-03');
assert.ok(data.statusNote.includes('候选')&&data.statusNote.includes('留档'),'all four alternatives are explicitly archived');
assert.ok(data.statusNote.includes('TV9949')&&/10\s*[/月]\s*4/.test(data.statusNote)&&data.statusNote.includes('杭州'),'latest return is October 4 to Hangzhou');
for(const artifact of [html,markdown])assert.ok(artifact.includes(data.statusNote),'both artifacts retain the current status summary');

if (process.env.GUIDE_DATA_ONLY === '1') {
  console.log('Return-options source and artifact checks passed.');
  process.exit(0);
}

const library = process.env.GUIDE_PLAYWRIGHT_PATH || path.join(os.homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const { chromium } = require(library);
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.GUIDE_CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
});
const localURL = pathToFileURL(path.join(root, 'tibet-return-options.html')).href;
const url = process.env.GUIDE_TEST_URL || localURL;
const output = fs.mkdtempSync(path.join(os.tmpdir(), 'tibet-return-options-qa-'));
const errors = [];
const results = [];
const screenshots = [];
const track = page => page.on('pageerror', error => errors.push(error.message));
const visiblePlans = page => page.locator('section.plan').evaluateAll(nodes => nodes
  .filter(node => !node.hidden && getComputedStyle(node).display !== 'none')
  .map(node => node.id));
const states = page => page.evaluate(() => ({
  plans: [...document.querySelectorAll('section.plan')].map(node => [node.id, node.hidden]),
  details: [...document.querySelectorAll('details.day-detail')].map(node => node.open)
}));

async function checkStructure(page, label) {
  assert.equal(await page.locator('.confirmed-stay').count(),current.confirmedStays.length,`${label}: actual orders are separate from route candidates`);
  for(const record of current.confirmedStays){
    const card=page.locator(`[data-stay-id="${record.id}"]`);
    const text=normalize(await card.innerText());
    for(const value of [record.hotel,record.checkin,record.checkout,record.status,record.paymentStatus,record.breakfast].filter(Boolean))assert.ok(text.includes(normalize(value)),`${label}: actual card preserves ${record.id} facts`);
    assert.ok(text.replaceAll(',','').includes(String(record.total)),`${label}: actual order total renders`);
    const rows=await card.locator('.confirmed-room-table tbody tr').allTextContents();
    assert.equal(rows.length,record.rooms.length);
    for(const room of record.rooms)assert.ok(rows.some(row=>row.includes(room.name)&&row.includes(`${room.count} 间`)&&row.replaceAll(',','').includes(String(room.amount))&&(!room.amountLabel||row.includes(room.amountLabel))),`${label}: room count is paired with total-price scope`);
    assert.ok(!/\d{12,}/.test(text),'public cards omit long order and payment-card numbers');
  }
  const returnText=await page.locator('#return-flight').innerText();
  assert.ok(returnText.includes('TV9949')&&returnText.includes('杭州')&&/10\s*(?:月|\/|\.|-)\s*0?4/.test(returnText),`${label}: October 4 return supersedes the earlier flight date`);
  assert.ok(/待确认|未提供|未确认/.test(returnText)&&!/10:55|16:55/.test(returnText),'new flight times remain unconfirmed');
  const hotelTables=await page.locator('.confirmed-room-table').evaluateAll(tables=>tables.map(table=>{
    const cell=table.tBodies[0]?.rows[0]?.cells[3],style=cell&&getComputedStyle(cell);
    return {table:table.getBoundingClientRect().width,container:table.parentElement.getBoundingClientRect().width,descriptionWidth:cell?cell.getBoundingClientRect().width-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight):0,fontSize:style?parseFloat(style.fontSize):0};
  }));
  assert.ok(hotelTables.every(size=>size.table<=size.container+1&&size.descriptionWidth>=4*size.fontSize),`${label}: room tables fit and description columns remain readable`);
  assert.deepEqual(await page.locator('section.plan').evaluateAll(nodes => nodes.map(node => node.id)), ids, `${label}: four ordered plans`);
  assert.equal(await page.locator('article.option-day').count(), 16, `${label}: four days per plan`);
  for (const id of ids) {
    assert.equal(await page.locator(`#${id}`).getAttribute('data-plan'), id);
    assert.deepEqual(await page.locator(`#${id} article.option-day`).evaluateAll(nodes => nodes.map(node => node.dataset.date)), dates, `${label}: continuous calendar for ${id}`);
    const plan = data.plans.find(item => item.id === id);
    for (const day of plan.days) {
      const card = page.locator(`#${id} article.option-day[data-date="${day.date}"]`);
      const text = normalize(await card.textContent());
      for (const field of ['title', 'stay', 'hotel', 'driving', 'decision']) assert.ok(text.includes(normalize(day[field])), `${label}: HTML preserves ${id} ${day.date} ${field}`);
      assert.equal(normalize(await card.locator('.day-route').textContent()), normalize(day.route.join(' → ')), `${label}: rendered route order agrees with data`);
      assert.equal(await card.locator('.schedule-row').count(), day.schedule.length, `${label}: complete daily schedule`);
    }
  }
  const allIds = await page.locator('[id]').evaluateAll(nodes => nodes.map(node => node.id));
  assert.equal(new Set(allIds).size, allIds.length, `${label}: anchor IDs are unique`);
  const broken = await page.locator('a[href^="#"]').evaluateAll(nodes => nodes
    .filter(node => node.hash && !document.getElementById(decodeURIComponent(node.hash.slice(1))))
    .map(node => node.hash));
  assert.deepEqual(broken, [], `${label}: internal links resolve`);
  assert.equal(await page.locator('#view-status').getAttribute('role'), 'status');
  assert.ok(await page.locator('.comparison-table').count(), `${label}: comparison is present`);
  assert.equal(await page.locator('details.day-detail').count(), 16, `${label}: all days retain details`);
}

async function checkNoOverflow(page, width, label) {
  const sizes = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth, body: document.body.scrollWidth }));
  assert.ok(sizes.document <= width + 1 && sizes.body <= width + 1, `${label}: no page overflow at ${width}px (${JSON.stringify(sizes)})`);
  return sizes;
}

async function screenshot(page, name) {
  const target = path.join(output, name);
  await page.screenshot({ path: target });
  screenshots.push(target);
}

try {
  for (const width of [360, 390, 768, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
    track(page);
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await checkStructure(page, `${width}px`);
    assert.equal(await page.locator('.plan-controls').getAttribute('hidden'), null, 'JavaScript enables filtering');
    assert.deepEqual(await visiblePlans(page), ids, 'all plans are initially readable');
    assert.ok((await page.locator('details.day-detail').evaluateAll(nodes => nodes.map(node => node.open))).every(open => !open), 'details begin collapsed');
    results.push({ width, initial: await checkNoOverflow(page, width, 'initial') });

    for (const id of ids) {
      await page.locator(`button[data-filter="${id}"]`).click();
      assert.deepEqual(await visiblePlans(page), [id], `${width}px: filter selects ${id}`);
      assert.equal(await page.locator(`button[data-filter="${id}"]`).getAttribute('aria-pressed'), 'true');
      assert.equal(await page.locator('.plan-controls button[aria-pressed="true"]').count(), 1, 'one filter is selected');
      assert.ok(normalize(await page.locator('#view-status').textContent()).length, 'filter change has a readable status');
      const detail = page.locator(`#${id} details.day-detail`).first();
      await detail.locator('summary').click();
      assert.equal(await detail.evaluate(node => node.open), true, `${id} detail expands`);
      assert.ok(await detail.locator(':scope > :not(summary)').first().isVisible(), `${id} detail content is visible`);
      await checkNoOverflow(page, width, `${id} expanded`);
      if (id === 'plan-1' && [390, 1440].includes(width)) await screenshot(page, `plan-1-expanded-${width}.png`);
      await detail.locator('summary').click();
      assert.equal(await detail.evaluate(node => node.open), false, `${id} detail collapses`);
    }
    await page.locator('button[data-filter="all"]').click();
    assert.deepEqual(await visiblePlans(page), ids, `${width}px: all filter restores every plan`);
    assert.equal(await page.locator('button[data-filter="all"]').getAttribute('aria-pressed'), 'true');
    if ([390, 1440].includes(width)) {
      await page.evaluate(() => scrollTo(0, 0));
      await screenshot(page, `overview-${width}.png`);
      for(const selector of [`#stay-${huating.id}`,`#stay-${homeinn.id}`,'#return-flight']){
        const target=path.join(output,`${selector.slice(1)}-${width}.png`);
        await page.locator(selector).screenshot({path:target});screenshots.push(target);
      }
    }
    await page.close();
  }

  const deep = await browser.newPage({ viewport: { width: 390, height: 1000 }, reducedMotion: 'reduce' });
  track(deep);
  for (const id of ids) {
    await deep.goto(`${url.split('#')[0]}#${id}`, { waitUntil: 'domcontentloaded' });
    assert.deepEqual(await visiblePlans(deep), [id], `direct #${id} selects only the requested plan`);
    assert.equal(await deep.locator(`button[data-filter="${id}"]`).getAttribute('aria-pressed'), 'true');
  }
  await deep.evaluate(() => { location.hash = 'plan-1'; });
  await deep.waitForFunction(() => !document.querySelector('#plan-1').hidden && document.querySelector('#plan-4').hidden);
  assert.deepEqual(await visiblePlans(deep), ['plan-1'], 'hash changes update the selected plan');
  await deep.close();

  const printing = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  track(printing);
  await printing.goto(`${url.split('#')[0]}#plan-2`, { waitUntil: 'domcontentloaded' });
  await printing.locator('#plan-2 details.day-detail').nth(1).locator('summary').click();
  const before = await states(printing);
  await printing.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
  assert.deepEqual(await visiblePlans(printing), ids, 'printing includes all plans even when one is filtered');
  assert.ok((await states(printing)).details.every(Boolean), 'printing expands all daily details');
  await printing.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
  await printing.emulateMedia({ media: 'print' });
  const tableSizes = await printing.locator('.table-wrap').evaluateAll(nodes => nodes.map(node => ({
    container: node.getBoundingClientRect().width,
    table: node.querySelector('table')?.getBoundingClientRect().width || 0
  })));
  assert.ok(tableSizes.every(size => size.table <= size.container + 1), 'print tables fit their containers');
  for (const id of ids) assert.ok(await printing.locator(`#${id}`).isVisible(), `print includes ${id}`);
  await printing.emulateMedia({ media: 'screen' });
  await printing.evaluate(() => window.dispatchEvent(new Event('afterprint')));
  assert.deepEqual(await states(printing), before, 'afterprint restores the exact filter and detail states');
  await printing.evaluate(() => window.dispatchEvent(new Event('afterprint')));
  assert.deepEqual(await states(printing), before, 'repeated afterprint is harmless');
  await printing.evaluate(() => { window.__printCalls = 0; window.print = () => { window.__printCalls++; }; });
  await printing.locator('button.print-guide').first().click();
  assert.equal(await printing.evaluate(() => window.__printCalls), 1, 'print control invokes browser printing');
  results.push({ printTables: tableSizes, printRestoresState: true });
  await printing.close();

  const noJS = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 1000 } });
  const plain = await noJS.newPage();
  track(plain);
  for (const target of [...new Set([url, localURL])]) {
    await plain.goto(target, { waitUntil: 'domcontentloaded' });
    await checkStructure(plain, 'no JavaScript');
    assert.deepEqual(await visiblePlans(plain), ids, 'without JavaScript all plans remain visible');
    assert.equal(await plain.locator('.plan-controls').isVisible(), false, 'inactive filters are hidden without JavaScript');
    const detail = plain.locator('#plan-1 details.day-detail').first();
    await detail.locator('summary').click();
    assert.ok(await detail.locator(':scope > :not(summary)').first().isVisible(), 'native details work without JavaScript');
    await detail.locator('summary').click();
    await plain.emulateMedia({ media: 'print' });
    for (const id of ids) assert.ok(await plain.locator(`#${id}`).isVisible(), `no-JS printing includes ${id}`);
    const hiddenPrintContent = await plain.locator('details.day-detail').evaluateAll(nodes => nodes
      .map((node, index) => ({ index, elements: [...node.children].filter(child => child.tagName !== 'SUMMARY') }))
      .filter(row => row.elements.some(child => !child.checkVisibility({ checkVisibilityCSS: true, checkOpacity: false })))
      .map(row => row.index));
    assert.deepEqual(hiddenPrintContent, [], 'no-JS printing exposes even initially collapsed daily content');
    await plain.emulateMedia({ media: 'screen' });
    await checkNoOverflow(plain, 390, 'no JavaScript');
  }
  await noJS.close();
  assert.deepEqual(errors, [], 'no browser runtime errors');
  console.log(JSON.stringify({ output, results, screenshots, errors, deepLinks: ids, noJSReadable: true }, null, 2));
} finally {
  await browser.close();
}
