(function(global){
  function createUndoActionStateController(deps={}){
    const {state,syncGameTimerRuntime,save,render,alert}=deps;
    function undoLastAction(){
      const e=state.events[0];
      if(!e){alert('No action to undo.');return}
      if(!e.before){alert('This action has no reversible snapshot.');return}

      // Stratagem use is a compound action: CP_CHANGED + STRATAGEM_USED share
      // the same pre-action snapshot. Undo both together so the log and state
      // return to exactly the point before the stratagem was clicked.
      let removeCount=1;
      if(e.kind==='STRATAGEM_USED'){
        const p=e.payload||{};
        const next=state.events[1];
        const np=next?.payload||{};
        const pairedCP=next?.kind==='CP_CHANGED'
          && String(np.side||'')===String(p.side||'')
          && Number(np.delta||0)===-Math.max(0,Number(p.cp)||0)
          && next?.before;
        if(pairedCP) removeCount=2;
      }

      const keepEvents=state.events.slice(removeCount);
      const restored=JSON.parse(JSON.stringify(e.before));
      restored.events=keepEvents;
      restored._undoSnapshot=null;
      Object.keys(state).forEach(k=>delete state[k]);
      Object.assign(state,restored);
      syncGameTimerRuntime();
      save();
      render();
    }
    return Object.freeze({undoLastAction});
  }
  global.OnoForgeUndoActionState=Object.freeze({createUndoActionStateController});
})(window);
