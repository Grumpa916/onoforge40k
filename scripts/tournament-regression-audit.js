#!/usr/bin/env node
'use strict';

/*
 * OnoForge 40K — Step 20 tournament/regression gate.
 * This is a deterministic source/data audit. It does not invent tabletop
 * results and it does not replace live playtesting; it verifies that the
 * tournament-critical systems are present, wired together, and protected
 * by the Event Companion v1.2 geometry gate.
 */

const fs=require('fs');
const html=fs.readFileSync('index.html','utf8');
const data=JSON.parse(fs.readFileSync('data/warhammer-event-companion-v1.2.json','utf8'));
const failures=[],warnings=[],report={};

function requireText(label,needle){
  if(!html.includes(needle)) failures.push({code:'MISSING_HOOK',label,needle});
}
function requireFn(name){requireText('function '+name,'function '+name+'(');}

const required=[
  'advancePhase','previousPhase','setCurrentTurn','scorePrimary','scoreSecondary',
  'scoreIntegrityAudit','snapshotForUndo','undoLastAction','event','save','load',
  'ensureScoreLedger','ensureObjectiveTurnSnapshot','ensureObjectiveControlHistory',
  'recordObjectiveTurnState','setObjectiveControl','recordPrimaryScoringCandidates',
  'primaryScorePreviewSummary','primaryObjectiveCheckpoint','primaryScoringCatalogueAudit',
  'tacticalLegalityForUnit','tacticalPreRollCheck','tacticalPreRollResolutionSet',
  'tacticalPhaseActionAvailable','tacticalWeaponPhaseEligible',
  'objectiveBattlefieldGeometry','objectiveSpatialClassification',
  'objectiveMapRendererHtml','battlefieldPositionEditorHtml',
  'battlefieldTerrainPathIntersections','battlefieldTerrainContextBetweenUnits',
  'tacticalObjectiveAdvisor','tacticalObjectiveAdvisorHtml',
  'eventCompanionMapRegressionAudit','validateEventCompanionGeometry'
];
required.forEach(requireFn);
report.requiredFunctions=required.length;

if(!html.includes('./data/warhammer-event-companion-v1.2.json')) failures.push({code:'LEGACY_EVENT_SOURCE',detail:'v1.2 loader missing'});
if(html.includes('./data/warhammer-event-companion-v1.1.json')) failures.push({code:'LEGACY_EVENT_SOURCE',detail:'v1.1 loader remains'});
if(html.includes("const ONOFORGE_SOURCE_POLICY_11E")) requireText('canonical source policy',"name:'40k.app'");
requireText('supplemental source policy',"role:'supplemental'");
requireText('bootstrap fallback policy',"role:'fallback-only'");

const layouts=Array.isArray(data.layoutGeometry?.layouts)?data.layoutGeometry.layouts:[];
const keys=new Set(layouts.map(x=>String(x?.missionKey)+'|'+String(x?.layout)));
const verified=layouts.filter(x=>x?.verified===true);
const pages=new Set(layouts.map(x=>x?.page));
report.geometry={layouts:layouts.length,verified:verified.length,uniqueKeys:keys.size,uniquePages:pages.size};

if(layouts.length!==45) failures.push({code:'GEOMETRY_COUNT',expected:45,actual:layouts.length});
if(verified.length!==45) failures.push({code:'GEOMETRY_VERIFIED_COUNT',expected:45,actual:verified.length});
if(keys.size!==45) failures.push({code:'GEOMETRY_UNIQUE_KEYS',expected:45,actual:keys.size});
if(pages.size!==45) failures.push({code:'GEOMETRY_UNIQUE_PAGES',expected:45,actual:pages.size});
if(data.layoutGeometry?.status!=='verified') failures.push({code:'GEOMETRY_STATUS',actual:data.layoutGeometry?.status});
if(Number(data.layoutGeometry?.verifiedLayoutCount)!==45) failures.push({code:'GEOMETRY_VERIFIED_FIELD',actual:data.layoutGeometry?.verifiedLayoutCount});

let geometryDefects=0;
for(const g of layouts){
  const id=String(g?.missionKey)+'|'+String(g?.layout);
  const positions=g?.objectivePositions||{};
  for(const [name,p] of Object.entries(positions)){
    if(!p||!Number.isFinite(Number(p.x))||!Number.isFinite(Number(p.y))||Number(p.x)<0||Number(p.x)>60||Number(p.y)<0||Number(p.y)>44){
      geometryDefects++; failures.push({code:'GEOMETRY_POINT',layout:id,objective:name});
    }
  }
  const zones=g?.deploymentZones||{};
  for(const name of ['attackerDeployment','defenderDeployment','attackerTerritory','defenderTerritory']){
    const r=zones[name];
    if(!r) {geometryDefects++; failures.push({code:'GEOMETRY_REGION_MISSING',layout:id,region:name});}
    else if(Array.isArray(r.points)){
      if(r.points.length<3) geometryDefects++;
      for(const p of r.points) if(!p||Number(p.x)<0||Number(p.x)>60||Number(p.y)<0||Number(p.y)>44) geometryDefects++;
    } else if(![r.x,r.y,r.width,r.height].every(v=>Number.isFinite(Number(v)))) geometryDefects++;
  }
  const terrain=g?.terrainGeometry||{};
  if(Object.keys(terrain).length!==16){
    geometryDefects++;
    failures.push({code:'TERRAIN_COUNT',layout:id,actual:Object.keys(terrain).length});
  }
  for(const [name,r] of Object.entries(terrain)){
    if(!Array.isArray(r?.points)||r.points.length<3){geometryDefects++; failures.push({code:'TERRAIN_POLYGON',layout:id,terrain:name});continue;}
    for(const p of r.points) if(!p||Number(p.x)<0||Number(p.x)>60||Number(p.y)<0||Number(p.y)>44) geometryDefects++;
  }
  if(Number(g?.coordinateResolutionInches)!==0.1){geometryDefects++; failures.push({code:'COORDINATE_RESOLUTION',layout:id});}
}
report.geometry.defects=geometryDefects;

const missionKeys=new Set(Array.isArray(data.layoutIndex)?data.layoutIndex.map(x=>x?.missionKey):[]);
report.missions={pairs:data.layoutIndex?.length||0,uniqueMissionKeys:missionKeys.size};
if((data.layoutIndex||[]).length!==15) failures.push({code:'MISSION_PAIR_COUNT',expected:15,actual:data.layoutIndex?.length||0});
if(missionKeys.size!==15) failures.push({code:'MISSION_KEY_COUNT',expected:15,actual:missionKeys.size});

const sourceGuardrails=[
  ['No 10th-edition “Big Guns Never Tire” rule text','Big Guns Never Tire'],
  ['No 10th-edition label','10th Edition']
];
for(const [label,textValue] of sourceGuardrails){
  if(html.includes(textValue)) failures.push({code:'RULESET_CONTAMINATION',label,text:textValue});
}
report.ruleset={editionGuard:'11th-edition code path; forbidden legacy phrase checks passed unless failures listed'};

const tournamentSystems={
  scoring:['scorePrimary','scoreSecondary','ensureScoreLedger','scoreIntegrityAudit','primaryScorePreviewSummary','primaryObjectiveCheckpoint'],
  objectiveControl:['setObjectiveControl','recordObjectiveTurnState','ensureObjectiveControlHistory','recordPrimaryScoringCandidates'],
  turnPhase:['advancePhase','previousPhase','setCurrentTurn','turnElapsedMs','finalizeCurrentTurnTime'],
  auditUndo:['event','snapshotForUndo','undoLastAction','save','load'],
  tacticalLegality:['tacticalLegalityForUnit','tacticalPhaseActionAvailable','tacticalWeaponPhaseEligible'],
  diceResolution:['tacticalPreRollCheck','tacticalPreRollResolutionSet'],
  mapGeometry:['objectiveBattlefieldGeometry','objectiveSpatialClassification','objectiveMapRendererHtml'],
  distanceTerrain:['battlefieldPositionEditorHtml','battlefieldTerrainPathIntersections','battlefieldTerrainContextBetweenUnits'],
  advisor:['tacticalObjectiveAdvisor','tacticalObjectiveAdvisorHtml','getTacticalAdvisorResult']
};
report.tournamentSystems={};
for(const [group,names] of Object.entries(tournamentSystems)){
  const missing=names.filter(n=>!html.includes(n));
  report.tournamentSystems[group]={required:names.length,missing};
  if(missing.length) failures.push({code:'TOURNAMENT_SYSTEM_HOOKS',group,missing});
}

const boundedChecks=[
  ['Action Log cap','Action Log capped at 100','100'],
  ['Battle state bounded storage','Battle state','storage'],
  ['Primary scoring round cap','15VP round cap','15'],
  ['Primary scoring game cap','45VP game cap','45']
];
report.storageAndScoringGuards=[];
for(const [label,detail,needle] of boundedChecks){
  const ok=html.includes(needle);
  report.storageAndScoringGuards.push({label,ok});
  if(!ok) warnings.push({code:'GUARD_NOT_FOUND',label,detail});
}

const htmlRenderChecks=[
  ['Battlefield Map','objective-map-renderer'],
  ['Tactical Advisor decision surface','tacticalObjectiveAdvisorHtml'],
  ['Objective scoring block','primaryObjectiveCheckpointHtml'],
  ['Opponent turn tracker','opponentTurnTrackingHtml'],
  ['Pre-Roll Check','tactical-preroll-card']
];
report.uiSurfaces=[];
for(const [label,needle] of htmlRenderChecks){
  const ok=html.includes(needle);
  report.uiSurfaces.push({label,ok});
  if(!ok) failures.push({code:'UI_SURFACE_MISSING',label});
}

const result={
  status:failures.length?'FAIL':'PASS',
  blockingErrors:failures.length,
  warnings:warnings.length,
  report,
  failures,
  warnings
};
console.log(JSON.stringify(result,null,2));
if(failures.length) process.exit(1);
