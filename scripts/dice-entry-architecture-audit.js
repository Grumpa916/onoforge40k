const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const checks=[];
const check=(name,condition,detail='')=>checks.push({name,pass:!!condition,detail});
const has=re=>re.test(html);
// Scope architecture checks to the physical-dice battle resolution surface.
// The separate Mathhammer engine intentionally contains simulation-only random sampling.
const preRollStart=html.indexOf('function tacticalPreRoll');
const preRollEnd=html.indexOf('function engineExpectedDice',preRollStart);
const preRoll=preRollStart>=0&&preRollEnd>preRollStart?html.slice(preRollStart,preRollEnd):'';
const hasPreRoll=re=>re.test(preRoll);

check('Physical dice authority is explicit',
  has(/PHYSICAL DICE AUTHORITY INVARIANT/) &&
  has(/never generates, predicts, or assumes a physical dice result/),
  'Dice resolution must treat tabletop physical dice as authoritative.');

check('Count-first architecture exists',
  hasPreRoll(/mode:\s*'count'/) &&
  hasPreRoll(/tacticalPreRollDiceRequirement\(field,s\)/) &&
  hasPreRoll(/field\s*===\s*'hits'/) &&
  hasPreRoll(/field\s*===\s*'wounds'/),
  'Successful hit/wound entry should use counts when exact die faces are unnecessary.');

check('Subclassify only when required',
  hasPreRoll(/mode:\s*'subclassify'/) &&
  hasPreRoll(/field\s*===\s*'criticalHits'/) &&
  hasPreRoll(/field\s*===\s*'criticalWounds'/) &&
  hasPreRoll(/field\s*===\s*'lethalHits'/),
  'Critical and Lethal classifications must be requested only where downstream rules require them.');

check('Exact physical results are reserved for resolution',
  hasPreRoll(/field\s*===\s*'precisionSave'/) &&
  hasPreRoll(/field\s*===\s*'precisionSaveReroll'/) &&
  hasPreRoll(/field\s*===\s*'precisionDamage'/) &&
  hasPreRoll(/field\s*===\s*'mixedVariableSave'/) &&
  hasPreRoll(/field\s*===\s*'mixedDamage'/),
  'Individual die faces must be collected only where allocation, re-rolls, variable damage, or similar rules require them.');

check('Dice inputs are bounded',
  has(/n<0\|\|n>Number\(max\|\|0\)/) &&
  has(/n<Math\.max\(1,Number\(min\)\|\|1\)\|\|n>Number\(max\|\|6\)/),
  'Count and exact-result entry must reject impossible physical results.');

check('UI exposes staged entry',
  hasPreRoll(/HITS • COUNT/) &&
  hasPreRoll(/HITS • SUBCLASSIFY/) &&
  hasPreRoll(/WOUNDS • COUNT/) &&
  hasPreRoll(/WOUNDS • SUBCLASSIFY/),
  'The physical dice overlay must visibly implement Count → Subclassify.');

check('Resolution advances from recorded results',
  hasPreRoll(/tacticalPreRollResolutionSet\(/) &&
  hasPreRoll(/stage='review'/) &&
  hasPreRoll(/damageResolved/),
  'Recorded physical results must drive the resolution state machine rather than generated dice.');

check('Variable damage remains physical-dice driven',
  hasPreRoll(/tacticalPreRollDamageRange\(/) &&
  hasPreRoll(/Enter the physical Damage result/) &&
  hasPreRoll(/D\[36\]/i),
  'Variable Damage must request the actual tabletop result.');

check('Precision uses individual results when required',
  hasPreRoll(/stage\s*===\s*'precisionSave'/) &&
  hasPreRoll(/stage\s*===\s*'precisionSaveReroll'/) &&
  hasPreRoll(/stage\s*===\s*'precisionDamage'/),
  'Precision allocation requires exact results because allocation changes after each physical result.');

check('Feel No Pain uses count entry where appropriate',
  hasPreRoll(/field\s*===\s*'mixedFnp'/) &&
  hasPreRoll(/mode:\s*'count'/),
  'FNP should collect only the number of wounds ignored when exact faces are unnecessary.');

check('No random dice generation',
  !/(Math\.random\(|crypto\.getRandomValues\()/i.test(preRoll),
  'The battle resolution surface must not generate physical dice results.');

const failures=checks.filter(x=>!x.pass);
console.log(JSON.stringify({audit:'Task 28 Dice Entry Architecture',checks:checks.length,passed:checks.length-failures.length,failed:failures.length,failures},null,2));
if(failures.length)process.exit(1);
