function createObjectiveCountsStateController({getState,objectiveStateRecord}){
  function objectiveCountsForSide(side){
    const state=getState();
    const player=side==='opp'?'opp':'my';
    return Object.keys(state.objectives||{}).map(objectiveStateRecord).filter(o=>o.owner===player);
  }
  return Object.freeze({objectiveCountsForSide});
}
window.OnoForgeObjectiveCountsState=Object.freeze({createObjectiveCountsStateController});