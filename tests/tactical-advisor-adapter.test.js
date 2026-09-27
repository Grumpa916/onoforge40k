const fs=require('fs');
const vm=require('vm');
const assert=require('assert');

const context={window:{}};
vm.createContext(context);
for(const file of ['tactical-advisor-engine.js','tactical-advisor-adapter.js']){
  vm.runInContext(fs.readFileSync(require('path').join(__dirname,'..',file),'utf8'),context);
}
const adapter=context.window.ONOFORGE_TACTICAL_ADVISOR_ADAPTER;
const engine=context.window.ONOFORGE_TACTICAL_ADVISOR;
assert(adapter&&engine);

const baseAdvisor={
  missionDecisionContext:{score:{gap:-6},primary:{myRoundRemaining:1},secondary:{myRoundRemaining:1}},
  evaluatedAt:{round:5,phase:'Charge',turn:'my'},
  attacker:{name:'Test Unit',points:150},
  recommendations:[{
    expectedDamage:4,modelsKilled:1,points:120,incomingThreat:2,killFraction:.1,
    friendlyPointsAtRisk:20,distanceKnown:false,
    tacticalLegality:{canTarget:true},
    strategicHook:{objective:{value:.9,status:'critical'}},
    exchangeComponents:{threatSuppression:.8,exposure:.2},
    decisionComponents:{
      objectiveValue:.9,
      primaryTargetImpact:{ownScoringValue:.8,denyScoringValue:.9},
      futureScoringValue:.7,
      denyOpponentScore:.9,
      preserveFriendlyUnit:.8,
      pointRiskFraction:.1,
      decisionConfidence:.7
    }
  }]
};

assert(adapter.deriveTurnUrgency(baseAdvisor.missionDecisionContext,baseAdvisor.evaluatedAt)>=75,'Late/behind/scoring-active state should derive high urgency');

const mapped=adapter.fromRecommendation(baseAdvisor.recommendations[0],baseAdvisor);
assert(mapped.mission.turnUrgency>=75);
assert.strictEqual(mapped.execution.distanceSource,'unknown');
assert.strictEqual(mapped.execution.physicalDistanceConfirmed,false);
assert.strictEqual(mapped.execution.legalityConfirmed,true);

const mapEstimate=adapter.fromRecommendation({...baseAdvisor.recommendations[0],distanceKnown:true},baseAdvisor);
assert.strictEqual(mapEstimate.execution.distanceSource,'map-estimate');
assert.strictEqual(mapEstimate.execution.physicalDistanceConfirmed,false);
assert.strictEqual(engine.evaluateEngagement(mapEstimate).executionConfidence,'tactical-only','Map geometry must remain tactical-only until physical distance is confirmed');

adapter.enrichAdvisor(baseAdvisor,engine);
const rec=baseAdvisor.recommendations[0];
assert(rec.tacticalImpact,'Adapter should attach tactical impact');
assert(rec.tacticalImpactReasons.length>0,'Advisor should receive human-readable reasons');
assert.strictEqual(rec.requiresPhysicalConfirmation,true,'Unmeasured geometry must remain a confirmation requirement');

// Comparison mode must not mutate the authoritative Advisor ordering.
const comparisonSource={
  missionDecisionContext:{score:{gap:0},primary:{myRoundRemaining:1},secondary:{myRoundRemaining:1}},
  evaluatedAt:{round:3,phase:'Shooting',turn:'my'},
  attacker:{name:'Comparison Unit',points:150},
  recommendations:[
    {entryUid:'high-kill',expectedDamage:15,modelsKilled:6,points:100,incomingThreat:2,killFraction:.6,friendlyPointsAtRisk:15,distanceKnown:true,tacticalLegality:{canTarget:true},strategicHook:{objective:{value:.1,status:'negative'}},exchangeComponents:{threatSuppression:.1,exposure:.1},decisionComponents:{objectiveValue:.1,primaryTargetImpact:{ownScoringValue:0,denyScoringValue:.05},futureScoringValue:0,denyOpponentScore:.05,preserveFriendlyUnit:.9,pointRiskFraction:.05,decisionConfidence:.9}},
    {entryUid:'mission-impact',expectedDamage:4,modelsKilled:1,points:120,incomingThreat:1,killFraction:.1,friendlyPointsAtRisk:10,distanceKnown:true,tacticalLegality:{canTarget:true},strategicHook:{objective:{value:.95,status:'critical'}},exchangeComponents:{threatSuppression:.8,exposure:.1},decisionComponents:{objectiveValue:.95,primaryTargetImpact:{ownScoringValue:.9,denyScoringValue:.95},futureScoringValue:.8,denyOpponentScore:.95,preserveFriendlyUnit:.95,pointRiskFraction:.03,decisionConfidence:.9}}
  ]
};
const originalOrder=comparisonSource.recommendations.map(x=>x.entryUid);
const comparisonClone={...comparisonSource,recommendations:comparisonSource.recommendations.map(x=>({...x}))};
adapter.enrichAdvisor(comparisonClone,engine);
assert.deepStrictEqual(comparisonSource.recommendations.map(x=>x.entryUid),originalOrder,'Comparison evaluation must not mutate the authoritative recommendation order');
assert(comparisonClone.recommendations[0].tacticalImpact,'Comparison clone should receive tactical impact');
assert.strictEqual(comparisonClone.recommendations[0].entryUid,'mission-impact','Tactical layer should be capable of selecting the tactically significant engagement');


// Charge projection uses mocked adapters here only to prove the wiring contract.
// The production adapter calls the real battle-state combat functions exposed by index.html.
context.window.state={
  tactical:{
    selectedAttackerUid:'my-charge',
    pairs:{
      'my-charge>opp-charge':{distanceInches:8.5,objective:'Midfield'}
    }
  },
  my:[{uid:'my-charge',unitId:'charger',points:180}],
  opp:[{uid:'opp-charge',unitId:'target',points:120}]
};
context.window.get=(id)=>({
  charger:{id:'charger',name:'Charger Unit',points:180,models:5,profile:{W:2}},
  target:{id:'target',name:'Target Unit',points:120,models:5,profile:{W:2}}
}[id]||null);
const projectionCalls=[];
const snapshots={
  'my:my-charge':{survivingModels:5,totalWounds:10,targetModels:5,targetWoundsState:[2,2,2,2,2],targetWoundsRemaining:10,totalWounds:10,models:[]},
  'opp:opp-charge':{survivingModels:5,totalWounds:10,targetModels:5,targetWoundsState:[2,2,2,2,2],targetWoundsRemaining:10,totalWounds:10,models:[]}
};
context.window.combatSnapshot=(side,entry)=>{
  const uid=typeof entry==='string'?entry:entry?.uid;
  return snapshots[side+':'+uid]||null;
};
context.window.combatTargetUnit=(side,entry)=>{
  const uid=typeof entry==='string'?entry:entry?.uid;
  return side==='my'&&uid==='my-charge'
    ?{id:'charger',name:'Charger Unit',models:5,profile:{W:2},weapons:[]}
    :side==='opp'&&uid==='opp-charge'
      ?{id:'target',name:'Target Unit',models:5,profile:{W:2},weapons:[]}
      :null;
};
context.window.tacticalAdvisorWeaponGroups=(side,entry,target)=>[
  {count:5,weapon:{name:side==='my'?'Charge Blades':'Counter Claws',rng:'MELEE',A:'2',S:'6',AP:'-2',D:'2'},attacker:side==='my'?{name:'Charger Unit'}:{name:'Target Unit'}}
];
context.window.tacticalWeaponPhaseEligible=(weapon,phase)=>phase==='Fight'&&weapon.rng==='MELEE';
context.window.tacticalPairState=()=>({distanceInches:8.5,distanceBand:'6-12',engagement:'notEngaged',objective:'Midfield'});
context.window.tacticalPrimaryTargetImpact=()=>({objective:'Midfield',ownScoringValue:.2,denyScoringValue:.9,status:'enemy-controlled'});
context.window.calculateMathMixed=(attacker,target,groups,math)=>{
  projectionCalls.push({attacker:attacker.name,target:target.name,chargeMade:math.chargeMade,defenderModels:math.defenderModels,wounds:[...(math.defenderWoundsState||[])]});
  const outgoing=math.chargeMade===true;
  return {
    damage:outgoing?7:3,
    modelsKilled:outgoing?2:1,
    killChance:outgoing?.35:.10,
    targetWounds:10,
    simulationConfidence:.9,
    sim:{samples:math.quickSamples},
    summary:outgoing?'charged':'return'
  };
};

const chargeAdvisor={
  phase:'Charge',
  chargeMode:true,
  missionContext:{score:{gap:-4},primary:{myRoundRemaining:1},secondary:{myRoundRemaining:1},round:4},
  attacker:'Charger Unit',
  recommendations:[{
    entryUid:'opp-charge',
    name:'Target Unit',
    points:120,
    models:5,
    targetWounds:10,
    distanceKnown:true,
    tacticalLegality:{canTarget:true},
    objectiveValue:.9,
    strategicHook:{objective:{status:'critical'}},
    decisionComponents:{objectiveValue:.9,decisionConfidence:.8}
  }]
};

const projection=adapter.projectChargeEngagement(chargeAdvisor.recommendations[0],chargeAdvisor,{samples:1200});
assert.strictEqual(projection.available,true,'Charge projection should use available combat context');
assert.strictEqual(projection.method,'shared-combat-engine');
assert.strictEqual(projection.exchangeModel,'reciprocal-current-state-projection');
assert.strictEqual(projection.outgoing.result.damage,7);
assert.strictEqual(projection.incoming.result.damage,3);
assert.strictEqual(projection.outgoing.chargeMade,true);
assert.strictEqual(projection.incoming.chargeMade,false);
assert.strictEqual(projection.distanceEvidence.distanceSource,'physical-measurement');
assert.strictEqual(projection.distanceEvidence.physicalDistanceConfirmed,true);
assert.strictEqual(projection.tacticalSignals.counterattackRisk,30);
assert(projection.tacticalSignals.objectiveImpact.denyScoringValue>.8);

assert(projectionCalls.some(x=>x.chargeMade===true),'Outgoing projected Fight must be flagged as the charging attack');
assert(projectionCalls.some(x=>x.chargeMade===false),'Return projected Fight must not inherit Charge/Lance state');
assert(projectionCalls.every(x=>x.defenderModels===5&&x.wounds.length===5),'Projection must preserve current model/wound state');

adapter.enrichChargeAdvisor(chargeAdvisor,engine,{samples:1200});
const chargeRec=chargeAdvisor.recommendations[0];
assert(chargeRec.projectedFight,'Charge Advisor should expose the projected Fight exchange');
assert.strictEqual(chargeRec.expectedDamage,7);
assert.strictEqual(chargeRec.incomingThreat,3);
assert(chargeRec.tacticalImpact,'Charge candidate should receive Tactical Impact evaluation');
assert(chargeRec.tacticalImpactReasons.some(x=>String(x).includes('scoring')),'Charge reasons should include mission impact when present');

console.log('Tactical Advisor adapter tests: passed');
