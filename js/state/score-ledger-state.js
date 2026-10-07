function createScoreLedgerStateController({getState}){
  function ensureScoreLedger(){
    const state=getState();
    const sides=['my','opp'];
    sides.forEach(side=>{
      const pk=side==='my'?'primaryMyScoredVP':'primaryOppScoredVP';
      const sk=side==='my'?'secondaryMyScoredVP':'secondaryOppScoredVP';
      const mk=side==='my'?'manualVPMy':'manualVPOpp';
      const totalKey=side==='my'?'myVP':'oppVP';
      if(!Number.isFinite(Number(state[pk])))state[pk]=0;
      if(!state[sk]||typeof state[sk]!=='object')state[sk]={};
      const secondary=Object.values(state[sk]).reduce((s,v)=>s+Math.max(0,Number(v)||0),0);
      state[pk]=Math.max(0,Math.min(45,Number(state[pk])||0));
      const expected=(side==='my'?(state.battleReadyMy?10:0):(state.battleReadyOpp?10:0))+Math.min(45,Number(state[pk])||0)+Math.min(45,secondary);
      if(!Number.isFinite(Number(state[mk])))state[mk]=Math.max(0,(Number(state[totalKey])||0)-expected);
      state[mk]=Math.max(0,Math.min(100,Number(state[mk])||0));
      state[totalKey]=Math.min(100,expected+state[mk]);
    });
    return state;
  }
  return Object.freeze({ensureScoreLedger});
}
window.OnoForgeScoreLedgerState=Object.freeze({createScoreLedgerStateController});
