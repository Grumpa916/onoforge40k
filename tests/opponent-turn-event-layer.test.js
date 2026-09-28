const fs=require('fs');
const vm=require('vm');
const assert=require('assert');

const source=fs.readFileSync('opponent-turn-event-layer.js','utf8');
const state={currentTurn:'opp',phase:'Shooting',round:2,events:[
  {id:'e-shoot',round:2,phase:'Shooting',playerTurn:'opp',kind:'ATTACK_RESOLUTION',payload:{
    side:'opp',attackerEntryUid:'oppAttacker',targetEntryUid:'myTarget',damage:4,casualties:2,modelIds:['my-m1','my-m2']
  }},
  {id:'e-charge',round:2,phase:'Charge',playerTurn:'opp',kind:'CHARGE_RESOLUTION',payload:{
    side:'opp',attackerSide:'opp',targetSide:'my',attackerEntryUid:'oppAttacker',targetEntryUids:['myTarget'],
    result:'Successful',requiredRoll:7,rolledTotal:9,measuredDistance:6,engagementState:'engaged',movementObserved:'observed',chargeMoveInferred:false
  }},
  {id:'e-fight',round:2,phase:'Fight',playerTurn:'opp',kind:'ATTACK_RESOLUTION',payload:{
    side:'opp',attackerEntryUid:'oppAttacker',targetEntryUid:'myTarget'
  }}
]};
const units={my1:{models:5,wounds:10},opp1:{models:3,wounds:6}};
const entries={my:{myTarget:{uid:'myTarget',unitId:'my1'}},opp:{oppAttacker:{uid:'oppAttacker',unitId:'opp1'}}};

const context={state,setTimeout:()=>{},entry:(side,uid)=>(entries[side]&&entries[side][uid])||null,get:id=>units[id]||null};
context.window=context;
vm.runInNewContext(source,context,{filename:'opponent-turn-event-layer.js'});

const api=context.ONOFORGE_OPPONENT_EVENT_CAPTURE;
assert.ok(api);
assert.strictEqual(api.VERSION,2);
assert.strictEqual(state.combatHistory,undefined,'Adapter must not create duplicate persistent history');
const history=api.getHistory();
assert.strictEqual(history.length,3);
assert.strictEqual(history[0].kind,'opponent-shooting');
assert.strictEqual(history[0].damage,4);
assert.strictEqual(history[0].casualties,2);
assert.strictEqual(history[0].targetUid,'myTarget');
assert.strictEqual(history[1].kind,'opponent-charge');
assert.strictEqual(history[1].result,'Successful');
assert.strictEqual(history[1].measuredDistance,6);
assert.strictEqual(history[1].chargeMoveInferred,false);
assert.strictEqual(history[2].kind,'opponent-fight');
assert.strictEqual(history[2].damage,null);

const normalized=api.capture('ATTACK_RESOLUTION',{
  phase:'Fight',attackerSide:'opp',targetSide:'my',attackerEntryUid:'oppAttacker',targetEntryUid:'myTarget',damage:8
});
assert.strictEqual(normalized.kind,'opponent-fight');
assert.strictEqual(normalized.damage,8);

state.events.push({id:'my-e',round:2,phase:'Fight',playerTurn:'my',kind:'ATTACK_RESOLUTION',payload:{
  side:'my',attackerEntryUid:'myTarget',targetEntryUid:'oppAttacker',damage:8
}});
assert.strictEqual(api.getHistory().length,4,'Combat History is intentionally bidirectional');
assert.strictEqual(api.getHistory().some(x=>x.attackerSide==='my'),true);
assert.strictEqual(api.getHistory().some(x=>x.attackerSide==='opp'),true);

state.events.push({id:'bad',round:2,phase:'Fight',playerTurn:'opp',kind:'ATTACK_RESOLUTION',payload:{
  side:'opp',attackerEntryUid:'oppAttacker',targetEntryUid:'unknown',damage:9
}});
assert.strictEqual(api.getHistory().length,3,'Unknown identity must not be guessed');

console.log('Opponent-turn event layer tests passed');
