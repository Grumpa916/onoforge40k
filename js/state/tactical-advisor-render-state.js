function createTacticalAdvisorRenderStateController({state,tacticalAdvisorStateSignature,tacticalTargetLegality,tacticalAdvisorWeaponGroups,tacticalPairState,missionDecisionContext,reserveUnitsForSide,get,TACTICAL_RENDER_CACHE,tacticalAdvisorV1,tacticalAdvisorV2,advisorStratagemPressure,advisorPreserveCP}){
function prepareTacticalRenderCache(){
  const signature=tacticalAdvisorStateSignature();
  if(signature!==TACTICAL_RENDER_CACHE.signature){
    TACTICAL_RENDER_CACHE.signature=signature;
    TACTICAL_RENDER_CACHE.advisor.clear();
    TACTICAL_RENDER_CACHE.weaponGroups.clear();
    TACTICAL_RENDER_CACHE.legality.clear();
  }
  return TACTICAL_RENDER_CACHE;
}
function getTacticalAdvisorResult(attackerEntryUid,options={}){
  const cache=prepareTacticalRenderCache();
  const samples=Math.min(10000,Math.max(2000,Number(options.samples)||4000));
  const key=String(attackerEntryUid||'')+'|'+samples;
  if(cache.advisor.has(key))return cache.advisor.get(key);
  const result=tacticalAdvisorV1(attackerEntryUid,{...options,samples});
  cache.advisor.set(key,result);
  return result;
}
function getTacticalAdvisorV2Result(attackerEntryUid,options={}){
  const cache=prepareTacticalRenderCache();
  const samples=Math.min(10000,Math.max(2000,Number(options.samples)||4000));
  const key='v2|'+String(attackerEntryUid||'')+'|'+samples;
  if(cache.advisor.has(key))return cache.advisor.get(key);
  const result=tacticalAdvisorV2(attackerEntryUid,{...options,samples});
  cache.advisor.set(key,result);
  return result;
}
function getTacticalTargetLegalityCached(attackerEntry,targetEntry,phase){
  const cache=prepareTacticalRenderCache();
  const key=String(attackerEntry?.uid||'')+'>'+String(targetEntry?.uid||'')+'|'+String(phase||state.phase||'Command');
  if(cache.legality.has(key))return cache.legality.get(key);
  const result=tacticalTargetLegality(attackerEntry,targetEntry,phase);
  cache.legality.set(key,result);
  return result;
}
function getTacticalRenderBundle(attackerEntry,targetEntry){
  const cache=prepareTacticalRenderCache();
  const phase=String(state.phase||'Command');
  const key=String(attackerEntry?.uid||'')+'>'+String(targetEntry?.uid||'')+'|'+phase;
  const bundleKey='bundle|'+key;
  if(!cache.weaponGroups.has(bundleKey)){
    const groups=targetEntry?tacticalAdvisorWeaponGroups('my',attackerEntry,targetEntry):[];
    const legality=targetEntry?getTacticalTargetLegalityCached(attackerEntry,targetEntry,phase):null;
    cache.weaponGroups.set(bundleKey,{groups,legality});
  }
  const bundle=cache.weaponGroups.get(bundleKey)||{groups:[],legality:null};
  return {
    result:getTacticalAdvisorResult(attackerEntry?.uid,{samples:4000}),
    groups:bundle.groups,
    legality:bundle.legality,
    context:targetEntry?tacticalPairState(attackerEntry.uid,targetEntry.uid):null
  };
}

function tacticalAdvisorBattleStateContext(){
  const mission=missionDecisionContext();
  const activeSecondary=(side)=>{
    const key=side==='my'?'secondaryMyCards':'secondaryOppCards';
    return (Array.isArray(state[key])?state[key]:[]).map(x=>typeof x==='string'?x:(x?.name||x?.id||'')).filter(Boolean);
  };
  const reserved=(side)=>reserveUnitsForSide(side).map(e=>({uid:e.uid,unitId:e.unitId,name:get(e.unitId)?.name||e.name||e.unitId}));
  const positioned=(side)=>{
    const src=state.battlefieldUnitPositions||{};
    return (Array.isArray(state[side])?state[side]:[]).filter(e=>e&&!e.attachedTo).map(e=>{
      const p=src[String(e.uid)];
      return {uid:e.uid,x:Number(p?.x),y:Number(p?.y),known:Number.isFinite(Number(p?.x))&&Number.isFinite(Number(p?.y))};
    }).filter(x=>x.known);
  };
  return {
    round:mission.round,phase:state.phase||'Command',currentTurn:state.currentTurn||'my',
    vp:{my:mission.score.my,opp:mission.score.opp,gap:mission.score.gap},
    cp:{my:Number(state.myCP)||0,opp:Number(state.oppCP)||0},
    primary:mission.primary,secondary:mission.secondary,objectives:mission.objectives,
    battlefield:mission.battlefield,reserves:{my:reserved('my'),opp:reserved('opp')},
    positions:{my:positioned('my'),opp:positioned('opp')},
    activeSecondaries:{my:activeSecondary('my'),opp:activeSecondary('opp')},
    stratagems:{
      myPhaseAvailable:(Array.isArray(state.stratagemsMy)?state.stratagemsMy:[]).filter(s=>s&&((String(s.phase||'Any Phase')==='Any Phase')||String(s.phase||'')===String(state.phase||'Command'))).map(s=>({name:s.name,cp:Number(s.cp)||0,phase:s.phase||'Any Phase'})),
      myUsedThisPhase:Array.isArray(state.stratagemUsesMy)?state.stratagemUsesMy.filter(x=>x&&Number(x.round)===Number(state.round)&&String(x.phase)===String(state.phase)&&String(x.playerTurn||'my')==='my').map(x=>({name:x.name,cp:Number(x.cp)||0})):[],
      myRecent:Array.isArray(state.stratagemUsesMy)?state.stratagemUsesMy.slice(-5).map(x=>({name:x?.name,cp:Number(x?.cp)||0,round:Number(x?.round)||0,phase:x?.phase||''})):[],
      oppRecent:Array.isArray(state.stratagemUsesOpp)?state.stratagemUsesOpp.slice(-5).map(x=>({name:x?.name,cp:Number(x?.cp)||0,round:Number(x?.round)||0,phase:x?.phase||''})):[],
      myMaxCurrentCP:Number(state.myCP)||0
    }
  };
}
function tacticalAdvisorStratagemPressure(battle,top){
  const available=Array.isArray(battle?.stratagems?.myPhaseAvailable)?battle.stratagems.myPhaseAvailable:[];
  const used=Array.isArray(battle?.stratagems?.myUsedThisPhase)?battle.stratagems.myUsedThisPhase:[];
  const cp=Math.max(0,Number(battle?.cp?.my)||0);
  const topPhase=String(battle?.phase||'Command');
  const affordable=available.filter(s=>Number(s.cp)||0<=cp);
  const affordableNames=affordable.map(s=>String(s.name||'')).filter(Boolean);
  const phaseGroups={};
  affordable.forEach(s=>{
    const name=String(s.name||'');
    const summary=String(s.summary||'').toLowerCase();
    let category='general';
    if(/save|defen[cs]|durab|ward|damage reduction|feel no pain/.test(summary))category='defensive';
    else if(/attack|combat|hit|wound|lethal|output|shoot|fight|damage/.test(summary))category='offensive';
    else if(/move|advance|fall back|charge|position|redeploy|reserve|teleport/.test(summary))category='mobility';
    else if(/objective|score|control|mission|battle tactic/.test(summary))category='scoring';
    else if(/command point|cp|re-roll|roll/.test(summary))category='resource';
    (phaseGroups[category]??=[]).push(name);
  });
  const categories=Object.keys(phaseGroups).filter(k=>phaseGroups[k].length);
  const cpHeadroom=Math.max(0,cp-(affordable.length?Math.min(...affordable.map(s=>Math.max(0,Number(s.cp)||0))):cp));
  const immediateOptions=affordable.filter(s=>String(s.phase||'Any Phase')===topPhase||String(s.phase||'Any Phase')==='Any Phase').map(s=>({name:s.name,cp:Number(s.cp)||0,phase:s.phase||'Any Phase',summary:s.summary||'',category:Object.keys(phaseGroups).find(k=>(phaseGroups[k]||[]).includes(String(s.name||'')))||'general'}));
  const topScore=Number(top?.decisionScore)||0;
  const confidence=Number(top?.decisionComponents?.decisionConfidence)||0;
  const pressure=immediateOptions.length?Math.max(0,Math.min(1,
    (immediateOptions.some(s=>s.category==='offensive'&&topScore>=0.55)?0.35:0)+
    (immediateOptions.some(s=>s.category==='defensive'&&confidence<0.65)?0.25:0)+
    (immediateOptions.some(s=>s.category==='scoring'&&Number(top?.decisionComponents?.objectiveValue||0)>=0.5)?0.30:0)+
    (cp<=1?0.10:0)
  )):0;
  return {
    phase:topPhase,currentCP:cp,cpHeadroom,
    availableCount:available.length,affordableCount:affordable.length,
    usedThisPhaseCount:used.length,affordableNames,
    categories,options:immediateOptions,pressure,
    preserveCP:cp<=1||pressure>=0.65,
    interaction:pressure>=0.65?'A current-phase stratagem window may materially change the value of this action.':
      pressure>=0.30?'A current-phase stratagem may improve or protect the exchange; keep CP available until the key decision is resolved.':
      'No tracked affordable current-phase stratagem creates a strong immediate interaction with this recommendation.',
    limitations:['Stratagem consequence analysis uses the currently loaded, phase-legal stratagem catalogue and its stored summary; it does not invent untracked effects or assume a stratagem target is eligible.']
  };
}
function tacticalAdvisorV2(attackerEntryUid,options={}){
  const base=tacticalAdvisorV1(attackerEntryUid,options);
  const battle=tacticalAdvisorBattleStateContext();
  const recommendations=Array.isArray(base.recommendations)?base.recommendations:[];
  const baseTop=recommendations[0]||null;
  const stratagemPressure=tacticalAdvisorStratagemPressure(battle,baseTop);
  const advisorStratagemPressure=Math.max(0,Math.min(1,Number(stratagemPressure?.pressure)||0));
  const advisorPreserveCP=Math.max(0,Math.min(1,Number(stratagemPressure?.preserveCP)||0));
  recommendations.forEach(x=>{
    const d=x.decisionComponents||{};
    const deny=Number(d.denyOpponentScore)||0;
    const preserve=Number(d.preserveFriendlyUnit)||0;
    const pressureAdjustment=
      (advisorStratagemPressure*0.025*deny)-
      (advisorPreserveCP*0.015*(1-preserve));
    x.stratagemPressureAdjustment=pressureAdjustment;
    x.priorityScore=Math.max(-1,Math.min(1,Number(x.decisionScore??x.tacticalIndexAdjusted??x.tacticalIndex)||0)+pressureAdjustment);
  });
  recommendations.sort((a,b)=>{
    const scoreDiff=Number(b.priorityScore??b.decisionScore??0)-Number(a.priorityScore??a.decisionScore??0);
    if(Math.abs(scoreDiff)>0.015)return scoreDiff;
    const confidenceDiff=Number(b.decisionComponents?.decisionConfidence||0)-Number(a.decisionComponents?.decisionConfidence||0);
    if(Math.abs(confidenceDiff)>0.01)return confidenceDiff;
    const objectiveDiff=Number(b.decisionComponents?.objectiveValue||0)-Number(a.decisionComponents?.objectiveValue||0);
    if(Math.abs(objectiveDiff)>0.01)return objectiveDiff;
    return Number(b.expectedDamage||0)-Number(a.expectedDamage||0);
  });
  // v2 changes the final ordering with priorityScore, so refresh the user-facing
  // rank/margin/near-tie explanation after that ordering is complete. This keeps
  // the explanation and the actual recommendation order authoritative to the same
  // score rather than leaking v1's pre-stratagem ordering.
  const v2NearTieThreshold=0.015;
  recommendations.forEach((x,i)=>{
    const next=recommendations[i+1];
    const priority=Number(x.priorityScore??x.decisionScore??0);
    const nextPriority=next?Number(next.priorityScore??next.decisionScore??0):null;
    const margin=next?Math.max(0,priority-nextPriority):1;
    const explanation=x.recommendationExplanation&&typeof x.recommendationExplanation==='object'
      ?x.recommendationExplanation:{};
    x.recommendationExplanation={
      ...explanation,
      rank:i+1,
      margin,
      nearTie:margin<=v2NearTieThreshold,
      headline:i===0?(margin<=v2NearTieThreshold?'Close call — verify battlefield context':'Top candidate'):'Ranked candidate'
    };
  });
  const top=recommendations[0]||null;
  const alerts=[];
  if(battle.currentTurn==='my'&&battle.cp.my<=1)alerts.push('CP is limited; preserve 1 CP when a critical stratagem window is expected.');
  if(battle.vp.gap<0)alerts.push('You are currently behind on VP; prioritize actions that create or deny scoring opportunities when legal.');
  if(battle.activeSecondaries.my.length<2&&battle.phase==='Command')alerts.push('Your Tactical hand is below two active cards; check the Command phase replenishment state.');
  if(battle.reserves.my.length)alerts.push(String(battle.reserves.my.length)+' friendly unit(s) remain in Reserves.');
  const minPhaseCP=battle.stratagems.myPhaseAvailable.reduce((m,s)=>Math.min(m,Number(s.cp)||99),99);
  if(battle.cp.my<minPhaseCP&&Number.isFinite(minPhaseCP)&&minPhaseCP<99)alerts.push('Current-phase stratagem options include costs above your available CP.');
  if(top?.recommendationExplanation?.nearTie)alerts.push('Top recommendation is a close call; verify the measured battlefield facts before committing.');
  return {
    version:'tactical-advisor-v2',status:base.status,battleState:battle,
    decisionContext:{phase:battle.phase,round:battle.round,currentTurn:battle.currentTurn,vpGap:battle.vp.gap,cp:battle.cp.my,objectiveCount:battle.objectives.my,activeSecondaryCount:battle.activeSecondaries.my.length,reserveCount:battle.reserves.my.length,phaseStratagemCount:battle.stratagems.myPhaseAvailable.length,phaseStratagemsUsed:battle.stratagems.myUsedThisPhase.length,stratagemPressure:stratagemPressure.pressure,preserveCP:stratagemPressure.preserveCP},
    recommendations,avoid:base.avoid||[],naturalTargets:base.naturalTargets||[],stratagemPressure,
    missionDecisionContext:base.missionDecisionContext||null,attacker:base.attacker||null,
    legality:base.legality||null,attackerActionState:base.attackerActionState||null,alerts,
    limitations:[...(base.limitations||[]),'Battle-state context is read-only; generating advice does not mutate authoritative game state.']
  };
}
function tacticalAdvisorV1(attackerEntryUid,options={}){
  const side='my',atkEntry=entry(side,attackerEntryUid)||mathRosterEntry(side);
}
window.OnoForgeTacticalAdvisorRenderState=Object.freeze({createTacticalAdvisorRenderStateController});