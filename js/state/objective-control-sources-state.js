function createObjectiveControlSourcesStateController({getState}){
  function ensureObjectiveControlSources(){
    const state=getState();
    if(!state.objectiveControlSources||typeof state.objectiveControlSources!=='object'||Array.isArray(state.objectiveControlSources))state.objectiveControlSources={};
    return state.objectiveControlSources;
  }
  function objectiveControlSourceIds(name){
    const key=String(name||'').trim();
    const sources=ensureObjectiveControlSources()[key];
    return Array.isArray(sources)?sources.map(String):[];
  }
  return Object.freeze({ensureObjectiveControlSources,objectiveControlSourceIds});
}
window.OnoForgeObjectiveControlSourcesState=Object.freeze({createObjectiveControlSourcesStateController});
