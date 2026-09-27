/*
 * OnoForge 40K — Tactical Advisor adapter
 *
 * Converts the existing Advisor recommendation shape into the pure engagement
 * evaluator. This file intentionally contains no rules calculations and no
 * geometry decisions. Unknown/approximate geometry remains non-authoritative.
 */
(function(global){
  'use strict';

  const clamp=(v,min=0,max=100)=>Math.max(min,Math.min(max,Number.isFinite(Number(v))?Number(v):0));
  const n=(v,f=0)=>Number.isFinite(Number(v))?Number(v):f;

  function score01(v){ return clamp(n(v)*100,0,100); }

  function deriveTurnUrgency(mission={}, evaluatedAt={}){
    const gap=n(mission?.score?.gap ?? mission?.vpDifferential);
    const round=n(evaluatedAt.round ?? mission?.round,1);
    const primaryRemaining=n(mission?.primary?.myRoundRemaining,0);
    const secondaryRemaining=n(mission?.secondary?.myRoundRemaining,0);
    let urgency=0;
    // These are explicit game-state signals already exposed by the existing
    // Advisor, rather than a manually supplied urgency number.
    if(gap<0) urgency+=20;
    if(primaryRemaining>0) urgency+=15;
    if(secondaryRemaining>0) urgency+=10;
    if(round>=4) urgency+=25;
    if(round>=5) urgency+=20;
    return clamp(urgency);
  }

  function fromRecommendation(rec={}, advisor={}){
    const d=rec.decisionComponents||{};
    const e=rec.exchangeComponents||{};
    const strategic=rec.strategicHook||{};
    const mission=advisor.missionDecisionContext||{};
    const evaluatedAt=advisor.evaluatedAt||{};

    // A known map distance is still only an approximate tactical signal. It
    // must never be mislabeled as a measured/authoritative distance.
    const distanceSource=rec.distanceSource||(
      rec.distanceKnown===true?'map-estimate':'unknown'
    );
    const execution={
      distanceSource,
      physicalDistanceConfirmed:rec.physicalDistanceConfirmed===true,
      legalityConfirmed:rec.tacticalLegality?.canTarget===true,
      reliability:score01(rec.decisionComponents?.decisionConfidence)
    };

    return {
      combat:{
        expectedDamage:n(rec.expectedDamage),
        expectedKills:n(rec.modelsKilled),
        expectedReturnDamage:n(rec.incomingThreat),
        attackerSurvival:clamp(100-(n(rec.friendlyPointsAtRisk)/Math.max(1,n(rec.points))*100)),
        targetSurvival:clamp(100-n(rec.killFraction)*100),
        attackerPoints:n(advisor.attacker?.points||rec.attackerPoints||0),
        targetPoints:n(rec.points)
      },
      mission:{
        objectiveSwing:score01(d.objectiveValue),
        primaryImpact:score01(d.primaryTargetImpact?.ownScoringValue),
        secondaryImpact:score01(d.futureScoringValue),
        scoringDenial:score01(d.primaryTargetImpact?.denyScoringValue ?? d.denyOpponentScore),
        isCriticalObjective:(strategic.objective?.status==='critical'||strategic.objective?.critical===true),
        turnUrgency:deriveTurnUrgency(mission,evaluatedAt),
        vpDifferential:n(mission?.score?.gap)
      },
      tactical:{
        threatSuppression:score01(e.threatSuppression),
        boardPosition:score01(d.objectiveValue),
        futureSetup:score01(d.futureScoringValue),
        // pointRiskFraction is a risk signal, not a true opportunity-cost
        // measurement. Only use it when explicitly supplied as such.
        opportunityCost:rec.opportunityCostKnown===true
          ?score01(rec.opportunityCost)
          :50,
        counterattackRisk:score01(e.exposure),
        targetThreat:score01(e.threatSuppression),
        protectsFriendlyAsset:score01(d.preserveFriendlyUnit)
      },
      execution
    };
  }

  function enrichAdvisor(advisor,engine){
    if(!advisor||!engine||typeof engine.evaluateEngagement!=='function')return advisor;
    const recommendations=Array.isArray(advisor.recommendations)?advisor.recommendations:[];
    recommendations.forEach(rec=>{
      const evaluation=engine.evaluateEngagement(fromRecommendation(rec,advisor));
      rec.tacticalImpact=evaluation;
      rec.tacticalImpactType=evaluation.engagementType;
      rec.tacticalImpactScore=evaluation.score;
      rec.tacticalImpactReasons=evaluation.reasons;
      rec.executionConfidence=evaluation.executionConfidence;
      rec.requiresPhysicalConfirmation=evaluation.requiresPhysicalConfirmation;
    });
    recommendations.sort((a,b)=>{
      const sa=n(a.tacticalImpactScore,-1),sb=n(b.tacticalImpactScore,-1);
      if(Math.abs(sb-sa)>0.01)return sb-sa;
      return n(b.decisionConfidence)-n(a.decisionConfidence);
    });
    return advisor;
  }

  global.ONOFORGE_TACTICAL_ADVISOR_ADAPTER=Object.freeze({
    deriveTurnUrgency,
    fromRecommendation,
    enrichAdvisor
  });
})(window);
