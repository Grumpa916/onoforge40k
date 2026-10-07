function createObjectiveCanonicalLabelStateController({getState,objectiveGeometryIdentity,objectiveTrackedIdentity,objectiveBattlefieldGeometry}){
  function objectiveCanonicalNumber(identity){
    const state=getState();
    if(!identity)return null;
    const entries=Object.keys(state.objectives||{});
    const six=entries.some(n=>/^Central 2$/i.test(String(n)))||entries.length>=6;
    if(identity.type==='home')return identity.side==='opp'?(six?6:5):1;
    if(identity.type==='expansion')return (Number(identity.ordinal)||1)===1?2:(six?5:4);
    if(identity.type==='central')return (Number(identity.ordinal)||1)===1?3:4;
    return null;
  }
  function objectiveCanonicalLabelForGeometryName(name){
    const identity=objectiveGeometryIdentity(name);
    const number=objectiveCanonicalNumber(identity);
    if(!number)return String(name||'');
    const role=identity.type==='home'?(identity.side==='opp'?'Opponent Home':'My Home'):identity.type==='central'?'Central':'Expansion';
    return 'O'+number+' • '+role;
  }
  function objectiveTrackedNameForGeometryName(name){
    const state=getState();
    const identity=objectiveGeometryIdentity(name);
    if(!identity)return String(name||'');
    for(const tracked of Object.keys(state.objectives||{})){
      const trackedIdentity=objectiveTrackedIdentity(tracked);
      if(!trackedIdentity||trackedIdentity.type!==identity.type)continue;
      if(identity.type==='home'&&trackedIdentity.side===identity.side)return tracked;
      if(identity.type!=='home'&&trackedIdentity.ordinal===identity.ordinal)return tracked;
    }
    return String(name||'');
  }
  function objectiveMapLabelForTrackedNameLegacy(name){
    const key=String(name||'').trim();
    const identity=objectiveTrackedIdentity(key);
    const number=objectiveCanonicalNumber(identity);
    if(number)return 'O'+number+' • '+(identity.type==='home'?(identity.side==='opp'?'Opponent Home':'My Home'):identity.type==='central'?'Central':'Expansion');
    return key;
  }
  function objectiveMapLabelForTrackedName(name){
    const geometry=objectiveBattlefieldGeometry();
    if(geometry.verified){
      const identity=objectiveTrackedIdentity(name);
      const match=geometry.objectives.find(o=>{
        const oi=objectiveGeometryIdentity(o.name);
        return oi&&identity&&oi.type===identity.type&&(oi.type==='home'?oi.side===identity.side:oi.ordinal===identity.ordinal);
      });
      return match?objectiveCanonicalLabelForGeometryName(match.name):objectiveMapLabelForTrackedNameLegacy(name);
    }
    return objectiveMapLabelForTrackedNameLegacy(name);
  }
  return Object.freeze({objectiveCanonicalNumber,objectiveCanonicalLabelForGeometryName,objectiveTrackedNameForGeometryName,objectiveMapLabelForTrackedNameLegacy,objectiveMapLabelForTrackedName});
}
window.OnoForgeObjectiveCanonicalLabelState=Object.freeze({createObjectiveCanonicalLabelStateController});
