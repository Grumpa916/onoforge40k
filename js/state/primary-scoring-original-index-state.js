function createPrimaryScoringOriginalIndexStateController({getPrimaryScoringRows,getVisiblePrimaryScoringRows}){
  function primaryScoringOriginalIndex(mission,visibleIndex){
    const rows=getPrimaryScoringRows(mission);
    const visible=getVisiblePrimaryScoringRows(mission);
    const row=visible[visibleIndex];
    return row?rows.indexOf(row):-1;
  }
  return Object.freeze({primaryScoringOriginalIndex});
}
window.OnoForgePrimaryScoringOriginalIndexState=Object.freeze({createPrimaryScoringOriginalIndexStateController});