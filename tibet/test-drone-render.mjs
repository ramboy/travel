// Offline template checks; synthetic evidence is never written to the source data.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const html=read('tibet-guide.html');
const scripts=[...html.matchAll(/<script src="([^"]+)"/g)].map(m=>m[1]);
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
function render(evidence){
  const elements=new Map(ids.map(id=>[id,{innerHTML:'',textContent:'',addEventListener(){}}]));
  const context={window:{},document:{getElementById:id=>elements.get(id)||null,querySelectorAll:()=>[]}};
  vm.createContext(context);
  for(const script of scripts){
    if(script==='guide-drone.js'&&evidence)context.window.TIBET_DRONE_EVIDENCE=evidence;
    vm.runInContext(read(script),context,{filename:script});
  }
  return {drone:context.window.TIBET_DRONE,content:elements.get('drone-content').innerHTML,stamp:elements.get('drone-stamp').innerHTML};
}
assert.ok(scripts.indexOf('guide-drone-evidence.js')<scripts.indexOf('guide-drone.js'),'evidence loads before the data model');
const current=render();
assert.equal([...current.content.matchAll(/data-drone-id=/g)].length,current.drone.rows.length);
const count=current.drone.rows.filter(row=>row.uom.colorVerified===true).length;
assert.ok(current.stamp.includes(`${count} 条 UOM 颜色已核验`),'page count follows complete observations');
for(const row of current.drone.rows.filter(row=>row.uom.observation)){
  assert.ok(current.content.includes('drone-observation'),'raw point evidence is rendered');
  assert.ok(current.content.includes(row.uom.observation.observedAt),'actual evidence date remains visible');
}
const source={title:'Synthetic UOM source',url:'https://uom.caac.gov.cn/#/main'};
const legend={verified:false,colorsVerified:true,observedAt:'2026-09-24',note:'Synthetic observed swatches only',sources:[source]};
const observation={rowId:'drone-karola',status:'white',queryText:'Synthetic query',matchedResult:'Synthetic result',zoom:15,observedAt:'2026-09-24',note:'Synthetic point without blue coverage',sources:[source]};
const white=render({legend,observations:[observation]});
assert.ok(white.stamp.includes('1 条 UOM 颜色已核验'),'raw white counts even with legal meaning unverified');
assert.ok(white.content.includes('data-uom-status="white"'));
assert.ok(white.content.includes('白区不自动等同法定管制区或可飞区'));
for(const value of [observation.queryText,observation.matchedResult,String(observation.zoom),observation.observedAt,observation.note])assert.ok(white.content.includes(value));
assert.ok(white.content.includes('实际起飞点和计划飞行范围仍需复查'));
const blue=render({legend,observations:[{...observation,status:'blue'}]});
assert.ok(blue.content.includes('data-uom-status="blue"'));
const mixed=render({legend,observations:[{...observation,status:'mixed'}]});
assert.ok(mixed.content.includes('data-uom-status="mixed"'));
const partial=render({legend,observations:[{...observation,zoom:8}]});
assert.ok(partial.stamp.includes('0 条 UOM 颜色已核验'));
assert.ok(!partial.content.includes('data-uom-status="white"'));
const missing=render({legend:{...legend,colorsVerified:false},observations:[observation]});
assert.ok(missing.stamp.includes('0 条 UOM 颜色已核验'));
assert.ok(!missing.content.includes('data-uom-status="white"'));
const attempted=render({legend,observations:[{...observation,rowId:'drone-lurila',status:'unverified',matchedResult:'Synthetic candidates do not identify the itinerary point',zoom:null,note:'Synthetic unsuccessful point lookup'}]});
const attemptedRow=attempted.drone.rows.find(row=>row.id==='drone-lurila');
assert.equal(attemptedRow.uom.status,'unverified');
assert.equal(attemptedRow.uom.label,'已尝试查询 · 点位待确认');
assert.equal(attemptedRow.uom.checkedAt,'','attempt date is not a successful color verification');
assert.equal(attemptedRow.uom.attempt,undefined,'a fresh attempt also supersedes stale legacy attempt details');
assert.ok(attempted.stamp.includes('0 条 UOM 颜色已核验'));
for(const text of ['已尝试查询 · 点位待确认','尝试日期：2026-09-24','Synthetic query','Synthetic candidates do not identify the itinerary point','Synthetic unsuccessful point lookup'])assert.ok(attempted.content.includes(text),'unsuccessful lookup metadata stays visible');
assert.ok(!attempted.content.includes('颜色核验：2026-09-24'),'attempt timestamp is never labeled a successful color check');
const confirmedAfterAttempt=render({legend,observations:[{...observation,rowId:'drone-lurila',status:'blue'}]});
assert.equal(confirmedAfterAttempt.drone.rows.find(row=>row.id==='drone-lurila').uom.attempt,undefined,'successful evidence clears the old blurry screenshot attempt');
assert.ok(!confirmedAfterAttempt.content.includes('缩小的倾斜窗口'),'stale visual blocker is not shown after successful verification');
const escaped=render({legend,observations:[{...observation,queryText:'<script>synthetic</script>'}]});
assert.ok(escaped.content.includes('&lt;script&gt;synthetic&lt;/script&gt;'));
assert.ok(!escaped.content.includes('<script>synthetic</script>'));
console.log('Offline drone template regression passed: current evidence, raw blue/white/mixed, incomplete evidence, missing swatch verification, unsuccessful lookup display, superseded attempts, and escaped metadata. No browser or visual layout test.');
