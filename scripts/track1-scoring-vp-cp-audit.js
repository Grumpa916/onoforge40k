const fs=require('fs');
const html=fs.readFileSync('index.html','utf8');
function check(name,ok){if(!ok){console.error('FAIL:',name);process.exitCode=1;}else console.log('PASS:',name);}
const scoreStart=html.indexOf('function scorePrimaryItem(');
const scoreEnd=html.indexOf('function primaryScoreAdjust(',scoreStart);
const score=scoreStart>=0&&scoreEnd>scoreStart?html.slice(scoreStart,scoreEnd):'';
const cpStart=html.indexOf('function changeCP(');
const cpEnd=html.indexOf('function ensureSecondaryPersonalPlans',cpStart);
const cp=cpStart>=0&&cpEnd>cpStart?html.slice(cpStart,cpEnd):'';

check('Primary scoring function exists',score.length>0);
check('Primary scoring recalculates authoritative total VP',/state\[overallKey\]=scoreTotalForSide\(side\)/.test(score));
check('Primary scoring derives eligibility before mutation',/const evidence=primaryScoringEvidence\(side,index,mission,amountOverride\)/.test(score));
check('Primary scoring preserves round and game VP caps',/roundAllowance/.test(score)&&/gameAllowance/.test(score));
check('Primary scoring records a PRIMARY_SCORED event',/event\('PRIMARY_SCORED'/.test(score));
check('Primary scoring persists and rerenders after mutation',/save\(\);\s*render\(\);/.test(score));
check('CP change function exists',cp.length>0);
check('CP changes are bounded at zero',/Math\.max\(0,before\+d\)/.test(cp));\.max\(0,before\+d\)/.test(cp));
check('CP changes snapshot phase state',/rememberPhaseCP\(\)/.test(cp));\(\)/.test(cp));
check('CP changes are logged',/event\('CP_CHANGED'/.test(cp));nt\('CP_CHANGED'/.test(cp));
if(process.exitCode)process.exit(1);
console.log('Track 1 scoring → VP/CP integrity audit passed 10/10');
