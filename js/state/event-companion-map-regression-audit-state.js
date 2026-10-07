function createEventCompanionMapRegressionAuditStateController({getEventCompanion,primaryScoring,primaryScoringCatalogueAudit}){
  function eventCompanionMapRegressionAudit(){
    const companion=getEventCompanion();
    const layouts=Array.isArray(companion?.layoutGeometry?.layouts)?companion.layoutGeometry.layouts:[];
    const index=Array.isArray(companion?.layoutIndex)?companion.layoutIndex:[];
    const keys=new Set(),pages=new Set(),issues=[];
    layouts.forEach(x=>{
      const key=String(x?.missionKey||'')+'|'+String(x?.layout||'')+'|'+String(x?.page||'');
      if(keys.has(key))issues.push('Duplicate layout record '+key); keys.add(key);
      if(pages.has(Number(x?.page)))issues.push('Duplicate layout page '+x.page); pages.add(Number(x?.page));
      if(!['A','B','C'].includes(x?.layout))issues.push('Invalid layout '+key);
    });
    const expectedPages=index.flatMap(x=>Array.isArray(x)?(x[3]||[]):(x.pages||[]));
    const expectedMissions=[...new Set(index.flatMap(x=>Array.isArray(x)?x.slice(0,2):(x.missions||[])))];
    const primaryMissionKeys=Object.keys(primaryScoring||{});
    const missingPrimaryMissions=expectedMissions.filter(m=>!primaryMissionKeys.includes(m));
    if(layouts.length!==45)issues.push('Expected 45 layout records; found '+layouts.length);
    if(index.length!==15)issues.push('Expected 15 mission pairs; found '+index.length);
    if(new Set(expectedPages).size!==45)issues.push('Mission layout index does not expose 45 unique pages');
    if(missingPrimaryMissions.length)issues.push('Primary scoring catalogue missing: '+missingPrimaryMissions.join(', '));
    const scoringAudit=primaryScoringCatalogueAudit();
    if(!scoringAudit.ok)issues.push('Primary scoring catalogue audit failed');
    return {ok:issues.length===0&&scoringAudit.ok,layoutCount:layouts.length,missionPairCount:index.length,uniquePages:pages.size,expectedMissionCount:expectedMissions.length,missingPrimaryMissions,verifiedCount:layouts.filter(x=>x?.verified===true).length,issues};
  }
  return Object.freeze({eventCompanionMapRegressionAudit});
}
window.OnoForgeEventCompanionMapRegressionAuditState=Object.freeze({createEventCompanionMapRegressionAuditStateController});
