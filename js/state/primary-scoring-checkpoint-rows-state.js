function createPrimaryScoringCheckpointRowsStateController({getState,primaryScoringRowsForRound}){
  function primaryScoringCheckpointRows(side,mission){
    const state=getState();
    const rows=primaryScoringRowsForRound(mission);
    const phase=String(state.phase||'Command').toLowerCase();
    const scoredKey=side==='my'?'primaryScoringByRoundMy':'primaryScoringByRoundOpp';
    const roundKey=String(Math.max(1,Number(state.round)||1));
    const scored=Array.isArray(state[scoredKey]?.[roundKey])?state[scoredKey][roundKey]:[];
    return rows.map((row,index)=>({row,index})).filter(({row,index})=>{
      if(scored.includes(index))return false;
      const timing=String(row?.[0]||'').toLowerCase();
      const commandCheckpoint=phase==='command'&&timing.includes('command phase');
      const turnEndCheckpoint=phase==='fight'&&(timing.includes('end of turn')||timing.includes('end of battle'));
      return commandCheckpoint||turnEndCheckpoint;
    });
  }
  return Object.freeze({primaryScoringCheckpointRows});
}
window.OnoForgePrimaryScoringCheckpointRowsState=Object.freeze({createPrimaryScoringCheckpointRowsStateController});
