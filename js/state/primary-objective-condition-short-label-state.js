function createPrimaryObjectiveConditionShortLabelStateController(){
  function primaryObjectiveConditionShortLabel(condition){
    if(!condition)return '';
    if(condition.type==='more-than-opponent')return condition.met?'More objectives controlled than opponent':'Need '+Math.max(0,Number(condition.required)||0)+' objectives; opponent controls '+Math.max(0,Number(condition.opponentCount)||0);
    if(condition.type==='opponent-home')return condition.met?'Opponent home objective controlled':'Opponent home objective not controlled';
    if(condition.type==='threshold')return (condition.met?'✓ ':'')+Math.max(0,Number(condition.count)||0)+' / '+Math.max(0,Number(condition.required)||0)+' objectives controlled';
    if(condition.type==='one-or-more')return condition.requiresTurnChange?(condition.met?'✓ '+condition.transitionCount+' objective'+(condition.transitionCount===1?'':'s')+' newly controlled this turn':'No newly controlled qualifying objective'):condition.met?'✓ At least one qualifying objective controlled':'No qualifying objective currently controlled';
    if(condition.type==='central-and-expansion')return condition.met?'✓ Central + expansion objective controlled':'Need at least 1 central and 1 expansion objective';
    return '';
  }
  return Object.freeze({primaryObjectiveConditionShortLabel});
}
window.OnoForgePrimaryObjectiveConditionShortLabelState=Object.freeze({createPrimaryObjectiveConditionShortLabelStateController});