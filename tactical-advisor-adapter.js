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


  function pairKey(attackerUid,targetUid){
    return String(attackerUid||'')+'>'+String(targetUid||'');
  }

  function rawPairFor(attackerUid,targetUid){
    const pairs=global.state?.tactical?.pairs;
    const raw=pairs&&pairs[pairKey(attackerUid,targetUid)];
    return raw&&typeof raw==='object'?raw:null;
  }

  function resolveDistanceEvidence(rec,attackerUid,targetUid){
    if(rec?.physicalDistanceConfirmed===true){
      return {distanceSource:'physical-measurement',physicalDistanceConfirmed:true};
    }
    const raw=rawPairFor(attackerUid,targetUid);
    if(Number.isFinite(Number(raw?.distanceInches))){
      return {distanceSource:'physical-measurement',physicalDistanceConfirmed:true};
    }
    if(rec?.distanceKnown===true){
      return {distanceSource:'map-estimate',physicalDistanceConfirmed:false};
    }
    return {distanceSource:'unknown',physicalDistanceConfirmed:false};
  }

  function resolveAttackerEntry(advisor){
    const state=global.state||{};
    const my=Array.isArray(state.my)?state.my:[];
    const selected=state.tactical?.selectedAttackerUid;
    if(selected){
      const hit=my.find(x=>x&&String(x.uid)===String(selected)&&!x.attachedTo);
      if(hit)return hit;
      const any=my.find(x=>x&&String(x.uid)===String(selected));
      if(any)return any;
    }
    const name=typeof advisor?.attacker==='string'?advisor.attacker:String(advisor?.attacker?.name||'');
    if(name){
      const hit=my.find(x=>{
        if(!x)return false;
        const unit=typeof global.get==='function'?global.get(x.unitId):null;
        return String(unit?.name||x.name||'')===name;
      });
      if(hit)return hit;
    }
    return my.find(x=>x&&!x.attachedTo)||null;
  }

  function liveModelSlot(model){
    return {
      model,
      profile:{...(model?.profile||{})},
      maxWounds:Math.max(1,Number(model?.maxWounds)||Number(model?.profile?.W)||1)
    };
  }

  function attachedTargetStateFromSnapshot(snap){
    const models=(snap?.models||[]).filter(m=>m&&m.alive!==false);
    const bodyguardSlots=models.filter(m=>m.componentRole==='bodyguard').map(liveModelSlot);
    const characterSlots=models.filter(m=>m.character===true).map(liveModelSlot);
    if(!bodyguardSlots.length&&!characterSlots.length)return null;
    return {bodyguardSlots,characterSlots};
  }

  function mathDefenderState(snap){
    const state={
      defenderModels:Math.max(1,Number(snap?.targetModels)||Number(snap?.survivingModels)||1),
      defenderWoundsState:Array.isArray(snap?.targetWoundsState)
        ?snap.targetWoundsState.map(v=>Math.max(0,Number(v)||0))
        :null
    };
    const attached=attachedTargetStateFromSnapshot(snap);
    if(attached){
      state.attachedTargetState=attached;
      state.defenderModels=Math.max(1,(attached.bodyguardSlots||[]).length+(attached.characterSlots||[]).length);
      state.defenderWoundsState=[
        ...(attached.bodyguardSlots||[]),
        ...(attached.characterSlots||[])
      ].map(slot=>Math.max(0,Number(slot?.model?.woundsRemaining)||slot.maxWounds||1));
    }
    return state;
  }

  function isMeleeWeapon(w){
    const raw=String(w?.rng??w?.range??'').trim().toUpperCase();
    if(raw==='MELEE')return true;
    return w?.WS!=null&&w?.BS==null;
  }

  function projectedFightGroups(side,entry,target){
    const fn=typeof global.tacticalAdvisorWeaponGroups==='function'
      ?global.tacticalAdvisorWeaponGroups
      :global.attachedCombatWeaponGroups;
    if(typeof fn!=='function'||!entry||!target)return [];
    const raw=fn(side,entry,target)||[];
    return raw.filter(g=>{
      if(!g||Number(g.count||0)<=0)return false;
      if(typeof global.tacticalWeaponPhaseEligible==='function'){
        return global.tacticalWeaponPhaseEligible(g.weapon,'Fight',entry,target);
      }
      return isMeleeWeapon(g.weapon);
    });
  }

  function projectionResult(result){
    if(!result)return null;
    return {
      damage:Math.max(0,Number(result.damage)||0),
      modelsKilled:Math.max(0,Number(result.modelsKilled)||0),
      wipeChance:Math.max(0,Math.min(1,Number(result.killChance)||0)),
      targetWounds:Math.max(0,Number(result.targetWounds)||0),
      simulationConfidence:Math.max(0,Math.min(1,Number(result.simulationConfidence)||0)),
      samples:Math.max(0,Number(result.sim?.samples)||0),
      summary:String(result.summary||'')
    };
  }

  function projectFightExchange(attackerSide,attackerEntry,targetSide,targetEntry,chargeMade,samples){
    const calcFn=global.calculateMathMixed;
    const snapFn=global.combatSnapshot;
    const unitFn=global.combatTargetUnit;
    if(typeof calcFn!=='function'||typeof snapFn!=='function'||typeof unitFn!=='function'){
      return {available:false,reason:'shared-combat-engine-unavailable'};
    }
    const attacker=unitFn(attackerSide,attackerEntry);
    const target=unitFn(targetSide,targetEntry);
    const targetSnap=snapFn(targetSide,targetEntry);
    if(!attacker||!target||!targetSnap||targetSnap.survivingModels<=0){
      return {available:false,reason:'combat-state-unavailable'};
    }
    const groups=projectedFightGroups(attackerSide,attackerEntry,target);
    if(!groups.length){
      return {available:false,reason:'no-melee-profiles-resolved'};
    }
    const math=mathDefenderState(targetSnap);
    const result=calcFn(
      attacker,
      target,
      groups,
      {
        ...math,
        quickSamples:Math.max(1000,Number(samples)||1500),
        attackerEngagedWithTarget:true,
        attackerEngagedAny:true,
        chargeMade:chargeMade===true,
        _skipSim:false
      }
    );
    const normalized=projectionResult(result);
    if(!normalized)return {available:false,reason:'combat-engine-returned-no-result'};
    return {
      available:true,
      method:'shared-combat-engine',
      attackerUnit:attacker.name,
      defenderUnit:target.name,
      chargeMade:chargeMade===true,
      targetModels:Math.max(1,Number(targetSnap.targetModels)||Number(targetSnap.survivingModels)||1),
      targetWoundsRemaining:Math.max(0,Number(targetSnap.targetWoundsRemaining)||Number(targetSnap.totalWounds)||0),
      result:normalized
    };
  }

  function chargeProjectionTacticalSignals(rec,advisor,projection,pairCtx,targetEntry,attackerEntry){
    const outgoing=projection?.outgoing?.result||{};
    const incoming=projection?.incoming?.result||{};
    const targetWounds=Math.max(1,Number(projection?.outgoing?.targetWoundsRemaining)||Number(rec?.targetWounds)||1);
    const attackerWounds=Math.max(0,Number(projection?.incoming?.targetWoundsRemaining)||0);
    const damageFraction=Math.max(0,Math.min(1,Number(outgoing.damage)/targetWounds));
    const killFraction=Math.max(0,Math.min(1,Number(outgoing.modelsKilled)/Math.max(1,Number(rec?.models)||1)));
    const counterRisk=attackerWounds>0
      ?Math.max(0,Math.min(1,Number(incoming.damage)/attackerWounds))
      :Math.max(0,Math.min(1,Number(incoming.damage)/Math.max(1,Number(attackerEntry?.points)||1)));
    const objectiveImpact=typeof global.tacticalPrimaryTargetImpact==='function'
      ?global.tacticalPrimaryTargetImpact(targetEntry,pairCtx)||{}
      :{};
    const baseObjective=Math.max(
      Number(rec?.objectiveValue)||0,
      Number(objectiveImpact.ownScoringValue)||0,
      Number(objectiveImpact.denyScoringValue)||0
    );
    const board=Math.max(0,Math.min(1,baseObjective))*100;
    const targetThreat=Math.max(0,Math.min(100,counterRisk*100));
    const threatSuppression=Math.max(0,Math.min(100,(0.65*killFraction+0.35*damageFraction)*100));
    const futureSetup=Math.max(0,Math.min(100,board*0.70+(rec?.counterAttackPotential>0?10:0)+(pairCtx?.engagement==='engaged'?20:0)));
    return {
      objectiveImpact,
      threatSuppression,
      boardPosition:board,
      futureSetup,
      targetThreat,
      counterattackRisk:targetThreat,
      protectsFriendlyAsset:50,
      opportunityCost:50,
      damageFraction,
      killFraction,
      counterDamage:Math.max(0,Number(incoming.damage)||0)
    };
  }

  function chargeReasonAugment(rec,projection,evaluation){
    const reasons=[];
    const impact=projection?.tacticalSignals?.objectiveImpact||{};
    const objective=String(impact.objective||rec?.strategicHook?.objective?.objective||'').trim();
    if(objective&&Number(impact.denyScoringValue)>=0.70)reasons.push('Denies meaningful scoring on '+objective);
    else if(objective&&Number(impact.ownScoringValue)>=0.70)reasons.push('Can materially change scoring control around '+objective);
    if(Number(projection?.tacticalSignals?.threatSuppression)>=70)reasons.push('Projected Fight exchange suppresses a meaningful enemy threat');
    if(Number(projection?.outgoing?.result?.damage)>0&&Number(projection?.incoming?.result?.damage)>0){
      reasons.push('Projects '+Number(projection.outgoing.result.damage).toFixed(1)+' damage for '+Number(projection.incoming.result.damage).toFixed(1)+' expected return damage');
    }
    if(!projection?.outgoing?.available||!projection?.incoming?.available)reasons.push('Projected Fight output is incomplete; verify the unit profiles before relying on the comparison');
    if(evaluation?.requiresPhysicalConfirmation)reasons.push('Charge distance still requires physical measurement');
    return [...new Set([...reasons,...(evaluation?.reasons||[])])].slice(0,4);
  }

  function projectChargeEngagement(rec={},advisor={},options={}){
    const attackerEntry=options.attackerEntry||resolveAttackerEntry(advisor);
    const targetEntry=options.targetEntry
      ||((global.state?.opp||[]).find(x=>x&&String(x.uid)===String(rec.entryUid)));
    if(!attackerEntry||!targetEntry){
      return {available:false,reason:'charge-entry-context-unavailable'};
    }
    const pairCtx=typeof global.tacticalPairState==='function'
      ?global.tacticalPairState(attackerEntry.uid,targetEntry.uid)
      :null;
    const attackerSnap=typeof global.combatSnapshot==='function'
      ?global.combatSnapshot('my',attackerEntry)
      :null;
    const outgoing=projectFightExchange('my',attackerEntry,'opp',targetEntry,true,options.samples||1500);
    const incoming=projectFightExchange('opp',targetEntry,'my',attackerEntry,false,options.samples||1500);
    const distanceEvidence=resolveDistanceEvidence(rec,attackerEntry.uid,targetEntry.uid);
    const tacticalSignals=chargeProjectionTacticalSignals(rec,advisor,{
      outgoing,
      incoming
    },pairCtx,targetEntry,attackerEntry);
    const attackerPoints=Math.max(1,Number(attackerEntry.points)||Number(resolveAttackerEntry(advisor)?.points)||0);
    const targetPoints=Math.max(1,Number(targetEntry.points)||Number(rec.points)||1);
    return {
      available:outgoing.available&&incoming.available,
      method:'shared-combat-engine',
      exchangeModel:'reciprocal-current-state-projection',
      distanceEvidence,
      outgoing:outgoing.available
        ?{...outgoing,result:outgoing.result}
        :{available:false,reason:outgoing.reason},
      incoming:incoming.available
        ?{...incoming,result:incoming.result}
        :{available:false,reason:incoming.reason},
      tacticalSignals,
      attackerPoints,
      targetPoints,
      attackerCurrentWounds:Math.max(1,Number(attackerSnap?.targetWoundsRemaining)||Number(attackerSnap?.totalWounds)||1)
    };
  }

  function fromRecommendation(rec={}, advisor={}, derived={}){
    const d=rec.decisionComponents||{};
    const e=rec.exchangeComponents||{};
    const strategic=rec.strategicHook||{};
    const mission=advisor.missionDecisionContext||advisor.missionContext||{};
    const evaluatedAt=advisor.evaluatedAt||{};
    const projection=derived.projectedFight||rec.projectedFight||null;
    const outgoing=projection?.outgoing?.result||{};
    const incoming=projection?.incoming?.result||{};
    const tacticalSignals=projection?.tacticalSignals||{};
    const attackerUid=derived.attackerEntry?.uid||resolveAttackerEntry(advisor)?.uid;
    const targetUid=rec?.entryUid;
    const distanceEvidence=projection?.distanceEvidence||resolveDistanceEvidence(rec,attackerUid,targetUid);
    const execution={
      distanceSource:distanceEvidence.distanceSource,
      physicalDistanceConfirmed:distanceEvidence.physicalDistanceConfirmed===true,
      legalityConfirmed:rec.tacticalLegality?.canTarget===true,
      reliability:score01(rec.decisionComponents?.decisionConfidence)
    };
    const targetWounds=Math.max(1,Number(projection?.outgoing?.targetWoundsRemaining)||Number(rec?.targetWounds)||1);
    const attackerWounds=Math.max(1,Number(projection?.attackerCurrentWounds)||Number(projection?.incoming?.targetWoundsRemaining)||0);
    const objectiveImpact=tacticalSignals.objectiveImpact||{};
    return {
      combat:{
        expectedDamage:n(outgoing.damage??rec.expectedDamage),
        expectedKills:n(outgoing.modelsKilled??rec.modelsKilled),
        expectedReturnDamage:n(incoming.damage??rec.incomingThreat),
        attackerSurvival:attackerWounds>0?clamp(100-(n(incoming.damage)/attackerWounds*100)):50,
        targetSurvival:clamp(100-(n(outgoing.damage)/targetWounds*100)),
        attackerPoints:n(projection?.attackerPoints??advisor.attacker?.points??rec.attackerPoints??0),
        targetPoints:n(projection?.targetPoints??advisor.targetPoints??rec.points)
      },
      mission:{
        objectiveSwing:score01(Math.max(n(d.objectiveValue),n(objectiveImpact.ownScoringValue),n(objectiveImpact.denyScoringValue),n(rec.objectiveValue))),
        primaryImpact:score01(objectiveImpact.ownScoringValue??d.primaryTargetImpact?.ownScoringValue),
        secondaryImpact:score01(d.futureScoringValue),
        scoringDenial:score01(objectiveImpact.denyScoringValue??d.primaryTargetImpact?.denyScoringValue??d.denyOpponentScore),
        isCriticalObjective:(strategic.objective?.status==='critical'||strategic.objective?.critical===true),
        turnUrgency:deriveTurnUrgency(mission,evaluatedAt),
        vpDifferential:n(mission?.score?.gap)
      },
      tactical:{
        threatSuppression:n(tacticalSignals.threatSuppression??score01(e.threatSuppression)),
        boardPosition:n(tacticalSignals.boardPosition??score01(d.objectiveValue)),
        futureSetup:n(tacticalSignals.futureSetup??score01(d.futureScoringValue)),
        opportunityCost:n(tacticalSignals.opportunityCost??50),
        counterattackRisk:n(tacticalSignals.counterattackRisk??score01(e.exposure)),
        targetThreat:n(tacticalSignals.targetThreat??score01(e.threatSuppression)),
        protectsFriendlyAsset:n(tacticalSignals.protectsFriendlyAsset??score01(d.preserveFriendlyUnit))
      },
      execution
    };
  }

  function enrichAdvisor(advisor,engine,options={}){
    if(!advisor||!engine||typeof engine.evaluateEngagement!=='function')return advisor;
    const recommendations=Array.isArray(advisor.recommendations)?advisor.recommendations:[];
    const isCharge=advisor.chargeMode===true||String(advisor.phase||'')==='Charge';
    recommendations.forEach(rec=>{
      let projection=null;
      let mapping;
      if(isCharge){
        projection=projectChargeEngagement(rec,advisor,{...options});
        rec.projectedFight=projection;
        if(projection?.outgoing?.result){
          rec.expectedDamage=projection.outgoing.result.damage;
          rec.modelsKilled=projection.outgoing.result.modelsKilled;
          rec.wipeChance=projection.outgoing.result.wipeChance;
          rec.killFraction=Math.max(0,Math.min(1,
            Number(rec.modelsKilled)/Math.max(1,Number(rec.models)||1)
          ));
        }
        if(projection?.incoming?.result){
          rec.incomingThreat=projection.incoming.result.damage;
        }
        rec.opportunityCostKnown=false;
        mapping=fromRecommendation(rec,advisor,projection);
      }else{
        mapping=fromRecommendation(rec,advisor);
      }
      const evaluation=engine.evaluateEngagement(mapping);
      if(isCharge)evaluation.reasons=chargeReasonAugment(rec,projection,evaluation);
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

  function enrichChargeAdvisor(advisor,engine,options={}){
    if(!advisor)return advisor;
    advisor.chargeMode=true;
    return enrichAdvisor(advisor,engine,options);
  }

  global.ONOFORGE_TACTICAL_ADVISOR_ADAPTER=Object.freeze({
    deriveTurnUrgency,
    fromRecommendation,
    projectFightExchange,
    projectChargeEngagement,
    enrichAdvisor,
    enrichChargeAdvisor
  });
})(window);
