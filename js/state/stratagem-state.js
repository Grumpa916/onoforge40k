function createStratagemStateController({getState}){
  function ensureStratagemState(){
    const state=getState();
    if(!Array.isArray(state.stratagemPhaseUsesMy))state.stratagemPhaseUsesMy=[];
    if(!Array.isArray(state.stratagemPhaseUsesOpp))state.stratagemPhaseUsesOpp=[];
    if(!Array.isArray(state.stratagemsMy))state.stratagemsMy=[];
    if(!Array.isArray(state.stratagemsOpp))state.stratagemsOpp=[];
    if(!Array.isArray(state.stratagemUsesMy))state.stratagemUsesMy=[];
    if(!Array.isArray(state.stratagemUsesOpp))state.stratagemUsesOpp=[];
  }
  function stratagemUseHistory(side){
    const state=getState();
    return side==='opp'?state.stratagemUsesOpp:state.stratagemUsesMy;
  }
  function stratagemUsedThisPhase(side,name){
    const state=getState();
    const history=stratagemUseHistory(side);
    const round=Math.max(1,Number(state.round)||1);
    const phase=String(state.phase||'Command');
    const turn=side==='opp'?'opp':'my';
    return Array.isArray(history)&&history.some(x=>
      x&&String(x.name)===String(name)
      &&Number(x.round)===round
      &&String(x.phase)===phase
      &&String(x.playerTurn)===turn
    );
  }
  function resetStratagemPhaseUses(){
    const state=getState();
    state.stratagemPhaseUsesMy=[];
    state.stratagemPhaseUsesOpp=[];
  }
  function stratagemUsedThisBattle(side,name){
    return stratagemUseHistory(side).some(x=>x&&String(x.name)===String(name));
  }
  function armyStratagemDetachment(side){
    const state=getState();
    const faction=side==='my'?state.faction:state.oppFaction;
    const selections=side==='my'?state.detachmentSelections:state.oppDetachmentSelections;
    const fallback=side==='my'?state.detachment:state.oppDetachment;
    const det=(Array.isArray(selections)&&selections[0])||fallback||'';
    return faction&&det?\`${faction} — ${det}\`:'';
  }
  return Object.freeze({ensureStratagemState,stratagemUseHistory,stratagemUsedThisPhase,resetStratagemPhaseUses,stratagemUsedThisBattle,armyStratagemDetachment});
}
window.OnoForgeStratagemState=Object.freeze({createStratagemStateController});
