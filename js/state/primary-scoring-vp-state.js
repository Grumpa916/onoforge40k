function createPrimaryScoringVPStateController(){
  function primaryScoringVP(value){
    const m=String(value||'').match(/\d+/);
    return m?Math.max(0,Number(m[0])||0):0;
  }
  return Object.freeze({primaryScoringVP});
}
window.OnoForgePrimaryScoringVPState=Object.freeze({createPrimaryScoringVPStateController});
