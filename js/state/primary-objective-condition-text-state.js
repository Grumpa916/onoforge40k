function createPrimaryObjectiveConditionTextStateController(){
  function primaryObjectiveConditionText(row){
    return String(row?.[2]||'').trim().toLowerCase();
  }
  return Object.freeze({primaryObjectiveConditionText});
}
window.OnoForgePrimaryObjectiveConditionTextState=Object.freeze({createPrimaryObjectiveConditionTextStateController});