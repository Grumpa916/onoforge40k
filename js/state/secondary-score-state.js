function createSecondaryScoreStateController({getState}){
  function secondaryTotalScoredVP(side){
    const state=getState();
    const key=side==='my'?'secondaryMyScoredVP':'secondaryOppScoredVP';
    const bucket=state[key]&&typeof state[key]==='object'?state[key]:{};
    return Math.min(45,Object.values(bucket).reduce((sum,v)=>sum+Math.max(0,Number(v)||0),0));
  }
  return Object.freeze({secondaryTotalScoredVP});
}
window.OnoForgeSecondaryScoreState=Object.freeze({createSecondaryScoreStateController});
