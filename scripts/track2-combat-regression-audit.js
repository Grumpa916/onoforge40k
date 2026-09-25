const fs=require('fs');
const s=fs.readFileSync('index.html','utf8');
const fail=m=>{console.error('FAIL:',m);process.exitCode=1};
const ok=m=>console.log('PASS:',m);

const required=[
 'function tacticalPreRollCheck(',
 'function tacticalPreRollResolutionCurrent(',
 'function tacticalPreRollApplyMixedSaveRolls(',
 'function tacticalPreRollResolveMixedSaveReroll(',
 'function tacticalPreRollResolveMixedFnp(',
 'function tacticalPreRollResolveMixedVariableDamage(',
 'function tacticalPreRollResolveMixedVariableDevastating(',
 'function tacticalPreRollPrecisionTarget(',
 'function tacticalPreRollPrecisionPushHistory(',
 'function tacticalPreRollDamageRange(',
 'function tacticalPreRollDamageMax(',
 'function tacticalPreRollLegalSaveOrder(',
 'function engineFnp(',
 'function engineContext(',
 'function engineSaveDistribution('
];
for(const n of required)s.includes(n)?ok(n+' present'):fail(n+' missing');

const regionStart=s.indexOf('function tacticalPreRollCheck(');
const regionEnd=s.indexOf('function tacticalPreRollResolutionSet(',regionStart);
const physical=regionStart>=0&&regionEnd>regionStart?s.slice(regionStart,regionEnd):'';
physical.length?ok('physical-dice resolution block found'):fail('physical-dice block not found');

if(/Math\.random\s*\(/.test(physical))fail('Math.random found in physical-dice resolution path');
else ok('physical-dice path contains no random generation');

const diceGuards=[
 [/n<1\|\|n>6/,'D6 save-result validation'],
 [/n<damageRange\.min\|\|n>max/,'variable Damage-result validation'],
 [/n<0\|\|n>pending/,'FNP ignored-wound validation'],
 [/Enter the actual physical D6/,'physical result provenance messaging']
];
for(const [re,label] of diceGuards)re.test(s)?ok(label):fail(label+' missing');

[
 [/tacticalPreRollDamageRange\(s\.plan\.weaponDamage/,'variable Damage range resolution'],
 [/vs\.phase='damage'/,'variable Damage pending stage'],
 [/vs\.phase='devastating'/,'Devastating Wounds pending stage'],
 [/mr\.mortalDamage=\(Number\(mr\.mortalDamage\)/,'Devastating damage ledger'],
 [/vs\.kind='devastating'/,'Devastating FNP path'],
 [/tacticalPreRollFnp\(m,s\)/,'FNP gate in damage resolution'],
 [/tacticalPreRollLegalSaveOrder\(/,'legal allocation ordering'],
 [/precisionTargetState/,'Precision target state'],
 [/precisionHistory/,'Precision resolution history'],
 [/tacticalPreRollMixedVariablePushHistory/,'variable-resolution undo history'],
 [/damageRolls\.push\(/,'recorded physical damage results'],
 [/fnpResults\.push\(/,'recorded FNP results']
].forEach(([re,label])=>re.test(s)?ok(label):fail(label+' missing'));

const randomPositions=[...s.matchAll(/Math\.random\s*\(/g)].map(m=>m.index);
const simStart=s.indexOf('function roll(');
const physicalRandom=randomPositions.some(p=>p>=regionStart&&p<regionEnd);
physicalRandom?fail('random generation overlaps physical combat block'):ok('random simulation remains outside physical combat block');

console.log(process.exitCode?'Track 2 audit FAILED':'Track 2 audit PASSED');