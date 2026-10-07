function createPrimaryScoringPreviewSummaryStateController({getState,primaryScoringRowsForRound,primaryRoundCapRemaining,primaryScoringEvidence}){
  function primaryScorePreviewSummary(side,mission){
    const state=getState();
    const player=side==='opp'?'opp':'my';
    const rows=primaryScoringRowsForRound(mission);
    let roundRemaining=primaryRoundCapRemaining(player);
    let gameRemaining=Math.max(0,45-(Number(state[player==='my'?'primaryMyScoredVP':'primaryOppScoredVP'])||0));
    let projected=0,candidates=0;
    const details=[];
    rows.forEach((row,index)=>{
      if(roundRemaining<=0||gameRemaining<=0)return;
      const evidence=primaryScoringEvidence(player,index,mission);
      if(!evidence.eligible)return;
      const allowed=Math.min(Number(evidence.allowedVP)||0,roundRemaining,gameRemaining);
      if(allowed<=0)return;
      projected+=allowed;roundRemaining-=allowed;gameRemaining-=allowed;candidates++;
      details.push({index,scoringItem:String(row?.[2]||''),vp:allowed,objectiveCount:evidence.objectiveCount||0});
    });
    return {projectedVP:projected,candidateCount:candidates,roundRemaining,gameRemaining,details};
  }
  return Object.freeze({primaryScorePreviewSummary});
}
window.OnoForgePrimaryScoringPreviewSummaryState=Object.freeze({createPrimaryScoringPreviewSummaryStateController});
