(function(global){
  function createBattleStartStateController(deps={}){
    const {state,tournamentSetupValidation,ensureReserveState,ensureDeploymentPlans,initializeLiveDeploymentFromPlan,tournamentDeploymentValidation,snapshotForUndo,ONOFORGE_RULES_DATA_PIN,startGameTimer,setTournamentLifecycle,resetStratagemPhaseUses,forceDisposition,availableForceDispositions,ensureBattlefieldUnitPositions,gameTimerElapsed,initTacticalDeck,drawTactical,get,ensureModelRoster,event,detachmentDP,primaryMission,save,render,TACTICAL_STATE_VERSION,alert}=deps;
    function startBattle(){

  const setupCheck=tournamentSetupValidation();
  if(!setupCheck.ready){alert('Tournament setup is incomplete:\n\n• '+setupCheck.missing.join('\n• '));return false;}
  if(!['SETUP','DEPLOYMENT'].includes(state.tournamentLifecycle)){
    alert('Start Battle is only available from tournament setup.');
    return false;
  }
  ensureReserveState();ensureDeploymentPlans();initializeLiveDeploymentFromPlan();
  const deploymentCheck=tournamentDeploymentValidation();
  if(!deploymentCheck.ready){alert('Deployment is incomplete:\n\n• '+deploymentCheck.missing.join('\n• '));return false;}
  const before=snapshotForUndo();
  // Pin the rules-data revision for the lifetime of this tournament battle.
  // Loading an existing battle preserves its prior pin rather than silently adopting a newer deployed dataset.
  state.rulesDataPin=JSON.parse(JSON.stringify(ONOFORGE_RULES_DATA_PIN));
  startGameTimer();

  state.round=1;
  state.battleRoundComplete=false;
  state.battleEnded=false;
  state.battleResultLocked=false;
  state.battleResultVerified=false;
  state.battleResultVerifiedAt=null;
  state.battleResult=null;
  if(!setTournamentLifecycle('LIVE')){alert('The tournament could not transition from Deployment to Live.');return false;}
  state.phase='Command';
  state.primaryScoringRound=1;
  state.primaryMyScoredVP=0;
  state.primaryOppScoredVP=0;
  state.primaryScoringByRoundMy={1:[]};
  state.primaryScoringByRoundOpp={1:[]};
  state.primaryScoringAmountsByRoundMy={1:{}};
  state.primaryScoringAmountsByRoundOpp={1:{}};
  state.primaryScoringValuesByRoundMy={1:{}};
  state.primaryScoringValuesByRoundOpp={1:{}};
  state.primaryScoredItemsMy=[];
  state.primaryScoredItemsOpp=[];
  state.stratagemUsesMy=[];
  state.stratagemUsesOpp=[];

  state.secondaryMyVP=0;
  state.secondaryOppVP=0;
  state.secondaryScoredMyVP=0;
  state.secondaryScoredOppVP=0;
  state.secondaryMyScoredVPByRound={};
  state.secondaryOppScoredVPByRound={};
  state.secondaryMyScoredRound={};
  state.secondaryOppScoredRound={};
  state.secondaryMyScoredVP={};
  state.secondaryOppScoredVP={};
  state.secondaryNewOrdersUsedMy=false;
  state.secondaryNewOrdersUsedOpp=false;

  if(Array.isArray(state.secondaryMy)){
    state.secondaryMy.forEach(m=>{
      if(m && typeof m==='object'){
        m.completed=false;
        m.scored=false;
        m.complete=false;
        m.isCompleted=false;
        delete m.completedRound;
        delete m.scoredRound;
        delete m.roundCompleted;
      }
    });
  }

  if(Array.isArray(state.secondaryMyScored)){
    state.secondaryMyScored.forEach(m=>{
      if(m && typeof m==='object'){
        m.completed=false;
        m.scored=false;
        m.complete=false;
        m.isCompleted=false;
        delete m.completedRound;
        delete m.scoredRound;
        delete m.roundCompleted;
      }
    });
  }

  if(Array.isArray(state.secondaryOpp)){
    state.secondaryOpp.forEach(m=>{
      if(m && typeof m==='object'){
        m.completed=false;
        m.scored=false;
        m.complete=false;
        m.isCompleted=false;
        delete m.completedRound;
        delete m.scoredRound;
        delete m.roundCompleted;
      }
    });
  }

  if(Array.isArray(state.secondaryOppScored)){
    state.secondaryOppScored.forEach(m=>{
      if(m && typeof m==='object'){
        m.completed=false;
        m.scored=false;
        m.complete=false;
        m.isCompleted=false;
        delete m.completedRound;
        delete m.scoredRound;
        delete m.roundCompleted;
      }
    });
  }

state.myCP=1;state.oppCP=1;state.phaseCP={};state.battleFirstTurn=state.firstTurn==='opp'?'opp':'my';state.stratagemUsesMy=[];state.stratagemUsesOpp=[];resetStratagemPhaseUses();state.newOrdersCompletedMy=false;state.newOrdersCompletedOpp=false;state.tactical={version:TACTICAL_STATE_VERSION,pairs:{},unitUse:{},unitMovement:{},unitActions:{}};if(!forceDisposition('my')&&availableForceDispositions('my').length)state.myForceDisposition=availableForceDispositions('my')[0];if(!forceDisposition('opp')&&availableForceDispositions('opp').length)state.oppForceDisposition=availableForceDispositions('opp')[0];state.page='battle';setTournamentLifecycle('LIVE');state.phase='Command';state.currentTurn=state.firstTurn==='opp'?'opp':'my';ensureReserveState();ensureBattlefieldUnitPositions();Object.values(ensureBattlefieldUnitPositions()).forEach(p=>{if(p&&typeof p==='object')p.round=1;});delete state.battlefieldMapPlacement;delete state.deploymentMapPlacement;state.gameTimer.turnMyMs=0;state.gameTimer.turnOppMs=0;state.gameTimer.turnStartedGameMs=gameTimerElapsed();state.gameTimer.turnPaused=false;state.manualVPMy=0;state.manualVPOpp=0;state.myVP=state.battleReadyMy?10:0;state.oppVP=state.battleReadyOpp?10:0;state.events=[];state.objectives={};state.objectiveTurnStartOwners={};if(Array.isArray(state.stratagemsMy))state.stratagemsMy.forEach(s=>{if(s)s.used=false});
if(Array.isArray(state.stratagemsOpp))state.stratagemsOpp.forEach(s=>{if(s)s.used=false});
state.secondaryMyDiscard=[];state.secondaryOppDiscard=[];state.secondaryTacticalDrawKeys={};state.secondaryMyScored=[];state.secondaryOppScored=[];state.secondaryMyScoredVP={};state.secondaryOppScoredVP={};state.secondaryMyScoredVPByRound={};state.secondaryOppScoredVPByRound={};state.secondaryMyScoredRound={};state.secondaryOppScoredRound={};state.secondaryMyDeck=[];state.secondaryOppDeck=[];state.secondaryMyDeckInitialized=false;state.secondaryOppDeckInitialized=false;state.secondaryMyCards=[];state.secondaryOppCards=[];state.secondaryTacticalDrawKeys={};if(state.secondaryMy==='tactical'){initTacticalDeck('my');drawTactical('my',2,false)}if(state.secondaryOpp==='tactical'){initTacticalDeck('opp');drawTactical('opp',2,false)};state.my.forEach(e=>{const u=get(e.unitId),roster=ensureModelRoster(e,u);e.game={entryId:e.uid,models:e.models,wounds:e.models*get(e.unitId).wounds,status:'Alive',battleshocked:false,modelRoster:roster.map(m=>({...m,alive:true,woundsRemaining:Number(u.wounds)||1}))};});
state.opp.forEach(e=>{const u=get(e.unitId),roster=ensureModelRoster(e,u);e.game={entryId:e.uid,models:e.models,wounds:e.models*get(e.unitId).wounds,status:'Alive',battleshocked:false,modelRoster:roster.map(m=>({...m,alive:true,woundsRemaining:Number(u.wounds)||1}))};});event('GAME_STARTED',{unit:'Game',action:'Start / Reset Battle',round:state.round,phase:state.phase,attacker:state.attackerSide,defender:state.attackerSide==='my'?'opp':'my',firstTurn:state.firstTurn,secondaryMy:state.secondaryMy,secondaryOpp:state.secondaryOpp,battleReadyMy:state.battleReadyMy,battleReadyOpp:state.battleReadyOpp,myStartingVP:state.myVP,oppStartingVP:state.oppVP,myDetachment:state.detachmentSelections,oppDetachment:state.oppDetachmentSelections,myDetachmentDP:detachmentDP('my'),oppDetachmentDP:detachmentDP('opp'),myForceDisposition:forceDisposition('my'),oppForceDisposition:forceDisposition('opp'),myPrimaryMission:primaryMission('my'),oppPrimaryMission:primaryMission('opp')},before);save();render()
    }
    return Object.freeze({startBattle});
  }
  global.OnoForgeBattleStartState=Object.freeze({createBattleStartStateController});
})(window);
