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

console.log('Tactical Advisor adapter tests: passed');
