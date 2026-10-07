(function(){
  function createTournamentLifecycleStateController(deps){
    const {state,scoreTotalForSide,ensureGameTimer,objectiveMissionKey,objectiveLayoutPage,ensureBattlefieldUnitPositions,ensureReserveState,ensureTransportEmbarkations,deploymentPlanForCurrentMap,secondaryTotalScoredVP,snapshotForUndo,event,save,render,objectiveMapMissionKey,objectiveMapLayout,terrainSetupComplete,firstTurn,secondaryMy,secondaryOpp,secState,ensureDeploymentPlans,isUnitReserved,document,URL,Blob,setTimeout,alert}=deps;
function tournamentResultSnapshot(){
 const my=scoreTotalForSide('my'),opp=scoreTotalForSide('opp');
 const t=ensureGameTimer();
 return {
  schema:'onoforge40k.tournament-result.v1',
  app:'OnoForge 40K',
  recordedAt:new Date().toISOString(),
  battleId:state.battleId||state.id||null,
  tournamentLifecycle:state.tournamentLifecycle||'COMPLETED',
  missionKey:state.objectiveMapMissionKey||objectiveMissionKey()||null,
  battlefieldLayout:state.objectiveMapLayout||null,
  mapPage:objectiveLayoutPage(),
  deploymentReadyMy:Object.values(ensureBattlefieldUnitPositions()).some(p=>p&&p.side==='my'),
  deploymentReadyOpp:Object.values(ensureBattlefieldUnitPositions()).some(p=>p&&p.side==='opp'),
  reservesDeclaredMy:Object.keys(ensureReserveState().my||{}).length,
  reservesDeclaredOpp:Object.keys(ensureReserveState().opp||{}).length,
  transportEmbarkations:JSON.parse(JSON.stringify(ensureTransportEmbarkations())),
  deploymentState:{mapPage:objectiveLayoutPage(),positions:JSON.parse(JSON.stringify(ensureBattlefieldUnitPositions())),plan:JSON.parse(JSON.stringify(deploymentPlanForCurrentMap())),reserves:JSON.parse(JSON.stringify(ensureReserveState())),transportEmbarkations:JSON.parse(JSON.stringify(ensureTransportEmbarkations()))},
  myName:state.myName,oppName:state.oppName,
  myVP:my,oppVP:opp,
  primaryMyVP:Number(state.primaryMyScoredVP)||0,
  primaryOppVP:Number(state.primaryOppScoredVP)||0,
  secondaryMyVP:secondaryTotalScoredVP('my'),
  secondaryOppVP:secondaryTotalScoredVP('opp'),
  battleReadyMy:!!state.battleReadyMy,battleReadyOpp:!!state.battleReadyOpp,
  round:Math.max(1,Number(state.round)||1),
  firstTurn:state.firstTurn||null,
  currentTurn:state.currentTurn||null,
  phase:state.phase||null,
  gameElapsedMs:Number(t.elapsedMs)||0,
  turnMyMs:Number(t.turnMyMs)||0,
  turnOppMs:Number(t.turnOppMs)||0,
  rulesDataPin:state.rulesDataPin?JSON.parse(JSON.stringify(state.rulesDataPin)):null,
  eventCount:Array.isArray(state.events)?state.events.length:0
 };
}

function ensureTournamentLifecycle(){
 const allowed=['SETUP','DEPLOYMENT','LIVE','COMPLETED'];
 if(!allowed.includes(state.tournamentLifecycle))state.tournamentLifecycle=state.battleEnded?'COMPLETED':'SETUP';
 return state.tournamentLifecycle;
}

function setTournamentLifecycle(next){
 const allowed=['SETUP','DEPLOYMENT','LIVE','COMPLETED'];
 if(!allowed.includes(next))return false;
 const current=ensureTournamentLifecycle();
 const transitions={SETUP:['DEPLOYMENT','LIVE'],DEPLOYMENT:['SETUP','LIVE'],LIVE:['COMPLETED'],COMPLETED:['SETUP']};
 if(current!==next&&!transitions[current].includes(next))return false;
 state.tournamentLifecycle=next;
 return true;
}

function battleMutationAllowed(action='battle update'){
 if(state.battleEnded||state.battleResultLocked){
   alert('Battle is complete. '+action+' is locked; start a new battle to make changes.');
   return false;
 }
 return true;
}

function tournamentResultIntegrityCheck(){
 if(!state.battleEnded||!state.battleResult)return {ok:false,reason:'No completed tournament result exists.'};
 const r=state.battleResult;
 const reserveState=ensureReserveState();
 const positions=ensureBattlefieldUnitPositions();
 const timer=ensureGameTimer();
 const expected={
  tournamentLifecycle:'COMPLETED',
  myVP:scoreTotalForSide('my'),
  oppVP:scoreTotalForSide('opp'),
  primaryMyVP:Number(state.primaryMyScoredVP)||0,
  primaryOppVP:Number(state.primaryOppScoredVP)||0,
  secondaryMyVP:secondaryTotalScoredVP('my'),
  secondaryOppVP:secondaryTotalScoredVP('opp'),
  battleReadyMy:!!state.battleReadyMy,
  battleReadyOpp:!!state.battleReadyOpp,
  round:Math.max(1,Number(state.round)||1),
  firstTurn:state.firstTurn||null,
  currentTurn:state.currentTurn||null,
  phase:state.phase||null,
  gameElapsedMs:Number(timer.elapsedMs)||0,
  turnMyMs:Number(timer.turnMyMs)||0,
  turnOppMs:Number(timer.turnOppMs)||0,
  missionKey:state.objectiveMapMissionKey||objectiveMissionKey()||null,
  battlefieldLayout:state.objectiveMapLayout||null,
  deploymentReadyMy:Object.values(positions).some(p=>p&&p.side==='my'),
  deploymentReadyOpp:Object.values(positions).some(p=>p&&p.side==='opp'),
  reservesDeclaredMy:Object.keys(reserveState.my||{}).length,
  reservesDeclaredOpp:Object.keys(reserveState.opp||{}).length,
  transportEmbarkations:JSON.parse(JSON.stringify(ensureTransportEmbarkations())),
  rulesDataPin:state.rulesDataPin?JSON.parse(JSON.stringify(state.rulesDataPin)):null
 };
 const comparable=(value)=>value&&typeof value==='object'?JSON.stringify(value):String(value??'');
 const mismatches=Object.keys(expected).filter(k=>comparable(r[k])!==comparable(expected[k]));
 return {ok:mismatches.length===0,mismatches};
}

function verifyTournamentResult(){
 if(!state.battleEnded||!state.battleResult){alert('Finish the battle before verifying the tournament result.');return false;}
 if(!state.battleResultLocked){alert('The tournament result is not locked.');return false;}
 const check=tournamentResultIntegrityCheck();
 if(!check.ok){alert('Result verification failed. Authoritative state differs from the locked result in: '+check.mismatches.join(', '));return false;}
 state.battleResultVerified=true;
 state.battleResultVerifiedAt=new Date().toISOString();
 event('TOURNAMENT_RESULT_VERIFIED',{side:'my',unit:'Battle',action:'Tournament result verified against locked authoritative state',round:Math.max(1,Number(state.round)||1)});
 save();render();
 return true;
}

function exportTournamentResult(){
 try{
  if(!state.battleEnded||!state.battleResult){alert('Finish the battle before exporting the tournament result.');return;}
  if(!state.battleResultVerified){alert('Verify the tournament result before exporting it.');return;}
  const check=tournamentResultIntegrityCheck();
  if(!check.ok){state.battleResultVerified=false;alert('Tournament result changed after verification. Re-verify before exporting. Differences: '+check.mismatches.join(', '));return;}
  const payload=JSON.stringify(state.battleResult,null,2);
  const blob=new Blob([payload],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);
  const stamp=String(state.battleResult.recordedAt||new Date().toISOString()).slice(0,10);
  a.download='onoforge40k-tournament-result-'+stamp+'.json';a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
 }catch(e){alert('Tournament result export failed: '+e.message)}
}

function tournamentSetupValidation(){
 const missing=[];
 if(!Array.isArray(state.my)||!state.my.length)missing.push('My roster');
 if(!Array.isArray(state.opp)||!state.opp.length)missing.push('Opponent roster');
 if(!state.objectiveMapMissionKey&&!objectiveMissionKey())missing.push('Primary mission');
 if(!state.objectiveMapLayout)missing.push('Battlefield layout');
 if(!state.terrainSetupComplete)missing.push('Terrain setup completion');
 if(state.firstTurn!=='my'&&state.firstTurn!=='opp')missing.push('First-turn selection');
 if(state.secondaryMy==='fixed'&&secState('my').length!==2)missing.push('My Fixed secondary selections (2)');
 if(state.secondaryOpp==='fixed'&&secState('opp').length!==2)missing.push('Opponent Fixed secondary selections (2)');
 return {ready:missing.length===0,missing};
}

function resetTournamentToSetup(){
  const before=snapshotForUndo();
  if(!setTournamentLifecycle('SETUP')){alert('The tournament cannot be reset from the current lifecycle state.');return false;}
  state.page='setup';
  event('TOURNAMENT_SETUP_RESET',{side:'my',unit:'Battle',action:'Return tournament battle to setup before deployment'},before);
  save();render();
  return true;
}

function initializeLiveDeploymentFromPlan(){
  const live=ensureBattlefieldUnitPositions(),plan=deploymentPlanForCurrentMap();
  Object.entries(plan).forEach(([uid,p])=>{
    if(live[String(uid)]||!p||isUnitReserved('my',uid))return;
    const x=Math.round(Number(p.x)*10)/10,y=Math.round(Number(p.y)*10)/10;
    if(!Number.isFinite(x)||!Number.isFinite(y)||x<0||x>60||y<0||y>44)return;
    live[String(uid)]={x,y,side:'my',source:'deployment-plan',round:Math.max(1,Number(state.round)||1)};
  });
}

function returnToTournamentSetup(){
  if(state.tournamentLifecycle!=='DEPLOYMENT')return false;
  const before=snapshotForUndo();
  if(!setTournamentLifecycle('SETUP'))return false;
  event('TOURNAMENT_SETUP_REOPENED',{
    side:'my',
    unit:'Battle',
    action:'Tournament setup reopened before live battle',
    round:Math.max(1,Number(state.round)||1)
  },before);
  save();render();
  return true;
}
    return {tournamentResultSnapshot,ensureTournamentLifecycle,setTournamentLifecycle,battleMutationAllowed,tournamentResultIntegrityCheck,verifyTournamentResult,exportTournamentResult,tournamentSetupValidation,resetTournamentToSetup,initializeLiveDeploymentFromPlan,returnToTournamentSetup};
  }
  window.OnoForgeTournamentLifecycleState={createTournamentLifecycleStateController};
})();
