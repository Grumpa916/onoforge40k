function createPrimaryObjectiveScoringCandidatesStateController({getState,primaryMission,primaryScoringRowsForRound,primaryScoringEvidence}){
  function primaryObjectiveScoringCandidates(side,mission){
    const state=getState();
    const player=side==='opp'?'opp':'my';
    const rows=primaryScoringRowsForRound(mission);
    const scoredKey=player==='my'?'primaryScoringByRoundMy':'primaryScoringByRoundOpp';
    const roundKey=String(Math.max(1,Number(state.round)||1));
    const scored=Array.isArray(state[scoredKey]?.[roundKey])?state[scoredKey][roundKey]:[];
    return rows.map((row,index)=>{
      if(scored.includes(index))return null;
      const evidence=primaryScoringEvidence(player,index,mission);
      return evidence.eligible?{index,row,evidence}:null;
    }).filter(Boolean);
  }
  return Object.freeze({primaryObjectiveScoringCandidates});
}
window.OnoForgePrimaryObjectiveScoringCandidatesState=Object.freeze({createPrimaryObjectiveScoringCandidatesStateController});
