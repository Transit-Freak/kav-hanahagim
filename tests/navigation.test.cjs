const test = require('node:test');
const assert = require('node:assert/strict');
const nav = require('../navigation.js');
test('known turn is visible 525m ahead, even when station is 720m away', () => {
  const total = 18787, stopF = .42316, driverF = stopF - 720 / total;
  const turn = nav.next(nav.prepare([{f:.41279,kind:'right'}]), driverF,total);
  assert.equal(turn.kind,'right'); assert(Math.abs(turn.meters - 525.17881)<.01);
});
test('no arbitrary lookahead cutoff, including intercity routes',()=>{
  assert.equal(nav.next(nav.prepare([{f:.9,kind:'left'}]),0,100000).meters,90000);
});
test('sort without mutating source and reject invalid instructions',()=>{
  const input=[{f:.8,kind:'right'},{f:NaN,kind:'left'},{f:.2,kind:'left'},{f:2,kind:'right'},{f:.3,kind:'bogus'}];
  assert.deepEqual(nav.prepare(input).map(x=>x.f),[.2,.8]);assert.equal(input[0].f,.8);
});
test('nearby opposite turns and roundabouts are not collapsed',()=>{
  const rows=nav.prepare([{f:.1,kind:'left'},{f:.11,kind:'right'},{f:.12,kind:'roundabout',exit:null}],1000);
  assert.equal(rows.length,3);assert.equal(nav.next(rows,.09,1000).kind,'left');
  assert.equal(nav.next(rows,.121,1000).kind,'right');
});
test('only identical duplicates removed; no guessed turns when none exist',()=>{
 const row={f:.2,kind:'right'}; assert.equal(nav.prepare([row,{...row}]).length,1);
 assert.equal(nav.next([],0,1000),null);assert.equal(nav.next([row],.3,1000),null);
});
test('prefer a supplied exit at the exact same position in either input order',()=>{
  const missing={f:.10731,kind:'roundabout',exit:null,name:'כיכר מאי 1945'};
  const known={f:.10731,kind:'roundabout',exit:2,name:'שדרות המייסדים'};
  for(const input of [[missing,known],[known,missing]]) {
    const snapshot=JSON.stringify(input);
    const rows=nav.prepare(input);
    assert.equal(rows.length,1);
    assert.equal(nav.next(rows,.1,10000).exit,2);
    assert.equal(rows[0].name,known.name);
    assert.equal(JSON.stringify(input),snapshot);
  }
});
test('keep missing exits when supplied exits conflict or refer to another position',()=>{
  const missing={f:.2,kind:'roundabout',exit:null};
  assert.equal(nav.prepare([missing,{...missing,exit:1},{...missing,exit:2}]).length,3);
  assert.equal(nav.prepare([missing,{...missing,f:.20001,exit:2}]).length,2);
  assert.equal(nav.prepare([missing,{...missing,f:.8,exit:2}]).length,2);
  for(const exit of [-1,1.5,'2']) assert.equal(nav.prepare([missing,{...missing,exit}]).length,2);
  assert.equal(nav.prepare([missing,{f:.2,kind:'right',exit:2}]).length,2);
});
