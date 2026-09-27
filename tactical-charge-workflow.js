(function(global){
  'use strict';

  function tacticalState(){
    if(typeof global.ensureTacticalState==='function')return global.ensureTacticalState();
    global.state=global.state||{};
    global.state.tactical=global.state.tactical||{};
    const t=global.state.tactical;
    if(!t.unitActions||typeof t.unitActions!=='object')t.unitActions={};
    if(!t.pairs||typeof t.pairs!=='object')t.pairs={};
    if(!t.fightPhase||typeof t.fightPhase!=='object')t.fightPhase={};
    return t;
  }

  function key(attackerUid,targetUid){return String(attackerUid||'')+'>'+String(targetUid||'');}
  function currentRound(){return Math.max(1,Number(global.state?.round)||1);}
  function currentTurn(){return global.state?.currentTurn==='opp'?'opp':'my';}
  function targetEntry(targetUid){return (global.state?.opp||[]).find(e=>e&&String(e.uid)===String(targetUid))||null;}
  function pairRecord(attackerUid,targetUid){const t=tacticalState();const raw=t.pairs[key(attackerUid,targetUid)];return raw&&typeof raw==='object'?raw:null;}
  function physicallyMeasured(attackerUid,targetUid){const d=Number(pairRecord(attackerUid,targetUid)?.distanceInches);return Number.isFinite(d)&&d>=0;}

  function legalChargeTarget(attackerUid,targetUid){
    if(typeof global.getTacticalTargetLegalityCached==='function'){
      const e=(global.state?.opp||[]).find(x=>x&&String(x.uid)===String(targetUid));
      const a=(global.state?.my||[]).find(x=>x&&String(x.uid)===String(attackerUid));
      if(a&&e)return global.getTacticalTargetLegalityCached(a,e,'Charge');
    }
    if(typeof global.tacticalTargetLegality==='function'){
      const e=(global.state?.opp||[]).find(x=>x&&String(x.uid)===String(targetUid));
      const a=(global.state?.my||[]).find(x=>x&&String(x.uid)===String(attackerUid));
      if(a&&e)return global.tacticalTargetLegality(a,e,'Charge');
    }
    return {canTarget:null,reasons:['charge legality could not be re-evaluated']};
  }

  function snapshot(){
    if(typeof global.snapshotForUndo==='function')return global.snapshotForUndo();
    try{return JSON.parse(JSON.stringify(global.state||{}));}catch(e){return null;}
  }
  function persist(){if(typeof global.save==='function')global.save();if(typeof global.render==='function')global.render();}
  function emit(kind,payload,before){if(typeof global.event==='function')global.event(kind,payload,before);}

  function setPairEngaged(attackerUid,targetUid,engaged){
    const t=tacticalState(),k=key(attackerUid,targetUid),cur=t.pairs[k]&&typeof t.pairs[k]==='object'?t.pairs[k]:{};
    t.pairs[k]={attackerUid,targetUid,distanceInches:cur.distanceInches,distanceBand:cur.distanceBand,los:cur.los,engagement:engaged?'engaged':'notEngaged',objective:cur.objective,notes:cur.notes};
  }
  function recordAction(attackerUid,chargeMade,targetUids){
    const t=tacticalState(),uid=String(attackerUid),round=currentRound(),turn=currentTurn();
    const cur=t.unitActions[uid]&&typeof t.unitActions[uid]==='object'?t.unitActions[uid]:{};
    t.unitActions[uid]={...cur,entryUid:uid,round,playerTurn:turn,chargeDone:true,chargeMade:chargeMade===true,chargeTargets:targetUids.map(String)};
  }
  function setFightState(attackerUid,targetUids,engaged){
    const t=tacticalState(),raw=t.fightPhase&&typeof t.fightPhase==='object'?t.fightPhase:{};
    const phase=(typeof global.tacticalFightPhaseState==='function'?global.tacticalFightPhaseState():{});
    const units={...(phase.units||raw.units||{})};
    const cur=units[String(attackerUid)]&&typeof units[String(attackerUid)]==='object'?units[String(attackerUid)]:{};
    units[String(attackerUid)]={...cur,engagedAtFightStart:engaged===true,becameEngagedDuringFight:engaged===true,pileInDone:false,consolidationDone:false};
    t.fightPhase={...phase,round:currentRound(),playerTurn:currentTurn(),step:phase.step||'unknown',selected:Array.isArray(phase.selected)?phase.selected.map(String):[],nextSide:phase.nextSide||currentTurn(),units,chargeTargets:targetUids.map(String)};
  }
  function validateTargets(attackerUid,targetUids,requireMeasured){
    const unique=[...new Set((targetUids||[]).map(String).filter(Boolean))];
    if(!unique.length)return {ok:false,reason:'Select at least one actual charge target.'};
    for(const uid of unique){
      if(!targetEntry(uid))return {ok:false,reason:'A selected charge target no longer exists.'};
      const legality=legalChargeTarget(attackerUid,uid);
      if(legality?.canTarget!==true)return {ok:false,reason:'Charge target '+uid+' is not currently established as legal.'};
      if(requireMeasured&&!physicallyMeasured(attackerUid,uid))return {ok:false,reason:'Record the physically measured charge distance for every selected target before recording success.'};
    }
    return {ok:true,targetUids:unique};
  }
  function recordChargeResult(attackerUid,outcome,targetUids){
    if(currentTurn()!=='my'||String(global.state?.phase||'')!=='Charge')return {ok:false,reason:'Charge results can only be recorded during your Charge phase.'};
    const before=snapshot();
    const uid=String(attackerUid||global.state?.tactical?.selectedAttackerUid||'');
    if(!uid)return {ok:false,reason:'No friendly Charge attacker is selected.'};
    if(outcome==='success'){
      const checked=validateTargets(uid,targetUids,true);if(!checked.ok)return checked;
      checked.targetUids.forEach(targetUid=>setPairEngaged(uid,targetUid,true));
      recordAction(uid,true,checked.targetUids);setFightState(uid,checked.targetUids,true);
      emit('CHARGE_RESULT',{entryUid:uid,outcome:'success',chargeMade:true,targetUids:checked.targetUids,round:currentRound()},before);persist();
      return {ok:true,outcome:'success',targetUids:checked.targetUids};
    }
    if(outcome==='failed'){
      const checked=(targetUids||[]).length?validateTargets(uid,targetUids,false):{ok:true,targetUids:[]};if(!checked.ok)return checked;
      checked.targetUids.forEach(targetUid=>setPairEngaged(uid,targetUid,false));
      recordAction(uid,false,checked.targetUids);setFightState(uid,[],false);
      emit('CHARGE_RESULT',{entryUid:uid,outcome:'failed',chargeMade:false,targetUids:checked.targetUids,round:currentRound()},before);persist();
      return {ok:true,outcome:'failed',targetUids:checked.targetUids};
    }
    return {ok:false,reason:'Unknown Charge result.'};
  }
  function selectedChargeTargetsFromDom(){
    if(typeof global.document==='undefined')return [];
    return Array.from(global.document.querySelectorAll('input[data-onoforge-charge-target]:checked')).map(x=>String(x.getAttribute('data-onoforge-charge-target')||'')).filter(Boolean);
  }
  function userFacingResult(result){if(!result?.ok&&result?.reason&&typeof global.alert==='function')global.alert(result.reason);return result;}
  global.recordTacticalChargeResult=function(outcome,attackerUid,targetUids){const selected=(targetUids&&targetUids.length)?targetUids:selectedChargeTargetsFromDom();return userFacingResult(recordChargeResult(attackerUid,outcome,selected));};
  global.confirmTacticalChargeSuccess=function(attackerUid){return global.recordTacticalChargeResult('success',attackerUid,selectedChargeTargetsFromDom());};
  global.recordTacticalChargeFailure=function(attackerUid){return global.recordTacticalChargeResult('failed',attackerUid,selectedChargeTargetsFromDom());};

  (function installAdvisorCompatibilityGuards(){
    const originalV2=global.getTacticalAdvisorV2Result;
    if(typeof originalV2==='function'&&!originalV2.__onoforgeChargeGuard){
      const guardedV2=function(attackerUid,options){
        try{return originalV2.call(this,attackerUid,options);}catch(error){
          console.warn('OnoForge Tactical Advisor v2 fallback:',error);
          const fallback=typeof global.getTacticalAdvisorResult==='function'?global.getTacticalAdvisorResult(attackerUid,options||{}):typeof global.tacticalAdvisorV1==='function'?global.tacticalAdvisorV1(attackerUid,options||{}):null;
          if(fallback&&typeof fallback==='object'){fallback.tacticalImpactFallback=true;fallback.tacticalImpactFallbackReason=String(error?.message||error);}return fallback;
        }
      };
      guardedV2.__onoforgeChargeGuard=true;global.getTacticalAdvisorV2Result=guardedV2;
    }
    const adapter=global.ONOFORGE_TACTICAL_ADVISOR_ADAPTER;
    if(adapter&&typeof adapter.enrichAdvisor==='function'&&!adapter.enrichAdvisor.__onoforgeChargeGuard){
      const originalEnrich=adapter.enrichAdvisor;
      const guardedEnrich=function(advisor,engine,options){
        try{return originalEnrich.call(this,advisor,engine,options||{});}catch(error){
          console.warn('OnoForge Tactical Impact enrichment fallback:',error);
          if(advisor&&typeof advisor==='object'){advisor.tacticalImpactFallback=true;advisor.tacticalImpactFallbackReason=String(error?.message||error);}return advisor;
        }
      };
      guardedEnrich.__onoforgeChargeGuard=true;adapter.enrichAdvisor=guardedEnrich;
    }
  })();

  // Keep one user-facing Tactical Advisor. The existing Advisor remains the
  // authoritative control surface; Tactical Impact is physically mounted
  // inside that panel and is re-mounted after every Battle renderer refresh.
  (function mountAdvisorSurface(){
    if(typeof global.document==='undefined')return;
    let observer=null;
    let timer=null;

    function findAuthoritativePanel(host){
      const battlePanel=global.document.querySelector('#battle-view .tactical-advisor-card');
      if(battlePanel&&battlePanel!==host&&!battlePanel.contains(host))return battlePanel;
      const cards=Array.from(global.document.querySelectorAll('.tactical-advisor-card'));
      const direct=cards.find(card=>card!==host&&!card.contains(host));
      if(direct)return direct;
      const candidates=Array.from(global.document.querySelectorAll('div,section,details'));
      return candidates
        .filter(el=>el!==host&&!el.contains(host))
        .filter(el=>{
          const text=String(el.textContent||'');
          return /Tactical Advisor/.test(text)&&/Objective priorities/.test(text);
        })
        .sort((a,b)=>String(a.textContent||'').length-String(b.textContent||'').length)[0]||null;
    }

    function mount(){
      const host=global.document.getElementById('onoforge-advisor-render');
      if(!host)return false;
      const panel=findAuthoritativePanel(host);
      if(!panel)return false;
      if(host.parentElement!==panel){
        host.style.margin='10px 0';
        host.style.border='0';
        host.style.padding='0';
        host.style.background='transparent';
        host.style.boxShadow='none';
        const summary=panel.querySelector(':scope > summary');
        if(summary&&summary.parentElement===panel){
          summary.insertAdjacentElement('afterend',host);
        }else{
          panel.insertBefore(host,panel.firstChild);
        }
      }
      return true;
    }

    function start(){
      if(observer)return;
      observer=new global.MutationObserver(function(){mount();});
      observer.observe(global.document.body,{childList:true,subtree:true});
      mount();
      timer=global.setInterval(mount,250);
    }

    if(global.document.readyState==='loading')global.document.addEventListener('DOMContentLoaded',start,{once:true});
    else start();
  })();

  global.ONOFORGE_TACTICAL_CHARGE_WORKFLOW=Object.freeze({recordChargeResult,physicallyMeasured,validateTargets});
})(window);
