function createPrimaryScoringEvidenceStateController({getState,primaryScoringRowsForRound,primaryObjectiveConditionStatus,primaryScoringIsPer,primaryScoringObjectiveAmount,primaryScoringObjectiveCount,primaryObjectiveQualifyingList,objectiveBattlefieldGeometry,primaryScoringMax,primaryScoringVP,primaryRoundScoredVP,objectiveLayoutPage}){
  function primaryScoringEvidence(side,index,mission,amountOverride){
    const state=getState();
    const player=side==='opp'?'opp':'my';
    const rows=primaryScoringRowsForRound(mission);
    const row=rows[index]||null;
    if(!row)return {eligible:false,reason:'Scoring item not available this round.',side:player,mission,index};
    const condition=primaryObjectiveConditionStatus(player,row);
    const per=primaryScoringIsPer(row);
    const scoringText=String(row?.[2]||'').toLowerCase();
    const objectiveBased=/\bper\s+objective\b/i.test(scoringText);
    const requiresSpatialGeometry=/\b(?:territory|deployment zone)\b/.test(scoringText);
    const geometryState=objectiveBattlefieldGeometry();
    const geometryVerified=!!geometryState.verified;
    const suggestedAmount=primaryScoringObjectiveAmount(player,row);
    const requestedRaw=Number(amountOverride??suggestedAmount);
    const requestedAmount=per
      ? Math.max(objectiveBased?0:1,Math.min(50,Math.floor(Number.isFinite(requestedRaw)?requestedRaw:suggestedAmount)))
      : 1;
    const objectiveCount=primaryScoringObjectiveCount(player,row);
    const qualifying=objectiveBased
      ? primaryObjectiveQualifyingList(player,row).map(o=>({name:o.name,owner:o.owner,type:o.type,territory:o.territory,deploymentZone:o.deploymentZone}))
      : [];
    const conditionMet=condition?!!condition.met:true;
    if(requiresSpatialGeometry&&!geometryVerified)return {
      eligible:false,reason:'Verified Event Companion geometry is required for territory/deployment-zone scoring.',side:player,mission,index,
      scoringItem:String(row[2]||''),timing:String(row[0]||''),condition,
      requiresSpatialGeometry,geometryVerified:false,geometrySource:geometryState.source?.geometryStatus||'unverified',
      qualifyingObjectives:qualifying
    };
    if(condition&&!conditionMet)return {
      eligible:false,reason:'Objective control condition is not met.',side:player,mission,index,
      scoringItem:String(row[2]||''),timing:String(row[0]||''),condition,
      qualifyingObjectives:qualifying,geometryVerified:objectiveBattlefieldGeometry().verified
    };
    const objectiveCap=objectiveBased
      ? Math.min(primaryScoringMax(row)||Math.max(0,objectiveCount||0),Math.max(0,objectiveCount||0))
      : primaryScoringMax(row)||50;
    const amount=per?Math.min(requestedAmount,objectiveCap):1;
    const baseVP=primaryScoringVP(row[1]);
    const requestedVP=baseVP*amount;
    const roundTotal=primaryRoundScoredVP(player);
    const gameTotal=Math.max(0,Math.min(45,Number(state[player==='my'?'primaryMyScoredVP':'primaryOppScoredVP'])||0));
    const roundRemaining=Math.max(0,15-roundTotal);
    const gameRemaining=Math.max(0,45-gameTotal);
    const allowedVP=Math.min(requestedVP,roundRemaining,gameRemaining);
    return {
      eligible:allowedVP>0 && (!objectiveBased || objectiveCap>0),
      reason:allowedVP>0?'Eligible to score this item.':gameRemaining<=0?'Primary game cap reached.':roundRemaining<=0?'Primary round cap reached.':'No qualifying objectives.',
      side:player,mission,index,scoringItem:String(row[2]||''),timing:String(row[0]||''),condition,
      conditionMet,per,objectiveBased,baseVP,requestedAmount,amount,objectiveCount,objectiveCap,
      requestedVP,allowedVP,roundTotal,gameTotal,roundRemaining,gameRemaining,
      qualifyingObjectives:qualifying,
      geometryVerified,
      requiresSpatialGeometry,
      geometrySource:geometryState.source?.geometryStatus||'unverified',
      mapLayout:state.objectiveMapLayout||'A',mapPage:objectiveLayoutPage()
    };
  }
  return Object.freeze({primaryScoringEvidence});
}
window.OnoForgePrimaryScoringEvidenceState=Object.freeze({createPrimaryScoringEvidenceStateController});
