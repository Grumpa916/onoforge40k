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

const has=(re)=>typeof re==='string'?html.includes(re):re.test(html);

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
check('Pause freezes the authoritative game clock',
  has(/t\.elapsedMs=gameTimerElapsed\(\)/)&&has(/t\.running=false/)&&has(/t\.paused=true/)&&has(/clearInterval\(gameTimerInterval\)/),
  'Pausing the tournament clock must stop elapsed wall-clock accumulation, not only the current player turn clock.');
check('Resume restarts the authoritative game clock from the persisted snapshot',
  has(/t\.startedAt=Date\.now\(\)/)&&has(/t\.running=true/)&&has(/t\.paused=false/)&&has(/t\.turnStartedGameMs=Number\(t\.elapsedMs\)\|\|0/),
  'Resuming must restart from the frozen elapsed snapshot without counting the pause interval.');
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

check('Legacy recovery cannot implicitly promote Battle page to Live',
  has("if(!allowed.includes(state.tournamentLifecycle))state.tournamentLifecycle=state.battleEnded?'COMPLETED':'SETUP';"),
  'Recovered legacy state must require an explicit Deployment transition.');

check('Deployment coordinates are checked against verified deployment zones',
  has(/function pointInsideDeploymentZone\(/)&&has(/function tournamentDeploymentZoneForSide\(/)&&has(/function tournamentDeploymentZoneStatus\(/)&&has(/outside deployment zone/),
  'When verified Event Companion geometry is available, actual deployment positions must be checked against the correct physical deployment zone.');
check('Deployment is blocked when verified geometry is unavailable',
  has(/const geometry=objectiveBattlefieldGeometry\(\)/)&&has(/Verified Event Companion deployment geometry is unavailable/)&&has(/if\(!geometry\.verified\)/),
  'Tournament deployment must not silently proceed when the authoritative Event Companion geometry cannot be verified.');
check('Live battle requires complete actual deployment',has('function tournamentDeploymentValidation()')&&has('const deploymentCheck=tournamentDeploymentValidation();')&&has("if(!deploymentCheck.ready){alert('Deployment is incomplete:"),'Start Battle must require actual deployment accounting before entering Live.');
check('Deployment readiness does not count planning ghosts as actual placement',has("deploymentReadyMy:Object.values(ensureBattlefieldUnitPositions()).some(p=>p&&p.side==='my')")&&has("deploymentReadyOpp:Object.values(ensureBattlefieldUnitPositions()).some(p=>p&&p.side==='opp')"),'Saved deployment plans must remain distinct from actual battlefield positions.');
check('Transport embarkations are a separate auditable declaration layer',
  has(/function ensureTransportEmbarkations\(/)&&has(/function setTransportEmbarkation\(/)&&has(/TRANSPORT_EMBARKED/)&&has(/TRANSPORT_DISEMBARKED/),
  'Transport formations must not be conflated with Leader/Bodyguard attachments.');
check('Embarked units are accounted for during deployment validation',
  has(/isUnitEmbarked\(side,id\)/)&&has(/if\(isUnitEmbarked\(side,id\)\)continue;/),
  'A declared embarked passenger is not required to have an independent battlefield position.');

check('Transport declarations reject self-embarkation and transport passengers',
  has(/tid===pid/)&&has(/passengerKeywords\.includes\('TRANSPORT'\)/),
  'A transport cannot embark itself or another transport through the declaration layer.');
check('Transport declaration moves a passenger between transports instead of duplicating it',
  has(/clearTransportEmbarkation\(s,pid\)/)&&has(/maps\[tid\]\.push\(pid\)/),
  'A passenger must have at most one declared starting transport.');
check('Embarkation removes stale battlefield position state',
  has(/delete state\.battlefieldUnitPositions\[pid\]/),
  'A unit declared embarked must not retain an independent deployment position.');
check('Transport declarations are included in locked result verification',
  has(/transportEmbarkations:JSON\.parse\(JSON\.stringify\(ensureTransportEmbarkations\(\)\)\)/)&&has(/const expected=\{/)&&has(/transportEmbarkations:JSON\.parse\(JSON\.stringify\(ensureTransportEmbarkations\(\)\)\),\n  rulesDataPin:/),
  'Transport declarations must remain part of the authoritative result integrity comparison.');

check('Tournament result captures both deployment sides and audit state',
  has(/deploymentReadyMy:/)&&has(/deploymentReadyOpp:/)&&has(/deploymentState:\{/)&&has(/positions:JSON\.parse\(JSON\.stringify\(ensureBattlefieldUnitPositions\(\)\)\)/),
  'The final tournament record must preserve deployment and reserve context.');

check('Tournament lifecycle has an explicit Deployment state',
  has(/allowed=\['SETUP','DEPLOYMENT','LIVE','COMPLETED'\]/)&&has(/DEPLOYMENT:\['SETUP','LIVE'\]/),
  'Tournament flow must distinguish setup, deployment, live battle, and completion.');

check('Lifecycle transition table forbids SETUP to LIVE bypass',
  has(/transitions=\{SETUP:\['DEPLOYMENT'\],DEPLOYMENT:\['SETUP','LIVE'\],LIVE:\['COMPLETED'\],COMPLETED:\['SETUP'\]\}/),
  'The lifecycle state machine itself must prevent bypassing Deployment.');

check('Tournament reset returns through Setup',
  has(/function resetTournamentToSetup\(/)&&has(/setTournamentLifecycle\('SETUP'\)/)&&has(/state\.page='setup'/),
  'Reset must return the tournament to Setup instead of bypassing Deployment.');

check('Setup cannot jump directly to Live',
  has(/function beginDeployment\(/)&&has(/function startBattle\(/)&&has(/if\(state\.tournamentLifecycle!=='DEPLOYMENT'\)/),
  'Live battle must require an explicit Deployment transition.');

check('Deployment initializes persistent map, reserve, and transport state',
  has(/function beginDeployment\(/)&&has(/ensureReserveState\(\)/)&&has(/ensureDeploymentPlans\(\)/)&&has(/ensureBattlefieldUnitPositions\(\)/)&&has(/ensureTransportEmbarkations\(\)/),
  'Deployment must preserve reserves and battlefield/deployment map state.');

check('Deployment and setup reopen transitions are auditable',
  has(/TOURNAMENT_DEPLOYMENT_STARTED/)&&has(/TOURNAMENT_SETUP_REOPENED/),
  'Tournament lifecycle transitions must remain visible in the action history.');

check('Live transition is gated to Deployment',
  has(/setTournamentLifecycle\('LIVE'\)/)&&has(/The tournament could not transition from Deployment to Live/),
  'The live state must be entered only through the Deployment lifecycle.');

check('Completed lifecycle is captured in the locked result',
  has(/setTournamentLifecycle\('COMPLETED'\)/)&&has(/state\.battleResult=tournamentResultSnapshot\(\)/)&&has(/state\.battleResultLocked=true/),
  'The result snapshot must be created only after the lifecycle reaches Completed.');
check('Tournament result requires explicit verification before export',
  has(/function verifyTournamentResult\(/)&&has(/state\.battleResultVerified=true/)&&has(/if\(!state\.battleResultVerified\)\{alert\('Verify the tournament result before exporting it/),
  'Final result must be explicitly verified before export.');
check('Result verification compares locked snapshot to authoritative state',
  has(/function tournamentResultIntegrityCheck\(/)&&has(/const mismatches=Object\.keys\(expected\)/),
  'Verification must detect divergence between the locked result and authoritative state.');
check('Result verification requires the Completed lifecycle',
  has(/tournamentLifecycle:'COMPLETED'/)&&has(/state\.tournamentLifecycle/),
  'A locked tournament result must remain associated with the Completed lifecycle.');
check('Verification is logged',
  has(/event\('TOURNAMENT_RESULT_VERIFIED'/),
  'Tournament result verification must remain auditable.');

const failures=checks.filter(x=>!x.pass);
console.log(JSON.stringify({
  audit:'Track 5 Tournament Operations integrity audit',
  checks:checks.length,
  passed:checks.length-failures.length,
  failed:failures.length,
  failures
},null,2));
if(failures.length)process.exit(1);
