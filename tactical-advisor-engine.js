/*
 * OnoForge 40K — Tactical Advisor Engagement Evaluation
 *
 * Pure decision layer. This module does not determine rules legality and does
 * not treat approximate battlefield geometry as authoritative. It consumes
 * already-derived combat/mission/tactical facts and explains why an
 * engagement matters.
 */
(function(global){
  'use strict';

  const clamp=(n,min=0,max=100)=>Math.max(min,Math.min(max,Number.isFinite(Number(n))?Number(n):0));
  const n=(v,fallback=0)=>Number.isFinite(Number(v))?Number(v):fallback;
  const round1=v=>Math.round(n(v)*10)/10;

  function normalizeContext(input={}){
    const combat=input.combat||{};
    const mission=input.mission||{};
    const tactical=input.tactical||{};
    const execution=input.execution||{};
    return {
      combat:{
        expectedDamage:Math.max(0,n(combat.expectedDamage)),
        expectedKills:Math.max(0,n(combat.expectedKills)),
        expectedReturnDamage:Math.max(0,n(combat.expectedReturnDamage)),
        attackerSurvival:clamp(combat.attackerSurvival),
        targetSurvival:clamp(combat.targetSurvival),
        attackerPoints:Math.max(0,n(combat.attackerPoints)),
        targetPoints:Math.max(0,n(combat.targetPoints))
      },
      mission:{
        objectiveSwing:clamp(mission.objectiveSwing),
        primaryImpact:clamp(mission.primaryImpact),
        secondaryImpact:clamp(mission.secondaryImpact),
        scoringDenial:clamp(mission.scoringDenial),
        isCriticalObjective:!!mission.isCriticalObjective,
        turnUrgency:clamp(mission.turnUrgency),
        vpDifferential:n(mission.vpDifferential)
      },
      tactical:{
        threatSuppression:clamp(tactical.threatSuppression),
        boardPosition:clamp(tactical.boardPosition),
        futureSetup:clamp(tactical.futureSetup),
        opportunityCost:clamp(tactical.opportunityCost),
        counterattackRisk:clamp(tactical.counterattackRisk),
        targetThreat:clamp(tactical.targetThreat),
        protectsFriendlyAsset:clamp(tactical.protectsFriendlyAsset)
      },
      execution:{
        distanceSource:execution.distanceSource||'unknown',
        physicalDistanceConfirmed:execution.physicalDistanceConfirmed===true,
        legalityConfirmed:execution.legalityConfirmed===true,
        reliability:clamp(execution.reliability,0,100)
      }
    };
  }

  function combatValue(c){
    const exchange=c.expectedDamage-(c.expectedReturnDamage*0.85);
    const relativeValue=c.targetPoints>0
      ? clamp((Math.max(0,c.expectedKills)/Math.max(1,c.expectedKills+1))*55 + (c.targetPoints/(c.targetPoints+c.attackerPoints+1))*45)
      : 0;
    return clamp((clamp(exchange/Math.max(1,c.expectedDamage+2)*100)*0.55)+(relativeValue*0.45));
  }

  function missionValue(m){
    const objective=m.objectiveSwing*0.30;
    const primary=m.primaryImpact*0.25;
    const secondary=m.secondaryImpact*0.10;
    const denial=m.scoringDenial*0.20;
    const urgency=m.turnUrgency*0.10;
    const critical=m.isCriticalObjective?5:0;
    return clamp(objective+primary+secondary+denial+urgency+critical);
  }

  function tacticalValue(t){
    return clamp(
      t.threatSuppression*0.28+
      t.boardPosition*0.18+
      t.futureSetup*0.18+
      t.targetThreat*0.16+
      t.protectsFriendlyAsset*0.12+
      (100-t.counterattackRisk)*0.08
    );
  }

  function engagementType({combat,mission,tactical}){
    const values={
      KILL:combat.expectedKills*12,
      DENY:mission.scoringDenial*0.55+mission.primaryImpact*0.45,
      CONTEST:mission.objectiveSwing*0.75+mission.turnUrgency*0.25,
      SECURE:mission.objectiveSwing*0.55+tactical.boardPosition*0.25+tactical.futureSetup*0.20,
      DISRUPT:tactical.threatSuppression*0.55+tactical.targetThreat*0.45,
      TRADE:combat.expectedDamage*0.35+(100-tactical.counterattackRisk)*0.30+combat.targetPoints/(Math.max(1,combat.attackerPoints))*35,
      PROTECT:tactical.protectsFriendlyAsset*0.75+mission.scoringDenial*0.25,
      POSITION:tactical.boardPosition*0.55+tactical.futureSetup*0.45
    };
    return Object.entries(values).sort((a,b)=>b[1]-a[1])[0][0];
  }

  function confidence(execution){
    if(execution.physicalDistanceConfirmed&&execution.legalityConfirmed)return 'confirmed';
    if(execution.physicalDistanceConfirmed)return 'measured';
    if(execution.distanceSource==='map-estimate')return 'tactical-only';
    return 'context-only';
  }

  function buildReasons(parts){
    const reasons=[];
    if(parts.mission>=70)reasons.push('High mission impact');
    if(parts.missionObjective>=70)reasons.push('Changes objective control or contest state');
    if(parts.scoringDenial>=70)reasons.push('Can deny or materially reduce enemy scoring');
    if(parts.threat>=70)reasons.push('Suppresses a meaningful enemy threat');
    if(parts.board>=70)reasons.push('Improves board position');
    if(parts.future>=70)reasons.push('Sets up a valuable future-turn position');
    if(parts.combat>=70)reasons.push('Favorable combat exchange');
    if(parts.counterRisk>=70)reasons.push('Manageable counterattack risk');
    if(parts.opportunity>=70)reasons.push('Low opportunity cost');
    if(parts.opportunity<=30)reasons.push('Carries significant opportunity cost');
    return reasons.slice(0,4);
  }

  function evaluateEngagement(input={}){
    const x=normalizeContext(input);
    const combat=combatValue(x.combat);
    const mission=missionValue(x.mission);
    const tactical=tacticalValue(x.tactical);
    const executionConfidence=confidence(x.execution);
    const opportunity=100-x.tactical.opportunityCost;
    const counterRisk=100-x.tactical.counterattackRisk;

    // Mission/tactical value deliberately outweighs raw lethality. Combat is
    // still important, but it cannot dominate the decision by itself.
    let score=(mission*0.34)+(tactical*0.31)+(combat*0.20)+(opportunity*0.10)+(counterRisk*0.05);

    // Approximate map distance may identify a candidate, but never grants an
    // execution bonus. Exact charge/shooting probabilities belong downstream.
    if(executionConfidence==='tactical-only')score*=0.94;
    if(executionConfidence==='context-only')score*=0.90;

    const parts={
      combat:round1(combat),
      mission:round1(mission),
      missionObjective:round1(x.mission.objectiveSwing),
      scoringDenial:round1(x.mission.scoringDenial),
      threat:round1(x.tactical.threatSuppression),
      board:round1(x.tactical.boardPosition),
      future:round1(x.tactical.futureSetup),
      counterRisk:round1(counterRisk),
      opportunity:round1(opportunity)
    };

    return {
      score:round1(clamp(score)),
      engagementType:engagementType(x),
      executionConfidence,
      components:parts,
      reasons:buildReasons(parts),
      mapGeometryAuthoritative:false,
      requiresPhysicalConfirmation:!x.execution.physicalDistanceConfirmed,
      combat:{...x.combat},
      mission:{...x.mission},
      tactical:{...x.tactical}
    };
  }

  global.ONOFORGE_TACTICAL_ADVISOR = Object.freeze({
    normalizeContext,
    evaluateEngagement,
    clamp
  });
})(window);
