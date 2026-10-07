(function(global){
  function createUndoSnapshotStateController(deps={}){
    const {state,ensureGameTimer,gameTimerElapsed}=deps;
    function snapshotForUndo(){

  const x=JSON.parse(JSON.stringify(state));
  delete x.events;
  delete x._undoSnapshot;
  // Materialize the live game/turn clocks into the snapshot so undo restores
  // the logical time at which the action began rather than stale timer fields.
  const t=ensureGameTimer();
  if(t&&typeof t==='object'){
    const elapsed=gameTimerElapsed();
    const currentSide=state.currentTurn==='opp'?'opp':'my';
    const turnKey=currentSide==='opp'?'turnOppMs':'turnMyMs';
    const otherKey=currentSide==='opp'?'turnMyMs':'turnOppMs';
    const savedTurn=Math.max(0,Number(t[turnKey])||0);
    const turnStarted=Math.max(0,Number(t.turnStartedGameMs)||0);
    const liveTurn=!t.turnPaused&&t.running&&!t.finishedAt
      ?savedTurn+Math.max(0,elapsed-turnStarted)
      :savedTurn;
    x.gameTimer={...x.gameTimer,elapsedMs:elapsed};
    x.gameTimer[turnKey]=liveTurn;
    x.gameTimer[otherKey]=Math.max(0,Number(t[otherKey])||0);
    if(t.running&&!t.finishedAt){
      // Rebase the restored running timer to the moment the snapshot was taken.
      x.gameTimer.startedAt=Date.now();
      x.gameTimer.turnStartedGameMs=elapsed;
    }
  }
  return x;

    }
    return Object.freeze({snapshotForUndo});
  }
  global.OnoForgeUndoSnapshotState=Object.freeze({createUndoSnapshotStateController});
})(window);
