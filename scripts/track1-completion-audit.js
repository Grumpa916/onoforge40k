const fs=require('fs');
const s=fs.readFileSync('index.html','utf8');
const fail=m=>{console.error('FAIL:',m);process.exitCode=1};
const ok=m=>console.log('PASS:',m);

[
  'function scorePrimaryItem(','function primaryScoringEvidence(','function autoScorePrimaryEndOfTurn(',
  'function advancePhase(','function previousPhase(','function setCurrentTurn(','function nextRound(',
  'function event(','function snapshotForUndo(','function undoLastAction(',
  'function recordObjectiveTurnState(','function ensureObjectiveTurnSnapshot(',
  'function changeVP(','function changeCP(',
  'function actionLogFiltersHtml(','function filteredActionLogEvents('
].forEach(n=>s.includes(n)?ok(n+' present'):fail(n+' missing'));

const phases=(s.match(/const phases=\['Command','Movement','Shooting','Charge','Fight'\]/g)||[]).length;
phases?ok('Five authoritative player phases'):fail('Five-phase state machine missing');
s.includes('const MAX_ROUND=5')?ok('Five-round boundary'):fail('MAX_ROUND=5 missing');

const checks=[
 [/autoScorePrimaryEndOfTurn\(endingTurn\)/,'end-of-turn scoring in phase transition'],
 [/autoScorePrimaryEndOfTurn\(before\)/,'manual turn scoring'],
 [/autoScorePrimaryEndOfTurn\(endingTurn\)/,'next-round scoring'],
 [/state\.events=state\.events\.slice\(0,100\)/,'bounded action log'],
 [/delete x\.events/,'undo snapshot excludes action log'],
 [/restored\.events=keepEvents/,'undo preserves retained action history'],
 [/state\.myVP=scoreTotalForSide\('my'\)/,'authoritative My VP ledger linkage'],
 [/state\.oppVP=scoreTotalForSide\('opp'\)/,'authoritative Opp VP ledger linkage'],
 [/primaryObjectiveConditionStatus\(player,row\)/,'objective-condition gate'],
 [/capturePrimaryObjectiveScoreSnapshot\(side,index,row\)/,'objective score snapshot'],
 [/recordObjectiveTurnState\(\)/,'objective turn history'],
 [/event\('PRIMARY_SCORED'/,'primary scoring audit event'],
 [/event\('OBJECTIVE/,'objective event namespace'],
 [/event\('PHASE_CHANGED'/,'phase event'],
 [/event\('TURN_CHANGED'/,'turn event'],
 [/event\('ROUND_CHANGED'/,'round event'],
];
for(const [re,label] of checks)re.test(s)?ok(label):fail(label+' missing');

if(/state\.currentTurn=next;\s*restorePhaseCP\(state\.round,next,state\.phase\)/.test(s))
  fail('manual turn still restores stale CP snapshot');
else ok('manual turn carries persistent CP state');

if(/state\.round=nextRoundNumber;[\s\S]{0,500}restorePhaseCP\(state\.round,nextTurn,'Command'\)/.test(s))
  fail('forward next-round transition restores stale CP');
else ok('forward next-round transition carries persistent CP');

console.log(process.exitCode?'Track 1 audit FAILED':'Track 1 audit PASSED');