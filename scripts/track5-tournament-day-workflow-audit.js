#!/usr/bin/env node
'use strict';

const fs=require('fs');
const html=fs.readFileSync('index.html','utf8');
const checks=[];
const check=(name,pass,detail)=>checks.push({name,pass:!!pass,detail});
const has=re=>re.test(html);

check('Tournament lifecycle exposes all four operational states',
  has(/allowed=\['SETUP','DEPLOYMENT','LIVE','COMPLETED'\]/),
  'Tournament day must distinguish setup, deployment, live play, and completed result.');

check('Setup requires terrain setup completion',
  has(/if\(!state\.terrainSetupComplete\)missing\.push\('Terrain setup completion'\)/),
  'The physical terrain setup step must be completed before deployment.');

check('Deployment is a distinct user-visible phase',
  has(/function beginDeployment\(/)&&has(/TOURNAMENT_DEPLOYMENT_STARTED/)&&has(/state\.tournamentLifecycle==='DEPLOYMENT'/),
  'The app must explicitly enter and persist Deployment before Live play.');

check('Live start requires actual deployment readiness',
  has(/const deploymentCheck=tournamentDeploymentValidation\(\)/)&&has(/if\(!deploymentCheck\.ready\)/),
  'Planning positions cannot substitute for actual deployment.');

check('Battle timer provides save and pause/resume controls',
  has(/function saveBattleFromTimer\(/)&&has(/onclick="saveBattleFromTimer\(\);return false;"/)&&has(/function toggleTurnPause\(/),
  'Tournament operation must allow a fast save and timer control from the active battle surface.');

check('Completed battles lock mutation and preserve a result snapshot',
  has(/state\.battleResult=tournamentResultSnapshot\(\)/)&&has(/state\.battleResultLocked=true/)&&has(/function battleMutationAllowed\(/),
  'A completed game must be recoverable as a locked result rather than remaining editable.');

check('Result verification gates export',
  has(/function verifyTournamentResult\(/)&&has(/function exportTournamentResult\(/)&&has(/if\(!state\.battleResultVerified\)/),
  'Tournament result export must require explicit verification.');

check('Recovery persists lifecycle, result lock, timer, deployment, and rules pin',
  has(/JSON\.stringify\(\{state:safeState,DEMO\}\)/)&&has(/tournamentLifecycle/)&&has(/battleResultLocked/)&&has(/rulesDataPin/)&&has(/deploymentState/),
  'A refreshed or resumed tournament must retain the authoritative operational context.');

check('Battle Mode omits browser/data diagnostics from the active header',
  !has(/Browser app loaded locally[^]*dataSyncStatusHtml\(\)/),
  'Diagnostics belong in setup/data surfaces, not the tournament table-facing battle header.');

const failures=checks.filter(x=>!x.pass);
console.log(JSON.stringify({
 audit:'Track 5 tournament-day workflow hardening audit',
 checks:checks.length,
 passed:checks.length-failures.length,
 failed:failures.length,
 failures
},null,2));
if(failures.length)process.exit(1);
