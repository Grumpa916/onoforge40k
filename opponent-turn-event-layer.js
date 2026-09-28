/* OnoForge 40K — Opponent-turn authoritative event capture
 *
 * Observation layer only. It never invents battlefield facts and never resolves
 * combat. It consumes explicit events emitted by the existing shared engine,
 * then stores normalized bidirectional combat history for the canonical Advisor.
 */
(function(global){
  'use strict';

  const VERSION=1;
  const sideOf=v=>String(v||'').toLowerCase()==='opp'?'opp':String(v||'').toLowerCase()==='my'?'my':null;
  const phaseOf=v=>String(v||'').trim().toLowerCase();
  const asId=v=>v==null||v===''?null:String(v);
  const finite=v=>Number.isFinite(Number(v))?Number(v):null;

  function ensureHistory(){
    const s=global.state;
    if(!s)return null;
    if(!s.combatHistory||typeof s.combatHistory!=='object')s.combatHistory={version:VERSION,events:[]};
    if(!Array.isArray(s.combatHistory.events))s.combatHistory.events=[];
    if(!Number.isFinite(Number(s.combatHistory.version)))s.combatHistory.version=VERSION;
    return s.combatHistory;
  }

  function currentTurn(){
    const s=global.state||{};
    return String(s.currentTurn||'').toLowerCase()==='opp'?'opp':String(s.currentTurn||'').toLowerCase()==='my'?'my':null;
  }

  function survivingState(uid,side){
    const get=typeof global.get==='function'?global.get:null;
    const e=typeof global.entry==='function'&&uid!=null
      ?(()=>{try{return global.entry(side,uid)||null;}catch(_e){return null;}})()
      :null;
    if(!e)return {unitUid:asId(uid),survivingModels:null,totalModels:null,woundsRemaining:null,totalWounds:null,unitAlive:null};
    const u=get&&e.unitId!=null?get(e.unitId):null;
    const models=Array.isArray(u?.modelRoster)?u.modelRoster:null;
    const aliveModels=models?models.filter(m=>m&&m.alive!==false):null;
    const totalModels=finite(u?.models);
    const totalWounds=finite(u?.wounds);
    const aliveWounds=models?models.reduce((n,m)=>n+Math.max(0,finite(m?.woundsRemaining)||0),0):null;
    return {
      unitUid:asId(uid),
      survivingModels:aliveModels?aliveModels.length:null,
      totalModels,
      woundsRemaining:aliveWounds,
      totalWounds,
      unitAlive:aliveModels?aliveModels.length>0:(totalWounds!=null?totalWounds>0:null)
    };
  }

  function uniqueSideEntry(uid,expectedSide){
    if(typeof global.entry!=='function')return null;
    try{
      const expected=global.entry(expectedSide,uid)||null;
      const other=global.entry(expectedSide==='my'?'opp':'my',uid)||null;
      return expected&&!other?expected:null;
    }catch(_e){return null;}
  }

  function normalizeAttack(payload){
    const p=payload&&typeof payload==='object'?payload:{};
    const attackerSide=sideOf(p.attackerSide||p.sourceSide||p.side);
    const attackerUid=asId(p.attackerUid||p.attackerEntryUid||p.sourceUid||p.attacker?.uid);
    const targetUid=asId(p.targetUid||p.targetEntryUid||p.defenderUid||p.target?.uid);
    if(attackerSide!=='opp'||!attackerUid||!targetUid)return null;
    if(!uniqueSideEntry(attackerUid,'opp')||!uniqueSideEntry(targetUid,'my'))return null;
    const phase=phaseOf(p.phase||global.state?.phase);
    if(phase!=='shooting'&&phase!=='fight')return null;
    return {
      kind:phase==='shooting'?'opponent-shooting':'opponent-fight',
      phase:phase==='shooting'?'Shooting':'Fight',
      round:Math.max(1,Number(global.state?.round)||1),
      attackerSide,targetSide:'my',attackerUid,targetUid,
      damage:finite(p.damage??p.appliedDamage??p.totalDamage),
      casualties:finite(p.casualties??p.modelsLost??p.kills),
      wounds:finite(p.wounds??p.woundsLost),
      modelsAffected:Array.isArray(p.modelIds)?p.modelIds.map(asId).filter(Boolean):null,
      sourceEvent:p.eventType||p.action||'ATTACK_RESOLUTION',
      targetState:survivingState(targetUid,'my')
    };
  }

  function normalizeCharge(payload){
    const p=payload&&typeof payload==='object'?payload:{};
    const attackerSide=sideOf(p.attackerSide||p.sourceSide||p.side);
    const targetSide=sideOf(p.targetSide||p.defenderSide);
    if(attackerSide!=='opp'||targetSide!=='my')return null;
    const attackerUid=asId(p.attackerUid||p.sourceUid||p.entryUid);
    const targetUid=asId(p.targetUid||p.defenderUid||p.targetEntryUid);
    if(!attackerUid||!targetUid)return null;
    if(!uniqueSideEntry(attackerUid,'opp')||!uniqueSideEntry(targetUid,'my'))return null;
    const result=p.result??p.success??p.chargeSuccessful??p.outcome;
    const success=result===true||String(result).toLowerCase()==='successful'||String(result).toLowerCase()==='success';
    const failed=result===false||String(result).toLowerCase()==='failed'||String(result).toLowerCase()==='failure';
    if(!success&&!failed)return null;
    return {
      kind:'opponent-charge',phase:'Charge',round:Math.max(1,Number(global.state?.round)||1),
      attackerSide,targetSide,attackerUid,targetUid,
      result:success?'Successful':'Failed',
      requiredRoll:finite(p.requiredRoll||p.requiredChargeRoll),
      rolledTotal:finite(p.rolledTotal||p.rollTotal||p.chargeRoll),
      measuredDistance:finite(p.measuredDistance||p.physicalDistance),
      engagementState:p.engagementState??p.engaged??null,
      sourceEvent:p.eventType||p.action||'CHARGE_RESULT'
    };
  }

  function push(record){
    if(!record)return null;
    const h=ensureHistory();
    if(!h)return null;
    const prior=h.events[h.events.length-1];
    if(prior&&JSON.stringify(prior.record||prior)===JSON.stringify(record))return prior;
    const stamped={record,id:'combat-'+Date.now()+'-'+h.events.length,turn:currentTurn(),capturedAt:new Date().toISOString()};
    h.events.push(stamped);
    return stamped;
  }

  function capture(type,payload){
    if(currentTurn()!=='opp')return null;
    const t=String(type||'').toUpperCase();
    if(t==='ATTACK_RESOLUTION'||t==='OPPONENT_SHOOTING_CAPTURE'||t==='OPPONENT_FIGHT_CAPTURE'){
      const record=normalizeAttack({...payload,phase:payload?.phase||global.state?.phase,attackerSide:payload?.attackerSide||payload?.side,targetSide:payload?.targetSide||'my'});
      if(t==='OPPONENT_SHOOTING_CAPTURE'&&record)record.kind='opponent-shooting';
      if(t==='OPPONENT_FIGHT_CAPTURE'&&record)record.kind='opponent-fight';
      return push(record);
    }
    if(t==='CHARGE_RESULT'||t==='CHARGE RESULT'||t==='OPPONENT_CHARGE_CAPTURE'||String(payload?.action||'').toUpperCase()==='CHARGE RESULT')return push(normalizeCharge(payload));
    return null;
  }

  function install(){
    if(global.__ONOFORGE_OPPONENT_EVENT_LAYER_INSTALLED)return;
    global.__ONOFORGE_OPPONENT_EVENT_LAYER_INSTALLED=true;
    const wait=()=>{
      if(typeof global.event==='function'){
        const original=global.event;
        global.event=function(type,payload,before){
          const result=original.apply(this,arguments);
          try{capture(type,payload);}catch(_e){}
          return result;
        };
        ensureHistory();
        return;
      }
      global.setTimeout(wait,50);
    };
    wait();
  }

  global.ONOFORGE_OPPONENT_EVENT_CAPTURE=Object.freeze({ensureHistory,capture,install});
  install();
})(window);
