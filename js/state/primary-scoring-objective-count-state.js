function createPrimaryScoringObjectiveCountStateController({getPrimaryObjectiveConditionText,getPrimaryObjectiveQualifyingList}){
  function primaryScoringObjectiveCount(side,row){
    const text=getPrimaryObjectiveConditionText(row);
    if(!/\b(?:per|for each)\s+objective\b/.test(text))return null;
    return getPrimaryObjectiveQualifyingList(side,row).length;
  }
  return Object.freeze({primaryScoringObjectiveCount});
}
window.OnoForgePrimaryScoringObjectiveCountState=Object.freeze({createPrimaryScoringObjectiveCountStateController});