function createPrimaryScoringIsPerStateController(){
  function primaryScoringIsPer(row){
    const text=String(row?.[2]||'').toLowerCase();
    return /\bper\b|\bfor each\b/.test(text);
  }
  return Object.freeze({primaryScoringIsPer});
}
window.OnoForgePrimaryScoringIsPerState=Object.freeze({createPrimaryScoringIsPerStateController});
