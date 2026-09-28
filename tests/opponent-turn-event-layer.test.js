const fs=require('fs');
const vm=require('vm');
const assert=require('assert');

const source=fs.readFileSync('opponent-turn-event-layer.js','utf8');
const state={currentTurn:'opp',phase:'Shooting',round:2};
const units={my1:{models:5,wounds:10},opp1:{models:3,wounds:6}};
const entries={my:{myTarget:{unitId:'my1'}},opp:{oppAttacker:{unitId:'opp1'}}};

const context={
  state,
  setTimeout:()=>{},
  entry:(side,uid)=>(entries[side]&&entries[side][uid])||null,
  get:id=>units[id]||null,
  event:(type,payload)=>({type,payload})
};
context.window=context;
vm.runInNewContext(source,context,{filename:'opponent-turn-event-layer.js'});

assert.ok(context.ONOFORGE_OPPONENT_EVENT_CAPTURE);
assert.ok(state.combatHistory);

context.ONOFORGE_OPPONENT_EVENT_CAPTURE.capture('ATTACK_RESOLUTION',{
  phase:'Shooting',attackerSide:'opp',attackerEntryUid:'oppAttacker',targetEntryUid:'myTarget',
  damage:4,casualties:2,modelIds:['my-m1','my-m2']
});
assert.strictEqual(state.combatHistory.events.length,1);
assert.strictEqual(state.combatHistory.events[0].record.kind,'opponent-shooting');
assert.strictEqual(state.combatHistory.events[0].record.damage,4);
assert.strictEqual(state.combatHistory.events[0].record.casualties,2);
assert.strictEqual(state.combatHistory.events[0].record.targetUid,'myTarget');

state.phase='Charge';
context.ONOFORGE_OPPONENT_EVENT_CAPTURE.capture('OPPONENT_CHARGE_CAPTURE',{
  attackerSide:'opp',targetSide:'my',attackerUid:'oppAttacker',targetUid:'myTarget',result:'Successful',
  requiredRoll:7,rolledTotal:9,measuredDistance:6,engagementState:'engaged'
});
assert.strictEqual(state.combatHistory.events.length,2);
assert.strictEqual(state.combatHistory.events[1].record.kind,'opponent-charge');
assert.strictEqual(state.combatHistory.events[1].record.result,'Successful');
assert.strictEqual(state.combatHistory.events[1].record.measuredDistance,6);

state.phase='Fight';
context.ONOFORGE_OPPONENT_EVENT_CAPTURE.capture('ATTACK_RESOLUTION',{
  phase:'Fight',attackerSide:'opp',attackerEntryUid:'oppAttacker',targetEntryUid:'myTarget'
});
assert.strictEqual(state.combatHistory.events.length,3);
assert.strictEqual(state.combatHistory.events[2].record.kind,'opponent-fight');
assert.strictEqual(state.combatHistory.events[2].record.damage,null);

const before=state.combatHistory.events.length;
context.ONOFORGE_OPPONENT_EVENT_CAPTURE.capture('ATTACK_RESOLUTION',{
  phase:'Fight',attackerSide:'my',attackerEntryUid:'myTarget',targetEntryUid:'oppAttacker',damage:8
});
assert.strictEqual(state.combatHistory.events.length,before,'My-side events must not be captured by opponent-turn layer');

context.ONOFORGE_OPPONENT_EVENT_CAPTURE.capture('ATTACK_RESOLUTION',{
  phase:'Fight',attackerSide:'opp',attackerEntryUid:'oppAttacker',targetEntryUid:'unknown'
});
assert.strictEqual(state.combatHistory.events.length,before,'Unknown target identity must not be guessed');

state.currentTurn='my';
context.ONOFORGE_OPPONENT_EVENT_CAPTURE.capture('OPPONENT_CHARGE_CAPTURE',{
  attackerSide:'opp',targetSide:'my',attackerUid:'oppAttacker',targetUid:'myTarget',result:'Successful'
});
assert.strictEqual(state.combatHistory.events.length,before,'Opponent history must be collected only during opponent turn');

console.log('Opponent-turn event layer tests passed');
