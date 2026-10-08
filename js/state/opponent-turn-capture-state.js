function createOpponentTurnCaptureStateController({getState,ensureTacticalState,entry,tacticalUnitState,tacticalPairKey,tacticalCombatPairState,event,snapshotForUndo,save,render,uid,unitDisplayName}){
  const state=getState();
function ensureOpponentTurnCaptureState(){
  const t=ensureTacticalState(),raw=t.opponentCapture&&typeof t.opponentCapture==='object'?t.opponentCapture:{};
  t.opponentCapture={
    attackerUid:typeof raw.attackerUid==='string'?raw.attackerUid:'',
    targetUid:typeof raw.targetUid==='string'?raw.targetUid:'',
    weaponName:typeof raw.weaponName==='string'?raw.weaponName:'',
    chargeTargets:Array.isArray(raw.chargeTargets)?raw.chargeTargets.map(String):[]
  };
  return t.opponentCapture;
}
function setOpponentTurnCapture(field,value){
  const s=ensureOpponentTurnCaptureState();
  if(['attackerUid','targetUid','weaponName'].includes(field))s[field]=String(value||'');
  save();render();
}
function setOpponentChargeTarget(uid,checked){
  const s=ensureOpponentTurnCaptureState(),id=String(uid||''),selected=new Set(s.chargeTargets||[]);
  if(checked)selected.add(id);else selected.delete(id);
  s.chargeTargets=[...selected];save();
}
function tacticalOpponentWeaponChoices(attackerSide,targetSide,attackerEntry,targetEntry,phase){
  if(!attackerEntry||!targetEntry)return [];
  const groups=attachedCombatWeaponGroups(attackerSide,attackerEntry,targetEntry)
    .filter(g=>tacticalWeaponPhaseEligible(g.weapon,phase,attackerEntry,targetEntry,attackerSide,targetSide));
  const out=[],seen=new Set();
  groups.forEach(g=>{
    const w=g.weapon;if(!w||!w.name)return;
    const key=String(w.name)+'|'+String(w.WS??w.BS??'')+'|'+String(w.A??'')+'|'+String(w.D??'');
    if(seen.has(key))return;
    seen.add(key);out.push(w);
  });
  return out;
}
function tacticalOpenOpponentCombatResolution(phase,attackerUid,targetUid,weaponName){
  if(state.currentTurn!=='opp'){alert('Opponent resolution controls are only available during the opponent turn.');return;}
  if(String(state.phase||'')!==String(phase||'')){alert('This control is for the current '+String(state.phase||'')+' phase.');return;}
  if(!attackerUid||!targetUid||!weaponName){alert('Select the attacking unit, target unit, and weapon profile first.');return;}
  if(!tacticalPreRollOpenResolutionForSides('opp','my',attackerUid,targetUid,weaponName)){
    alert('The shared physical-dice resolver could not open this attack. Re-check the selected units and the current battlefield context.');
  }
}
function recordOpponentChargeResult(attackerUid,targetUids,result,requiredRoll,rolledTotal,measuredDistance,engagementState,movementObserved){
  if(state.currentTurn!=='opp'||String(state.phase||'')!=='Charge')return;
  const ids=[...new Set((Array.isArray(targetUids)?targetUids:[]).map(String).filter(Boolean))];
  const normalized=String(result||'').toLowerCase()==='successful'?'Successful':String(result||'').toLowerCase()==='failed'?'Failed':'';
  if(!attackerUid||!ids.length){alert('Select the enemy charging unit and at least one friendly target.');return;}
  if(!normalized){alert('Choose Successful or Failed.');return;}
  const req=requiredRoll===''||requiredRoll==null?null:Number(requiredRoll);
  const roll=rolledTotal===''||rolledTotal==null?null:Number(rolledTotal);
  const distance=measuredDistance===''||measuredDistance==null?null:Number(measuredDistance);
  const engagement=['engaged','notEngaged','unknown'].includes(String(engagementState||''))?String(engagementState):'unknown';
  const observed=['observed','notObserved','unknown'].includes(String(movementObserved||''))?String(movementObserved):'unknown';
  const before=snapshotForUndo(),t=ensureTacticalState(),round=Math.max(1,Number(state.round)||1),ae=entry('opp',attackerUid);
  const oldAction=tacticalAdvisorActionState(attackerUid);
  t.unitActions[String(attackerUid)]={...oldAction,round,playerTurn:'opp',chargeDone:true,chargeMade:normalized==='Successful',chargeTargets:ids};
  ids.forEach(targetUid=>{
    const key=tacticalPairKey(attackerUid,targetUid),oldPair=t.pairs[key]&&typeof t.pairs[key]==='object'?t.pairs[key]:{};
    t.pairs[key]={...oldPair,attackerUid:String(attackerUid),targetUid:String(targetUid),engagement};
  });
  const targets=ids.map(id=>entry('my',id)).filter(Boolean);
  event('CHARGE_RESOLUTION',{
    side:'opp',attackerSide:'opp',targetSide:'my',attackerEntryUid:String(attackerUid),
    attacker:ae?.name||get(ae?.unitId)?.name||String(attackerUid),targetEntryUids:ids,
    targets:targets.map(e=>unitDisplayName('my',e)),result:normalized,
    requiredRoll:Number.isFinite(req)?req:null,rolledTotal:Number.isFinite(roll)?roll:null,
    measuredDistance:Number.isFinite(distance)&&distance>=0?Math.round(distance*10)/10:null,
    engagementState:engagement,movementObserved:observed,chargeMoveInferred:false
  },before);
  save();render();
}

function tacticalMovementTrackerHtml(){
  return Object.freeze({ensureOpponentTurnCaptureState,setOpponentTurnCapture,setOpponentChargeTarget,tacticalOpponentWeaponChoices,tacticalOpenOpponentCombatResolution,recordOpponentChargeResult,tacticalMovementTrackerHtml});
}
window.OnoForgeOpponentTurnCaptureState=Object.freeze({createOpponentTurnCaptureStateController});
}
