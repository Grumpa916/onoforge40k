function createObjectiveControlHistoryStateController({getState}){
  function ensureObjectiveControlHistory(){
    const state=getState();
    if(!state.objectiveControlHistory||typeof state.objectiveControlHistory!=='object')state.objectiveControlHistory={};
    return state.objectiveControlHistory;
  }
  function objectivePreviousTurnKey(){
    const state=getState();
    const round=Math.max(1,Number(state.round)||1),turn=state.currentTurn==='opp'?'opp':'my',first=state.battleFirstTurn==='opp'?'opp':'my';
    if(turn!==first)return round+'|'+first;
    if(round<=1)return '';
    return (round-1)+'|'+(first==='my'?'opp':'my');
  }
  function objectivePreviousTurnOwner(name){
    const key=objectivePreviousTurnKey();
    const record=key?ensureObjectiveControlHistory()[key]:null;
    const item=record?.objectives?.[String(name||'')];
    return item&&['my','opp','contested','none'].includes(item.owner)?item.owner:null;
  }
  return Object.freeze({ensureObjectiveControlHistory,objectivePreviousTurnKey,objectivePreviousTurnOwner});
}
window.OnoForgeObjectiveControlHistoryState=Object.freeze({createObjectiveControlHistoryStateController});
