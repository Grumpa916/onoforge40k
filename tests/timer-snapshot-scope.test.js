const assert=require('assert');
const fs=require('fs');

const html=fs.readFileSync('index.html','utf8');

const snapshotStart=html.indexOf('function snapshotForUndo()');
assert(snapshotStart>=0,'snapshotForUndo definition missing');
const snapshotEnd=html.indexOf('\n}\n',snapshotStart);
assert(snapshotEnd>snapshotStart,'snapshotForUndo end not found');
const snapshot=html.slice(snapshotStart,snapshotEnd+3);
assert(snapshot.includes('const t=ensureGameTimer();'),'snapshotForUndo timer variable missing');
assert(snapshot.includes("const currentSide=t.turnSide==='opp'||t.turnSide==='my'?t.turnSide:(state.currentTurn==='opp'?'opp':'my');"),'snapshotForUndo must use local timer variable');
assert(!snapshot.includes('liveTimer.turnSide'),'snapshotForUndo contains stale liveTimer reference');

const saveStart=html.indexOf('function save()');
assert(saveStart>=0,'save definition missing');
const saveEnd=html.indexOf('\n}\n',saveStart);
assert(saveEnd>saveStart,'save end not found');
const save=html.slice(saveStart,saveEnd+3);
assert(save.includes('const liveTimer=ensureGameTimer();'),'save liveTimer variable missing');
assert(save.includes('const currentSide=liveTimer.turnSide==='),'save liveTimer reference unexpectedly changed');

const quota=save.slice(save.indexOf("if(e&&e.name==='QuotaExceededError')"));
assert(quota.includes('const compactTimer=ensureGameTimer();'),'quota fallback timer variable missing');
assert(quota.includes('const currentSide=compactTimer.turnSide==='),'quota fallback must use compactTimer');
assert(!quota.includes('const currentSide=liveTimer.turnSide==='),'quota fallback contains stale liveTimer reference');

console.log('timer-snapshot-scope.test.js: PASS');
