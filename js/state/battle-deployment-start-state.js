(function(global){
  function createBattleDeploymentStartStateController(deps={}){
    const {state,tournamentSetupValidation,snapshotForUndo,setTournamentLifecycle,ensureReserveState,ensureDeploymentPlans,initializeLiveDeploymentFromPlan,event,save,render,alert}=deps;
    function beginDeployment(){
  const setupCheck=tournamentSetupValidation();
  if(!setupCheck.ready){alert('Tournament setup is incomplete:\n\n• '+setupCheck.missing.join('\n• '));return false;}
  const before=snapshotForUndo();
  if(!setTournamentLifecycle('DEPLOYMENT')){alert('The tournament cannot enter Deployment from the current lifecycle state.');return false;}
  ensureReserveState();
  ensureDeploymentPlans();
  initializeLiveDeploymentFromPlan();
  delete state.battlefieldMapPlacement;
  delete state.deploymentMapPlacement;
  event('TOURNAMENT_DEPLOYMENT_STARTED',{
    side:'my',
    unit:'Battle',
    action:'Tournament deployment phase started',
    round:Math.max(1,Number(state.round)||1)
  },before);
  save();render();
  return true;
}
    return Object.freeze({beginDeployment});
  }
  global.OnoForgeBattleDeploymentStartState=Object.freeze({createBattleDeploymentStartStateController});
})(window);
