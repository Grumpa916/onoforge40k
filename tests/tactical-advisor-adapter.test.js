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
assert.strictEqual(mapped.execution.physicalDistanceConfirmed,false);
assert.strictEqual(mapped.execution.legalityConfirmed,true);

adapter.enrichAdvisor(baseAdvisor,engine);
const rec=baseAdvisor.recommendations[0];
assert(rec.tacticalImpact,'Adapter should attach tactical impact');
assert(rec.tacticalImpactReasons.length>0,'Advisor should receive human-readable reasons');
assert.strictEqual(rec.requiresPhysicalConfirmation,true,'Unmeasured geometry must remain a confirmation requirement');

console.log('Tactical Advisor adapter tests: passed');
