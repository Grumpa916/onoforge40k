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
  function pauseGameTimer(){
    if(!host.battleMutationAllowed('timer changes'))return false;
    const t=ensureGameTimer();
    if(t.finishedAt||t.turnPaused||!t.running)return false;
    finalizeCurrentTurnTime();
    t.elapsedMs=gameTimerElapsed();
    t.running=false;
    t.paused=true;
    t.turnPaused=true;
    t.pausedAt=Date.now();
    t.turnStartedGameMs=t.elapsedMs;
    if(gameTimerInterval){clearInterval(gameTimerInterval);gameTimerInterval=null;}
    updateGameTimerDisplay();
    try{host.save();}catch(e){console.warn('OnoForge timer state save failed.',e);}
    return true;
  }
  function resumeGameTimer(){
    if(!host.battleMutationAllowed('timer changes'))return false;
    const t=ensureGameTimer();
    if(t.finishedAt||!t.turnPaused)return false;
    t.startedAt=Date.now();
    t.running=true;
    t.paused=false;
    t.turnPaused=false;
    t.pausedAt=0;
    t.turnStartedGameMs=Number(t.elapsedMs)||0;
    if(gameTimerInterval)clearInterval(gameTimerInterval);
    gameTimerInterval=setInterval(updateGameTimerDisplay,100);
    updateGameTimerDisplay();
    try{host.save();}catch(e){console.warn('OnoForge timer state save failed.',e);}
    return true;
  }
  function toggleTurnPause(){
    return ensureGameTimer().turnPaused?resumeGameTimer():pauseGameTimer();
  }
  function switchTurnClock(next,outgoingSide){
    const state=hState(),t=ensureGameTimer();
    // Callers that already mutate currentTurn must pass the outgoing side.
    // Older callers may omit it, in which case the current state is used.
    const side=outgoingSide==='opp'||outgoingSide==='my'
      ?outgoingSide
      :(state.currentTurn==='opp'?'opp':'my');
    if(!t.turnPaused){
      const key=side==='opp'?'turnOppMs':'turnMyMs';
      const now=gameTimerElapsed();
      const delta=Math.max(0,now-(Number(t.turnStartedGameMs)||0));
      t[key]=Math.max(0,Number(t[key])||0)+delta;
      t.turnStartedGameMs=now;
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
    bindTimerControls();
  }
  function ensureLiveGameTimerDisplay(){
    const state=hState(),t=ensureGameTimer();
    // Migration guard: an already-live battle created before timer state was
    // initialized should start its untouched clock automatically. Intentionally
    // paused or finished timers are left alone.
    const untouched=!t.running&&!t.paused&&!t.finishedAt
      &&Math.max(0,Number(t.elapsedMs)||0)===0
      &&Math.max(0,Number(t.turnMyMs)||0)===0
      &&Math.max(0,Number(t.turnOppMs)||0)===0;
    if(state.tournamentLifecycle==='LIVE'&&!state.battleEnded&&untouched){
      t.startedAt=Date.now();
      t.turnStartedGameMs=0;
      t.running=true;
      t.paused=false;
      if(host.save)host.save();
    }
    if(gameTimerInterval!==null)return;
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
  let saveStatusTimer=null;
  function setTimerSaveStatus(message){
    const el=document.getElementById('game-timer-save-status');
    if(!el)return;
    el.textContent=message;
    if(saveStatusTimer)clearTimeout(saveStatusTimer);
    saveStatusTimer=setTimeout(()=>{
      const current=document.getElementById('game-timer-save-status');
      if(current)current.textContent='';
    },1800);
  }
  function saveBattleFromTimer(){
    if(hState().cloud?.userId){
      setTimerSaveStatus('Saving…');
      Promise.resolve(host.cloudSaveCurrentBattle({silent:false}))
        .then(()=>setTimerSaveStatus('Saved'))
        .catch(()=>setTimerSaveStatus('Save failed'));
      return;
    }
    setTimerSaveStatus('Saving…');
    try{
      const ok=host.save();
      setTimerSaveStatus(ok===false?'Save failed':'Saved locally');
    }catch(e){
      console.warn('OnoForge local battle save failed.',e);
      setTimerSaveStatus('Save failed');
    }
  }
  function bindTimerControls(){
    const pause=document.getElementById('game-timer-pause');
    if(pause)pause.onclick=function(ev){
      ev.preventDefault();ev.stopPropagation();pauseGameTimer();return false;
    };
    const resume=document.getElementById('game-timer-resume');
    if(resume)resume.onclick=function(ev){
      ev.preventDefault();ev.stopPropagation();resumeGameTimer();return false;
    };
    const saveButton=document.getElementById('game-timer-save');
    if(saveButton)saveButton.onclick=function(ev){
      ev.preventDefault();ev.stopPropagation();saveBattleFromTimer();return false;
    };
    const finish=document.getElementById('game-timer-finish');
    if(finish)finish.onclick=function(ev){
      ev.preventDefault();ev.stopPropagation();finishGameTimer();return false;
    };
  }
  function gameTimerHtml(){
    const state=hState(),t=ensureGameTimer();
    return `<div class="game-timer" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:0 0 10px;padding:7px 9px;border:1px solid var(--border,#2d4055);border-radius:8px;background:var(--panel,#111c2b)">
    <strong>Game Time</strong>
    <span id="game-timer-value" style="font-variant-numeric:tabular-nums;font-weight:700">${formatGameTime(gameTimerElapsed())}</span>
    <span id="game-timer-status" class="muted small">${t.finishedAt?'Finished':t.turnPaused?'Game Paused':t.running?'Game Running':'Ready'}</span>
    <span class="muted small">Current Turn: ${host.esc(state.currentTurn==='opp'?state.oppName:state.myName)} <strong id="turn-timer-value">${formatGameTime(turnElapsedMs(state.currentTurn==='opp'?'opp':'my'))}</strong></span>
    <span class="muted small">${host.esc(state.myName)}: <strong id="my-turn-time-value">${formatGameTime(turnElapsedMs('my'))}</strong></span>
    <span class="muted small">${host.esc(state.oppName)}: <strong id="opp-turn-time-value">${formatGameTime(turnElapsedMs('opp'))}</strong></span>
    <button type="button" id="game-timer-pause" class="btn danger" onclick="pauseGameTimer();return false;">Pause Game</button>
    <button type="button" id="game-timer-resume" class="btn primary" onclick="resumeGameTimer();return false;">Resume Game</button>
    <button type="button" id="game-timer-save" class="btn primary">Save Battle</button>
    <span id="game-timer-save-status" class="muted small" aria-live="polite"></span>
    <button type="button" id="game-timer-finish" class="btn" ${t.finishedAt?'disabled':''}>Finish</button>
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
  function handleGameTimerAction(action,ev){
    ev?.preventDefault?.();
    ev?.stopPropagation?.();
    if(action==='toggle')toggleGameTimer();
    else if(action==='save')saveBattleFromTimer();
    else if(action==='finish')finishGameTimer();
    return false;
  }
  function install(nextHost){
    host=nextHost;
    const api={
      ensureGameTimer,gameTimerElapsed,turnElapsedMs,finalizeCurrentTurnTime,
      pauseGameTimer,resumeGameTimer,toggleTurnPause,switchTurnClock,
      formatGameTime,updateGameTimerDisplay,ensureLiveGameTimerDisplay,
      startGameTimer,toggleGameTimer,finishGameTimer,saveBattleFromTimer,
      gameTimerHtml,stopGameTimerRuntime,syncGameTimerRuntime,handleGameTimerAction
    };
    Object.keys(api).forEach(name=>{ global[name]=api[name]; });
    bindTimerControls();
    return api;
  }

  global.OnoForgeGameTimer={install};
})(window);
