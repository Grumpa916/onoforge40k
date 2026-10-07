function createPrimaryObjectiveQualifyingListStateController({getPrimaryObjectiveConditionText,objectiveCountsForSide,objectiveIsInTerritory,objectiveDeploymentZone,objectiveTurnStartOwner}){
  function primaryObjectiveQualifyingList(side,row){
    const text=getPrimaryObjectiveConditionText(row);
    const owned=objectiveCountsForSide(side);
    const excludeHome=/excluding home|exclude home|excl\. home/.test(text);
    const central=/\bcentral objectives?\b/.test(text);
    const expansion=/\bexpansion objectives?\b/.test(text);
    const enemyTerritory=/enemy territory|enemy's territory/.test(text);
    const deploymentZone=/deployment zone/.test(text);
    const changed=/did not control at the start of the turn|not controlled at the start of the turn|did not control at start of turn/.test(text);
    return owned.filter(o=>
      (!excludeHome||o.type!=='home') &&
      (!central||o.type==='central') &&
      (!expansion||o.type==='expansion') &&
      (!enemyTerritory||objectiveIsInTerritory(o.name,side)) &&
      (!deploymentZone||objectiveDeploymentZone(o.name)===(side==='opp'?'opp':'my')) &&
      (!changed||objectiveTurnStartOwner(o.name)!==side)
    );
  }
  return Object.freeze({primaryObjectiveQualifyingList});
}
window.OnoForgePrimaryObjectiveQualifyingListState=Object.freeze({createPrimaryObjectiveQualifyingListStateController});