function createPrimaryRoundScoreStateController({getState}){
  function primaryRoundScoredVP(side){
    const state=getState();
    const roundKey=String(Math.max(1,Number(state.round)||1));
    const valueKey=side==='my'?'primaryScoringValuesByRoundMy':'primaryScoringValuesByRoundOpp';
    const values=state[valueKey]?.[roundKey]||{};
    return Object.values(values).reduce((sum,v)=>sum+Math.max(0,Number(v)||0),0);
  }
  return Object.freeze({primaryRoundScoredVP});
}
window.OnoForgePrimaryRoundScoreState=Object.freeze({createPrimaryRoundScoreStateController});
