function createPrimaryScoringEffectiveMaxStateController({primaryScoringMax,primaryScoringObjectiveCount}){
  function primaryScoringEffectiveMax(side,row){
    const explicit=primaryScoringMax(row);
    const objectiveCount=primaryScoringObjectiveCount(side,row);
    if(objectiveCount===null)return explicit||5;
    return Math.max(0,Math.min(explicit||objectiveCount,objectiveCount));
  }
  return Object.freeze({primaryScoringEffectiveMax});
}
window.OnoForgePrimaryScoringEffectiveMaxState=Object.freeze({createPrimaryScoringEffectiveMaxStateController});
