const fs=require('fs');
const html=fs.readFileSync('index.html','utf8');
function check(name,ok,detail=''){if(!ok){console.error('FAIL:',name,detail);process.exitCode=1;}else console.log('PASS:',name);}
const helperStart=html.indexOf('function autoScorePrimaryEndOfTurn(');
const helperEnd=html.indexOf('function advancePhase()',helperStart);
const advanceStart=helperEnd;
const advanceEnd=html.indexOf('function previousPhase()',advanceStart);
const helper=helperStart>=0&&helperEnd>helperStart?html.slice(helperStart,helperEnd):'';
const advance=advanceStart>=0&&advanceEnd>advanceStart?html.slice(advanceStart,advanceEnd):'';

check('Track 1 end-of-turn scoring helper exists',helper.length>0);
check('Helper evaluates the active player mission',/primaryMission\(player\)/.test(helper));
check('Helper limits automation to End of turn timing',/if\(!\/end of turn\/.test\(timing\)\)return/.test(helper));
check('Helper uses authoritative scoring eligibility evidence',/primaryScoringEvidence\(player,index,mission\)/.test(helper));
check('Helper commits through the existing primary scoring path',/scorePrimaryItem\(player,index,mission\)/.test(helper));
check('Advance Phase triggers scoring at the end of every player turn',/autoScorePrimaryEndOfTurn\(endingTurn\)/.test(advance));
check('Final-round guard occurs after end-of-turn scoring trigger',advance.indexOf('autoScorePrimaryEndOfTurn(endingTurn)')<advance.indexOf("if(currentRound>=MAX_ROUND)"));
check('Round transition records scoring candidates after auto-scoring',advance.indexOf("recordPrimaryScoringCandidates(endingTurn,'round-end')")>advance.indexOf('autoScorePrimaryEndOfTurn(endingTurn)'));
check('Player-turn transition records scoring candidates after auto-scoring',advance.indexOf("recordPrimaryScoringCandidates(endingTurn,'turn-end')")>advance.indexOf('autoScorePrimaryEndOfTurn(endingTurn)'));
check('Command-phase scoring remains manual rather than auto-triggered',!/autoScorePrimaryEndOfTurn\([^)]*\).*primaryScoringRowsForRound/.test(advance));
check('Primary scoring events remain in the authoritative event log',/event\('PRIMARY_SCORED'/.test(html));
if(process.exitCode) process.exit(1);
console.log('Track 1 end-of-turn primary scoring audit passed 11/11');
