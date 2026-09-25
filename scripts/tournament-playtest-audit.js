const fs=require('fs');
const path=require('path');

const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const data=JSON.parse(fs.readFileSync(path.join(root,'data','warhammer-event-companion-v1.2.json'),'utf8'));

const checks=[];
function check(name,condition,detail=''){checks.push({name,pass:!!condition,detail});}

function has(re){return re.test(html);}
function count(re){return (html.match(re)||[]).length;}

check('Canonical Event Companion v1.2 loader',
  /warhammer-event-companion-v1\.2\.json/.test(html) &&
  !/warhammer-event-companion-v1\.1\.json/.test(html),
  'index.html must load v1.2 only.');

check('All 45 layouts verified',
  Array.isArray(data.layoutGeometry?.layouts) && data.layoutGeometry.layouts.length===45 &&
  data.layoutGeometry.layouts.every(x=>x?.verified===true),
  'Expected exactly 45 verified layout records.');

check('All 15 mission pairs available',
  Array.isArray(data.layoutIndex) && data.layoutIndex.length===15,
  'Expected 15 mission/layout pairs.');

check('Three map variants wired',
  has(/function setObjectiveMapLayout\(layout\)/) &&
  has(/\['A','B','C'\]\.includes\(layout\)/) &&
  has(/objectiveLayoutPage\(\)/),
  'A/B/C layout selection and page resolution must be wired.');

check('Objective control is stateful',
  has(/function objectiveStateRecord\(/) &&
  has(/owner:o\.owner/) &&
  has(/qualifyingObjectives/),
  'Objective state must carry ownership/qualification data.');

check('Objective changes feed primary scoring candidates',
  has(/recordPrimaryScoringCandidates\(/) &&
  has(/recordPrimaryScoringCandidates\(scoringSide,/) &&
  has(/recordPrimaryScoringCandidates\(endingTurn,/) &&
  has(/recordPrimaryScoringCandidates\(before,/),
  'Objective-control and turn-boundary checkpoints must route through the side-aware scoring candidate function.');

check('Primary scoring candidate uses geometry evidence',
  has(/primaryScoringEvidence\(/) &&
  has(/geometryVerified/) &&
  has(/requiresSpatialGeometry/),
  'Spatial scoring cannot bypass verified geometry.');

check('Primary VP preview respects caps',
  has(/function primaryScorePreviewSummary\(/) &&
  has(/roundRemaining=primaryRoundCapRemaining/) &&
  has(/45-\(Number\(state\[/),
  'Projected scoring must respect round and game caps.');

check('Battlefield positions are explicit/manual',
  has(/function setBattlefieldUnitPosition\(side,uid,x,y,source='manual'\)/) &&
  has(/source='manual'/) &&
  has(/x<0\|\|x>60\|\|y<0\|\|y>44/),
  'Unit positions must be manually recorded and bounded to 60x44.');

check('Distance uses recorded positions',
  has(/function battlefieldDistanceBetween\(/) &&
  has(/objectiveDistanceFromUnit\(/),
  'Distance must derive from explicit battlefield coordinates.');

check('Terrain is measured without inventing LOS',
  has(/function battlefieldTerrainContextBetweenUnits\(/) &&
  has(/losInference:'not-inferred'/),
  'Terrain intersections may be measured, but LOS remains a tabletop determination.');

check('Battlefield position changes are auditable and undoable',
  /function setBattlefieldUnitPosition[\s\S]{0,2500}snapshotForUndo\(\)[\s\S]{0,2500}event\(source==='deployment'\?'UNIT_DEPLOYED':'UNIT_BATTLEFIELD_POSITION_CHANGED'/.test(html),
  'Position changes must create an undo snapshot and action-log event.');

check('Map layout changes are auditable and persisted',
  /function setObjectiveMapLayout[\s\S]{0,2500}snapshotForUndo\(\)[\s\S]{0,2500}event\('OBJECTIVE_LAYOUT_CHANGED'/.test(html) &&
  /function setObjectiveMapLayout[\s\S]{0,3000}save\(\);render\(\);/.test(html),
  'Layout changes must be logged, saved, and rendered.');

check('Primary scoring candidate checkpoints are logged',
  /function recordPrimaryScoringCandidates[\s\S]{0,1800}event\('PRIMARY_SCORING_CANDIDATE'/.test(html),
  'Candidate checkpoints must appear in the action log.');

check('No 10th-edition Big Guns rule',
  !/Big Guns Never Tire/i.test(html),
  'Legacy 10th-edition rule text must not be present.');

const failures=checks.filter(x=>!x.pass);
console.log(JSON.stringify({
  audit:'Step 22 tournament playtest integration smoke audit',
  checks:checks.length,
  passed:checks.length-failures.length,
  failed:failures.length,
  failures
},null,2));
if(failures.length)process.exit(1);
