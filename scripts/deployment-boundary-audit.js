// OnoForge 40K — deployment boundary audit
// Runs in CI against the full repository checkout so the 1 MB+ index.html never needs to be transferred through chat.
const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');
const lines = html.split(/\r?\n/);

const targets = [
  'ensureDeploymentPlans',
  'deploymentPlanForCurrentMap',
  'setDeploymentPlanPosition',
  'saveDeploymentPlan',
  'loadDeploymentPlan',
  'ensureReserveState',
  'setReserveDeclaration',
  'deployReserveByMap',
  'ensureBattlefieldUnitPositions',
  'setBattlefieldUnitPosition',
  'battlefieldDistanceBetween',
  'battlefieldTerrainPathIntersections',
  'objectiveMapRendererHtml',
  'render()'
];

console.log(`index.html bytes: ${Buffer.byteLength(html, 'utf8')}`);
console.log(`index.html lines: ${lines.length}`);

for(const target of targets){
  const hits=[];
  lines.forEach((line,i)=>{
    if(line.includes(target)) hits.push(i+1);
  });
  console.log(`${target}: ${hits.length} occurrence(s)${hits.length ? ` at lines ${hits.slice(0,20).join(', ')}${hits.length>20?' ...':''}` : ''}`);
}

const externalScriptMarkers = [...html.matchAll(/<script[^>]+(?:src=|id=)[^>]*>/gi)].map(m=>m[0]);
console.log(`script tags with attributes: ${externalScriptMarkers.length}`);
for(const marker of externalScriptMarkers.slice(0,30)) console.log(`SCRIPT ${marker}`);

if(html.includes('OnoForgeDeploymentBridge')){
  console.log('Deployment compatibility bridge marker already present in index.html.');
}else{
  console.log('Deployment compatibility bridge marker is not present in index.html.');
}

if(!html.includes('OnoForgeDeploymentState')){
  console.log('Deployment state seam marker is not present in index.html.');
}else{
  console.log('Deployment state seam marker is present in index.html.');
}
