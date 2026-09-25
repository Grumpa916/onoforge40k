const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const checks=[];
const check=(name,condition,detail='')=>checks.push({name,pass:!!condition,detail});
const has=re=>re.test(html);
const region=(startMarker,endMarker)=>{
  const a=html.indexOf(startMarker),b=html.indexOf(endMarker,a+startMarker.length);
  return a>=0&&b>a?html.slice(a,b):'';
};
const mixed=region('function tacticalPreRollApplyMixedSaveRolls','function tacticalPreRollResolutionPlan');
const apply=region('function tacticalPreRollApplyResolution','function tacticalPreRollResolutionState');

check('Model-level mixed resolution surface exists',
  mixed.includes('function tacticalPreRollApplyMixedSaveRolls') &&
  mixed.includes('const states=new Map') &&
  mixed.includes('const modelStates=Array.from(states.values())'),
  'Mixed save resolution must maintain explicit per-model state.');
check('Wounded models are allocated before unwounded models',
  /arr\.find\(m=>m\.alive!==false&&Number\(m\.woundsRemaining\|\|0\)<Number\(m\.maxWounds\|\|m\.profile\?\.W\|\|1\)\)/.test(mixed),
  'Normal damage allocation must prefer already-wounded legal models.');
check('Damage reduces individual model wounds',
  /m\.woundsRemaining=Math\.max\(0,before-applied\)/.test(mixed) &&
  /m\.alive=m\.woundsRemaining>0/.test(mixed),
  'A failed save must resolve against an individual model state.');
check('Model death advances allocation',
  /if\(!m\.alive\)while\(currentGroupIndex<orderIds\.length\)/.test(mixed),
  'When a model reaches zero wounds, subsequent damage must move to the next legal target.');
check('Devastating Wounds uses model allocation',
  /if\(plan\.devastating&&criticalWounds>0\)/.test(mixed) &&
  /pickModel\(g\)/.test(mixed) &&
  /applyNormalDamage\(m,normalDamage\)/.test(mixed),
  'Devastating Wounds must resolve against legal individual models.');
check('Variable damage preserves model-specific deferred instances',
  /damageInstances:variableDamage\?resolution\.filter\(x=>!x\.saveSucceeds\)\.map\(x=>\(\{kind:'failedSave',modelId:x\.modelId,groupId:x\.groupId\}\)\)/.test(mixed) &&
  /devastatingInstances:variableDamage&&plan\.devastating\?devastatingInstances:\[\]/.test(mixed),
  'Variable damage must retain the model receiving each unresolved damage instance.');
check('Mixed resolution commits model state to roster',
  /\(s\.mixedResolution\.modelStates\|\|\[\]\)\.forEach\(ms=>/.test(apply) &&
  /ensureModelRoster\(ce,u\)\.find\(m=>m\.id===ms\.id\)/.test(apply) &&
  /rm\.woundsRemaining=.*ms\.woundsRemaining/.test(apply) &&
  /rm\.alive=ms\.alive!==false/.test(apply),
  'Resolved model state must be written back to the existing model roster.');
check('Roster state is synchronized after model damage',
  /if\(modelRosterRule\(u\)\)\{syncModelRosterBattleState\(ce,u\);return;\}/.test(apply) &&
  /syncModelRosterBattleState\(te,targetUnit\)/.test(apply),
  'Model roster and aggregate battle state must remain synchronized.');
check('Non-roster mixed units still update aggregate state',
  /const alive=states\.filter\(ms=>ms\.alive!==false\)\.length/.test(apply) &&
  /ce\.game\.models=alive/.test(apply) &&
  /ce\.game\.wounds=.*total/.test(apply),
  'Units without a model roster must still receive a consistent aggregate update.');
check('ATTACK_RESOLUTION records model-level resolution',
  /event\('ATTACK_RESOLUTION',\{/.test(apply) &&
  /mixedAllocation:!!s\.plan\.mixedSaveGroups/.test(apply) &&
  /saveRolls:s\.mixedResolution\?\.resolution\?\.map\(x=>x\.roll\)/.test(apply),
  'The action log must retain enough information to audit model-level allocation.');
const failures=checks.filter(x=>!x.pass);
console.log(JSON.stringify({audit:'Task 31 model-level damage resolution audit',checks:checks.length,passed:checks.length-failures.length,failed:failures.length,failures},null,2));
if(failures.length)process.exit(1);
