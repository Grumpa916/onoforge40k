const fs=require('fs');
const s=fs.readFileSync('index.html','utf8');
const fail=m=>{console.error('FAIL:',m);process.exitCode=1};
const ok=m=>console.log('PASS:',m);
[
 ['function ensureTacticalTurnDraw(','Command-phase Tactical replenishment'],
 ['function tacticalNewOrdersUsed(','New Orders state'],
 ['function useTacticalNewOrders(','New Orders action'],
 ['function openTacticalNewOrders(','New Orders UI'],
 ['function discardTacticalForCP(','voluntary Tactical discard'],
 ['function openTacticalDiscardModal(','discard UI'],
 ['function scoreSecondary(','secondary scoring path'],
 ['function secondaryTotalScoredVP(','secondary ledger'],
 ['function secondaryRoundScoredVP(','secondary round ledger'],
 ['function battleEndSummaryHtml(','end-game report']
].forEach(([n,l])=>s.includes(n)?ok(l):fail(l+' missing'));
[
 [/active\.length>=2/,'Tactical active-card floor'],
 [/drawTactical\(next,needed,false\)/,'Command-phase replenishment draw'],
 [/secondaryNewOrdersUsedMy/,'My New Orders usage state'],
 [/secondaryNewOrdersUsedOpp/,'Opponent New Orders usage state'],
 [/cpSpent:1/,'New Orders CP audit event'],
 [/state\.myCP-=1/,'My New Orders CP spend'],
 [/state\.oppCP-=1/,'Opponent New Orders CP spend'],
 [/state\[cardsKey\]=secState\(player\)\.filter\(n=>!selected\.includes\(n\)\)/,'Tactical discard removes selected cards'],
 [/cpGained:1/,'Tactical discard CP audit event'],
 [/scoreSecondary\(side,name,amount,\{endOfBattle(?:,rowIndex:index)?\}\)/,'condition-level secondary scoring'],
 [/roundAllowance=Math\.max\(0,15-roundTotalBefore\)/,'secondary round cap'],
 [/Math\.max\(0,45-totalBefore\)/,'secondary game cap'],
 [/fixed\?20/,'fixed secondary per-card cap'],
 [/SECONDARY_SCORED/,'secondary scoring event'],
 [/SECONDARY_DISCARDED/,'secondary discard event']
].forEach(([re,l])=>re.test(s)?ok(l):fail(l+' missing'));
if(/state\.secondaryTacticalDrawKeys=\{'1\|my':true,'1\|opp':true\}/.test(s))fail('battle start suppresses initial Tactical draw');else ok('battle start allows initial Tactical draw');
if(!/drawTactical\('my',2,false\)/.test(s)||!/drawTactical\('opp',2,false\)/.test(s))fail('battle start draws two Tactical cards');else ok('battle start draws two Tactical cards');
console.log(process.exitCode?'Track 3 audit FAILED':'Track 3 audit PASSED');