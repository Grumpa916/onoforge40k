function createSecondaryRoundLedgerStateController({getState}){
  function ensureSecondaryRoundLedger(){
    const state=getState();
    const sides=['my','opp'];
    sides.forEach(side=>{
      const vpKey=side==='my'?'secondaryMyScoredVPByRound':'secondaryOppScoredVPByRound';
      const roundKey=side==='my'?'secondaryMyScoredRound':'secondaryOppScoredRound';
      if(!state[vpKey]||typeof state[vpKey]!=='object')state[vpKey]={};
      if(!state[roundKey]||typeof state[roundKey]!=='object')state[roundKey]={};
      Object.keys(state[vpKey]).forEach(round=>{
        if(!state[vpKey][round]||typeof state[vpKey][round]!=='object')state[vpKey][round]={};
        Object.keys(state[vpKey][round]).forEach(name=>{
          state[vpKey][round][name]=Math.max(0,Number(state[vpKey][round][name])||0);
        });
      });
    });
    return state;
  }
  return Object.freeze({ensureSecondaryRoundLedger});
}
window.OnoForgeSecondaryRoundLedgerState=Object.freeze({createSecondaryRoundLedgerStateController});
