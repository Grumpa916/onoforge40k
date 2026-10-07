(function(global){
  function createBattleEndStateController(deps={}){
    const {state,snapshotForUndo,finalizeCurrentTurnTime,ensureGameTimer,gameTimerElapsed,gameTimerIntervalRef,setTournamentLifecycle,tournamentResultSnapshot,event,save,render,alert}=deps;
    function endBattle(){
 const before=snapshotForUndo();
 if(state.battleEnded)return;
 finalizeCurrentTurnTime();
 const t=ensureGameTimer();
 if(t.running){t.elapsedMs=gameTimerElapsed();t.running=false;t.paused=false;t.finishedAt=Date.now();}
 if(gameTimerIntervalRef.get()){clearInterval(gameTimerIntervalRef.get());gameTimerIntervalRef.set(null);}
 if(!setTournamentLifecycle('COMPLETED')){
  alert('The tournament could not transition to Completed.');
  return false;
 }
 state.battleResult=tournamentResultSnapshot();
 state.battleResultLocked=true;
 state.battleResultVerified=false;
 state.battleResultVerifiedAt=null;
 state.battleEnded=true;
 event('BATTLE_ENDED',{side:'my',unit:'Battle',action:'Battle marked complete',round:Math.max(1,Number(state.round)||1)},before);
 save();render();
}
    return Object.freeze({endBattle});
  }
  global.OnoForgeBattleEndState=Object.freeze({createBattleEndStateController});
})(window);
