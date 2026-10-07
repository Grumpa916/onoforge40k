function createTacticalCombatStateController({
  getState,
  snapshotForUndo,
  event,
  save,
  render,
  entry,
  objectiveBattlefieldGeometry,
  battlefieldUnitPosition,
  battlefieldDistanceBetween,
  battlefieldTerrainPathIntersections,
  objectiveStateRecord,
  objectiveMissionKey,
  objectiveLayoutPage,
  get,
  tacticalUnitState,
  combatRootEntry,
  tacticalAdvisorWeaponGroups,
  combatTargetUnit,
  bodyguardLeaders,
  WARGEAR_PROFILES_11E,
  ensureTacticalState
}){
  const state=getState();
function tacticalFightPhaseState(){
  const t=ensureTacticalState(),r=Math.max(1,Number(state.round)||1),turn=state.currentTurn;
  const raw=t.fightPhase;
  if(raw.round!==r||raw.playerTurn!==turn){
    return {round:r,playerTurn:turn,step:'unknown',selected:[],nextSide:turn,notes:'',units:{}};
  }
  return {
    round:r,playerTurn:turn,
    step:['fightsFirst','remaining','unknown'].includes(raw.step)?raw.step:'unknown',
    selected:Array.isArray(raw.selected)?raw.selected.map(String):[],
    nextSide:raw.nextSide==='opp'?'opp':'my',
    notes:raw.notes==null?'':String(raw.notes),
    units:raw.units&&typeof raw.units==='object'?raw.units:{}
  };
}
function setTacticalFightPhase(field,value){
  const before=snapshotForUndo(),t=ensureTacticalState(),r=Math.max(1,Number(state.round)||1),turn=state.currentTurn,cur=tacticalFightPhaseState();
  const next={...cur,round:r,playerTurn:turn};
  if(field==='step')next.step=['fightsFirst','remaining','unknown'].includes(value)?value:'unknown';
  else if(field==='nextSide')next.nextSide=value==='opp'?'opp':'my';
  else return;
  t.fightPhase=next;
  event('TACTICAL_FIGHT_PHASE_CHANGED',{field,value:next[field],action:'Fight phase sequencing changed',before:cur,after:next},before);
  save();render();
}
function tacticalFightUnitState(entryUid){
  const phase=tacticalFightPhaseState(),raw=phase.units?.[String(entryUid)]||{};
  return {
    engagedAtFightStart:raw.engagedAtFightStart===true?true:(raw.engagedAtFightStart===false?false:null),
    becameEngagedDuringFight:raw.becameEngagedDuringFight===true?true:(raw.becameEngagedDuringFight===false?false:null),
    pileInDone:raw.pileInDone===true,
    consolidationDone:raw.consolidationDone===true
  };
}
function setTacticalFightUnitState(entryUid,field,value){
  if(!entryUid)return;
  const before=snapshotForUndo(),t=ensureTacticalState(),r=Math.max(1,Number(state.round)||1),turn=state.currentTurn;
  const cur=tacticalFightPhaseState(),uid=String(entryUid),old={...tacticalFightUnitState(uid)},units={...cur.units},next={...old};
  if(field==='engagedAtFightStart'||field==='becameEngagedDuringFight')next[field]=value===true||value==='true'?true:(value===false||value==='false'?false:null);
  else if(field==='pileInDone'||field==='consolidationDone')next[field]=!!value;
  else return;
  units[uid]=next;t.fightPhase={...cur,round:r,playerTurn:turn,units};
  event('TACTICAL_FIGHT_UNIT_CHANGED',{entryUid,field,value:next[field],action:'Fight unit state changed',before:old,after:next},before);
  save();render();
}
function tacticalFightOrderState(entry){
  const f=tacticalUnitFightState(entry),phase=tacticalFightPhaseState(),unit=tacticalFightUnitState(entry?.uid),selected=phase.selected.includes(String(entry?.uid||''));
  const overrunEligible=unit.engagedAtFightStart===true||unit.becameEngagedDuringFight===true,effectiveEligible=f.eligible||overrunEligible;
  return {...f,...unit,selected,overrunEligible,effectiveEligible,
    fightType:f.engaged?'NORMAL_FIGHT':f.chargeMade?'CHARGE_FIGHT':overrunEligible?'OVERRUN_FIGHT':'INELIGIBLE',
    stepEligible:f.fightsFirst?'fightsFirst':effectiveEligible?'remaining':'ineligible',
    availableNow:effectiveEligible&&!selected&&(phase.step==='unknown'||phase.step===(f.fightsFirst?'fightsFirst':'remaining'))};
}
function tacticalPairKey(attackerUid,targetUid){return String(attackerUid||'')+'>'+String(targetUid||'')}
function tacticalDistanceBandFromInches(value){
  const d=Number(value);
  if(!Number.isFinite(d)||d<0)return 'unknown';
  if(d<6)return '<6';
  if(d<12)return '6-12';
  if(d<18)return '12-18';
  if(d<24)return '18-24';
  return '24+';
}
function battlefieldTerrainContextBetweenUnits(attackerSide,attackerUid,targetSide,targetUid){
  const geometry=objectiveBattlefieldGeometry();
  const a=battlefieldUnitPosition(attackerSide,attackerUid),b=battlefieldUnitPosition(targetSide,targetUid);
  // Explicit live unit coordinates are sufficient to calculate direct distance.
  // Event Companion geometry verification is only required for terrain-path
  // intersections; it must not turn a known unit-to-unit distance into "unknown".
  if(!a||!b)return {verified:false,distanceInches:null,terrainIntersections:[],losInference:'blocked'};
  const distanceInches=battlefieldDistanceBetween(a,b);
  if(!geometry.verified)return {verified:false,distanceInches,terrainIntersections:[],losInference:'not-inferred'};
  return {verified:true,distanceInches,terrainIntersections:battlefieldTerrainPathIntersections(a,b),losInference:'not-inferred'};
}
function tacticalCombatPairState(attackerSide,targetSide,attackerUid,targetUid){
  const as=attackerSide==='opp'?'opp':'my',ts=targetSide==='my'?'my':'opp';
  const t=ensureTacticalState(),key=tacticalPairKey(attackerUid,targetUid),reverseKey=tacticalPairKey(targetUid,attackerUid),direct=t.pairs[key],reverse=t.pairs[reverseKey],raw=direct&&typeof direct==='object'?direct:(reverse&&typeof reverse==='object'?reverse:{});
  const exact=Number.isFinite(Number(raw.distanceInches))?Math.max(0,Number(raw.distanceInches)):null;
  const geometryContext=battlefieldTerrainContextBetweenUnits(as,attackerUid,ts,targetUid);
  const resolvedDistance=exact!==null?exact:(geometryContext?.verified===true?geometryContext.distanceInches:null);
  const distanceBand=['unknown','<6','6-12','12-18','18-24','24+'].includes(raw.distanceBand)?raw.distanceBand:tacticalDistanceBandFromInches(resolvedDistance);
  const objectiveName=raw.objective==null?'':String(raw.objective),objectiveMeta=objectiveName?objectiveStateRecord(objectiveName):null,layoutInfo=ensureObjectiveLayoutForMission();
  return {key,attackerUid:attackerUid||null,targetUid:targetUid||null,distanceInches:resolvedDistance,distanceBand,
    los:['yes','no','unknown'].includes(raw.los)?raw.los:'unknown',
    engagement:['engaged','notEngaged','unknown'].includes(raw.engagement)?raw.engagement:(String(state.phase||'')==='Charge'?'notEngaged':'unknown'),
    objective:objectiveName,
    objectiveContext:objectiveMeta?{owner:objectiveMeta.owner,type:objectiveMeta.type,territory:objectiveMeta.territory,deploymentZone:objectiveMeta.deploymentZone,changedThisTurn:objectiveMeta.changedThisTurn,mapLayout:objectiveMeta.mapLayout,mapPage:objectiveMeta.mapLayoutPage}:null,
    battlefieldLayout:{layout:state.objectiveMapLayout||'A',missionKey:state.objectiveMapMissionKey||objectiveMissionKey(),page:layoutInfo?objectiveLayoutPage():null},
    battlefieldGeometry:objectiveBattlefieldGeometry(),terrainContext:geometryContext,notes:raw.notes==null?'':String(raw.notes)};
}
function tacticalPairState(attackerUid,targetUid){return tacticalCombatPairState('my','opp',attackerUid,targetUid);}
function setTacticalPairField(attackerUid,targetUid,field,value){
  if(!attackerUid||!targetUid)return;
  const before=snapshotForUndo(),t=ensureTacticalState(),key=tacticalPairKey(attackerUid,targetUid);
  const cur=tacticalPairState(attackerUid,targetUid);
  const next={...cur,[field]:value};
  if(field==='distanceInches'){
    const n=Number(value);
    next[field]=Number.isFinite(n)&&n>=0?Math.round(n*10)/10:null;
  }
  t.pairs[key]={attackerUid,targetUid,distanceInches:next.distanceInches,distanceBand:next.distanceBand||tacticalDistanceBandFromInches(next.distanceInches),los:next.los,engagement:next.engagement,objective:next.objective,notes:next.notes};
  event('TACTICAL_CONTEXT_CHANGED',{attackerUid,targetUid,field,action:'Tactical context '+field+' changed',before:cur,after:t.pairs[key]},before);
  save();render();
}
function clearTacticalPair(attackerUid,targetUid){
  if(!attackerUid||!targetUid)return;
  const before=snapshotForUndo(),t=ensureTacticalState(),key=tacticalPairKey(attackerUid,targetUid);
  const old=t.pairs[key]||null;
  delete t.pairs[key];
  event('TACTICAL_CONTEXT_CHANGED',{attackerUid,targetUid,action:'Tactical context cleared',before:old,after:null},before);
  save();render();
}
function tacticalAdvisorActionState(entryUid){
  if(!entryUid)return {movement:'unknown',movementDistanceInches:null,setUpThisTurn:null,shootingDone:false,chargeDone:false,chargeMade:false,chargeTargets:[],fightDone:false,enemyFightBackDone:false,round:Math.max(1,Number(state.round)||1),playerTurn:state.currentTurn};
  const t=ensureTacticalState(),raw=t.unitActions[String(entryUid)];
  if(!raw||raw.round!==Math.max(1,Number(state.round)||1)||raw.playerTurn!==state.currentTurn){
    return {movement:'unknown',movementDistanceInches:null,setUpThisTurn:null,shootingDone:false,chargeDone:false,chargeMade:false,chargeTargets:[],fightDone:false,round:Math.max(1,Number(state.round)||1),playerTurn:state.currentTurn};
  }
  return {
    movement:['unknown','remained','normal','advance','fallback'].includes(raw.movement)?raw.movement:'unknown',
    movementDistanceInches:Number.isFinite(Number(raw.movementDistanceInches))&&Number(raw.movementDistanceInches)>=0?Math.round(Number(raw.movementDistanceInches)*10)/10:null,
    setUpThisTurn:raw.setUpThisTurn===true?true:(raw.setUpThisTurn===false?false:null),
    shootingDone:!!raw.shootingDone,
    chargeDone:!!raw.chargeDone,
    chargeMade:!!raw.chargeMade,
    chargeTargets:Array.isArray(raw.chargeTargets)?raw.chargeTargets.map(String):[],
    fightDone:!!raw.fightDone,
    enemyFightBackDone:!!raw.enemyFightBackDone,
    fightTargetUid:raw.fightTargetUid==null?'':String(raw.fightTargetUid),
    round:raw.round,playerTurn:raw.playerTurn
  };
}
function tacticalUnitMovementTypeLegacy(entryUid){
  if(!entryUid)return null;
  const t=ensureTacticalState(),raw=t.unitMovement[String(entryUid)];
  return raw&&raw.round===Math.max(1,Number(state.round)||1)&&raw.playerTurn===state.currentTurn?(!!raw.advanced?'advance':'remained'):null;
}
function tacticalUnitMovementType(entryUid){
  const a=tacticalAdvisorActionState(entryUid);
  if(a.movement!=='unknown')return a.movement;
  const legacy=tacticalUnitMovementTypeLegacy(entryUid);
  return legacy===null?'unknown':legacy;
}
function tacticalUnitAdvancedState(entryUid){
  const movement=tacticalUnitMovementType(entryUid);
  return movement==='unknown'?null:movement==='advance';
}
function setTacticalUnitAction(entryUid,field,value){
  if(!entryUid)return;
  const before=snapshotForUndo(),t=ensureTacticalState(),key=String(entryUid);
  const old=tacticalAdvisorActionState(entryUid);
  const next={...old,round:Math.max(1,Number(state.round)||1),playerTurn:state.currentTurn};
  if(field==='movement'){
    next.movement=['unknown','remained','normal','advance','fallback'].includes(value)?value:'unknown';
    t.unitMovement[key]={round:next.round,playerTurn:next.playerTurn,advanced:next.movement==='advance'};
  }else if(field==='movementDistanceInches'){
    const n=Number(value);
    next.movementDistanceInches=Number.isFinite(n)&&n>=0?Math.min(60,Math.round(n*10)/10):null;
  }else if(field==='setUpThisTurn'){
    next.setUpThisTurn=value===true||value==='true'?true:(value===false||value==='false'?false:null);
  }else if(field==='shootingDone'||field==='chargeDone'||field==='chargeMade'||field==='fightDone'||field==='enemyFightBackDone'){
    next[field]=!!value;
  }else if(field==='fightTargetUid'){
    next.fightTargetUid=value==null?'':String(value);
  }else return;
  t.unitActions[key]=next;
  event('TACTICAL_ACTION_STATE_CHANGED',{entryUid,field,value:next[field]??next.movement,action:'Unit '+field+' changed',before:old,after:next},before);
  save();render();
}
function recordTacticalChargeResult(result,attackerUid){
  if(state.currentTurn!=='my'||String(state.phase||'')!=='Charge')return;
  const normalized=String(result||'').toLowerCase()==='success'?'Successful':String(result||'').toLowerCase()==='failed'?'Failed':'';
  if(!attackerUid){alert('Select the charging unit first.');return;}
  if(!normalized){alert('Choose Successful or Failed.');return;}
  const checked=[...document.querySelectorAll('input[data-onoforge-charge-target]:checked')]
    .map(el=>String(el.getAttribute('data-onoforge-charge-target')||'')).filter(Boolean);
  const fallback=String(ensureTacticalState().selectedTargetUid||'');
  const ids=[...new Set((checked.length?checked:[fallback]).map(String).filter(Boolean))];
  const valid=ids.filter(id=>entry('opp',id)&&!tacticalUnitState('opp',entry('opp',id))?.destroyed);
  if(!valid.length){alert('Select at least one valid enemy charge target.');return;}
  const before=snapshotForUndo(),t=ensureTacticalState(),round=Math.max(1,Number(state.round)||1),ae=entry('my',attackerUid);
  if(!ae){alert('The selected charging unit is no longer available.');return;}
  const oldAction=tacticalAdvisorActionState(attackerUid);
  t.unitActions[String(attackerUid)]={...oldAction,round,playerTurn:'my',chargeDone:true,chargeMade:normalized==='Successful',chargeTargets:valid};
  const targets=valid.map(id=>entry('opp',id)).filter(Boolean);
  let firstDistance=null;
  valid.forEach(targetUid=>{
    const key=tacticalPairKey(attackerUid,targetUid),oldPair=t.pairs[key]&&typeof t.pairs[key]==='object'?t.pairs[key]:{};
    const pair=tacticalCombatPairState('my','opp',attackerUid,targetUid);
    const d=Number(pair?.distanceInches);
    if(firstDistance===null&&Number.isFinite(d)&&d>=0)firstDistance=Math.round(d*10)/10;
    t.pairs[key]={...oldPair,attackerUid:String(attackerUid),targetUid:String(targetUid),engagement:normalized==='Successful'?'engaged':'notEngaged'};
  });
  event('CHARGE_RESOLUTION',{
    side:'my',attackerSide:'my',targetSide:'opp',attackerEntryUid:String(attackerUid),
    attacker:ae?.name||get(ae?.unitId)?.name||String(attackerUid),targetEntryUids:valid,
    targets:targets.map(e=>unitDisplayName('opp',e)),result:normalized,
    requiredRoll:null,rolledTotal:null,measuredDistance:firstDistance,
    engagementState:normalized==='Successful'?'engaged':'notEngaged',
    movementObserved:'unknown',chargeMoveInferred:false
  },before);
  save();render();
}
window.recordTacticalChargeResult=recordTacticalChargeResult;

function setTacticalUnitAdvanced(entryUid,advanced){
  setTacticalUnitAction(entryUid,'movement',advanced?'advance':'remained');
}
function tacticalFightResolvedForSide(entryUid,side){
  if(!entryUid)return false;
  const s=side==='opp'?'opp':'my',root=entry(s,entryUid),rootUid=root?combatRootEntry(s,root)?.uid:entryUid;
  return (state.events||[]).some(e=>e?.kind==='ATTACK_RESOLUTION'&&Number(e.round||0)===Math.max(1,Number(state.round)||1)&&String(e.phase||'')==='Fight'&&String(e.payload?.side||'')===s&&tacticalWeaponEventEntryMatches(rootUid,e,s));
}
function tacticalPhaseActionAvailable(entryUid,phase,side=state.currentTurn){
  const a=tacticalAdvisorActionState(entryUid);
  if(phase==='Shooting')return !a.shootingDone;
  if(phase==='Charge')return !a.chargeDone;
  if(phase==='Fight')return !tacticalFightResolvedForSide(entryUid,side);
  return true;
}
function tacticalWeaponUseKey(entryUid,weaponName){return String(entryUid||'')+'|'+String(weaponName||'')}
function tacticalWeaponCanonicalEntryUid(entryUid,side='my'){
  if(!entryUid)return null;
  const e=entry(side,entryUid);
  const root=e?combatRootEntry(side,e):null;
  return root?.uid||entryUid;
}
function tacticalWeaponUseState(entryUid,weaponName,side='my'){
  const t=ensureTacticalState();
  const raw=t.unitUse[tacticalWeaponUseKey(entryUid,weaponName)]||{};
  return {used:!!raw.used,usedCount:Math.max(0,Number(raw.usedCount)||0)};
}
function tacticalWeaponHasRule(w,rule){
  return (w?.abilities||[]).some(a=>String(a||'').toUpperCase().replace(/-/g,' ').includes(String(rule||'').toUpperCase()));
}
function tacticalWeaponBattleUseCount(entryUid,weaponName,side='my'){
  if(!entryUid||!weaponName)return 0;
  const s=side==='opp'?'opp':'my';
  return (state.events||[]).filter(e=>
    e?.kind==='ATTACK_RESOLUTION' &&
    (String(e.payload?.side||e.playerTurn||'')===s) &&
    tacticalWeaponEventEntryMatches(entryUid,e,s) &&
    String(e.payload?.weapon||'')===String(weaponName)
  ).reduce((n,e)=>n+Math.max(1,Number(e.payload?.modelsResolved||e.payload?.modelsRemaining||e.payload?.modelIds?.length)||1),0);
}
function tacticalWeaponAvailable(entryUid,w,maxCount,side='my'){
  if(!w)return {available:false,count:0,reason:'missing weapon'};
  const limit=Math.max(1,Number(maxCount)||1),use=tacticalWeaponUseState(entryUid,w.name,side);
  if(tacticalWeaponHasRule(w,'ONE SHOT')){
    const eventCount=tacticalWeaponBattleUseCount(entryUid,w.name,side);
    const consumed=Math.max(use.usedCount,eventCount);
    const remaining=Math.max(0,limit-Math.min(limit,consumed));
    return {available:remaining>0,count:remaining,reason:remaining?'':'All One Shot weapons used',use,eventCount};
  }
  return {available:true,count:limit,reason:null,use};
}
function setTacticalWeaponUsed(entryUid,weaponName,count){
  if(!entryUid||!weaponName)return;
  const before=snapshotForUndo(),t=ensureTacticalState(),key=tacticalWeaponUseKey(entryUid,weaponName),n=Math.max(0,Math.floor(Number(count)||0));
  const old=tacticalWeaponUseState(entryUid,weaponName);
  t.unitUse[key]={used:n>0,usedCount:n};
  event('TACTICAL_WEAPON_USE_CHANGED',{entryUid,weaponName,action:'Weapon use count changed',before:old,after:t.unitUse[key]},before);
  save();render();
}
function tacticalWeaponShootingMode(w){
  return tacticalWeaponIsCloseQuarters(w)?'close-quarters':'other-ranged';
}
function tacticalWeaponEventEntryMatches(entryUid,event,side='my'){
  if(!entryUid||!event)return false;
  const logged=String(event.payload?.attackerEntryUid||'');
  if(!logged)return false;
  if(logged===String(entryUid))return true;
  const e=entry(side,entryUid);
  const root=e?combatRootEntry(side,e):null;
  return !!root&&String(root.uid)===logged;
}
function tacticalWeaponModelUseEvents(entryUid,round=state.round,phase=state.phase,side='my'){
  if(!entryUid)return [];
  const r=Math.max(1,Number(round)||1),p=String(phase||'Command'),s=side==='opp'?'opp':'my';
  return (state.events||[]).filter(e=>
    e?.kind==='ATTACK_RESOLUTION' &&
    (Number(e.round)||1)===r &&
    String(e.phase||'')===p &&
    (String(e.payload?.side||e.playerTurn||'')===s) &&
    tacticalWeaponEventEntryMatches(entryUid,e,s) &&
    Array.isArray(e.payload?.modelIds)
  );
}
function tacticalWeaponModelWeaponInstanceCount(entryUid,modelId,weaponName,side='my'){
  if(!entryUid||!modelId||!weaponName)return 0;
  const e=entry(side==='opp'?'opp':'my',entryUid),u=e?get(e.unitId):null;
  const roster=e&&u?ensureModelRoster(e,u):[];
  let model=roster.find(x=>String(x.id)===String(modelId));
  // Generic combat snapshots use UID-model-N ids while the persistent model roster
  // uses UID-mN ids. Map by model ordinal so weapon availability is not lost.
  if(!model){
    const match=String(modelId).match(/-(?:model-|m)(\d+)$/);
    if(match){
      const index=Math.max(0,Number(match[1])-1);
      model=roster[index];
    }
  }
  return model?(Array.isArray(model.weapons)?model.weapons:[]).filter(x=>String(x)===String(weaponName)).length:0;
}

function tacticalWeaponModelUseCount(entryUid,modelId,weaponName,round=state.round,phase=state.phase,side='my'){
  const wanted=String(modelId);
  return tacticalWeaponModelUseEvents(entryUid,round,phase,side).reduce((n,e)=>{
    const ids=Array.isArray(e.payload?.modelIds)?e.payload.modelIds.map(id=>String(id)):[];
    return ids.includes(wanted)&&String(e.payload?.weapon||'')===String(weaponName)?n+1:n;
  },0);
}
function tacticalWeaponModelAvailable(entryUid,modelId,w,round=state.round,phase=state.phase,side='my'){
  if(!w)return false;
  const instances=tacticalWeaponModelWeaponInstanceCount(entryUid,modelId,w.name,side);
  if(instances<=0)return false;
  const used=tacticalWeaponModelUseCount(entryUid,modelId,w.name,round,phase,side);
  return tacticalWeaponHasRule(w,'ONE SHOT')?used<instances:used<1;
}
function tacticalWeaponModelAlreadyUsed(entryUid,modelId,weaponName,round=state.round,phase=state.phase,side='my'){
  const wanted=String(modelId);
  return tacticalWeaponModelUseEvents(entryUid,round,phase,side).some(e=>{
    const ids=Array.isArray(e.payload?.modelIds)?e.payload.modelIds.map(id=>String(id)):[];
    return ids.includes(wanted)&&String(e.payload?.weapon||'')===String(weaponName);
  });
}
function tacticalWeaponModelModeConflict(entryUid,modelId,w,attackerEntry,round=state.round,phase=state.phase,side='my'){
  const unit=get(attackerEntry?.unitId);
  const mv=tacticalUnitIsMonsterVehicle(attackerEntry);
  if(mv)return false;
  const mode=tacticalWeaponShootingMode(w);
  return tacticalWeaponModelUseEvents(entryUid,round,phase,side).some(e=>{
    const ids=Array.isArray(e.payload?.modelIds)?e.payload.modelIds.map(id=>String(id)):[];
    if(!ids.includes(String(modelId)))return false;
    const prior=String(e.payload?.shootingMode||'');
    return prior&&prior!==mode;
  });
}
function tacticalWeaponPhaseUseCount(entryUid,weaponName,round=state.round,phase=state.phase,side='my'){
  if(!entryUid||!weaponName)return 0;
  const r=Math.max(1,Number(round)||1),p=String(phase||'Command'),s=side==='opp'?'opp':'my';
  return (state.events||[]).filter(e=>
    e?.kind==='ATTACK_RESOLUTION' &&
    (Number(e.round)||1)===r &&
    String(e.phase||'')===p &&
    (String(e.payload?.side||e.playerTurn||'')===s) &&
    tacticalWeaponEventEntryMatches(entryUid,e,s) &&
    String(e.payload?.weapon||'')===String(weaponName)
  ).reduce((n,e)=>n+Math.max(1,Number(e.payload?.modelsResolved)||1),0);
}
function tacticalWeaponAvailableForPhase(entryUid,w,maxCount,round=state.round,phase=state.phase,side='my'){
  const limit=Math.max(0,Math.floor(Number(maxCount)||0));
  if(!w||limit<=0)return {available:false,count:0,reason:'No remaining models'};
  const phaseUsed=tacticalWeaponPhaseUseCount(entryUid,w.name,round,phase,side);
  const use=tacticalWeaponUseState(entryUid,w.name,side);
  if(tacticalWeaponHasRule(w,'ONE SHOT')){
    const used=Math.max(phaseUsed,Math.min(limit,use.usedCount));
    const remaining=Math.max(0,limit-used);
    return {available:remaining>0,count:remaining,reason:remaining?'':'All available One Shot weapons used',use,phaseUsed};
  }
  const remaining=Math.max(0,limit-phaseUsed);
  return {available:remaining>0,count:remaining,reason:remaining?'':'Weapon capacity already resolved this phase',use,phaseUsed};
}
function tacticalUnitIsEngaged(entryUid){
  if(!entryUid)return false;
  const pairs=ensureTacticalState().pairs||{};
  return Object.values(pairs).some(v=>v&&String(v.attackerUid||'')===String(entryUid)&&v.engagement==='engaged');
}
function tacticalUnitIsMonsterVehicle(entry){
  const unit=entry?get(entry.unitId):null;
  const keywords=(unit?.keywords||[]).map(k=>String(k||'').toUpperCase().trim());
  return keywords.includes('MONSTER')||keywords.includes('VEHICLE');
}
function tacticalUnitHasKeyword(entry,keyword){
  const unit=entry?get(entry.unitId):null;
  const wanted=String(keyword||'').toUpperCase().trim();
  return !!wanted&&(unit?.keywords||[]).some(k=>String(k||'').toUpperCase().trim()===wanted);
}
function tacticalUnitCanFly(entry){
  return tacticalUnitHasKeyword(entry,'FLY')||tacticalUnitHasKeyword(entry,'FLYING');
}
function tacticalUnitHasFightsFirst(entry){
  if(!entry)return false;
  const unit=get(entry.unitId);
  const abilities=[...(unit?.abilities||[]),...(unit?.keywords||[])].map(a=>String(a||'').toUpperCase().replace(/[-_]/g,' '));
  return abilities.some(a=>a.includes('FIGHTS FIRST')||a.includes('FIGHT FIRST'));
}
function tacticalUnitFightState(entry){
  const a=tacticalAdvisorActionState(entry?.uid);
  const engaged=tacticalUnitIsEngagedAny(entry?.uid);
  const chargeMade=a.chargeMade===true;
  const intrinsicFirst=tacticalUnitHasFightsFirst(entry);
  return {
    eligible:engaged||chargeMade,
    engaged,
    chargeMade,
    fightsFirst:intrinsicFirst||chargeMade,
    intrinsicFightsFirst:intrinsicFirst,
    fightType:engaged?'NORMAL_FIGHT':chargeMade?'OVERRUN_OR_POSITION_DEPENDENT':'INELIGIBLE',
    actionState:a
  };
}
function tacticalWeaponIsCloseQuarters(w){
  return (w?.abilities||[]).some(a=>{
    const text=String(a||'').toUpperCase().replace(/[-_]/g,' ');
    return text.includes('CLOSE QUARTERS')||text.trim()==='PISTOL'||text.includes(' PISTOL');
  });
}
function tacticalWeaponIsBlast(w){
  return (w?.abilities||[]).some(a=>String(a||'').toUpperCase().replace(/-/g,' ').includes('BLAST'));
}
function tacticalWeaponIsAssault(w){
  return tacticalWeaponHasRule(w,'ASSAULT');
}
function tacticalWeaponIsIndirect(w){
  return tacticalWeaponHasRule(w,'INDIRECT FIRE');
}
function closeQuartersForTarget(attackerEntry,targetEntry){
  if(!attackerEntry||!targetEntry)return false;
  const groups=attachedCombatWeaponGroups('my',attackerEntry,targetEntry);
  return groups.some(g=>tacticalWeaponIsCloseQuarters(g.weapon)&&tacticalWeaponPhaseEligible(g.weapon,'Shooting',attackerEntry,targetEntry));
}
function tacticalUnitIsEngagedAny(entryUid){
  if(!entryUid)return false;
  const pairs=ensureTacticalState().pairs||{};
  return Object.values(pairs).some(v=>v&&v.engagement==='engaged'&&(
    String(v.attackerUid||'')===String(entryUid)||
    String(v.targetUid||'')===String(entryUid)
  ));
}
function tacticalWeaponPhaseEligible(w,phase,attackerEntry,targetEntry,attackerSide='my',targetSide='opp'){
  if(!w)return false;
  const p=String(phase||state.phase||'Command');
  const raw=String(w.rng??w.range??'').trim().toUpperCase();
  const closeQuarters=tacticalWeaponIsCloseQuarters(w);
  const blast=tacticalWeaponIsBlast(w);
  const assault=tacticalWeaponIsAssault(w);
  const monsterVehicle=tacticalUnitIsMonsterVehicle(attackerEntry);
  const ctx=attackerEntry&&targetEntry?tacticalCombatPairState(attackerSide,targetSide,attackerEntry.uid,targetEntry.uid):null;
  const targetEngaged=!!targetEntry&&ctx?.engagement==='engaged';
  const movementEntry=attackerEntry?combatRootEntry(attackerSide,attackerEntry):null;
  const movementType=tacticalUnitMovementType(movementEntry?.uid||attackerEntry?.uid);
  const advanced=movementType==='advance';
  if(p==='Shooting'){
    if(!tacticalPhaseActionAvailable(attackerEntry?.uid,'Shooting',attackerSide))return false;
    // Catalogue melee profiles may omit an explicit "MELEE" range and
    // identify themselves only with WS. Treat WS-only weapons as melee here;
    // otherwise they leak into the Shooting selector.
    if(raw==='MELEE'||(w.WS!=null&&w.BS==null))return false;
    if(movementType==='fallback')return false;
    if(tacticalWeaponIsIndirect(w)&&tacticalUnitIsEngagedAny(attackerEntry?.uid))return false;
    // Assault Shooting is the only core-rule shooting mode available to a unit
    // that Advanced this turn. Close-quarters shooting additionally requires
    // that the unit did not Advance.
    if(advanced===true){
      if(ctx?.engagement==='engaged')return false;
      return assault;
    }
    if(targetEngaged&&blast)return false;
    if(ctx?.engagement==='engaged'){
      if(!monsterVehicle&&!closeQuarters)return false;
      return true;
    }
    if(tacticalUnitIsEngagedAny(attackerEntry?.uid))return false;
    return true;
  }
  if(p==='Fight')return !tacticalFightResolvedForSide(attackerEntry?.uid,attackerSide)&&(raw==='MELEE'||(w.WS!=null&&w.BS==null));
  return true;
}
function tacticalWeaponRange(w){
  if(!w)return null;
  let raw=String(w.rng??w.range??'').trim().toUpperCase();
  if(!raw||raw==='MELEE'||raw==='—'||raw==='-'){
    const name=String(w.name||'');
    const profile=typeof WARGEAR_PROFILES_11E==='object'
      ?Object.values(WARGEAR_PROFILES_11E).flatMap(x=>Object.values(x||{})).find(p=>p&&typeof p==='object'&&String(p.name||'')===name)
      :null;
    raw=String(profile?.rng??'').trim().toUpperCase();
  }
  if(!raw||raw==='MELEE'||raw==='—'||raw==='-'){
    const name=String(w.name||'');
    if(name&&typeof WARGEAR_PROFILES_11E==='object'){
      const profile=Object.values(WARGEAR_PROFILES_11E).flatMap(x=>Object.values(x||{})).find(p=>p&&typeof p==='object'&&p.rng&&String(p.rng).toUpperCase()!=='MELEE'&&String(p.rng).match(/\d/)&&String(p.name||'')===name);
      raw=String(profile?.rng??'').trim().toUpperCase();
    }
  }
  if(!raw)return null;
  const m=raw.match(/(\d+(?:\.\d+)?)/);
  return m?Number(m[1]):null;
}
function tacticalWeaponAbilityText(w){
  return (w?.abilities||[]).map(x=>String(x||'').toUpperCase().replace(/-/g,' ')).join(' | ');
}
function tacticalLoneOperativeRange(unit){
  const abilities=[...(unit?.abilities||[]),...(unit?.specialRules||[])].map(x=>String(x||'').toUpperCase().replace(/-/g,' '));
  const text=abilities.join(' | ');
  const match=text.match(/LONE OPERATIVE\s*(\d+(?:\.\d+)?)?/);
  if(!match)return null;
  return Number.isFinite(Number(match[1]))?Number(match[1]):12;
}
function tacticalTargetIsAttached(side,targetEntry){
  if(!targetEntry)return false;
  if(targetEntry.attachedTo)return true;
  return bodyguardLeaders(side,targetEntry.uid).length>0;
}
function tacticalRapidFireValue(w){
  const txt=tacticalWeaponAbilityText(w);
  return Number((txt.match(/RAPID FIRE\s*(\d+)/)||[])[1])||0;
}
function tacticalMeltaValue(w){
  const txt=tacticalWeaponAbilityText(w);
  return Number((txt.match(/MELTA\s*(\d+)/)||[])[1])||0;
}
function tacticalHalfRangeState(w,distanceInches){
  const range=tacticalWeaponRange(w),d=Number(distanceInches);
  const rapid=tacticalRapidFireValue(w),melta=tacticalMeltaValue(w);
  if(!Number.isFinite(range)||!Number.isFinite(d))return {rapid,melta,range,halfRange:null,active:null};
  return {rapid,melta,range,halfRange:range/2,active:d<=range/2};
}
function tacticalRapidFireState(w,distanceInches){
  const h=tacticalHalfRangeState(w,distanceInches);
  return {...h};
}
function tacticalMeltaState(w,distanceInches){
  const h=tacticalHalfRangeState(w,distanceInches);
  return {...h};
}
function engineHalfRangeActive(w,m){
  const h=tacticalHalfRangeState(w,m?.distanceInches);
  return h.active===true||m?.halfRange===true;
}
function tacticalRapidFireThreats(targetEntry,distanceInches){
  const unit=combatTargetUnit('opp',targetEntry)||get(targetEntry?.unitId);
  if(!unit)return [];
  const d=Number(distanceInches);
  if(!Number.isFinite(d))return [];
  return (unit.weapons||[]).map(w=>{
    const rf=tacticalRapidFireState(w,d);
    return {...rf,weapon:w};
  }).filter(x=>x.rapid>0&&x.range!==null);
}
function tacticalMeltaThreats(targetEntry,distanceInches){
  const unit=combatTargetUnit('opp',targetEntry)||get(targetEntry?.unitId);
  if(!unit)return [];
  const d=Number(distanceInches);
  if(!Number.isFinite(d))return [];
  return (unit.weapons||[]).map(w=>{
    const melta=tacticalMeltaState(w,d);
    return {...melta,weapon:w};
  }).filter(x=>x.melta>0&&x.range!==null);
}
function tacticalTargetLegality(attackerEntry,targetEntry,phase,attackerSide='my',targetSide='opp'){
  if(!attackerEntry||!targetEntry)return {status:'unknown',known:false,canTarget:null,reasons:['missing-unit']};
  const ctx=tacticalCombatPairState(attackerSide,targetSide,attackerEntry.uid,targetEntry.uid),p=String(phase||state.phase||'Command');
  const reasons=[];
  if(p==='Shooting'){
    const engaged=tacticalUnitIsEngagedAny(attackerEntry.uid);
    const advanced=tacticalUnitAdvancedState(attackerEntry.uid);
    const movementType=tacticalUnitMovementType(attackerEntry.uid);
    if(!tacticalPhaseActionAvailable(attackerEntry.uid,'Shooting',attackerSide))return {status:'known',known:true,canTarget:false,reasons:['attacker has already completed its Shooting action'],context:ctx};
    // Only the attacker's engagement with this selected target matters here.
    // A target being engaged with some other friendly unit does not by itself prevent shooting.
    const targetEngaged=ctx.engagement==='engaged';
    const attackerMV=tacticalUnitIsMonsterVehicle(attackerEntry);
    const targetCombatUnit=combatTargetUnit(targetSide,targetEntry)||get(targetEntry.unitId);
    const targetIsMonsterVehicle=!!targetCombatUnit&&((targetCombatUnit.keywords||[]).map(k=>String(k||'').toUpperCase().trim()).some(k=>k==='MONSTER'||k==='VEHICLE'));
    const loneRange=tacticalLoneOperativeRange(targetCombatUnit);
    const targetAttached=tacticalTargetIsAttached(targetSide,targetEntry);
    if(loneRange!==null&&!targetAttached){
      if(ctx.distanceInches===null)reasons.push('Lone Operative range unknown');
      else if(ctx.distanceInches>loneRange)return {status:'known',known:true,canTarget:false,reasons:['Lone Operative: attacker is '+String(ctx.distanceInches)+'" away; target must be within '+loneRange+'".'],context:ctx};
    }
    if(advanced===null)reasons.push('movement not recorded for attacker');
    if(engaged&&ctx.engagement!=='engaged'){
      if(!attackerMV){
        return {status:'known',known:true,canTarget:false,reasons:['engaged unit can only shoot its engaged target with Close-quarters shooting'],context:ctx};
      }
      if(!closeQuartersForTarget(attackerEntry,targetEntry)){
        return {status:'known',known:true,canTarget:false,reasons:['engaged MONSTER/VEHICLE requires an eligible Close-quarters shooting attack against this target'],context:ctx};
      }
    }
    // A target's engagement with a different friendly unit does not by itself make it illegal to shoot.
    const groups=tacticalAdvisorWeaponGroups(attackerSide,attackerEntry,targetEntry).filter(g=>tacticalWeaponPhaseEligible(g.weapon,'Shooting',attackerEntry,targetEntry,attackerSide,targetSide));
    const hasIndirect=groups.some(g=>tacticalWeaponIsIndirect(g.weapon));
    if(ctx.los==='no'&&!hasIndirect){
      return {status:'known',known:true,canTarget:false,reasons:['line of sight confirmed unavailable and no Indirect Fire weapon is eligible'],context:ctx};
    }
    if(ctx.los==='no'&&hasIndirect)reasons.push('using Indirect Fire; attacking model lacks line of sight');
    const ranges=groups.map(g=>tacticalWeaponRange(g.weapon)).filter(Number.isFinite);
    if(!groups.length)return {status:'known',known:true,canTarget:false,reasons:['attacker has no phase-eligible ranged weapons'],context:ctx};
    if(!ranges.length)reasons.push('weapon range unknown');
    if(ctx.distanceInches===null)reasons.push('range unknown');
    if(ctx.los==='unknown')reasons.push('line of sight unknown');
    if(ctx.distanceInches!==null&&ranges.length&&Math.max(...ranges)<ctx.distanceInches)reasons.push('target is beyond all known weapon ranges');
    const blocked=reasons.some(x=>x==='target is beyond all known weapon ranges');
    return {status:blocked?'known':(reasons.length?'unknown':'known'),known:!reasons.length||blocked,canTarget:blocked?false:(reasons.length?null:true),reasons,context:ctx};
  }
  if(p==='Charge'){
    if(!tacticalPhaseActionAvailable(attackerEntry.uid,'Charge',attackerSide))return {status:'known',known:true,canTarget:false,reasons:['attacker has already completed its Charge action'],context:ctx};
    const movementType=tacticalUnitMovementType(combatRootEntry(attackerSide,attackerEntry)?.uid||attackerEntry.uid);
    if(tacticalUnitHasKeyword(attackerEntry,'AIRCRAFT'))reasons.push('AIRCRAFT units cannot declare charges');
    if(tacticalUnitHasKeyword(targetEntry,'AIRCRAFT')&&!tacticalUnitCanFly(attackerEntry))reasons.push('only FLYING units can select AIRCRAFT units as charge targets');
    if(movementType==='advance')reasons.push('attacker advanced and cannot declare a charge');
    if(movementType==='fallback')reasons.push('attacker fell back and cannot declare a charge');
    if(tacticalUnitIsEngagedAny(attackerEntry.uid))reasons.push('attacker is already engaged');
    if(ctx.distanceInches===null)reasons.push('distance unknown');
    if(ctx.distanceInches!==null&&ctx.distanceInches>12)reasons.push('target is beyond the 12-inch charge declaration range');
    if(ctx.engagement==='unknown')reasons.push('engagement status unknown');
    if(ctx.engagement==='engaged')reasons.push('target is already within engagement range');
    const blocked=reasons.some(x=>x==='AIRCRAFT units cannot declare charges'||x==='only FLYING units can select AIRCRAFT units as charge targets'||x==='attacker advanced and cannot declare a charge'||x==='attacker fell back and cannot declare a charge'||x==='attacker is already engaged'||x==='target is beyond the 12-inch charge declaration range'||x==='target is already within engagement range');
    return {status:blocked?'known':(reasons.length?'unknown':'known'),known:!reasons.length||blocked,canTarget:blocked?false:(reasons.length?null:true),reasons,context:ctx};
  }
  if(p==='Fight'){
    if(!tacticalPhaseActionAvailable(attackerEntry.uid,'Fight',attackerSide))return {status:'known',known:true,canTarget:false,reasons:['attacker has already completed its Fight action'],context:ctx};
    const fightState=tacticalUnitFightState(attackerEntry),unitState=tacticalFightUnitState(attackerEntry.uid);
    const overrunEligible=unitState.engagedAtFightStart===true||unitState.becameEngagedDuringFight===true,effectiveEligible=fightState.eligible||overrunEligible;
    if(!effectiveEligible&&ctx.engagement==='unknown')reasons.push('engagement status unknown');
    if(!effectiveEligible&&ctx.engagement==='notEngaged')reasons.push('unit is not engaged, did not make a Charge move, and has no confirmed Overrun eligibility');
    if(fightState.chargeMade&&ctx.engagement!=='engaged')reasons.push('unit made a Charge move; pile-in/engagement state is needed before selecting melee targets');
    if(overrunEligible&&ctx.engagement!=='engaged')reasons.push('Overrun eligibility is confirmed, but a current engaged target is still required');
    if(unitState.pileInDone===false&&effectiveEligible)reasons.push('pile-in status is unresolved');
    if(tacticalUnitHasKeyword(attackerEntry,'AIRCRAFT'))reasons.push('AIRCRAFT units can only make melee attacks against FLYING units');
    if(tacticalUnitHasKeyword(targetEntry,'AIRCRAFT')&&!tacticalUnitCanFly(attackerEntry))reasons.push('only FLYING models can make melee attacks against AIRCRAFT units');
    const blockedAircraft=reasons.some(x=>x==='AIRCRAFT units can only make melee attacks against FLYING units'||x==='only FLYING models can make melee attacks against AIRCRAFT units');
    const hardBlocked=!effectiveEligible&&ctx.engagement==='notEngaged',targetEligible=effectiveEligible&&ctx.engagement==='engaged';
    return {status:blockedAircraft||hardBlocked?'known':(targetEligible?'known':'unknown'),known:blockedAircraft||hardBlocked||targetEligible,canTarget:blockedAircraft||hardBlocked?false:(targetEligible?true:null),reasons,context:ctx,
      fightState:{...fightState,...unitState,overrunEligible,effectiveEligible,fightType:fightState.engaged?'NORMAL_FIGHT':fightState.chargeMade?'CHARGE_FIGHT':overrunEligible?'OVERRUN_FIGHT':'INELIGIBLE'}};
  }
  return {status:'notRequired',known:true,canTarget:true,reasons,context:ctx};
}
  return Object.freeze({tacticalFightPhaseState,setTacticalFightPhase,tacticalFightUnitState,setTacticalFightUnitState,tacticalFightOrderState,tacticalPairKey,tacticalDistanceBandFromInches,battlefieldTerrainContextBetweenUnits,tacticalCombatPairState,tacticalPairState,setTacticalPairField,clearTacticalPair,tacticalAdvisorActionState,tacticalUnitMovementTypeLegacy,tacticalUnitMovementType,tacticalUnitAdvancedState,setTacticalUnitAction,recordTacticalChargeResult,setTacticalUnitAdvanced,tacticalFightResolvedForSide,tacticalPhaseActionAvailable,tacticalWeaponUseKey,tacticalWeaponCanonicalEntryUid,tacticalWeaponUseState,tacticalWeaponHasRule,tacticalWeaponBattleUseCount,tacticalWeaponAvailable,setTacticalWeaponUsed,tacticalWeaponShootingMode,tacticalWeaponEventEntryMatches,tacticalWeaponModelUseEvents,tacticalWeaponModelWeaponInstanceCount,tacticalWeaponModelUseCount,tacticalWeaponModelAvailable,tacticalWeaponModelAlreadyUsed,tacticalWeaponModelModeConflict,tacticalWeaponPhaseUseCount,tacticalWeaponAvailableForPhase,tacticalUnitIsEngaged,tacticalUnitIsMonsterVehicle,tacticalUnitHasKeyword,tacticalUnitCanFly,tacticalUnitHasFightsFirst,tacticalUnitFightState,tacticalWeaponIsCloseQuarters,tacticalWeaponIsBlast,tacticalWeaponIsAssault,tacticalWeaponIsIndirect,closeQuartersForTarget,tacticalUnitIsEngagedAny,tacticalWeaponPhaseEligible,tacticalWeaponRange,tacticalWeaponAbilityText,tacticalLoneOperativeRange,tacticalTargetIsAttached,tacticalRapidFireValue,tacticalMeltaValue,tacticalHalfRangeState,tacticalRapidFireState,tacticalMeltaState,engineHalfRangeActive,tacticalRapidFireThreats,tacticalMeltaThreats,tacticalTargetLegality});
}
window.OnoForgeTacticalCombatState=Object.freeze({createTacticalCombatStateController});