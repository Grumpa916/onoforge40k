const fs=require('fs');
const vm=require('vm');
const assert=require('assert');

const code=fs.readFileSync('tactical-charge-workflow.js','utf8');
const context={
  console,
  window:null,
  state:{
    phase:'Charge',
    round:2,
    currentTurn:'my',
    my:[{uid:'charger',unitId:'chargerUnit'}],
    opp:[
      {uid:'targetA',unitId:'targetAUnit'},
      {uid:'targetB',unitId:'targetBUnit'}
    ],
    tactical:{
      pairs:{
        'charger>targetA':{attackerUid:'charger',targetUid:'targetA',distanceInches:7.5,distanceBand:'6-12',engagement:'notEngaged'},
        'charger>targetB':{attackerUid:'charger',targetUid:'targetB',distanceBand:'6-12',engagement:'notEngaged'}
      },
      unitActions:{},
      fightPhase:{}
    }
  }
};
context.window=context;
context.ensureTacticalState=()=>context.state.tactical;
context.snapshotForUndo=()=>JSON.parse(JSON.stringify(context.state));
const events=[];
context.event=(kind,payload,before)=>events.push({kind,payload,before});
context.save=()=>{};
context.render=()=>{};
context.getTacticalTargetLegalityCached=(attacker,target,phase)=>{
  assert.strictEqual(phase,'Charge');
  return {canTarget:true,reasons:[]};
};

vm.runInNewContext(code,context);

let result=context.recordTacticalChargeResult('success','charger',['targetA']);
assert.strictEqual(result.ok,true);
assert.deepStrictEqual(Array.from(result.targetUids),['targetA']);
assert.strictEqual(context.state.tactical.unitActions.charger.chargeDone,true);
assert.strictEqual(context.state.tactical.unitActions.charger.chargeMade,true);
assert.deepStrictEqual(Array.from(context.state.tactical.unitActions.charger.chargeTargets),['targetA']);
assert.strictEqual(context.state.tactical.pairs['charger>targetA'].engagement,'engaged');
assert.strictEqual(context.state.tactical.fightPhase.units.charger.engagedAtFightStart,true);
assert.strictEqual(context.state.tactical.fightPhase.units.charger.becameEngagedDuringFight,true);
assert.strictEqual(events.at(-1).kind,'CHARGE_RESULT');
assert.strictEqual(events.at(-1).payload.outcome,'success');

context.state.phase='Charge';
context.state.tactical.unitActions={};
context.state.tactical.fightPhase={};
events.length=0;
result=context.recordTacticalChargeResult('success','charger',['targetB']);
assert.strictEqual(result.ok,false,'Successful charge must require physical measurement');
assert.strictEqual(context.state.tactical.unitActions.charger,undefined);

result=context.recordTacticalChargeResult('failed','charger',['targetB']);
assert.strictEqual(result.ok,true);
assert.strictEqual(context.state.tactical.unitActions.charger.chargeDone,true);
assert.strictEqual(context.state.tactical.unitActions.charger.chargeMade,false);
assert.deepStrictEqual(Array.from(context.state.tactical.unitActions.charger.chargeTargets),['targetB']);
assert.strictEqual(context.state.tactical.pairs['charger>targetB'].engagement,'notEngaged');
assert.strictEqual(events.at(-1).payload.outcome,'failed');

console.log('Tactical Charge workflow tests: passed');
