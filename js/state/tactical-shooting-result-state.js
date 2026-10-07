function createTacticalShootingResultStateController({getState,tacticalAdvisorAttackerEntry,entry,getTacticalRenderBundle,tacticalLegalityForUnit,tacticalWeaponIsRanged,tacticalWeaponRange,tacticalWeaponPhaseEligible,tacticalUnitMovementType,tacticalWeaponIsAssault,tacticalUnitIsEngagedAny,tacticalUnitIsMonsterVehicle,tacticalWeaponIsCloseQuarters,tacticalWeaponIsBlast,tacticalWeaponIsIndirect,tacticalPreRollHtml,esc,unitDisplayName}){
  function tacticalShootingResultHtml(){
    const state=getState();
      if(String(state.phase||'Command')!=='Shooting')return '';
      const ae=tacticalAdvisorAttackerEntry();
      const teUid=state.tactical?.selectedTargetUid;
      const te=teUid?entry('opp',teUid):null;
      if(!ae||!te)return '';
      const renderBundle=getTacticalRenderBundle(ae,te);
      const ctx=renderBundle.context;
      const legality=renderBundle.legality;
      const result=renderBundle.result;
      const rec=Array.isArray(result.recommendations)?result.recommendations.find(x=>x.entryUid===te.uid):null;
      const unitLegality=tacticalLegalityForUnit('my',ae);
      const status=unitLegality.reason==='not-your-turn'?'Waiting for your turn':unitLegality.reason==='destroyed'?'Unit destroyed':result.status==='action-already-completed'?'Shooting already completed':legality.canTarget===false?'Not eligible':rec?'Ready to resolve':'Needs information';
      const allGroups=renderBundle.groups;
      const rangedGroups=allGroups.filter(g=>tacticalWeaponIsRanged(g.weapon));
      const weaponRows=rangedGroups.map(g=>{
        const w=g.weapon||{},name=String(w.name||'Weapon'),range=tacticalWeaponRange(w),abilities=(w.abilities||[]).map(x=>String(x||'').toUpperCase().replace(/-/g,' '));
        const reasons=[];
        if(!tacticalWeaponPhaseEligible(w,'Shooting',ae,te)){
          if(tacticalUnitMovementType(ae.uid)==='advance'&&!tacticalWeaponIsAssault(w))reasons.push('Unit Advanced and this weapon is not ASSAULT');
          if(tacticalUnitIsEngagedAny(ae.uid)&&!tacticalUnitIsMonsterVehicle(ae)&&!tacticalWeaponIsCloseQuarters(w))reasons.push('Attacker is engaged and this is not a Close-quarters weapon');
          if((ctx.engagement==='engaged'||tacticalUnitIsEngagedAny(te.uid))&&tacticalWeaponIsBlast(w))reasons.push('BLAST cannot target an engaged unit');
          if(range!==null&&ctx.distanceInches!==null&&range<ctx.distanceInches)reasons.push('Target is beyond weapon range');
          if(tacticalWeaponIsIndirect(w)&&tacticalUnitIsEngagedAny(ae.uid))reasons.push('Indirect Fire cannot be used while attacker is engaged');
          if(!reasons.length)reasons.push('Weapon is not eligible in the current battlefield state');
        }
        return '<div class="status" style="margin:0"><div class="split"><div><b>'+esc(name)+'</b><div class="tiny">'+(range===null?'Range unknown':range+'"')+(abilities.length?' • '+esc(abilities.join(' • ')):'')+'</div></div><span class="pill '+(reasons.length?'warn':'ok')+'">'+(reasons.length?'Not eligible':'Eligible')+'</span></div>'+(reasons.length?'<div class="tiny" style="margin-top:5px">⚠ '+esc(reasons.join(' • '))+'</div>':'<div class="tiny" style="margin-top:5px">Available for this target.</div>')+'</div>';
      }).join('');
      const resultReason=result.status==='attacker-not-legal'
        ?(result.attackerLegality?.reason==='not-your-turn'?'This is not your active turn. Switch the active player to your army before resolving this Shooting action.':result.attackerLegality?.reason==='destroyed'?'The selected attacker is destroyed.':'The selected attacker is not currently available.')
        :result.status==='action-already-completed'?'This unit has already completed its Shooting action this turn.'
        :null;
      const reasons=[...(legality.reasons||[]),...(resultReason?[resultReason]:[])].map(x=>'<li>'+esc(x)+'</li>').join('');
      const expected=rec?'<div class="grid3" style="margin-top:10px">'+
        '<div class="status"><div class="muted small">Expected damage</div><b style="font-size:1.35em">'+Number(rec.expectedDamage||0).toFixed(1)+'W</b></div>'+
        '<div class="status"><div class="muted small">Expected models killed</div><b style="font-size:1.35em">'+Number(rec.modelsKilled||0).toFixed(1)+'</b></div>'+
        '<div class="status"><div class="muted small">Wipe chance</div><b style="font-size:1.35em">'+(Number(rec.wipeChance||0)*100).toFixed(0)+'%</b></div>'+
      '</div>':'<div class="status" style="margin-top:10px">Enter the required battlefield information above to calculate this matchup.</div>';
      return '<details class="card tactical-shooting-result-card" open>'+
        '<summary><div class="split"><div><h3 style="margin:0">Shooting Result</h3><div class="muted">'+esc(unitDisplayName('my',ae))+' → '+esc(unitDisplayName('opp',te))+'</div></div><span class="pill">'+status+'</span></div></summary>'+
        '<div style="margin-top:10px">'+
          '<div class="grid3">'+
            '<div class="status"><div class="muted small">Distance</div><b>'+esc(ctx.distanceInches===null?(ctx.distanceBand==='unknown'?'Unknown':ctx.distanceBand):ctx.distanceInches+'"')+'</b></div>'+
            '<div class="status"><div class="muted small">LOS</div><b>'+esc(ctx.los==='yes'?'Yes':ctx.los==='no'?'No':'Unknown')+'</b></div>'+
            '<div class="status"><div class="muted small">Target</div><b>'+esc(unitDisplayName('opp',te))+'</b></div>'+
          '</div>'+
          '<div style="margin-top:10px"><div class="muted small" style="margin-bottom:5px">Ranged weapons</div><div style="display:grid;gap:6px">'+(weaponRows||'<div class="status">No ranged weapons found on this unit.</div>')+'</div></div>'+
          expected+tacticalPreRollHtml()+
          (reasons?'<div class="warn" style="margin-top:10px"><b>Target check</b><ul style="margin:5px 0 0 18px">'+reasons+'</ul></div>':'')+
          '<div class="tiny" style="margin-top:8px">Expected values use the same combat engine as the Tactical Advisor. The app does not roll your physical dice.</div>'+
        '</div>'+
      '</details>';
    
  }
  return Object.freeze({tacticalShootingResultHtml});
}
window.OnoForgeTacticalShootingResultState=Object.freeze({createTacticalShootingResultStateController});
