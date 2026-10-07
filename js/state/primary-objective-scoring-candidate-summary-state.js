function createPrimaryObjectiveScoringCandidateSummaryStateController({primaryObjectiveScoringCandidates}){
  function primaryObjectiveScoringCandidateSummary(side,mission){
    const candidates=primaryObjectiveScoringCandidates(side,mission);
    return candidates.map(c=>({
      index:c.index,scoringItem:String(c.row?.[2]||''),timing:String(c.row?.[0]||''),
      vp:c.evidence.allowedVP,objectiveCount:c.evidence.objectiveCount||0,
      qualifyingObjectives:c.evidence.qualifyingObjectives||[],geometryVerified:!!c.evidence.geometryVerified
    }));
  }
  return Object.freeze({primaryObjectiveScoringCandidateSummary});
}
window.OnoForgePrimaryObjectiveScoringCandidateSummaryState=Object.freeze({createPrimaryObjectiveScoringCandidateSummaryStateController});
