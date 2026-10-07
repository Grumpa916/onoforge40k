function createObjectiveGeometryIdentityStateController({getState}){
  function objectiveGeometryIdentity(name){
    const state=getState();
    const key=String(name||'').trim();
    if(/^Attacker Home$/i.test(key))return {type:'home',side:state.attackerSide==='opp'?'opp':'my',ordinal:1};
    if(/^Defender Home$/i.test(key))return {type:'home',side:state.attackerSide==='opp'?'my':'opp',ordinal:1};
    const m=key.match(/^(Central|Expansion)\s+(\d+)$/i);
    if(m)return {type:m[1].toLowerCase(),ordinal:Math.max(1,Number(m[2])||1)};
    return null;
  }
  return Object.freeze({objectiveGeometryIdentity});
}
window.OnoForgeObjectiveGeometryIdentityState=Object.freeze({createObjectiveGeometryIdentityStateController});