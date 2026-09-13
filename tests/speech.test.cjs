const {test}=require('node:test');
const assert=require('node:assert/strict');
const {tracker,instruction,create}=require('../speech.js');
test('early and near announcements occur once, including a turn first seen at 100m',()=>{
 const t=tracker(),m={kind:'right',f:.5};
 assert.equal(t.next(m,0,1000),null);
 assert.match(t.next(m,.4,1000),/100 מטר.*ימינה/);
 for(let f=.401;f<.449;f+=.001) assert.equal(t.next(m,f,1000),null);
 assert.match(t.next(m,.46,1000),/40 מטר/);
 assert.equal(t.next(m,.48,1000),null);
 assert.equal(t.next(m,.501,1000),null);
 t.reset();assert.ok(t.next(m,.4,1000));
});
test('starting near skips the obsolete early stage and another turn is independent',()=>{
 const t=tracker();assert.ok(t.next({kind:'left',f:.5},.48,1000));
 assert.equal(t.next({kind:'left',f:.5},.4,1000),null);
 assert.ok(t.next({kind:'right',f:.52},.5,1000));
});
test('missing exit never invents a direction',()=>{
 assert.equal(instruction({kind:'roundabout'}),'כיכר בהמשך. מספר היציאה אינו זמין');
 assert.match(instruction({kind:'roundabout',exit:2}),/מספר 2/);
 assert.match(instruction({kind:'keep-left',then:'right'}),/היצמדו לשמאל, ואז פנו ימינה/);
});
test('speech chooses Hebrew, replaces pending speech, cancels, and reports missing voice',()=>{
 let calls=[],cancelled=0,errors=[],voices=[{lang:'he-IL'}];
 const host={SpeechSynthesisUtterance:class{constructor(text){this.text=text;}},speechSynthesis:{getVoices:()=>voices,speak:u=>calls.push(u),cancel:()=>cancelled++}};
 const c=create(host,e=>errors.push(e));
 assert.equal(c.speak('א'),true);assert.equal(calls[0].lang,'he-IL');
 c.speak('ב');assert.equal(cancelled,1);c.cancel();assert.equal(cancelled,2);
 voices=[];assert.equal(c.speak('ג'),false);assert.equal(errors.length,1);
 voices=[{lang:'he-IL'}];assert.equal(c.speak('ד'),true);
 calls.at(-1).onerror();assert.equal(errors.length,2);
 assert.equal(create({},()=>{}).supported,false);
});
