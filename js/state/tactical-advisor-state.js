function createTacticalAdvisorStateController({getState,tacticalAdvisorAttackerEntry,tacticalUnitState,esc,unitDisplayName,tacticalObjectiveAdvisorHtml,objectiveTacticalSummary,objectiveBattlefieldGeometry,getTacticalAdvisorResult,tacticalAdvisorActionState,entry,setTacticalAdvisorAttacker,enrichAdvisor,confidenceClass,recordTacticalChargeResult,ensureTacticalState,save,render}){function tacticalAdvisorHtml(){const state=getState();
  const currentPhase=String(state.phase||'Command');
  if(currentPhase==='Command'||currentPhase==='Movement') return '';
  const ae=tacticalAdvisorAttackerEntry();
  if(!ae)return '<div class="card tactical-advisor-card"><h3 style="margin:0">Tactical Advisor</h3><div class="muted">Build your army and select an attacker to receive target recommendations.</div></div>';
  const attackerOptions=(state.my||[]).filter(e=>!e.attachedTo&&!tacticalUnitState('my',e)?.destroyed).map(e=>'<option value="'+esc(e.uid)+'" '+(e.uid===ae.uid?'selected':'')+'>'+esc(unitDisplayName('my',e))+'</option>').join('');
  const objectivePriorityHtml=tacticalObjectiveAdvisorHtml('my');
  const objectiveIntel=objectiveTacticalSummary();
  const objectiveIntelHtml='<div class="status" style="margin-bottom:8px"><div class="muted small">Objective state</div><div class="tiny" style="margin-top:3px">'+
    'Controlled: <b>'+objectiveIntel.controlled.length+'</b> • Contested: <b>'+objectiveIntel.contested.length+'</b> • Enemy: <b>'+objectiveIntel.enemyControlled.length+'</b> • Central: <b>'+objectiveIntel.central.length+'</b>'+
    (objectiveIntel.enemyTerritory.length?' • Enemy territory: <b>'+objectiveIntel.enemyTerritory.length+'</b>':'')+
    (objectiveIntel.enemyDeployment.length?' • Enemy deployment: <b>'+objectiveIntel.enemyDeployment.length+'</b>':'')+
    '</div></div>';
  const battlefieldGeometry=objectiveBattlefieldGeometry();
  const battlefieldGeometryHtml='<div class="status" style="margin-bottom:8px;border-color:'+(battlefieldGeometry.verified?'#356747':'#78512d')+'"><div class="split"><div><div class="muted small">Battlefield geometry</div><div class="tiny" style="margin-top:3px">'+esc(battlefieldGeometry.layout)+' • Event Companion p.'+esc(String(battlefieldGeometry.page||'—'))+' • '+esc(battlefieldGeometry.table.widthInches+' x '+battlefieldGeometry.table.depthInches+' in')+'</div></div><span class="pill">'+(battlefieldGeometry.verified?'Verified':'Position data pending')+'</span></div><div class="tiny" style="margin-top:5px">'+esc(battlefieldGeometry.status)+'</div></div>';
  const result=getTacticalAdvisorResult(ae.uid,{samples:4000});
  const chargeActionState=tacticalAdvisorActionState(ae.uid);
  if(String(state.phase||'')==='Charge'&&chargeActionState?.chargeDone){
    const recordedTargets=Array.isArray(chargeActionState.chargeTargets)?chargeActionState.chargeTargets.map(String):[];
    const names=recordedTargets.map(uid=>{
      const e=entry('opp',uid);
      return e?unitDisplayName('opp',e):uid;
    }).filter(Boolean).join(', ');
    const outcome=chargeActionState.chargeMade?'Successful':'Failed';
    return '<details class="card tactical-advisor-card" open><summary><div class="split"><div><h3 style="margin:0">Tactical Advisor</h3><div class="muted">Charge result recorded</div></div><span class="pill ok">Charge complete</span></div></summary>'+
      '<div style="margin-top:10px">'+
        '<div class="field" style="margin-bottom:8px"><label>Attacker</label><select onchange="setTacticalAdvisorAttacker(this.value)">'+attackerOptions+'</select></div>'+
        '<div class="status"><b>Charge recorded: '+outcome+'</b>'+(names?' • '+esc(names):'')+'<div class="muted" style="margin-top:4px">The Charge result has been written to the battle state and Action Log.</div></div>'+
        '<div class="tiny" style="margin-top:8px">Charge execution is complete for this unit this turn.</div>'+
      '</div></details>';
  }
  if(result.status!=='ok'){
    const detail=result.attacker?(' • '+esc(result.attacker)):'',phaseLabel=result.phase?(' • '+esc(result.phase)):'',gateLabel=result.status==='action-already-completed'?'Action complete':result.status==='no-ranged-weapons'?'No ranged weapons':result.status==='charge-target-evaluation-not-yet-modeled'?'Charge targeting':result.status==='no-eligible-charge-targets'?'No legal charge target':'Phase gate';
    const statusAttackerSelector='<div class="field" style="margin-top:10px"><label>Attacker</label><select onchange="setTacticalAdvisorAttacker(this.value)">'+attackerOptions+'</select></div>';
    if(result.status==='no-ranged-weapons'){
      return '<details class="card tactical-advisor-card" open><summary><div class="split"><div><h3 style="margin:0">Tactical Advisor</h3><div class="muted">No shooting action available for this unit</div></div><span class="pill">No ranged weapons</span></div></summary>'+
        '<div style="margin-top:10px">'+
          '<div class="field" style="margin-bottom:8px"><label>Attacker</label><select onchange="setTacticalAdvisorAttacker(this.value)">'+attackerOptions+'</select></div>'+
          '<div class="status"><b>'+esc(result.attacker||'Selected unit')+'</b><div class="muted" style="margin-top:4px">This unit has no ranged weapons, so there is nothing to enter or resolve in the Shooting phase.</div></div>'+
          '<div class="tiny" style="margin-top:8px">Choose another attacker above to evaluate a unit that can shoot.</div>'+
        '</div></details>';
    }
    return '<div class="card tactical-advisor-card"><div class="split"><div><h3 style="margin:0">Tactical Advisor</h3><div class="muted">'+esc(result.status||'Advisor unavailable')+detail+phaseLabel+'</div></div><span class="pill">'+esc(gateLabel)+'</span></div>'+
      statusAttackerSelector+
      '<div class="status" style="margin-top:10px">'+esc(result.note||'The advisor is not producing a recommendation from the current game state.')+'</div>'+
      (result.status==='no-eligible-charge-targets'?'<div class="tiny" style="margin-top:8px">Choose another attacker above, or evaluate a different target in Tactical Context below.</div>':'')+
      '</div>';
  }
  const impactAdapter=window.ONOFORGE_TACTICAL_ADVISOR_ADAPTER;
  const impactEngine=window.ONOFORGE_TACTICAL_ADVISOR;
  const enrichedAdvisor=(impactAdapter&&impactEngine&&typeof impactAdapter.enrichAdvisor==='function')
    ?impactAdapter.enrichAdvisor({
        ...result,
        recommendations:(Array.isArray(result.recommendations)?result.recommendations:[]).map(x=>({...x}))
      },impactEngine,{attackerEntry:ae,samples:1500})
    :result;
  const recs=Array.isArray(enrichedAdvisor.recommendations)?enrichedAdvisor.recommendations:[],confidenceClass=v=>v==='High'?'ok':v==='Medium'?'status':'warn';
  const recCard=r=>{
    const e=r.recommendationExplanation||{},expected=e.expected||{},risk=e.risk||{},conf=e.confidence||{},changes=Array.isArray(e.whatCouldChange)?e.whatCouldChange:[];
    const impact=r.tacticalImpact||{},projection=r.projectedFight||{};
    const impactReasons=Array.isArray(impact.reasons)?impact.reasons:[];
    const selected=state.tactical?.selectedTargetUid===r.entryUid;
    return '<details class="tactical-recommendation-card" style="margin-top:6px" '+(selected?'open':'')+'>'+
      '<summary style="cursor:pointer;list-style:none"><div class="split"><div><b>#'+esc(e.rank||'')+' '+esc(r.name||'Target')+'</b><div class="tiny">'+Number(expected.damage||0).toFixed(1)+'W • '+Number(expected.modelsKilled||0).toFixed(1)+' models • '+(Number(expected.wipeChance||0)*100).toFixed(0)+'% wipe</div></div><span class="pill '+(selected?'ok':'')+'">'+(selected?'Selected':(e.confidence?.label==='Limited'?'Verify context':'Select'))+'</span></div></summary>'+
      '<div class="grid3" style="margin-top:7px"><div class="status"><div class="muted small">Expected damage</div><b>'+Number(expected.damage||0).toFixed(1)+'W</b></div><div class="status"><div class="muted small">Models killed</div><b>'+Number(expected.modelsKilled||0).toFixed(1)+'</b></div><div class="status"><div class="'+confidenceClass(conf.label)+'"><div class="muted small">Confidence</div><b>'+esc(conf.label||'Limited')+'</b></div></div></div>'+
      '<div style="margin-top:7px"><b>Why:</b> '+esc(e.why||'Combat and mission factors are combined.')+'</div>'+
      (e.missionImpact?.objective?'<div style="margin-top:7px"><b>Mission:</b> '+esc(e.missionImpact.objective)+' • '+esc(e.missionImpact.status||'unknown')+
        (Number(e.missionImpact.denyOpponentPrimary||0)>0?' • can affect opponent Primary scoring':'')+
        (Number(e.missionImpact.ownPrimaryOpportunity||0)>0?' • linked to your Primary scoring':'')+
        '</div>':'')+
      '<div style="margin-top:7px"><b>Risk:</b> '+esc(String(risk.band||'unknown'))+' • '+Number(risk.incomingThreat||0).toFixed(1)+' incoming W • '+Number(risk.pointsAtRisk||0).toFixed(0)+' pts at risk</div>'+
      '<div class="status" style="margin-top:8px"><div class="split"><div><b>Tactical Impact Analysis</b><div class="tiny">Shared combat + mission impact model</div></div><span class="pill">'+Number(impact.score||0).toFixed(0)+'/100 • '+esc(String(impact.engagementType||'TACTICAL'))+'</span></div>'+
        (impactReasons.length?'<div style="margin-top:6px">'+impactReasons.map(x=>'<span class="pill" style="margin:2px">'+esc(x)+'</span>').join('')+'</div>':'<div class="muted small" style="margin-top:6px">No additional impact reasons were resolved from the current state.</div>')+
        (String(state.phase||'')==='Charge'
          ?'<div style="margin-top:7px"><b>Charge analysis:</b> '+(r.chargeSuccessChance==null?'Success chance requires measured distance':'2D6 success chance '+(Number(r.chargeSuccessChance)*100).toFixed(0)+'%')+
            ' • '+(projection?.distanceEvidence?.physicalDistanceConfirmed?'measured distance confirmed':'physical distance not yet confirmed')+
            (projection?.outgoing?.result? ' • projected '+Number(projection.outgoing.result.damage||0).toFixed(1)+'W outgoing':'')+
            (projection?.incoming?.result? ' • '+Number(projection.incoming.result.damage||0).toFixed(1)+'W return':'')+
            '</div>'+
          '<div class="status" style="margin-top:8px"><b>Charge Execution</b><div class="tiny" style="margin-top:3px">Select the target(s) you actually declared against, then record whether the physical 2D6 charge succeeded.</div>'+
            '<label style="display:flex;gap:7px;align-items:center;margin-top:6px;font-size:10px"><input type="checkbox" data-onoforge-charge-target="'+esc(r.entryUid).replace(/"/g,'&quot;')+'" '+(state.tactical?.selectedTargetUid===r.entryUid?'checked':'')+'><span><b>'+esc(r.name||'Target')+'</b> • '+(Number.isFinite(Number(r.distance))?Number(r.distance).toFixed(1)+'" measured':(projection?.distanceEvidence?.physicalDistanceConfirmed?'Measured distance recorded':'Measure distance first'))+'</span></label>'+
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px"><button type="button" class="btn primary" onclick="window.recordTacticalChargeResult(\'success\',\''+String(ae.uid).replace(/'/g,"\\'")+'\');return false;">Charge Successful</button><button type="button" class="btn" onclick="window.recordTacticalChargeResult(\'failed\',\''+String(ae.uid).replace(/'/g,"\\'")+'\');return false;">Charge Failed</button></div></div>'
          : '')+
      '</div>'+
      (changes.length?'<div style="margin-top:7px"><b>What could change it:</b><ul style="margin:3px 0 0 18px">'+changes.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></div>':'')+
      '<button type="button" class="btn primary" style="width:100%;margin-top:8px" onclick="ensureTacticalState().selectedTargetUid=\''+esc(r.entryUid).replace(/'/g,"\\'")+'\';save();render()">Select '+esc(r.name||'Target')+'</button>'+
    '</details>';
  };
  const natural=(result.naturalTargets||[]).slice(0,3).map(r=>'<span class="pill" style="margin:2px">'+esc(r.name)+'</span>').join(''),avoidTargets=(result.avoid||[]).slice(0,3).map(r=>'<span class="pill" style="margin:2px">'+esc(r.name)+'</span>').join('');
  return '<details class="card tactical-advisor-card" open><summary><div class="split"><div><h3 style="margin:0">Tactical Advisor</h3><div class="muted">Quick target comparison</div></div><span class="pill">'+esc(result.evaluatedAt?.phase||state.phase||'Command')+'</span></div></summary>'+
    '<div style="margin-top:10px">'+
      '<div class="field" style="margin-bottom:8px"><label>Attacker</label><select onchange="setTacticalAdvisorAttacker(this.value)">'+attackerOptions+'</select></div>'+
      objectivePriorityHtml+
            objectiveIntelHtml+
      '<div class="status" style="margin-bottom:8px"><div class="muted small">Recommended targets</div><div class="tiny" style="margin-top:2px">Compare expected damage and wipe chance. Unknown battlefield facts lower confidence but do not hide valid target candidates.</div></div>'+
      (recs.slice(0,3).map(recCard).join('')||'<div class="empty">No eligible target recommendations for the current phase.</div>')+
      '<div class="grid2" style="margin-top:8px"><div class="status"><b>Natural targets</b><div style="margin-top:4px">'+(natural||'<span class="muted">None</span>')+'</div></div><div class="status"><b>Avoid / high-risk</b><div style="margin-top:4px">'+(avoidTargets||'<span class="muted">None</span>')+'</div></div></div>'+
      '<div class="muted small" style="margin-top:8px">Recommendations and Tactical Impact analysis update from the authoritative army roster, weapon availability, battlefield context, objectives, and tracked game state.</div>'+
    '</div></details>';
}return Object.freeze({tacticalAdvisorHtml});}window.OnoForgeTacticalAdvisorState=Object.freeze({createTacticalAdvisorStateController});