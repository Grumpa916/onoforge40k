function createObjectiveTrackedIdentityStateController({getState,ensureObjectiveMeta,objectiveGeometryIdentity}){
  function objectiveTrackedIdentity(name){
    const key=String(name||'').trim();
    const meta=ensureObjectiveMeta()[key]||{};
    if(meta.type==='home'&&['my','opp'].includes(meta.homeSide))return {type:'home',side:meta.homeSide,ordinal:1};
    if(meta.type==='central'||meta.type==='expansion'){
      const m=key.match(/^(?:Central|Expansion)\s+(\d+)$/i);
      return {type:meta.type,ordinal:m?Math.max(1,Number(m[1])||1):1};
    }
    return objectiveGeometryIdentity(key);
  }
  return Object.freeze({objectiveTrackedIdentity});
}
window.OnoForgeObjectiveTrackedIdentityState=Object.freeze({createObjectiveTrackedIdentityStateController});