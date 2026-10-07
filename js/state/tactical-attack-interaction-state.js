function createTacticalAttackInteractionStateController({
  getState,
  entry,
  attachedCombatWeaponGroups,
  snapshotForUndo,
  combatTargetUnit,
  get,
  modelRosterRule,
  ensureModelRoster,
  syncModelRosterBattleState,
  combatRootEntry,
  tacticalAdvisorActionState,
  ensureTacticalState,
  event,
  uid,
  unitDisplayName,
  save,
  render,
  ensureOpponentTurnCaptureState,
  tacticalAdvisorAttackerEntry,
  tacticalPreRollWeaponState
}){
  function recordTacticalAttackInteraction(attackerSide,targetSide,attackerUid,targetUid,weaponName,actualDamage){
    const state=getState();
    const as=attackerSide==='opp'?'opp':'my',ts=targetSide==='my'?'my':'opp',ae=entry(as,attackerUid),te=entry(ts,targetUid),name=String(weaponName||''),damage=Math.max(0,Number(actualDamage)||0);
    if(!ae||!te||!name){alert('Select the attacker, target, and weapon first.');return false;}
    const weapon=attachedCombatWeaponGroups(as,ae,te).map(g=>g.weapon).find(w=>String(w.name)===name);
    if(!weapon){alert('The selected weapon is no longer available for this attack.');return false;}
    const before=snapshotForUndo(),targetUnit=combatTargetUnit(ts,te)||get(te.unitId);if(!targetUnit)return false;
    if(modelRosterRule(targetUnit)){
      const roster=ensureModelRoster(te,targetUnit),alive=roster.filter(m=>m.alive!==false).sort((a,b)=>Math.max(0,Number(a.woundsRemaining)||0)-Math.max(0,Number(b.woundsRemaining)||0));let remaining=damage;
      for(const model of alive){if(remaining<=0)break;const prior=Math.max(0,Number(model.woundsRemaining)||0),applied=Math.min(prior,remaining);model.woundsRemaining=Math.max(0,prior-applied);model.alive=model.woundsRemaining>0;remaining-=applied;}
      syncModelRosterBattleState(te,targetUnit);
    }else{
      const maxWounds=Math.max(0,Number(te.models)||1)*Math.max(1,Number(targetUnit.wounds)||1);
      te.game=te.game||{entryId:te.uid,models:te.models,wounds:maxWounds,status:'Alive'};
      te.game.wounds=Math.max(0,Math.min(maxWounds,Number(te.game.wounds??maxWounds)-damage));
      te.game.models=Math.max(0,Math.ceil(te.game.wounds/Math.max(1,Number(targetUnit.wounds)||1)));
      te.game.status=te.game.wounds<=0?'Destroyed':te.game.wounds<maxWounds?'Damaged':'Alive';
    }
    const actionRoot=combatRootEntry(as,ae)||ae,actionState=tacticalAdvisorActionState(actionRoot.uid);
    if(state.phase==='Shooting')actionState.shootingDone=true;if(state.phase==='Fight')actionState.fightDone=true;
    actionState.round=Math.max(1,Number(state.round)||1);actionState.playerTurn=state.currentTurn;ensureTacticalState().unitActions[String(actionRoot.uid)]={...actionState};
    const targetBefore=before?.[ts]?.find?.(x=>x.uid===te.uid)?.game||{};
    event('ATTACK_INTERACTION',{resolutionId:uid(),side:as,attackerSide:as,targetSide:ts,phase:String(state.phase||''),round:Math.max(1,Number(state.round)||1),attacker:unitDisplayName(as,ae),attackerEntryUid:ae.uid,target:unitDisplayName(ts,te),targetEntryUid:te.uid,weapon:name,actualDamage:damage,damageRecorded:true,before:JSON.parse(JSON.stringify(targetBefore)),after:JSON.parse(JSON.stringify(te.game||{})),diceEntry:false},before);
    save();render();return true;
  }

  function recordMyTacticalAttackInteractionFromUi(){
    const state=getState();
    const ae=tacticalAdvisorAttackerEntry(),teUid=state.tactical?.selectedTargetUid,te=teUid?entry('opp',teUid):null,weaponName=ae&&te?tacticalPreRollWeaponState(ae.uid,te.uid).weaponName:'';
    if(!ae||!te||!weaponName){alert('Select the attacker, target, and weapon first.');return;}
    const raw=window.prompt('Actual damage inflicted? Enter 0 if the attack caused no damage.');if(raw===null)return;
    const n=Number(raw);if(!Number.isFinite(n)||n<0){alert('Enter a valid damage amount (0 or greater).');return;}
    recordTacticalAttackInteraction('my','opp',ae.uid,te.uid,weaponName,n);
  }

  function recordOpponentTacticalAttackInteractionFromUi(){
    const capture=ensureOpponentTurnCaptureState(),ae=entry('opp',capture.attackerUid),te=entry('my',capture.targetUid),weaponName=String(capture.weaponName||'');
    if(!ae||!te||!weaponName){alert('Select the attacking unit, target unit, and weapon first.');return;}
    const raw=window.prompt('Actual damage inflicted? Enter 0 if the attack caused no damage.');if(raw===null)return;
    const n=Number(raw);if(!Number.isFinite(n)||n<0){alert('Enter a valid damage amount (0 or greater).');return;}
    recordTacticalAttackInteraction('opp','my',ae.uid,te.uid,weaponName,n);
  }

  return Object.freeze({recordTacticalAttackInteraction,recordMyTacticalAttackInteractionFromUi,recordOpponentTacticalAttackInteractionFromUi});
}
window.OnoForgeTacticalAttackInteractionState=Object.freeze({createTacticalAttackInteractionStateController});