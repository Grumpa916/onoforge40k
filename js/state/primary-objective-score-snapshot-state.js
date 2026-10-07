function createPrimaryObjectiveScoreSnapshotStateController({getState,primaryMission,primaryScoringObjectiveCount,primaryObjectiveConditionStatus,primaryObjectiveQualifyingList}){
  function ensurePrimaryObjectiveScoreSnapshots(){
    const state=getState();
    if(!state.primaryObjectiveScoreSnapshots||typeof state.primaryObjectiveScoreSnapshots!=='object')state.primaryObjectiveScoreSnapshots={};
    return state.primaryObjectiveScoreSnapshots;
  }
  function primaryObjectiveScoreSnapshotKey(side,round,index){
    return String(Math.max(1,Number(round)||1))+'|'+(side==='opp'?'opp':'my')+'|'+String(index);
  }
  function capturePrimaryObjectiveScoreSnapshot(side,index,row){
    const state=getState();
    const round=Math.max(1,Number(state.round)||1);
    const perCount=primaryScoringObjectiveCount(side,row);
    const condition=primaryObjectiveConditionStatus(side,row);
    const count=perCount===null?(condition?condition.count:null):perCount;
    if(count===null)return null;
    const qualifyingRaw=perCount!==null?primaryObjectiveQualifyingList(side,row):(condition?.qualifying||[]);
    const qualifying=qualifyingRaw.map(o=>({name:o.name,owner:o.owner,type:o.type,territory:o.territory,deploymentZone:o.deploymentZone}));
    const snap={round,side,index,mission:primaryMission(side),condition:String(row?.[2]||''),qualifyingCount:count,required:condition?.required||null,conditionType:condition?.type||'per-objective',conditionMet:condition?!!condition.met:true,opponentCount:condition?.opponentCount??null,requiresTurnChange:!!condition?.requiresTurnChange,transitionCount:condition?.transitionCount??null,transitionType:condition?.transitionType||null,transitionObjectives:(condition?.transitionObjectives||[]).map(o=>({name:o.name,owner:o.owner,startOwner:o.startOwner,changeType:o.changeType})),qualifyingObjectives:qualifying,capturedAtPhase:String(state.phase||'Command'),capturedAtTurn:state.currentTurn==='opp'?'opp':'my'};
    ensurePrimaryObjectiveScoreSnapshots()[primaryObjectiveScoreSnapshotKey(side,round,index)]=snap;
    return snap;
  }
  function primaryObjectiveScoreSnapshot(side,index){
    const state=getState();
    const round=Math.max(1,Number(state.round)||1);
    return ensurePrimaryObjectiveScoreSnapshots()[primaryObjectiveScoreSnapshotKey(side,round,index)]||null;
  }
  function clearPrimaryObjectiveScoreSnapshot(side,index){
    const state=getState();
    const round=Math.max(1,Number(state.round)||1);
    delete ensurePrimaryObjectiveScoreSnapshots()[primaryObjectiveScoreSnapshotKey(side,round,index)];
  }
  return Object.freeze({ensurePrimaryObjectiveScoreSnapshots,primaryObjectiveScoreSnapshotKey,capturePrimaryObjectiveScoreSnapshot,primaryObjectiveScoreSnapshot,clearPrimaryObjectiveScoreSnapshot});
}
window.OnoForgePrimaryObjectiveScoreSnapshotState=Object.freeze({createPrimaryObjectiveScoreSnapshotStateController});
