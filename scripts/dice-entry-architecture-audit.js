const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const checks=[];
const check=(name,condition,detail='')=>checks.push({name,pass:!!condition,detail});
const has=re=>re.test(html);

check('Physical dice authority is explicit',
  has(/PHYSICAL DICE AUTHORITY INVARIANT/) &&
  has(/never generates, predicts, or assumes a physical dice result/),
  'Dice resolution must treat tabletop physical dice as authoritative.');

check('Count-first architecture exists',
  has(/mode:'count'/) &&
  has(/tacticalPreRollDiceRequirement(field,s)/) &&
  has(/field==='hits'/) &&
  has(/field==='wounds'/),
  'Successful hit/wound entry should use counts when exact die faces are unnecessary.');

check('Subclassify only when required',
  has(/mode:'subclassify'/) &&
  has(/field==='criticalHits'/) &&
  has(/field==='criticalWounds'/) &&
  has(/field==='lethalHits'/),
  'Critical and Lethal classifications must be requested only where downstream rules require them.');

check('Exact physical results are reserved for resolution',
  has(/field==='precisionSave'/) &&
  has(/field==='precisionSaveReroll'/) &&
  has(/field==='precisionDamage'/) &&
  has(/field==='mixedVariableSave'/) &&
  has(/field==='mixedDamage'/),
  'Individual die faces must be collected only where allocation, re-rolls, variable damage, or similar rules require them.');

check('Dice inputs are bounded',
  has(/n<0\|\|n>Number\(max\|\|0\)/) &&
  has(/n<Math\.max\(1,Number\(min\)\|\|1\)\|\|n>Number\(max\|\|6\)/),
  'Count and exact-result entry must reject impossible physical results.');

check('UI exposes staged entry',
  has(/HITS • COUNT/) &&
  has(/HITS • SUBCLASSIFY/) &&
  has(/WOUNDS • COUNT/) &&
  has(/WOUNDS • SUBCLASSIFY/),
  'The physical dice overlay must visibly implement Count → Subclassify.');

check('Resolution advances from recorded results',
  has(/tacticalPreRollResolutionSet\(/) &&
  has(/stage='review'/) &&
  has(/damageResolved/),
  'Recorded physical results must drive the resolution state machine rather than generated dice.');

check('Variable damage remains physical-dice driven',
  has(/tacticalPreRollDamageRange\(/) &&
  has(/Enter the physical Damage result/) &&
  has(/D\[36\]/i),
  'Variable Damage must request the actual tabletop result.');

check('Precision uses individual results when required',
  has(/stage==='precisionSave'/) &&
  has(/stage==='precisionSaveReroll'/) &&
  has(/stage==='precisionDamage'/),
  'Precision allocation requires exact results because allocation changes after each physical result.');

check('Feel No Pain uses count entry where appropriate',
  has(/field==='mixedFnp'/) &&
  has(/mode:'count'/),
  'FNP should collect only the number of wounds ignored when exact faces are unnecessary.');

check('No random dice generation',
  !/(Math\.random\(|crypto\.getRandomValues\()/i.test(html),
  'The battle resolution surface must not generate physical dice results.');

const failures=checks.filter(x=>!x.pass);
console.log(JSON.stringify({audit:'Task 28 Dice Entry Architecture',checks:checks.length,passed:checks.length-failures.length,failed:failures.length,failures},null,2));
if(failures.length)process.exit(1);
