const fs=require('fs');
const html=fs.readFileSync('index.html','utf8');
const data=JSON.parse(fs.readFileSync('data/warhammer-event-companion-v1.2.json','utf8'));
const requiredFunctions=['primaryScoringEvidence','primaryScoringCatalogueAudit','recordPrimaryScoringCandidates','primaryScorePreviewSummary','objectiveMapRendererHtml','battlefieldPositionEditorHtml','battlefieldTerrainContextBetweenUnits','tacticalPrimaryTargetImpact'];
const missing=requiredFunctions.filter(n=>!html.includes('function '+n));
if(missing.length)throw new Error('Missing required development functions: '+missing.join(', '));
if(!html.includes('./data/warhammer-event-companion-v1.2.json'))throw new Error('App is not loading Event Companion v1.2');
if(html.includes('./data/warhammer-event-companion-v1.1.json'))throw new Error('Legacy Event Companion v1.1 loader remains');
const layouts=data.layoutGeometry?.layouts||[],index=data.layoutIndex||[];
if(layouts.length!==45)throw new Error('Expected 45 layout geometry records; found '+layouts.length);
if(index.length!==15)throw new Error('Expected 15 mission pairs; found '+index.length);
if(new Set(layouts.map(x=>x.page)).size!==45)throw new Error('Expected 45 unique layout pages');
const unverified=layouts.filter(x=>x?.verified!==true);
if(unverified.length)throw new Error('Expected all 45 layouts to be verified; found '+unverified.length+' unverified');
const geometryIssues=[];
const pointOk=p=>p&&Number.isFinite(Number(p.x))&&Number.isFinite(Number(p.y))&&Number(p.x)>=0&&Number(p.x)<=60&&Number(p.y)>=0&&Number(p.y)<=44;
layouts.forEach(x=>{
  const key=String(x.missionKey||'')+'|'+String(x.layout||'')+'|p'+String(x.page||'');
  const positions=x.objectivePositions&&typeof x.objectivePositions==='object'?x.objectivePositions:{};
  if(!positions['Attacker Home']||!positions['Defender Home'])geometryIssues.push(key+' missing physical home objective positions');
  Object.entries(positions).forEach(([name,p])=>{if(!pointOk(p))geometryIssues.push(key+' invalid objective '+name);});
  const zones=x.deploymentZones&&typeof x.deploymentZones==='object'?x.deploymentZones:{};
  ['attackerDeployment','defenderDeployment','attackerTerritory','defenderTerritory'].forEach(k=>{
    const r=zones[k];
    if(!r)geometryIssues.push(key+' missing '+k);
    else if(Array.isArray(r.points)){if(r.points.length<3)geometryIssues.push(key+' '+k+' has too few points');r.points.forEach(p=>{if(!pointOk(p))geometryIssues.push(key+' '+k+' has out-of-bounds point');});}
    else if(![r.x,r.y,r.width,r.height].every(v=>Number.isFinite(Number(v))))geometryIssues.push(key+' '+k+' is not a rectangle or polygon');
  });
  const terrain=x.terrainGeometry&&typeof x.terrainGeometry==='object'?x.terrainGeometry:{};
  if(Object.keys(terrain).length!==16)geometryIssues.push(key+' expected 16 terrain areas; found '+Object.keys(terrain).length);
  Object.entries(terrain).forEach(([name,r])=>{if(!Array.isArray(r.points)||r.points.length<3)geometryIssues.push(key+' '+name+' invalid polygon');else r.points.forEach(p=>{if(!pointOk(p))geometryIssues.push(key+' '+name+' has out-of-bounds point');});});
  if(!Number.isFinite(Number(x.coordinateResolutionInches))||Number(x.coordinateResolutionInches)!==0.1)geometryIssues.push(key+' missing 0.1-inch coordinate resolution');
});
if(geometryIssues.length)throw new Error('Verified geometry audit failed: '+geometryIssues.slice(0,12).join('; '));
if(data.layoutGeometry?.status!=='verified')throw new Error('layoutGeometry status is not verified');
if(Number(data.layoutGeometry?.verifiedLayoutCount)!==45)throw new Error('Expected verifiedLayoutCount=45');
console.log('Objective/scoring audit passed: 45 verified layouts, 15 mission pairs, v1.2 source, task 11-18 hooks present, geometry structure validated.');
