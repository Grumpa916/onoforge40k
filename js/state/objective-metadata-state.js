function createObjectiveMetadataStateController({getState}){
  function ensureObjectiveMeta(){
    const state=getState();
    if(!state.objectiveMeta||typeof state.objectiveMeta!=='object')state.objectiveMeta={};
    return state.objectiveMeta;
  }
  function objectiveRole(name){
    const meta=ensureObjectiveMeta()[String(name||'')]||{};
    if(meta.type==='home')return 'home';
    if(meta.type==='central')return 'central';
    if(meta.type==='expansion')return 'expansion';
    return ['home','central','expansion'].includes(meta.role)?meta.role:'expansion';
  }
  function objectiveType(name){return objectiveRole(name);}
  function objectiveHomeSide(name){return ensureObjectiveMeta()[String(name||'')]?.homeSide||null;}
  function objectiveMetadataTerritory(name){
    const meta=ensureObjectiveMeta()[String(name||'')]||{};
    if(['my','opp','nml'].includes(meta.territory))return meta.territory;
    if(meta.type==='home'&&['my','opp'].includes(meta.homeSide))return meta.homeSide;
    return 'nml';
  }
  function objectiveMetadataDeploymentZone(name){
    const meta=ensureObjectiveMeta()[String(name||'')]||{};
    if(['my','opp','none'].includes(meta.deploymentZone))return meta.deploymentZone;
    if(meta.type==='home'&&['my','opp'].includes(meta.homeSide))return meta.homeSide;
    return 'none';
  }
  return Object.freeze({ensureObjectiveMeta,objectiveRole,objectiveType,objectiveHomeSide,objectiveMetadataTerritory,objectiveMetadataDeploymentZone});
}
window.OnoForgeObjectiveMetadataState=Object.freeze({createObjectiveMetadataStateController});
