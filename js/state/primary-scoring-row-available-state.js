function createPrimaryScoringRowAvailableStateController({primaryScoringRoundRange}){
  function primaryScoringRowAvailable(timing,round){
    const timingText=String(timing||'').toLowerCase();
    if(timingText.includes('end of battle')) return Number(round)===5;
    const range=primaryScoringRoundRange(timing);
    return round>=range.min&&round<=range.max;
  }
  return Object.freeze({primaryScoringRowAvailable});
}
window.OnoForgePrimaryScoringRowAvailableState=Object.freeze({createPrimaryScoringRowAvailableStateController});