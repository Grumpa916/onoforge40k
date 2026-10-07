function createBattlefieldUnitPositionStateController({getState,isUnitReserved,deploymentPlanPosition}){
  function ensureBattlefieldUnitPositions(){
    const state=getState();
    if(!state.battlefieldUnitPositions||typeof state.battlefieldUnitPositions!=='object'||Array.isArray(state.battlefieldUnitPositions))state.battlefieldUnitPositions={};
    return state.battlefieldUnitPositions;
  }
  function battlefieldUnitPosition(side,uid,mode='battle'){
    if(isUnitReserved(side,uid))return null;
    if(mode==='setup')return side==='my'?deploymentPlanPosition(uid):null;
    const raw=ensureBattlefieldUnitPositions()[String(uid)];
    if(!raw||raw.side!==(side==='opp'?'opp':'my'))return null;
    const x=Math.round(Number(raw.x)*10)/10,y=Math.round(Number(raw.y)*10)/10;
    if(!Number.isFinite(x)||!Number.isFinite(y)||x<0||x>60||y<0||y>44)return null;
    return {x,y,side:raw.side,source:raw.source||'manual'};
  }
  return Object.freeze({ensureBattlefieldUnitPositions,battlefieldUnitPosition});
}
window.OnoForgeBattlefieldUnitPositionState=Object.freeze({createBattlefieldUnitPositionStateController});
