// OnoForge Tactical Advisor context/state extraction.
function createTacticalAdvisorContextStateController(deps={}){
  const {
    state,get,modelRosterRule,survivingModelRoster,ensureTacticalState,objectiveStateRecord,
    ensureObjectiveLayoutForMission,objectiveMissionKey,objectiveLayoutPage,objectiveBattlefieldGeometry,
    objectiveMapModel,primaryMission,primaryScoringRowsForRound,objectiveTacticalSummary,objectiveHomeSide,
    objectivePrimaryScoringImpact,esc,objectiveTurnStartOwner,objectiveControlSourceIds,entry,mathRosterEntry,
    tacticalPairState,TACTICAL_STATE_VERSION
  }=deps;

function tacticalUnitState(side,e){
  const u=get(e?.unitId);if(!u||!e)return null;
  const g=e.game||{};
  const roster=modelRosterRule(u)?survivingModelRoster(e,u):[];
  const models=roster.length?roster.length:Math.max(0,Number(g.models??e.models??u.models)||0);
  const wounds=roster.length?roster.reduce((n,m)=>n+Math.max(0,Number(m.woundsRemaining)||0),0):Math.max(0,Number(g.wounds??models*(u.wounds||1))||0);
  return {entryUid:e.uid,unitId:u.id,name:u.name,models,wounds,maxWounds:Math.max(1,Number(u.wounds)||1)*Math.max(1,Number(e.models)||Number(u.models)||1),destroyed:g.status==='Destroyed'||models<=0,battleshocked:!!g.battleshocked,attachedTo:e.attachedTo||null,keywords:[...(u.keywords||[])],profile:u.profile||{}};
}

function tacticalBattleState(){
  ensureTacticalState();
  const objectives=Object.keys(state.objectives||{}).map(objectiveStateRecord);
  const layoutInfo=ensureObjectiveLayoutForMission();
  return {version:TACTICAL_STATE_VERSION,round:Math.max(1,Number(state.round)||1),phase:state.phase||'Command',turn:state.currentTurn==='opp'?'opp':'my',
    vp:{my:Number(state.myVP)||0,opp:Number(state.oppVP)||0},cp:{my:Number(state.myCP)||0,opp:Number(state.oppCP)||0},
    battlefield:{mapLayout:state.objectiveMapLayout||'A',mapMissionKey:state.objectiveMapMissionKey||objectiveMissionKey(),mapPage:layoutInfo?objectiveLayoutPage():null},
    battlefieldGeometry:objectiveBattlefieldGeometry(),map:objectiveMapModel(),
    objectives,units:{my:(state.my||[]).map(e=>tacticalUnitState('my',e)).filter(Boolean),opp:(state.opp||[]).map(e=>tacticalUnitState('opp',e)).filter(Boolean)},
    recentEvents:(state.events||[]).slice(0,20).map(e=>({kind:e.kind,round:e.round,phase:e.phase,playerTurn:e.playerTurn,payload:e.payload||{}}))};
}

function tacticalUnitActionState(side,e){
  const p=String(state.phase||'Command'),round=Math.max(1,Number(state.round)||1),turn=state.currentTurn==='opp'?'opp':'my';
  if(!e)return {phase:p,round,turn,shootingModelsResolved:0,shootingResolved:false};
  const uid=String(e.uid||'');
  const shootingModelsResolved=(state.events||[]).filter(ev=>
    ev?.kind==='ATTACK_RESOLUTION' &&
    (Number(ev.round)||1)===round &&
    String(ev.phase||'')==='Shooting' &&
    String(ev.playerTurn||'')===side &&
    String(ev.payload?.attackerEntryUid||'')===uid
  ).reduce((n,ev)=>n+Math.max(1,Number(ev.payload?.modelsResolved)||1),0);
  const roster=modelRosterRule(get(e.unitId))?survivingModelRoster(e,get(e.unitId)).length:Math.max(0,Number(e.game?.models??e.models??0));
  return {phase:p,round,turn,shootingModelsResolved,shootingResolved:shootingModelsResolved>0,remainingShootingModels:Math.max(0,roster-shootingModelsResolved)};
}

function tacticalLegalityForUnit(side,e){
  const p=state.phase||'Command',isMine=side==='my',turn=state.currentTurn==='opp'?'opp':'my';
  const s=tacticalUnitState(side,e);if(!s)return {legal:false,reason:'missing-unit'};
  if(s.destroyed)return {legal:false,reason:'destroyed'};
  if(isMine&&turn!=='my')return {legal:false,reason:'not-your-turn'};
  if(!isMine&&turn==='my')return {legal:false,reason:'opponent-turn'};
  const action=tacticalUnitActionState(side,e);
  const available={movement:p==='Movement',shooting:p==='Shooting'&&action.remainingShootingModels>0,charge:p==='Charge',fight:p==='Fight',command:p==='Command'};
  return {legal:true,phase:p,action,available};
}

function tacticalObjectiveAdvisor(side){
  const player=side==='opp'?'opp':'my',enemy=player==='my'?'opp':'my';
  const mission=primaryMission(player);
  const rows=primaryScoringRowsForRound(mission);
  const summary=objectiveTacticalSummary();
  const list=Object.keys(state.objectives||{}).map(objectiveStateRecord);
  const relevant=list.map(o=>{
    const text=rows.map(r=>String(r?.[2]||'')).join(' ').toLowerCase();
    const centralRule=/central objectives?/.test(text)&&o.type==='central';
    const homeRule=/home objective|your home|home/.test(text)&&o.type==='home'&&objectiveHomeSide(o.name)===player;
    const enemyTerritoryRule=/enemy territory/.test(text)&&o.territory===enemy;
    const deploymentRule=/deployment zone/.test(text)&&o.deploymentZone===player;
    const genericObjectiveRule=/objective/.test(text);
    const missionRelevant=centralRule||homeRule||enemyTerritoryRule||deploymentRule||genericObjectiveRule;
    const transition=o.changeType||'uncontrolled';
    let action='Monitor',score=0,reason='No immediate control change is indicated.';
    if(o.owner===player){
      score+=missionRelevant?45:10;
      action=missionRelevant?'Defend':'Hold';
      if(transition==='newly_controlled'){
        score+=18; action='Defend';
        reason='You newly controlled this objective this turn; protect that control.';
      }else if(transition==='recaptured'){
        score+=22; action='Defend';
        reason='You recaptured this objective; protect the recovered control.';
      }else if(transition==='gained'){
        score+=14; action='Defend';
        reason='You gained control of this objective this turn; protect the new control.';
      }else if(transition==='held'){
        reason=missionRelevant?'You continue to control a mission-relevant objective.':'You currently control it.';
      }else{
        reason='You currently control it.';
      }
    }else if(o.owner==='contested'){
      score+=missionRelevant?55:25;
      action='Contest';
      if(transition==='contested')score+=15;
      reason=transition==='contested'?'This objective became contested during the current turn; resolving control may affect scoring.':'Control is contested; resolving control may affect scoring.';
    }else if(o.owner===enemy){
      score+=missionRelevant?50:15;
      action='Take';
      if(transition==='lost'){
        score+=20; action='Retake';
        reason='You lost control of this objective during the current turn; retaking it may restore control.';
      }else if(transition==='gained'){
        score+=10;
        reason=missionRelevant?'The opponent gained control this turn and the objective is relevant to the mission.':'The opponent gained control this turn.';
      }else{
        reason=missionRelevant?'Enemy control is directly relevant to current mission conditions.':'Taking it may improve board control.';
      }
    }else{
      score+=missionRelevant?30:5;
      action='Consider';
      reason='No player currently controls this objective.';
    }
    const primaryImpact=objectivePrimaryScoringImpact(player,o.name);
    const primaryVP=Math.max(0,Number(primaryImpact.potentialVP)||0);
    const primaryConditionCount=Math.max(0,Number(primaryImpact.conditionCount)||0);
    if(primaryVP>0)score+=primaryVP*4;
    else if(primaryConditionCount>0)score+=primaryConditionCount*8;
    if(primaryVP>0)reason+=' Primary scoring can contribute up to '+primaryVP+' VP from this objective.';
    else if(primaryConditionCount>0)reason+=' This objective contributes to a current Primary scoring condition.';
    if(o.type==='central')score+=8;
    if(o.territory===enemy)score+=5;
    if(o.deploymentZone===enemy)score+=7;
    return {...o,action,score,reason,missionRelevant,transition,primaryImpact,primaryVP};
  }).sort((a,b)=>b.score-a.score);
  return {side:player,mission,round:Math.max(1,Number(state.round)||1),recommendations:relevant.slice(0,4),summary};
}

function tacticalObjectiveAdvisorHtml(side){
  const intel=tacticalObjectiveAdvisor(side||'my');
  const recs=intel.recommendations||[];
  const cards=recs.map(o=>{
    const location=[o.type,o.territory,o.deploymentZone==='none'?'':o.deploymentZone].filter(Boolean).join(' • ');
    const control=o.owner==='my'?'Mine':o.owner==='opp'?'Enemy':o.owner==='contested'?'Contested':'Uncontrolled';
    const transition=o.transition&&o.transition!=='held'&&o.transition!=='uncontrolled'?' • '+o.changeLabel:'';
    const primary=o.primaryVP>0?' • up to '+o.primaryVP+' VP':(o.primaryImpact?.conditionCount?' • Primary condition':'');
    return '<div class="status" style="margin-top:5px"><div class="split"><div><b>'+esc(o.name)+'</b><div class="tiny">'+esc(control)+' • '+esc(location)+esc(transition)+esc(primary)+'</div></div><span class="pill">'+esc(o.action)+'</span></div><div class="tiny" style="margin-top:4px">'+esc(o.reason)+'</div></div>';
  }).join('');
  return '<div class="status" style="margin-bottom:8px"><div class="muted small">Objective priorities • Round '+intel.round+'</div>'+(recs.length?cards:'<div class="tiny" style="margin-top:4px">No objectives tracked.</div>')+'</div>';
}

function tacticalObjectiveValueForTarget(targetEntry,pairCtx){
  const label=String(pairCtx?.objective||'').trim();
  if(!label)return {value:0,status:'unknown',reason:'no-objective-context',objective:''};
  const rawOwner=state.objectives?.[label];
  const owner=['my','opp','contested','none'].includes(rawOwner)?rawOwner:'unknown';
  const startOwner=objectiveTurnStartOwner(label);
  const changedThisTurn=owner!==startOwner;
  if(owner==='unknown'||owner==='none')return {value:0,status:'unknown',reason:'objective-owner-unknown',objective:label,owner,startOwner,changedThisTurn};
  const oc=Math.max(0,Number(targetEntry?.profile?.OC)||0);
  if(owner==='opp')return {value:Math.min(1,0.65+0.35*Math.min(1,oc/5)),status:'positive',reason:changedThisTurn?'target-linked-to-newly-opponent-controlled-objective':'target-linked-to-opponent-controlled-objective',objective:label,owner,startOwner,changedThisTurn,oc};
  if(owner==='contested')return {value:Math.min(1,0.40+0.25*Math.min(1,oc/5)),status:'contested',reason:changedThisTurn?'target-linked-to-newly-contested-objective':'target-linked-to-contested-objective',objective:label,owner,startOwner,changedThisTurn,oc};
  return {value:0.05*Math.min(1,oc/5),status:'negative',reason:changedThisTurn?'target-linked-to-newly-friendly-controlled-objective':'target-linked-to-friendly-controlled-objective',objective:label,owner,startOwner,changedThisTurn,oc};
}

function tacticalPrimaryTargetImpact(targetEntry,pairCtx){
  const explicitObjective=String(pairCtx?.objective||'').trim();
  const linkedObjectives=Object.keys(state.objectives||{}).filter(name=>{
    const ids=objectiveControlSourceIds(name);
    return targetEntry?.uid&&ids.includes(String(targetEntry.uid));
  });
  const objectives=explicitObjective?[explicitObjective]:linkedObjectives;
  if(!objectives.length)return {objective:'',objectives:[],my:{potentialVP:0,conditionCount:0,items:[]},opp:{potentialVP:0,conditionCount:0,items:[]},ownScoringValue:0,denyScoringValue:0,status:'unknown',linkSource:'none'};
  const impacts=objectives.map(objective=>{
    const myImpact=objectivePrimaryScoringImpact('my',objective);
    const oppImpact=objectivePrimaryScoringImpact('opp',objective);
    const owner=['my','opp','contested','none'].includes(state.objectives?.[objective])?state.objectives[objective]:'unknown';
    const targetControls=owner==='opp';
    const myOpportunity=myImpact.potentialVP>0?myImpact.potentialVP:(myImpact.conditionCount>0?0.25:0);
    const denyOpportunity=targetControls?(oppImpact.potentialVP>0?oppImpact.potentialVP:(oppImpact.conditionCount>0?0.25:0)):0;
    return {objective,owner,targetControls,myImpact,oppImpact,myOpportunity,denyOpportunity};
  });
  const myOpportunity=Math.max(...impacts.map(x=>x.myOpportunity),0);
  const denyOpportunity=Math.max(...impacts.map(x=>x.denyOpportunity),0);
  const strongest=impacts.slice().sort((a,b)=>(b.myOpportunity+b.denyOpportunity)-(a.myOpportunity+a.denyOpportunity))[0];
  return {
    objective:strongest?.objective||'',
    objectives:impacts.map(x=>x.objective),
    owner:strongest?.owner||'unknown',
    targetControls:!!strongest?.targetControls,
    my:{potentialVP:strongest?.myImpact?.potentialVP||0,conditionCount:strongest?.myImpact?.conditionCount||0,items:strongest?.myImpact?.items||[]},
    opp:{potentialVP:strongest?.oppImpact?.potentialVP||0,conditionCount:strongest?.oppImpact?.conditionCount||0,items:strongest?.oppImpact?.items||[]},
    ownScoringValue:Math.min(1,myOpportunity/5),
    denyScoringValue:Math.min(1,denyOpportunity/5),
    status:strongest?.owner==='unknown'?'unknown':strongest?.targetControls?'enemy-controlled':strongest?.owner==='my'?'friendly-controlled':strongest?.owner==='contested'?'contested':'uncontrolled',
    linkSource:explicitObjective?'pair-context':linkedObjectives.length?'oc-contributor':'none'
  };
}

function tacticalAdvisorStateSnapshot(attackerEntryUid){
  const atk=entry('my',attackerEntryUid)||mathRosterEntry('my');
  const targets=(state.opp||[]).filter(e=>!e.attachedTo&&!tacticalUnitState('opp',e)?.destroyed);
  return {battle:tacticalBattleState(),attacker:atk?tacticalUnitState('my',atk):null,targetCount:targets.length,
    targets:targets.map(e=>{const s=tacticalUnitState('opp',e);return s?{...s,tacticalContext:tacticalPairState(atk?.uid,e.uid)}:null}).filter(Boolean)};
}

function tacticalAdvisorStateSignature(){
  const t=ensureTacticalState();
  const entrySignature=side=>(state[side]||[]).map(e=>({
    uid:e?.uid,unitId:e?.unitId,models:e?.models,qty:e?.qty,points:e?.points,
    weapons:e?.weapons,wargearSelections:e?.wargearSelections,attachedTo:e?.attachedTo,
    leaderUid:e?.leaderUid,attachedRole:e?.attachedRole,game:e?.game
  }));
  return JSON.stringify({
    phase:state.phase||'Command',
    round:Math.max(1,Number(state.round)||1),
    currentTurn:state.currentTurn==='opp'?'opp':'my',
    myVP:Number(state.myVP)||0,oppVP:Number(state.oppVP)||0,
    myCP:Number(state.myCP)||0,oppCP:Number(state.oppCP)||0,
    objectives:state.objectives||{},
    objectiveMeta:state.objectiveMeta||{},
    objectiveTurnStartOwners:state.objectiveTurnStartOwners||{},
    objectiveControlHistory:state.objectiveControlHistory||{},
    objectiveControlSources:state.objectiveControlSources||{},
    objectiveMapLayout:state.objectiveMapLayout||'A',
    objectiveMapMissionKey:state.objectiveMapMissionKey||objectiveMissionKey(),
    mission:state.mission||state.primaryMission||state.missionName||'',
    primaryMyScoredVP:Number(state.primaryMyScoredVP)||0,
    primaryOppScoredVP:Number(state.primaryOppScoredVP)||0,
    primaryScoringByRoundMy:state.primaryScoringByRoundMy||{},
    primaryScoringByRoundOpp:state.primaryScoringByRoundOpp||{},
    primaryScoringValuesByRoundMy:state.primaryScoringValuesByRoundMy||{},
    primaryScoringValuesByRoundOpp:state.primaryScoringValuesByRoundOpp||{},
    secondaryMyScoredVP:state.secondaryMyScoredVP||{},
    secondaryOppScoredVP:state.secondaryOppScoredVP||{},
    secondaryMyScoredVPByRound:state.secondaryMyScoredVPByRound||{},
    secondaryOppScoredVPByRound:state.secondaryOppScoredVPByRound||{},
    mathRules:state.mathRules||{},
    my:entrySignature('my'),
    opp:entrySignature('opp'),
    // Tactical recommendations and legality depend on the authoritative live map.
    // Include battlefield positions in the cache signature so moving a unit cannot
    // leave stale charge distances, eligibility, or recommendations on screen.
    battlefieldUnitPositions:state.battlefieldUnitPositions||{},
    tactical:{
      pairs:t.pairs||{},
      unitUse:t.unitUse||{},
      unitMovement:t.unitMovement||{},
      unitActions:t.unitActions||{},
      fightPhase:t.fightPhase||{}
    },
    events:(state.events||[]).filter(e=>e?.kind==='ATTACK_RESOLUTION').map(e=>({
      kind:e.kind,round:e.round,phase:e.phase,playerTurn:e.playerTurn,payload:e.payload||{}
    }))
  });
}

  return Object.freeze({tacticalUnitState,tacticalBattleState,tacticalUnitActionState,tacticalLegalityForUnit,tacticalObjectiveAdvisor,tacticalObjectiveAdvisorHtml,tacticalObjectiveValueForTarget,tacticalPrimaryTargetImpact,tacticalAdvisorStateSnapshot,tacticalAdvisorStateSignature});
}
window.OnoForgeTacticalAdvisorContextState=Object.freeze({createTacticalAdvisorContextStateController});
