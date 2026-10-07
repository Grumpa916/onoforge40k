function createPrimaryScoringCatalogueAuditStateController({getEventCompanion,primaryScoring}){
  function primaryScoringCatalogueAudit(){
    const companion=getEventCompanion();
    const expected=Array.isArray(companion?.layoutIndex)?[...new Set(companion.layoutIndex.flatMap(x=>Array.isArray(x)?x.slice(0,2):(x?.missions||[])))]:[];
    const catalogue=primaryScoring&&typeof primaryScoring==='object'?primaryScoring:{};
    const missing=expected.filter(m=>!Object.prototype.hasOwnProperty.call(catalogue,m));
    const malformed=[];
    Object.entries(catalogue).forEach(([mission,rows])=>{
      if(!Array.isArray(rows))return malformed.push(mission+' is not an array');
      rows.forEach((row,i)=>{
        if(!Array.isArray(row)||row.length<3)malformed.push(mission+' row '+i+' malformed');
        else if(!String(row[0]||'').trim()||!String(row[1]||'').trim()||!String(row[2]||'').trim())malformed.push(mission+' row '+i+' incomplete');
      });
    });
    return {ok:missing.length===0&&malformed.length===0,expectedMissionCount:expected.length,missing,malformed};
  }
  return Object.freeze({primaryScoringCatalogueAudit});
}
window.OnoForgePrimaryScoringCatalogueAuditState=Object.freeze({createPrimaryScoringCatalogueAuditStateController});
