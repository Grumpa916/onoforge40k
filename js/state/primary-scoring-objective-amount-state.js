function createPrimaryScoringObjectiveAmountStateController({primaryScoringObjectiveCount}){
  function primaryScoringObjectiveAmount(side,row){
    const count=primaryScoringObjectiveCount(side,row);
    return count===null?1:count;
  }
  return Object.freeze({primaryScoringObjectiveAmount});
}
window.OnoForgePrimaryScoringObjectiveAmountState=Object.freeze({createPrimaryScoringObjectiveAmountStateController});