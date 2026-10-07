function createGameTimerStateController({getState}){
  function ensureGameTimer(){
    const state=getState();
    if(!state.gameTimer || typeof state.gameTimer!=='object'){
      state.gameTimer={elapsedMs:0,running:false,paused:false,startedAt:0,pausedAt:0,finishedAt:0,turnMyMs:0,turnOppMs:0,turnStartedGameMs:0,turnPaused:false};
    }
    return state.gameTimer;
  }
  function gameTimerElapsed(){
    const t=ensureGameTimer();
    if(!t.running)return Math.max(0,Number(t.elapsedMs)||0);
    return Math.max(0,(Number(t.elapsedMs)||0)+(Date.now()-(Number(t.startedAt)||Date.now())));
  }
  function turnElapsedMs(side){
    const state=getState();
    const t=ensureGameTimer();
    const key=side==='opp'?'turnOppMs':'turnMyMs';
    const saved=Math.max(0,Number(t[key])||0);
    if(t.turnPaused)return saved;
    if(state.currentTurn!==side)return saved;
    return saved+Math.max(0,gameTimerElapsed()-(Number(t.turnStartedGameMs)||0));
  }
  function finalizeCurrentTurnTime(){
    const state=getState();
    const t=ensureGameTimer();
    if(t.turnPaused)return;
    const side=state.currentTurn==='opp'?'opp':'my';
    const key=side==='opp'?'turnOppMs':'turnMyMs';
    const now=gameTimerElapsed();
    const delta=Math.max(0,now-(Number(t.turnStartedGameMs)||0));
    t[key]=Math.max(0,Number(t[key])||0)+delta;
    t.turnStartedGameMs=now;
  }
  function switchTurnClock(next){
    const state=getState();
    const t=ensureGameTimer();
    if(!t.turnPaused){
      finalizeCurrentTurnTime();
      t.turnStartedGameMs=gameTimerElapsed();
    }
    state.currentTurn=next==='opp'?'opp':'my';
  }
  return Object.freeze({ensureGameTimer,gameTimerElapsed,turnElapsedMs,finalizeCurrentTurnTime,switchTurnClock});
}
window.OnoForgeGameTimerState=Object.freeze({createGameTimerStateController});
