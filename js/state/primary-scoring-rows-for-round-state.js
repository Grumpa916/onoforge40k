function createPrimaryScoringRowsForRoundStateController({getState,getPrimaryScoringRows,primaryScoringRowAvailable}){
  function primaryScoringRowsForRound(mission){
    const state=getState();
    const rows=getPrimaryScoringRows(mission);
    const round=Math.max(1,Math.min(5,Number(state.round)||1));
    return rows.filter(r=>primaryScoringRowAvailable(r?.[0],round));
  }
  return Object.freeze({primaryScoringRowsForRound});
}
window.OnoForgePrimaryScoringRowsForRoundState=Object.freeze({createPrimaryScoringRowsForRoundStateController});