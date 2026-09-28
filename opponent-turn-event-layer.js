/* OnoForge 40K — Opponent-turn combat history adapter
 *
 * Read-only adapter. The authoritative history is state.events.
 * This layer normalizes ATTACK_RESOLUTION and CHARGE_RESOLUTION events
 * emitted by the shared combat/charge workflows for diagnostics and UI.
 */
(function(global){
  'use strict';

  const VERSION=2;
  const sideOf=v=>String(v||'').toLowerCase()==='opp'?'opp':String(v||'').toLowerCase()==='my'?'my':null;
  const phaseOf=v=>String(v||'').trim().toLowerCase();
  const asId=v=>v==null||v===''?null:String(v);
  const finite=v=>Number.isFinite(Number(v))?Number(v):null;

  function currentTurn(){
    const s=global.state||{};
    return sideOf(s.currentTurn);
  }

  function entryExists(uid,side){
    if(typeof global.entry!=='function'||!uid)return false;
    try{return !!global.entry(side,uid);}catch(_e){return false;}
  }

  function normalizeAttackEvent(e){
    const p=e?.payload&&typeof e.payload==='object'?e.payload:{};
    const attackerSide=sideOf(p.attackerSide||p.sourceSide||p.side||e?.playerTurn);
    const targetSide=sideOf(p.targetSide||p.defenderSide)||(attackerSide==='opp'?'my':attackerSide==='my'?'opp':null);
    const attackerUid=asId(p.attackerEntryUid||p.attackerUid||p.sourceUid);
    const targetUid=asId(p.targetEntryUid||p.targetUid||p.defenderUid);
    const phase=phaseOf(p.phase||e?.phase);
    if(!attackerSide||!targetSide||!attackerUid||!targetUid)return null;
    if(phase!=='shooting'&&phase!=='fight')return null;
    if(!entryExists(attackerUid,attackerSide)||!entryExists(targetUid,targetSide))return null;
    return {
      eventId:asId(e?.id),resolutionId:asId(p.resolutionId),
      kind:phase==='shooting'?'opponent-shooting':'opponent-fight',
      eventKind:e?.kind||'ATTACK_RESOLUTION',phase:phase==='shooting'?'Shooting':'Fight',
      round:Math.max(1,Number(e?.round||global.state?.round)||1),
      attackerSide,targetSide,attackerUid,targetUid,
      attacker:String(p.attacker||attackerUid),target:String(p.target||targetUid),
      damage:finite(p.damage??p.appliedDamage??p.totalDamage),
      casualties:finite(p.casualties??p.modelsKilled??p.modelsLost??p.kills),
      wounds:finite(p.wounds??p.woundsLost),
      modelIds:Array.isArray(p.modelIds)?p.modelIds.map(asId).filter(Boolean):null,
      before:p.before||e?.before||null,after:p.after||null
    };
  }

  function normalizeChargeEvent(e){
    const p=e?.payload&&typeof e.payload==='object'?e.payload:{};
    const attackerSide=sideOf(p.attackerSide||p.sourceSide||p.side||e?.playerTurn);
    const targetSide=sideOf(p.targetSide||p.defenderSide)||(attackerSide==='opp'?'my':attackerSide==='my'?'opp':null);
    const attackerUid=asId(p.attackerEntryUid||p.attackerUid||p.sourceUid||p.entryUid);
    const targetUids=Array.isArray(p.targetEntryUids)
      ?p.targetEntryUids.map(asId).filter(Boolean)
      :asId(p.targetEntryUid||p.targetUid||p.defenderUid)?[asId(p.targetEntryUid||p.targetUid||p.defenderUid)]:[];
    const result=String(p.result??p.outcome??'');
    if(!attackerSide||!targetSide||!attackerUid||!targetUids.length)return null;
    if(phaseOf(p.phase||e?.phase)!=='charge')return null;
    if(!entryExists(attackerUid,attackerSide)||targetUids.some(uid=>!entryExists(uid,targetSide)))return null;
    if(result!=='Successful'&&result!=='Failed')return null;
    return {
      eventId:asId(e?.id),resolutionId:asId(p.resolutionId),
      kind:attackerSide==='opp'?'opponent-charge':'charge',
      eventKind:e?.kind||'CHARGE_RESOLUTION',phase:'Charge',
      round:Math.max(1,Number(e?.round||global.state?.round)||1),
      attackerSide,targetSide,attackerUid,targetUids,
      attacker:String(p.attacker||attackerUid),
      result,
      requiredRoll:finite(p.requiredRoll),rolledTotal:finite(p.rolledTotal),
      measuredDistance:finite(p.measuredDistance),
      engagementState:p.engagementState??'unknown',
      movementObserved:p.movementObserved??'unknown',
      chargeMoveInferred:p.chargeMoveInferred===true
    };
  }

  function historyFromState(){
    const events=Array.isArray(global.state?.events)?global.state.events:[];
    return events.map(e=>{
      if(e?.kind==='ATTACK_RESOLUTION')return normalizeAttackEvent(e);
      if(e?.kind==='CHARGE_RESOLUTION'||e?.kind==='CHARGE_RESULT')return normalizeChargeEvent(e);
      return null;
    }).filter(Boolean);
  }

  function capture(type,payload){
    const fake={id:null,kind:String(type||''),round:global.state?.round,phase:payload?.phase||global.state?.phase,playerTurn:global.state?.currentTurn,payload:payload||{}};
    if(String(type||'').toUpperCase()==='ATTACK_RESOLUTION'||String(type||'').toUpperCase()==='OPPONENT_SHOOTING_CAPTURE'||String(type||'').toUpperCase()==='OPPONENT_FIGHT_CAPTURE')return normalizeAttackEvent(fake);
    if(String(type||'').toUpperCase()==='CHARGE_RESOLUTION'||String(type||'').toUpperCase()==='CHARGE_RESULT'||String(type||'').toUpperCase()==='OPPONENT_CHARGE_CAPTURE')return normalizeChargeEvent(fake);
    return null;
  }

  function ensureHistory(){return historyFromState();}
  function install(){return true;}

  global.ONOFORGE_OPPONENT_EVENT_CAPTURE=Object.freeze({VERSION,ensureHistory,getHistory:historyFromState,capture,install});
})(window);
