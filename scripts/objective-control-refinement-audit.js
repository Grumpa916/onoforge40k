const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const data=JSON.parse(fs.readFileSync(path.join(root,'data','warhammer-event-companion-v1.2.json'),'utf8'));
const checks=[];
const check=(name,pass,detail='')=>checks.push({name,pass:!!pass,detail});
const has=re=>re.test(html);

check('Objective ownership remains turn-aware',
  has(/objectiveTurnStartOwner\(/) && has(/objectiveControlChangeType\(/) && has(/recordObjectiveTurnState\(/),
  'Objective state must retain turn-start ownership and transition history.');

check('Objective control remains linked to Primary scoring',
  has(/objectivePrimaryScoringImpact\(/) && has(/primaryScoringCandidates:candidatesAfter/) && has(/recordPrimaryScoringCandidates\(scoringSide/),
  'Control changes must feed scoring context and candidate checkpoints.');

check('Objective control changes remain auditable',
  has(/event\('OBJECTIVE_CHANGED'/) && has(/snapshotForUndo\(\)/),
  'Control changes must remain undoable and logged.');

check('Control contributors are explicitly assigned',
  has(/toggleObjectiveControlUnit\(/) && has(/OBJECTIVE_OC_SOURCE_CHANGED/) && has(/This does not infer control from unit presence/),
  'OC contributor tracking must be explicit rather than inferred.');

check('Verified geometry overrides manual spatial labels',
  has(/function objectiveSpatialGeometryLocked\(/) &&
  /function setObjectiveRole[\s\S]{0,1800}objectiveSpatialGeometryLocked\(key\)/.test(html) &&
  /function setObjectiveTerritory[\s\S]{0,1600}objectiveSpatialGeometryLocked\(key\)/.test(html) &&
  /function setObjectiveDeploymentZone[\s\S]{0,1600}objectiveSpatialGeometryLocked\(key\)/.test(html),
  'Manual role/territory/deployment edits must be blocked when verified geometry is available.');

check('Verified geometry is visibly distinguished in the tracker',
  has(/Verified geometry/) && has(/objective-geometry-lock/) && has(/spatialVerified/),
  'Players must be able to distinguish verified spatial classification from manual fallback.');

check('Territory and deployment remain separate fields',
  has(/objectiveTerritory\(key\)/) && has(/objectiveDeploymentZone\(key\)/) &&
  has(/territory:objectiveTerritory/) && has(/deploymentZone:objectiveDeploymentZone/),
  'Territory and deployment zone must remain independent data fields.');

check('Objective events carry spatial evidence',
  has(/spatialSource:objectiveStateRecord\(key\)\.spatialSource/) &&
  has(/spatialVerified:objectiveStateRecord\(key\)\.spatialVerified/),
  'Objective control events must retain the spatial evidence used at the time of the change.');

check('All verified layouts remain intact',
  Array.isArray(data.layoutGeometry?.layouts) &&
  data.layoutGeometry.layouts.length===45 &&
  data.layoutGeometry.layouts.every(x=>x?.verified===true),
  'Expected all 45 Event Companion v1.2 layouts to remain verified.');

const failures=checks.filter(x=>!x.pass);
console.log(JSON.stringify({audit:'Task 24 objective-control refinement audit',checks:checks.length,passed:checks.length-failures.length,failed:failures.length,failures},null,2));
if(failures.length)process.exit(1);
