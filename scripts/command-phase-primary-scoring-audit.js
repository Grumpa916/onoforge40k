const fs=require('fs');
const html=fs.readFileSync('index.html','utf8');
const checks=[
  ['11e command-phase primary scoring rows present',html.includes('Command phase / R5')],
  ['primary scoring evidence remains authoritative',html.includes('function primaryScoringEvidence(')],
  ['command-phase opportunity evaluator exists',html.includes('function commandPhasePrimaryScoringOpportunity(')],
  ['Battle-shock changes refresh scoring candidates',html.includes("recordPrimaryScoringCandidates(state.currentTurn==='opp'?'opp':'my','battle-shock-change')")],
  ['Tyranid Shadow usage state exists',html.includes('shadowInTheWarpUsed:false')],
  ['Shadow usage marker exists',html.includes('function markShadowInTheWarpUsed(')],
  ['Command-phase Advisor surface exists',html.includes('function commandPhasePrimaryAdvisorHtml(')],
  ['Tyranid Shadow reminder is surfaced',html.includes('consider Shadow in the Warp before Command-phase Primary scoring')],
  ['Advisor exposes command-phase scoring opportunity',html.includes('commandPhasePrimaryOpportunity')]
];
const failures=checks.filter(([,ok])=>!ok);
console.log(JSON.stringify({audit:'11e Command-phase Primary scoring / Shadow in the Warp',checks:checks.length,passed:checks.length-failures.length,failed:failures.length,failures},null,2));
if(failures.length)process.exit(1);
