const fs=require('fs');
const path=require('path');

const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const data=JSON.parse(fs.readFileSync(path.join(root,'data','warhammer-event-companion-v1.2.json'),'utf8'));
const checks=[];
const check=(name,condition,detail='')=>checks.push({name,pass:!!condition,detail});
const has=re=>re.test(html);

check('Tactical Advisor engine exists',
  has(/function tacticalAdvisorV1\(/) &&
  has(/function getTacticalAdvisorResult\(/),
  'The active battle surface must have the Tactical Advisor calculation and cached result entry points.');

check('Advisor uses mission state',
  has(/function missionDecisionContext\(/) &&
  has(/const missionCtx=missionDecisionContext\(\)/) &&
  has(/missionContext:missionCtx/),
  'Recommendations must receive current mission, score, Primary/Secondary, objective, and turn context.');

check('Advisor uses objective-control state',
  has(/objectiveSummary:(?:objectiveSummary\.)?(?:current|control|summary)/) &&
  has(/objectiveTacticalSummary\(\)/) &&
  has(/objectiveMapLayout:state\.objectiveMapLayout/),
  'Recommendations must consume the active objective-control and map state.');

check('Advisor uses verified battlefield geometry',
  has(/battlefieldGeometry:objectiveBattlefieldGeometry\(\)/) &&
  has(/tacticalPairState\(/) &&
  has(/distanceInches/),
  'Spatial recommendations must use recorded battlefield context rather than inventing distances.');

check('Unknown spatial state is not guessed',
  has(/unknown battlefield distances reduce confidence/) &&
  has(/Record the battlefield distance before committing to the charge/) &&
  has(/losInference:'not-inferred'/),
  'Unknown spatial information must reduce confidence or request measurement, never be silently inferred.');

check('Phase legality gates recommendations',
  has(/tacticalLegalityForUnit\(/) &&
  has(/tacticalTargetLegality\(/) &&
  has(/tacticalPhaseActionAvailable\(/) &&
  has(/\['Shooting','Fight'\]/),
  'Advisor output must be constrained by current phase and legal target/action state.');

check('Weapon availability is data-driven',
  has(/tacticalAdvisorAttackerHasRangedWeapons\(/) &&
  has(/tacticalAdvisorWeaponGroups\(/) &&
  has(/tacticalWeaponPhaseEligible\(/),
  'Weapon recommendations must come from the current unit/weapon data and phase eligibility.');

check('Advisor exposes decision factors',
  has(/decisionScore/) &&
  has(/decisionMode/) &&
  has(/decisionExplanation|recommendationExplanation/) &&
  has(/objectiveValue/) &&
  has(/futureScoringValue|scoreNow|denyOpponentScore|preserveFriendlyUnit|tradeValue/),
  'The decision surface must expose mission-relevant factors rather than only raw damage.');

check('Advisor state cache invalidates on battle-state changes',
  has(/function tacticalAdvisorStateSignature\(/) &&
  has(/TACTICAL_RENDER_CACHE\.signature/) &&
  has(/TACTICAL_RENDER_CACHE\.advisor\.clear\(\)/),
  'Cached recommendations must be invalidated when relevant game state changes.');

check('Advisor is integrated with the battle renderer',
  has(/prepareTacticalRenderCache\(\)/) &&
  has(/id="onoforge-advisor-render"/),
  'The battle page must expose a dedicated Tactical Advisor render surface.');

check('Advisor integration preserves tournament scoring caps',
  has(/primaryMyScoredVP/) &&
  has(/primaryOppScoredVP/) &&
  has(/Math\.max\(0,15-myRoundPrimary\)/) &&
  has(/Math\.max\(0,15-oppRoundPrimary\)/),
  'Advisor mission context must preserve the existing Primary scoring ledger and round-cap state.');

check('Verified Event Companion geometry remains intact',
  Array.isArray(data.layoutGeometry?.layouts) &&
  data.layoutGeometry.layouts.length===45 &&
  data.layoutGeometry.layouts.every(x=>x?.verified===true),
  'Task 25 must not weaken the verified 45-layout geometry source.');

check('No legacy Big Guns rule',
  !/Big Guns Never Tire/i.test(html),
  'Legacy 10th-edition rule text must remain absent.');

const failures=checks.filter(x=>!x.pass);
console.log(JSON.stringify({
  audit:'Task 25 Tactical Advisor integration audit',
  checks:checks.length,
  passed:checks.length-failures.length,
  failed:failures.length,
  failures
},null,2));
if(failures.length)process.exit(1);
