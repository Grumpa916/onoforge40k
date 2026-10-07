(function(global){
  function createGameTimerRuntimeStateController(deps={}){
    const {ensureGameTimer,updateGameTimerDisplay,getGameTimerInterval,setGameTimerInterval}=deps;
    function syncGameTimerRuntime(){
      if(getGameTimerInterval()!==null){
        clearInterval(getGameTimerInterval());
        setGameTimerInterval(null);
      }
      const t=ensureGameTimer();
      if(t.running&&!t.finishedAt){
        // Undo restores a snapshot from the action boundary; resume from that
        // boundary instead of charging time spent while the action was undone.
        t.startedAt=Date.now();
        t.turnStartedGameMs=Math.max(0,Number(t.elapsedMs)||0);
        setGameTimerInterval(setInterval(updateGameTimerDisplay,100));
      }
      updateGameTimerDisplay();
    }
    return Object.freeze({syncGameTimerRuntime});
  }
  global.OnoForgeGameTimerRuntimeState=Object.freeze({createGameTimerRuntimeStateController});
})(window);
