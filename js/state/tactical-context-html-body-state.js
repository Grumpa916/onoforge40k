function createTacticalContextHtmlBodyStateController({getState,tacticalAdvisorAttackerEntry,tacticalUnitState,ensureTacticalState,entry,getTacticalRenderBundle,tacticalAdvisorActionState,tacticalUnitMovementType,esc,unitDisplayName,tacticalLegalityForUnit,tacticalFightPhaseState,tacticalFightResolvedForSide,tacticalCombatFightWeapons,tacticalFightUnitState}){
  function tacticalContextHtmlBody(){
    const state=getState();
      const ae=tacticalAdvisorAttackerEntry();
      const targets=(state.opp||[]).filter(e=>!e.attachedTo&&!tacticalUnitState('opp',e)?.destroyed);
      if(!ae||!targets.length)return '<div class="muted">Build both armies and select an attacker/target to record battlefield context.</div>';
      const selectedUid=(state.tactical?.selectedTargetUid&&targets.some(e=>e.uid===state.tactical.selectedTargetUid))?state.tactical.selectedTargetUid:targets[0].uid;
      ensureTacticalState().selectedTargetUid=selectedUid;
      const te=entry('opp',selectedUid),renderBundle=getTacticalRenderBundle(ae,te),ctx=renderBundle.context,leg=renderBundle.legality,actions=tacticalAdvisorActionState(ae.uid),movementType=tacticalUnitMovementType(ae.uid);
      const options=targets.map(e=>'<option value="'+esc(e.uid)+'" '+(e.uid===selectedUid?'selected':'')+'>'+esc(unitDisplayName('opp',e))+'</option>').join('');
      const phase=String(state.phase||'Command');
      const phaseLabel=phase==='Movement'?'Movement':phase==='Shooting'?'Shooting':phase==='Charge'?'Charge':phase==='Fight'?'Fight':phase;
      const unitLegality=tacticalLegalityForUnit('my',ae);
      const status=unitLegality.legal===false
        ?(unitLegality.reason==='not-your-turn'?'Waiting for your turn':unitLegality.reason==='destroyed'?'Unit destroyed':'Unit unavailable')
        :(leg.canTarget===true?'Ready':leg.canTarget===false?'Not eligible':'Needs battlefield info');
      const warningReasons=[...(unitLegality.legal===false?[unitLegality.reason==='not-your-turn'?'This is not your active turn. Switch the active player to your army before resolving Shooting.':unitLegality.reason==='destroyed'?'This unit is destroyed.':'This unit is unavailable.']:[]),...(leg.reasons||[])];
      const warning=warningReasons.length?'<div class="warn tactical-context-warning" style="margin-top:8px">⚠ '+esc(warningReasons.join(' • '))+'.</div>':'';
      let phaseSpecific='';
      if(phase==='Movement'){
        phaseSpecific=
          '<div class="grid2" style="margin-top:8px">'+
          '<div class="field"><label>Movement decision</label><select onchange="setTacticalUnitAction(\''+ae.uid+'\',\'movement\',this.value)"><option value="unknown" '+(movementType==='unknown'?'selected':'')+'>Unknown</option><option value="remained" '+(movementType==='remained'?'selected':'')+'>Remain Stationary</option><option value="normal" '+(movementType==='normal'?'selected':'')+'>Normal Move</option><option value="advance" '+(movementType==='advance'?'selected':'')+'>Advance</option><option value="fallback" '+(movementType==='fallback'?'selected':'')+'>Fall Back</option></select></div>'+
          '<div class="field"><label>Set up this turn?</label><select onchange="setTacticalUnitAction(\''+ae.uid+'\',\'setUpThisTurn\',this.value)"><option value="" '+(actions.setUpThisTurn===null?'selected':'')+'>Unknown</option><option value="false" '+(actions.setUpThisTurn===false?'selected':'')+'>No</option><option value="true" '+(actions.setUpThisTurn===true?'selected':'')+'>Yes</option></select></div>'+
          '</div>'+
          '<div class="muted small" style="margin-top:7px">Movement distance is read from the selected unit when available; no manual maximum-movement entry is required.</div>';
      }else if(phase==='Fight'){
        const fs=tacticalFightPhaseState(),targetUid=String(ensureTacticalState().selectedTargetUid||''),te=targetUid?entry('opp',targetUid):null;
        const targetLabel=te?unitDisplayName('opp',te):'Select the enemy unit actually fought above';
        const friendlyResolved=tacticalFightResolvedForSide(ae.uid,'my');
        const enemyResolved=te?tacticalFightResolvedForSide(te.uid,'opp'):false;
        const friendlyWeapons=te?tacticalCombatFightWeapons('my','opp',ae,te):[];
        const enemyWeapons=te?tacticalCombatFightWeapons('opp','my',te,ae):[];
        const fFu=tacticalFightUnitState(ae.uid),eFu=te?tacticalFightUnitState(te.uid):null;
        const friendlyOptions=friendlyWeapons.map(x=>'<option value="'+esc(x.weapon.name)+'">'+esc(x.weapon.name)+' • WS '+esc(String(x.weapon.WS??'?'))+' • '+esc(String(x.weapon.A??'?'))+'A • D'+esc(String(x.weapon.D??'?'))+'</option>').join('');
        const enemyOptions=enemyWeapons.map(x=>'<option value="'+esc(x.weapon.name)+'">'+esc(x.weapon.name)+' • WS '+esc(String(x.weapon.WS??'?'))+' • '+esc(String(x.weapon.A??'?'))+'A • D'+esc(String(x.weapon.D??'?'))+'</option>').join('');
        const friendlyControls=friendlyWeapons.length
          ?'<select class="field" style="margin-top:7px;width:100%"><option value="">Choose weapon profile…</option>'+friendlyOptions+'</select><button type="button" class="btn primary" style="width:100%;margin-top:6px" onclick="tacticalOpenFightResolution(\'my\',\'opp\',\''+esc(ae.uid)+'\',\''+esc(te?.uid||'')+'\',this.previousElementSibling.value)">Enter Friendly Dice</button>'
          :'<div class="muted small" style="margin-top:7px">No eligible melee weapon is currently available.</div>';
        const enemyControls=enemyWeapons.length
          ?'<select class="field" style="margin-top:7px;width:100%"><option value="">Choose weapon profile…</option>'+enemyOptions+'</select><button type="button" class="btn primary" style="width:100%;margin-top:6px" onclick="tacticalOpenFightResolution(\'opp\',\'my\',\''+esc(te?.uid||'')+'\',\''+esc(ae.uid)+'\',this.previousElementSibling.value)">Enter Enemy Dice</button>'
          :'<div class="muted small" style="margin-top:7px">No eligible enemy melee weapon is currently available.</div>';
        phaseSpecific=
          '<div class="grid2" style="margin-top:8px">'+
            '<div class="field"><label>Fight step</label><select onchange="setTacticalFightPhase(\'step\',this.value)"><option value="unknown" '+(fs.step==='unknown'?'selected':'')+'>Unknown</option><option value="fightsFirst" '+(fs.step==='fightsFirst'?'selected':'')+'>Fights First</option><option value="remaining" '+(fs.step==='remaining'?'selected':'')+'>Remaining Combats</option></select></div>'+
            '<div class="field"><label>Next</label><select onchange="setTacticalFightPhase(\'nextSide\',this.value)"><option value="my" '+(fs.nextSide==='my'?'selected':'')+'>My army</option><option value="opp" '+(fs.nextSide==='opp'?'selected':'')+'>Opponent</option></select></div>'+
          '</div>'+
          '<div class="status" style="margin-top:8px"><b>Fight Execution</b><div class="tiny" style="margin-top:3px">Both directions use the same physical-dice resolver. A side becomes resolved only after an ATTACK_RESOLUTION event updates the opposing battlefield state.</div>'+
            '<div class="grid2" style="margin-top:8px">'+
              '<div class="status"><div class="muted small">Friendly melee → '+esc(targetLabel)+'</div><b>'+(friendlyResolved?'Resolved by ATTACK_RESOLUTION':'Not yet resolved')+'</b>'+friendlyControls+'</div>'+
              '<div class="status"><div class="muted small">Enemy melee → '+esc(unitDisplayName('my',ae))+'</div><b>'+(enemyResolved?'Resolved by ATTACK_RESOLUTION':'Not yet resolved')+'</b>'+enemyControls+'</div>'+
            '</div>'+
          '</div>'+
          '<div class="grid2" style="margin-top:8px">'+
            '<div class="field"><label>'+esc(unitDisplayName('my',ae))+' — Pile-in completed?</label><select onchange="setTacticalFightUnitState(\''+esc(ae.uid)+'\',\'pileInDone\',this.value)"><option value="false" '+(fFu.pileInDone!==true?'selected':'')+'>No / unresolved</option><option value="true" '+(fFu.pileInDone===true?'selected':'')+'>Yes</option></select></div>'+
            '<div class="field"><label>'+esc(unitDisplayName('my',ae))+' — Consolidation completed?</label><select onchange="setTacticalFightUnitState(\''+esc(ae.uid)+'\',\'consolidationDone\',this.value)"><option value="false" '+(fFu.consolidationDone!==true?'selected':'')+'>No / unresolved</option><option value="true" '+(fFu.consolidationDone===true?'selected':'')+'>Yes</option></select></div>'+
          '</div>'+
          (eFu?'<div class="grid2" style="margin-top:8px">'+
            '<div class="field"><label>'+esc(unitDisplayName('opp',te))+' — Pile-in completed?</label><select onchange="setTacticalFightUnitState(\''+esc(te.uid)+'\',\'pileInDone\',this.value)"><option value="false" '+(eFu.pileInDone!==true?'selected':'')+'>No / unresolved</option><option value="true" '+(eFu.pileInDone===true?'selected':'')+'>Yes</option></select></div>'+
            '<div class="field"><label>'+esc(unitDisplayName('opp',te))+' — Consolidation completed?</label><select onchange="setTacticalFightUnitState(\''+esc(te.uid)+'\',\'consolidationDone\',this.value)"><option value="false" '+(eFu.consolidationDone!==true?'selected':'')+'>No / unresolved</option><option value="true" '+(eFu.consolidationDone===true?'selected':'')+'>Yes</select></div>'+
          '</div>':'');
    
      }
    
      return '<div class="tactical-context-body">'+
        '<div class="split" style="margin-bottom:8px"><div class="muted small">'+esc(phaseLabel)+' • '+esc(status)+'</div><span class="tiny">Enter only battlefield facts</span></div>'+
        '<div class="grid2">'+
          '<div class="field"><label>Attacker</label><div class="status">'+esc(unitDisplayName('my',ae))+'</div></div>'+
          '<div class="field"><label>Enemy target</label><select onchange="ensureTacticalState().selectedTargetUid=this.value;save();render()">'+options+'</select></div>'+
        '</div>'+
        '<div class="grid3" style="margin-top:8px">'+
          '<div class="field"><label>Distance</label><select onchange="setTacticalPairField(\''+ae.uid+'\',\''+selectedUid+'\',\'distanceBand\',this.value)"><option value="unknown" '+(ctx.distanceBand==='unknown'?'selected':'')+'>Unknown</option><option value="<6" '+(ctx.distanceBand==='<6'?'selected':'')+'>Under 6"</option><option value="6-12" '+(ctx.distanceBand==='6-12'?'selected':'')+'>6–12"</option><option value="12-18" '+(ctx.distanceBand==='12-18'?'selected':'')+'>12–18"</option><option value="18-24" '+(ctx.distanceBand==='18-24'?'selected':'')+'>18–24"</option><option value="24+" '+(ctx.distanceBand==='24+'?'selected':'')+'>24"+</option></select></div>'+
          '<div class="field"><label>Line of sight</label><select onchange="setTacticalPairField(\''+ae.uid+'\',\''+selectedUid+'\',\'los\',this.value)"><option value="unknown" '+(ctx.los==='unknown'?'selected':'')+'>Unknown</option><option value="yes" '+(ctx.los==='yes'?'selected':'')+'>Yes</option><option value="no" '+(ctx.los==='no'?'selected':'')+'>No</option></select></div>'+
          '<div class="field"><label>'+(phase==='Shooting'?'Attacker engaged with this target?':phase==='Charge'?'Already engaged with this target?':'Attacker engaged with this target?')+'</label><select onchange="setTacticalPairField(\''+ae.uid+'\',\''+selectedUid+'\',\'engagement\',this.value)"><option value="unknown" '+(ctx.engagement==='unknown'?'selected':'')+'>Unknown</option><option value="engaged" '+(ctx.engagement==='engaged'?'selected':'')+'>Yes</option><option value="notEngaged" '+(ctx.engagement==='notEngaged'?'selected':'')+'>No</option></select>'+(phase==='Shooting'?'<div class="tiny" style="margin-top:4px">This means your attacking unit is engaged with this specific target. It does not mean the enemy is engaged elsewhere.</div>':'')+'</div>'+
        '</div>'+
        ((phase==='Shooting'||phase==='Charge')?'<div class="field" style="margin-top:8px"><label>Exact distance <span class="tiny">(needed for weapon-range / charge math)</span></label><input type="number" min="0" step="0.1" value="'+(ctx.distanceInches===null?'':ctx.distanceInches)+'" placeholder="Enter measured inches if needed" onchange="setTacticalPairField(\''+ae.uid+'\',\''+selectedUid+'\',\'distanceInches\',this.value)"></div>':'')+    '<div class="field" style="margin-top:8px"><label>Objective / battlefield note <span class="tiny">(optional)</span></label><input type="text" value="'+esc(ctx.objective)+'" placeholder="e.g. Objective 2" onchange="setTacticalPairField(\''+ae.uid+'\',\''+selectedUid+'\',\'objective\',this.value)"></div>'+
        phaseSpecific+
        warning+
        '<div class="row" style="margin-top:8px"><button class="btn" type="button" onclick="clearTacticalPair(\''+ae.uid+'\',\''+selectedUid+'\')">Reset Context</button></div>'+
      '</div>';
    
  }
  return Object.freeze({tacticalContextHtmlBody});
}
window.OnoForgeTacticalContextHtmlBodyState=Object.freeze({createTacticalContextHtmlBodyStateController});
