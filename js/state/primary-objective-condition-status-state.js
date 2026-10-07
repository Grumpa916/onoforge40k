function createPrimaryObjectiveConditionStatusStateController({getState,objectiveCountsForSide,primaryObjectiveQualifyingList,objectiveHomeSide,objectiveStateRecord,objectiveTurnStartOwner,primaryObjectiveConditionText}){
  function primaryObjectiveConditionStatus(side,row){
    const state=getState();
    const text=primaryObjectiveConditionText(row);
    if(!/\b(?:control|controls)\b.*\bobjective/.test(text))return null;
    const enemy=side==='my'?'opp':'my';
    if(/central.*and.*expansion objectives?/.test(text)){
      const all=objectiveCountsForSide(side);
      const central=all.filter(o=>o.type==='central');
      const expansion=all.filter(o=>o.type==='expansion');
      return {type:'central-and-expansion',count:central.length+expansion.length,centralCount:central.length,expansionCount:expansion.length,required:2,met:central.length>=1&&expansion.length>=1,qualifying:[...central,...expansion]};
    }
    if(/control more objectives than your opponent/.test(text)){
      const mine=objectiveCountsForSide(side).length;
      const theirs=objectiveCountsForSide(enemy).length;
      return {type:'more-than-opponent',count:mine,opponentCount:theirs,required:theirs+1,met:mine>theirs,qualifying:objectiveCountsForSide(side)};
    }
    if(/control your opponent's home objective|control the enemy home objective/.test(text)){
      const name=Object.keys(state.objectives||{}).find(n=>objectiveHomeSide(n)===enemy);
      const met=!!name&&state.objectives?.[name]===side;
      return {type:'opponent-home',count:met?1:0,required:1,met,qualifying:met?[objectiveStateRecord(name)]:[],objective:name||''};
    }
    const qualifying=primaryObjectiveQualifyingList(side,row);
    const count=qualifying.length;
    const requiresTurnChange=/did not control at the start of the turn|not controlled at the start of the turn|did not control at start of turn/.test(text);
    const transitionQualified=requiresTurnChange?qualifying.filter(o=>objectiveTurnStartOwner(o.name)!==side):qualifying;
    const transitionCount=transitionQualified.length;
    const transitionType=requiresTurnChange?'newly-controlled-this-turn':null;
    const transitionFields={requiresTurnChange,transitionCount,transitionType,transitionObjectives:transitionQualified};
    const thresholdMatch=text.match(/control\s+(\d+)\+\s+objectives?/);
    if(thresholdMatch){
      const required=Math.max(1,Number(thresholdMatch[1])||1);
      return {type:'threshold',count,required,met:count>=required,qualifying,...transitionFields};
    }
    if(/control one or more objectives/.test(text)){
      return {type:'one-or-more',count,required:1,met:count>=1,qualifying,...transitionFields};
    }
    return null;
  }
  return Object.freeze({primaryObjectiveConditionStatus});
}
window.OnoForgePrimaryObjectiveConditionStatusState=Object.freeze({createPrimaryObjectiveConditionStatusStateController});