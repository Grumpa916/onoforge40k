function createScoreCalculationStateController({getState,ensureScoreLedger,secondaryTotalScoredVP}){
  function scoreTotalForSide(side){
    const state=getState();
    ensureScoreLedger();
    const primary=Math.max(0,Math.min(45,Number(state[side==='my'?'primaryMyScoredVP':'primaryOppScoredVP'])||0));
    const secondary=Math.max(0,Math.min(45,Number(secondaryTotalScoredVP(side))||0));
    const ready=side==='my'?(state.battleReadyMy?10:0):(state.battleReadyOpp?10:0);
    const manual=Math.max(0,Number(state[side==='my'?'manualVPMy':'manualVPOpp'])||0);
    return Math.min(100,ready+primary+secondary+manual);
  }
  return Object.freeze({scoreTotalForSide});
}
window.OnoForgeScoreCalculationState=Object.freeze({createScoreCalculationStateController});
