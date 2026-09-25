const fs=require('fs');
const path=require('path');

const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const data=JSON.parse(fs.readFileSync(path.join(root,'data','warhammer-event-companion-v1.2.json'),'utf8'));
const checks=[];
function check(name,condition,detail=''){checks.push({name,pass:!!condition,detail});}
function has(re){return re.test(html);}

check('Interactive map surface exists',
  has(/data-objective-map-canvas/) &&
  has(/role="application"/),
  'The verified battlefield must render as an interactive map surface.');

check('Map placement uses explicit unit selection',
  has(/objectiveMapPlacementPanelHtml\(/) &&
  has(/objective-map-unit-select/) &&
  has(/state\.battlefieldMapPlacement/),
  'A player must explicitly select the unit before placing it.');

check('Touch/click placement converts to 60x44 coordinates',
  has(/getBoundingClientRect\(\)/) &&
  has(/\*60/) &&
  has(/\*44/) &&
  has(/Math\.round\(x\*10\)\/10/) &&
  has(/Math\.round\(y\*10\)\/10/),
  'Map input must translate screen coordinates into the verified 60x44 inch system at 0.1 inch resolution.');

check('Placement remains manual and bounded',
  /function setBattlefieldUnitPosition[\s\S]{0,2200}source:'manual'/.test(html) &&
  has(/x<0\|\|x>60\|\|y<0\|\|y>44/),
  'Map placement must never infer position and must reject coordinates outside the table.');

check('Placement changes remain undoable and auditable',
  /function setBattlefieldUnitPosition[\s\S]{0,2400}snapshotForUndo\(\)[\s\S]{0,2400}event\('UNIT_BATTLEFIELD_POSITION_CHANGED'/.test(html),
  'Map placement must preserve the existing undo/action-log contract.');

check('Map renders verified deployment and territory geometry',
  has(/Object\.entries\(model\.deploymentZones\|\|\{\}\)/) &&
  has(/attackerDeployment/) &&
  has(/attackerTerritory/) &&
  has(/defenderTerritory/),
  'Deployment zones and territory must come from the verified Event Companion geometry.');

check('Map renders verified terrain geometry',
  has(/Object\.entries\(model\.terrainGeometry\|\|\{\}\)/) &&
  has(/objective-map-terrain/) &&
  has(/objective-map-terrain-polygon/),
  'Terrain regions must be rendered from the verified geometry dataset.');

check('Attacker/Defender map labels are role-aware',
  has(/state\.attackerSide==='opp'/) &&
  has(/Attacker Home/) === false,
  'Rendered map labels must resolve physical Attacker/Defender regions to the current army roles.');

check('No-manual-LOS inference guard remains visible',
  has(/Line of sight is never inferred/) &&
  has(/losInference:'not-inferred'/),
  'The map layer must not silently turn terrain geometry into a line-of-sight decision.');

check('Clear-position control exists',
  has(/data-battlefield-clear/) &&
  has(/clearBattlefieldUnitPosition\(/),
  'A recorded position must be removable without inventing a replacement coordinate.');

check('Verified source remains the only geometry source',
  Array.isArray(data.layoutGeometry?.layouts) &&
  data.layoutGeometry.layouts.length===45 &&
  data.layoutGeometry.layouts.every(x=>x?.verified===true),
  'Expected all 45 Event Companion v1.2 layouts to remain verified.');

const failures=checks.filter(x=>!x.pass);
console.log(JSON.stringify({
  audit:'Step 23 interactive tournament map layer audit',
  checks:checks.length,
  passed:checks.length-failures.length,
  failed:failures.length,
  failures
},null,2));
if(failures.length)process.exit(1);
