#!/usr/bin/env node
'use strict';

/*
 * OnoForge 40K — Track 5 Tournament Operations integrity audit.
 * This gate verifies the tournament-day timing/result foundations already
 * present in the authoritative battle state. It does not claim that the
 * complete tournament-operations track is finished.
 */
const fs=require('fs');
const html=fs.readFileSync('index.html','utf8');
const checks=[];
const check=(name,pass,detail)=>checks.push({name,pass:!!pass,detail});

const has=(re)=>re.test(html);

check('Authoritative game timer state exists',
  has(/state.gameTimer/)&&has(/function ensureGameTimer\(/),
  'Tournament timing must live in persisted battle state.');
check('Game elapsed time is derived from timer state',
  has(/function gameTimerElapsed\(/)&&has(/startedAt/)&&has(/elapsedMs/),
  'Elapsed game time must have a deterministic persisted representation.');
check('Separate player turn clocks exist',
  has(/turnMyMs/)&&has(/turnOppMs/)&&has(/function turnElapsedMs\(/),
  'Tournament operations require separate player turn timing.');
check('Turn time is finalized at transitions',
  has(/function finalizeCurrentTurnTime\(/)&&has(/function switchTurnClock\(/),
  'Turn timing must not lose elapsed time when control changes.');
check('Pause/resume is persisted',
  has(/function toggleTurnPause\(/)&&has(/save()/),
  'Pause/resume state must survive normal persistence.');
check('Timer persistence avoids counting closed-app time',
  has(/point-in-time timer snapshot/)&&has(/safeState.gameTimer={...safeState.gameTimer/),
  'Loading a saved battle must not retroactively count browser-closed time.');
check('Battle completion finalizes timer',
  has(/function endBattle\(/)&&has(/t.finishedAt=Date.now()/),
  'Ending a battle must stop and finalize timing.');
check('End-game report exists',
  has(/function battleEndSummaryHtml\(/)&&has(/Final scoring breakdown/),
  'Tournament operations require a final scoring surface.');
check('Final report includes both players and scoring components',
  has(/Primary .*Secondary .*Battle Ready/)&&has(/state.myName/)&&has(/state.oppName/),
  'Final report must expose both sides and the major scoring components.');
check('End-game event is logged',
  has(/event\('BATTLE_ENDED'/),
  'Battle completion must remain auditable in the action history.');
check('Immutable tournament result snapshot exists',
  has(/function tournamentResultSnapshot\(/)&&has(/state\.battleResult=tournamentResultSnapshot\(\)/),
  'Completed battles must preserve a result snapshot independent of later UI rendering.');
check('Tournament result export is available',
  has(/function exportTournamentResult\(/)&&has(/Export Tournament Result/),
  'A completed tournament battle must provide a portable result export.');
check('Tournament setup readiness gate exists',
  has(/function tournamentSetupValidation\(/)&&has(/function tournamentSetupChecklistHtml\(/),
  'Battle Setup must expose an explicit readiness check before Live state.');
check('Start battle is blocked when setup is incomplete',
  has(/const setupCheck=tournamentSetupValidation\(\)/)&&has(/if\(!setupCheck\.ready\)\{alert\('Tournament setup is incomplete/),
  'Incomplete setup must not silently transition into a live battle.');
check('Setup readiness covers rosters mission battlefield and turn order',
  has(/missing\.push\('My roster'\)/)&&has(/missing\.push\('Opponent roster'\)/)&&has(/missing\.push\('Primary mission'\)/)&&has(/missing\.push\('Battlefield layout'\)/)&&has(/missing\.push\('First-turn selection'\)/),
  'Core tournament setup prerequisites must be explicit.');
check('Fixed secondary setup requires two selections',
  has(/state\.secondaryMy==='fixed'&&secState\('my'\)\.length!==2/)&&has(/state\.secondaryOpp==='fixed'&&secState\('opp'\)\.length!==2/),
  'Fixed secondary setup must be complete before Live state.');
check('No legacy 10th-edition rule contamination',
  !/Big Guns Never Tire/i.test(html),
  'Tournament operations must remain on the current rules path.');

const failures=checks.filter(x=>!x.pass);
console.log(JSON.stringify({
  audit:'Track 5 Tournament Operations integrity audit',
  checks:checks.length,
  passed:checks.length-failures.length,
  failed:failures.length,
  failures
},null,2));
if(failures.length)process.exit(1);
