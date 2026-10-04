/* OnoForge 40K — Game Timer extracted from index.html.
 *
 * First timer extraction boundary.
 * The module owns timer state mechanics and its interval; the application
 * provides a narrow host bridge for state, persistence, rendering, and
 * battle/cloud services.
 */
(function(global){
  'use strict';

  let gameTimerInterval=null;
  let host=null;
  let timerClickHandlerInstalled=false;

  function hState(){ return host.getState(); }
  function ensureGameTimer(){
    const state=hState();
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
    const state=hState(),t=ensureGameTimer();
    const key=side==='opp'?'turnOppMs':'turnMyMs';
    const saved=Math.max(0,Number(t[key])||0);
    if(t.turnPaused)return saved;
    if(state.currentTurn!==side)return saved;
    return saved+Math.max(0,gameTimerElapsed()-(Number(t.turnStartedGameMs)||0));
  }
  function finalizeCurrentTurnTime(){
    const state=hState(),t=ensureGameTimer();
    if(t.turnPaused)return;
    const side=state.currentTurn==='opp'?'opp':'my';
    const key=side==='opp'?'turnOppMs':'turnMyMs';
    const now=gameTimerElapsed();
    const delta=Math.max(0,now-(Number(t.turnStartedGameMs)||0));
    t[key]=Math.max(0,Number(t[key])||0)+delta;
    t.turnStartedGameMs=now;
  }
  function toggleTurnPause(){
    if(!host.battleMutationAllowed('timer changes'))return;
    const t=ensureGameTimer();
    if(t.finishedAt)return;
    if(t.turnPaused){
      t.startedAt=Date.now();
      t.running=true;
      t.paused=false;
      t.pausedAt=0;
      t.turnStartedGameMs=Number(t.elapsedMs)||0;
      t.turnPaused=false;
      if(gameTimerInterval)clearInterval(gameTimerInterval);
      gameTimerInterval=setInterval(updateGameTimerDisplay,100);
    }else{
      finalizeCurrentTurnTime();
      t.elapsedMs=gameTimerElapsed();
      t.running=false;
      t.paused=true;
      t.pausedAt=Date.now();
      t.turnStartedGameMs=t.elapsedMs;
      if(gameTimerInterval){clearInterval(gameTimerInterval);gameTimerInterval=null;}
    }
    host.save();
    host.render();
  }
  function switchTurnClock(next){
    const state=hState(),t=ensureGameTimer();
    if(!t.turnPaused){
      finalizeCurrentTurnTime();
      t.turnStartedGameMs=gameTimerElapsed();
    }
    state.currentTurn=next==='opp'?'opp':'my';
  }
  function formatGameTime(ms){
    const total=Math.max(0,Math.floor(Number(ms)||0)/1000);
    const h=Math.floor(total/3600);
    const m=Math.floor((total%3600)/60);
    const s=Math.floor(total%60);
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }
  function updateGameTimerDisplay(){
    const state=hState();
    const el=document.getElementById('game-timer-value');
    if(el)el.textContent=formatGameTime(gameTimerElapsed());
    const turnEl=document.getElementById('turn-timer-value');
    if(turnEl)turnEl.textContent=formatGameTime(turnElapsedMs(state.currentTurn==='opp'?'opp':'my'));
    const myTurnEl=document.getElementById('my-turn-time-value');
    if(myTurnEl)myTurnEl.textContent=formatGameTime(turnElapsedMs('my'));
    const oppTurnEl=document.getElementById('opp-turn-time-value');
    if(oppTurnEl)oppTurnEl.textContent=formatGameTime(turnElapsedMs('opp'));
    const status=document.getElementById('game-timer-status');
    if(status){
      const t=ensureGameTimer();
      status.textContent=t.finishedAt?'Finished':(t.turnPaused?'Game Paused':'Game Running');
    }
  }
  function ensureLiveGameTimerDisplay(){
    if(gameTimerInterval!==null)return;
    const t=ensureGameTimer();
    if(t.running && !t.finishedAt){
      gameTimerInterval=setInterval(updateGameTimerDisplay,100);
    }
  }
  function startGameTimer(){
    const t=ensureGameTimer();
    t.elapsedMs=0;
    t.startedAt=Date.now();
    t.pausedAt=0;
    t.finishedAt=0;
    t.running=true;
    t.paused=false;
    if(gameTimerInterval)clearInterval(gameTimerInterval);
    gameTimerInterval=setInterval(updateGameTimerDisplay,100);
    updateGameTimerDisplay();
  }
  function toggleGameTimer(){ toggleTurnPause(); }
  function finishGameTimer(){
    const t=ensureGameTimer();
    if(t.finishedAt)return;
    if(t.running){finalizeCurrentTurnTime();t.elapsedMs=gameTimerElapsed();}
    t.running=false;
    t.paused=false;
    t.finishedAt=Date.now();
    stopGameTimerRuntime();
    host.save();
    host.render();
  }
  function saveBattleFromTimer(){
    if(hState().cloud?.userId){host.cloudSaveCurrentBattle({silent:false});return;}
    host.save();
    global.alert('Battle saved on this device.');
  }
  function gameTimerHtml(){
    const state=hState(),t=ensureGameTimer();
    const label=t.finishedAt?'Finished':t.turnPaused?'Resume Game':'Pause Game';
    const action=t.finishedAt?'':`<button type="button" class="btn ${t.turnPaused?'primary':'danger'}" data-game-timer-action="toggle">${label}</button>`;
    return `<div class="game-timer" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:0 0 10px;padding:7px 9px;border:1px solid var(--border,#2d4055);border-radius:8px;background:var(--panel,#111c2b)">
    <strong>Game Time</strong>
    <span id="game-timer-value" style="font-variant-numeric:tabular-nums;font-weight:700">${formatGameTime(gameTimerElapsed())}</span>
    <span id="game-timer-status" class="muted small">${t.finishedAt?'Finished':t.running?'Running':t.elapsedMs>0?'Paused':'Ready'}</span>
    <span class="muted small">Current Turn: ${host.esc(state.currentTurn==='opp'?state.oppName:state.myName)} <strong id="turn-timer-value">${formatGameTime(turnElapsedMs(state.currentTurn==='opp'?'opp':'my'))}</strong></span>
    <span class="muted small">${host.esc(state.myName)}: <strong id="my-turn-time-value">${formatGameTime(turnElapsedMs('my'))}</strong></span>
    <span class="muted small">${host.esc(state.oppName)}: <strong id="opp-turn-time-value">${formatGameTime(turnElapsedMs('opp'))}</strong></span>
    ${action}
    <button type="button" class="btn primary" data-game-timer-action="save">${state.cloudBattleSaving?'Saving…':'Save Battle'}</button>
    <button type="button" class="btn" data-game-timer-action="finish" ${t.finishedAt?'disabled':''}>Finish</button>
  </div>`;
  }
  function stopGameTimerRuntime(){
    if(gameTimerInterval!==null){
      clearInterval(gameTimerInterval);
      gameTimerInterval=null;
    }
  }
  function syncGameTimerRuntime(){
    stopGameTimerRuntime();
    const t=ensureGameTimer();
    if(t.running&&!t.finishedAt){
      t.startedAt=Date.now();
      t.turnStartedGameMs=Math.max(0,Number(t.elapsedMs)||0);
      gameTimerInterval=setInterval(updateGameTimerDisplay,100);
    }
    updateGameTimerDisplay();
  }
  function handleTimerClick(ev){
    const button=ev.target.closest?.('[data-game-timer-action]');
    if(!button)return;
    ev.preventDefault();
    ev.stopPropagation();
    if(button.disabled)return;
    const action=button.dataset.gameTimerAction;
    if(action==='toggle')toggleGameTimer();
    else if(action==='save')saveBattleFromTimer();
    else if(action==='finish')finishGameTimer();
  }
  function install(nextHost){
    host=nextHost;
    if(!timerClickHandlerInstalled){
      document.addEventListener('click',handleTimerClick);
      timerClickHandlerInstalled=true;
    }
    const api={ensureGameTimer,gameTimerElapsed,turnElapsedMs,finalizeCurrentTurnTime,toggleTurnPause,switchTurnClock,formatGameTime,updateGameTimerDisplay,ensureLiveGameTimerDisplay,startGameTimer,toggleGameTimer,finishGameTimer,saveBattleFromTimer,gameTimerHtml,stopGameTimerRuntime,syncGameTimerRuntime};
    Object.keys(api).forEach(name=>{ global[name]=api[name]; });
    return api;
  }

  global.OnoForgeGameTimer={install};
})(window);
