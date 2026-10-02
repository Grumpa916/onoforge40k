// OnoForge 40K — deployment boundary audit
// Runs in CI against the full repository checkout so the 1 MB+ index.html never needs to be transferred through chat.
const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');
const lines = html.split(/\r?\n/);

const targets = [
  'ensureDeploymentPlans','deploymentPlanForCurrentMap','setDeploymentPlanPosition','saveDeploymentPlan','loadDeploymentPlan',
  'ensureReserveState','setReserveDeclaration','deployReserveByMap','ensureBattlefieldUnitPositions','setBattlefieldUnitPosition',
  'battlefieldDistanceBetween','battlefieldTerrainPathIntersections','objectiveMapRendererHtml','render()'
];

console.log(`index.html bytes: ${Buffer.byteLength(html, 'utf8')}`);
console.log(`index.html lines: ${lines.length}`);

for(const target of targets){
  const hits=[];
  lines.forEach((line,i)=>{if(line.includes(target)) hits.push(i+1);});
  console.log(`${target}: ${hits.length} occurrence(s)${hits.length ? ` at lines ${hits.slice(0,20).join(', ')}${hits.length>20?' ...':''}` : ''}`);
}

const contextTargets = [
  'ensureDeploymentPlans','deploymentPlanForCurrentMap','setDeploymentPlanPosition','saveDeploymentPlan','loadDeploymentPlan',
  'ensureReserveState','setReserveDeclaration','deployReserveByMap','ensureBattlefieldUnitPositions','setBattlefieldUnitPosition',
  'battlefieldDistanceBetween','battlefieldTerrainPathIntersections','objectiveMapRendererHtml'
];
for(const target of contextTargets){
  const hits=[];
  lines.forEach((line,i)=>{if(line.includes(target)&&hits.length<20)hits.push(i);});
  for(const i of hits){
    const start=Math.max(0,i-2),end=Math.min(lines.length,i+3);
    console.log(`\n--- ${target} @ line ${i+1} ---`);
    for(let j=start;j<end;j++)console.log(`${j+1}: ${lines[j]}`);
  }
}

const externalScriptMarkers=[...html.matchAll(/<script[^>]+(?:src=|id=)[^>]*>/gi)].map(m=>m[0]);
console.log(`script tags with attributes: ${externalScriptMarkers.length}`);
for(const marker of externalScriptMarkers.slice(0,30))console.log(`SCRIPT ${marker}`);

if(html.includes('OnoForgeDeploymentBridge'))console.log('Deployment compatibility bridge marker already present in index.html.');
else throw new Error('Deployment compatibility bridge marker is missing from index.html.');

if(html.includes('<script src="./deployment-interaction.js"></script>'))console.log('Deployment interaction seam script tag present in index.html.');
else throw new Error('Deployment interaction seam script tag is missing from index.html.');

if(html.includes('OnoForgeDeploymentInteraction.install({'))console.log('Deployment interaction adapter installation present in index.html.');
else throw new Error('Deployment interaction adapter installation is missing from index.html.');

const forbiddenInlineMarkers=[
  "document.addEventListener('toggle',function(ev){const panel=ev.target.closest?.('[data-live-deployment-panel]')",
  "document.addEventListener('change',function(ev){const transport=ev.target.closest('[data-transport-toggle]')",
  'let objectiveMapDrag=null;'
];
for(const marker of forbiddenInlineMarkers){
  if(html.includes(marker))throw new Error(`Deployment interaction marker still inline in index.html: ${marker}`);
}
console.log('Deployment interaction listeners are no longer inline in index.html.');

if(html.includes('OnoForgeDeploymentState'))console.log('Deployment state seam marker is present in index.html.');
else console.log('Deployment state seam marker is not present in index.html.');
