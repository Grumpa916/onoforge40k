(function(global){
  function createForceDispositionStateController(deps={}){
    const {state,detachmentSelections,detachmentInfo,PRIMARY_MISSIONS,snapshotForUndo,ensureObjectiveLayoutForMission,event,save,render}=deps;
    function forceDispositionNameForDetachment(side){
      const names=detachmentSelections(side);
      const faction=side==='my'?state.faction:state.oppFaction;
      return names.map(n=>detachmentInfo(faction,n)?.[2]).filter(Boolean);
    }
    function availableForceDispositions(side){return [...new Set(forceDispositionNameForDetachment(side))];}
    function forceDisposition(side){
      const key=side==='my'?'myForceDisposition':'oppForceDisposition';
      const avail=availableForceDispositions(side);
      const current=state[key];
      if(current && avail.includes(current)) return current;
      return avail[0]||'';
    }
    function primaryMission(side){
      const own=forceDisposition(side);
      const opp=forceDisposition(side==='my'?'opp':'my');
      return own&&opp ? (PRIMARY_MISSIONS[own]?.[opp]||'') : '';
    }
    function setForceDisposition(side,value){
      const key=side==='my'?'myForceDisposition':'oppForceDisposition';
      const before=snapshotForUndo();
      state[key]=value;
      ensureObjectiveLayoutForMission();
      event('FORCE_DISPOSITION_CHANGED',{side,action:'Set Force Disposition',forceDisposition:value,primaryMission:primaryMission(side)},before);
      save();render();
    }
    
    return Object.freeze({forceDispositionNameForDetachment,availableForceDispositions,forceDisposition,primaryMission,setForceDisposition});
  }
  global.OnoForgeForceDispositionState=Object.freeze({createForceDispositionStateController});
})(window);
