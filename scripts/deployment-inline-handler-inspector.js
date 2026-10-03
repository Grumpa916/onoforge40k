const fs = require('fs');
const source = fs.readFileSync('index.html', 'utf8');
const lines = source.split(/\r?\n/);
const terms = [
  'deploymentTrackingSide',
  'battlefieldMapPlacement',
  'setDeploymentPlanPosition',
  'setBattlefieldUnitPosition',
  'removeBattlefieldUnitPosition',
  'deployment-tracking',
  'deployment-plan'
];
for (const term of terms) {
  const hits = [];
  lines.forEach((line, i) => { if (line.includes(term)) hits.push(i + 1); });
  console.log(`${term}: ${hits.length} hit(s)${hits.length ? ` at ${hits.join(', ')}` : ''}`);
}
console.log('\nPotential inline listener lines:');
lines.forEach((line, i) => {
  if (line.includes('addEventListener') && /deployment|battlefield|army|reserve|objective/i.test(line)) {
    console.log(`${i + 1}: ${line.trim()}`);
  }
});
