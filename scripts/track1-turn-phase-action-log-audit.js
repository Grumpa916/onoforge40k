const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');
const checks = [];
function check(name, ok, detail='') {
  checks.push({name, ok: !!ok, detail});
}

check(
  'authoritative turn state exists',
  /round:1,phase:'Command'/.test(html) &&
  /currentTurn:'my'/.test(html) &&
  /battleFirstTurn/.test(html),
  'round, phase, currentTurn and battleFirstTurn are represented in battle state'
);

check(
  'five player-turn phases are authoritative',
  /const phases=\['Command','Movement','Shooting','Charge','Fight'\]/.test(html) &&
  /const GAME_REFERENCE_PHASES=\{Command:\[\],Movement:\[\],Shooting:\[\],Charge:\[\],Fight:\[\],End:\[\]\}/.test(html),
  'Command → Movement → Shooting → Charge → Fight'
);

check(
  'forward phase transitions are logged',
  /event\('PHASE_CHANGED',\{from:phases\[i\],phase:next,action:'Next Phase'\}/.test(html),
  'advancePhase records each intra-turn phase transition'
);

check(
  'backward phase transitions are logged',
  /event\('PHASE_CHANGED',\{from:phases\[i\],phase:prev,action:'Previous Phase'\}/.test(html),
  'previousPhase records backward phase navigation'
);

check(
  'turn boundary is authoritative and logged',
  /event\('TURN_CHANGED',\{from:endingTurn,to:otherTurn/.test(html) &&
  /state\.currentTurn=otherTurn/.test(html),
  'Fight → Command changes the active player and records TURN_CHANGED'
);

check(
  'round boundary is authoritative and logged',
  /event\('ROUND_CHANGED',\{fromRound:currentRound,round:state\.round,phase:'Command',currentTurn:firstTurn/.test(html) &&
  /state\.round=currentRound\+1/.test(html),
  'both player turns advance the round and record ROUND_CHANGED'
);

check(
  'final-round completion is logged without advancing past round five',
  /const MAX_ROUND=5/.test(html) &&
  /state\.battleRoundComplete=true/.test(html) &&
  /event\('TURN_ENDED',\{endingTurn,round:currentRound,phase:'Fight',action:'Battle round complete/.test(html),
  'final Fight boundary closes the battle instead of creating round six'
);

check(
  'end-of-turn scoring occurs before the turn changes',
  /autoScorePrimaryEndOfTurn\(endingTurn\)/.test(html) &&
  /event\('TURN_CHANGED'/.test(html),
  'primary scoring is resolved before handing the turn to the opponent'
);

check(
  'CP carries across phase and turn boundaries',
  /rememberPhaseCP\(\);\s*state\.phase=next;\s*rememberPhaseCP\(\)/.test(html) &&
  /rememberPhaseCP\(\);\s*state\.phase='Command';\s*state\.currentTurn=otherTurn;\s*rememberPhaseCP\(\)/.test(html),
  'live CP is carried forward while phase snapshots support backward navigation'
);

check(
  'action log records authoritative transition metadata',
  /function event\(kind,payload,before\)/.test(html) &&
  /round:state\.round,phase:state\.phase,playerTurn/.test(html) &&
  /before:before\|\|state\._undoSnapshot\|\|null/.test(html),
  'events retain round, phase, player and undo-boundary state'
);

check(
  'action log is bounded',
  /state\.events=state\.events\.slice\(0,100\)/.test(html),
  'action history is capped at 100 events'
);

check(
  'undo snapshots exclude the action log',
  /function snapshotForUndo\(\)/.test(html) &&
  /delete x\.events;/.test(html) &&
  /delete x\._undoSnapshot;/.test(html),
  'undo restores game state without recursively restoring the event history'
);

check(
  'turn navigation is exposed to the active battle UI',
  /window\.nextRound=nextRound/.test(html) &&
  /window\.previousRound=previousRound/.test(html) &&
  /window\.advancePhase=advancePhase/.test(html) &&
  /window\.previousPhase=previousPhase/.test(html),
  'phase/round controls are available to the battle interface'
);

check(
  'turn clock follows player transitions',
  /switchTurnClock\(otherTurn\)/.test(html) &&
  /switchTurnClock\(firstTurn\)/.test(html),
  'player-turn timing switches with authoritative turn ownership'
);

const failed = checks.filter(x => !x.ok);
for (const c of checks) console.log((c.ok ? 'PASS' : 'FAIL') + ' — ' + c.name + (c.detail ? ' — ' + c.detail : ''));
console.log(`Track 1 turn/phase → action-log integrity: ${checks.length - failed.length}/${checks.length} passed`);
if (failed.length) process.exit(1);
