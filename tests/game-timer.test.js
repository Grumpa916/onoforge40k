const assert=require('assert');
const fs=require('fs');
const vm=require('vm');

const source=fs.readFileSync('js/ui/game-timer.js','utf8');
let now=1000000;
const documentStub={
  getElementById(){return null;},
  querySelector(){return null;},
};
const context={
  window:null,
  document:documentStub,
  Date:{now:()=>now},
  setInterval:()=>1,
  clearInterval:()=>{},
  console
};
context.window=context;
vm.createContext(context);
vm.runInContext(source,context);

const saved=[];
const state={
  myName:'My',
  oppName:'Opp',
  currentTurn:'my',
  gameTimer:{
    elapsedMs:0,running:true,paused:false,startedAt:now,
    pausedAt:0,finishedAt:0,turnMyMs:0,turnOppMs:0,
    turnStartedGameMs:0,turnPaused:false
  }
};
context.OnoForgeGameTimer.install({
  getState:()=>state,
  save:()=>saved.push({...state.gameTimer}),
  render:()=>{},
  battleMutationAllowed:()=>true,
  cloudSaveCurrentBattle:()=>Promise.resolve(true),
  esc:v=>String(v)
});
context.startGameTimer();
now+=10000;
context.switchTurnClock('opp');

assert.strictEqual(state.currentTurn,'opp');
assert.strictEqual(state.gameTimer.turnMyMs,10000);
assert.strictEqual(state.gameTimer.turnOppMs,0);
assert.strictEqual(state.gameTimer.turnStartedGameMs,10000);

now+=7000;
assert.strictEqual(context.turnElapsedMs('my'),10000);
assert.strictEqual(context.turnElapsedMs('opp'),7000);

context.switchTurnClock('my');
assert.strictEqual(state.currentTurn,'my');
assert.strictEqual(state.gameTimer.turnMyMs,10000);
assert.strictEqual(state.gameTimer.turnOppMs,7000);

const state2={
  myName:'My',
  oppName:'Opp',
  currentTurn:'my',
  gameTimer:{
    elapsedMs:0,running:true,paused:false,startedAt:2000000,
    pausedAt:0,finishedAt:0,turnMyMs:0,turnOppMs:0,
    turnStartedGameMs:0,turnPaused:false
  }
};
context.stopGameTimerRuntime();
context.OnoForgeGameTimer.install({
  getState:()=>state2,
  save:()=>{},
  render:()=>{},
  battleMutationAllowed:()=>true,
  cloudSaveCurrentBattle:()=>Promise.resolve(true),
  esc:v=>String(v)
});
context.startGameTimer();
now=2012000;
context.switchTurnClock('opp');
assert.strictEqual(state2.gameTimer.turnMyMs,12000);
assert.strictEqual(state2.gameTimer.turnOppMs,0);

// Reproduce the application ordering where currentTurn is changed before
// the timer boundary call. The explicit outgoing side must still receive time.
now=2019000;
state2.currentTurn='my';
context.switchTurnClock('my','opp');
assert.strictEqual(state2.gameTimer.turnMyMs,12000);
assert.strictEqual(state2.gameTimer.turnOppMs,7000);

console.log('game-timer.test.js: PASS');
