function createObjectiveMapEntriesStateController({getState,objectiveBattlefieldGeometry,objectiveMapLabelForTrackedNameLegacy,objectiveRole,objectiveTerritory,objectiveDeploymentZone,objectiveTrackedNameForGeometryName,objectiveCanonicalLabelForGeometryName}){
  function objectiveMapEntries(){
    const state=getState();
    const geometry=objectiveBattlefieldGeometry();
    if(!geometry.verified)return Object.entries(state.objectives||{}).map(([name,owner])=>({name,stateName:name,owner:['my','opp','contested','none'].includes(owner)?owner:'none',position:null,label:objectiveMapLabelForTrackedNameLegacy(name),type:objectiveRole(name),territory:objectiveTerritory(name),deploymentZone:objectiveDeploymentZone(name)}));
    return geometry.objectives.map(o=>{
      const stateName=objectiveTrackedNameForGeometryName(o.name);
      const owner=['my','opp','contested','none'].includes(state.objectives?.[stateName])?state.objectives[stateName]:'none';
      return {...o,stateName,owner,label:objectiveCanonicalLabelForGeometryName(o.name)};
    });
  }
  return Object.freeze({objectiveMapEntries});
}
window.OnoForgeObjectiveMapEntriesState=Object.freeze({createObjectiveMapEntriesStateController});
