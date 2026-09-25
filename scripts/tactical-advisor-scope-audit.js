const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const checks=[];
const check=(name,condition,detail='')=>checks.push({name,pass:!!condition,detail});

const advisorStart=html.indexOf('function tacticalAdvisor(');
const advisorEnd=html.indexOf('function math(){',advisorStart);
const advisor=advisorStart>=0&&advisorEnd>advisorStart?html.slice(advisorStart,advisorEnd):'';
const explanationStart=advisor.indexOf('x.recommendationExplanation={');
const explanationEnd=advisor.indexOf('};',explanationStart);
const explanation=explanationStart>=0&&explanationEnd>explanationStart?advisor.slice(explanationStart,explanationEnd):'';
const pairDecl=advisor.indexOf('const pairDecisionCtx=tacticalPairState(atkEntry.uid,x.entryUid);');
const pairRefs=(advisor.match(/\bpairDecisionCtx\b/g)||[]).length;

check('Tactical Advisor function boundary is present',advisor.length>0,
  'The Tactical Advisor audit must operate on the intended function rather than an unrelated code block.');
check('pairDecisionCtx has a local declaration',pairDecl>=0,
  'Target-pair context must be declared inside the recommendation evaluation scope.');
check('pairDecisionCtx is not referenced in the explanation block',
  explanation.length>0 && !/\bpairDecisionCtx\b/.test(explanation),
  'Recommendation explanation must consume persisted recommendation data rather than an out-of-scope pair context variable.');
check('Primary target impact is persisted before explanation rendering',
  advisor.indexOf('x.exchangeComponents.primaryTargetImpact=primaryTargetImpact;')>=0 &&
  explanation.includes('x.exchangeComponents?.primaryTargetImpact'),
  'Primary scoring impact must be stored on the recommendation before the explanation is constructed.');
check('Primary target impact is not read as an out-of-scope bare variable in explanation',
  explanation.length>0 && !/(^|[^.\\w])primaryTargetImpact\b/.test(explanation),
  'The explanation block must not directly reference the local primaryTargetImpact variable.');
check('pairDecisionCtx references are confined to the Tactical Advisor',
  pairRefs>0 && (html.match(/\bpairDecisionCtx\b/g)||[]).length===pairRefs,
  'The pair context symbol should not leak into unrelated global/UI code.');
check('Objective pair context is separated from decision pair context',
  advisor.includes('const objectivePairCtx=tacticalPairState(atkEntry.uid,x.entryUid);') &&
  advisor.includes('const primaryTargetImpact=tacticalPrimaryTargetImpact(entry(\'opp\',x.entryUid),objectivePairCtx);'),
  'Primary scoring impact uses an explicitly named objective pair context.');

const failures=checks.filter(x=>!x.pass);
console.log(JSON.stringify({audit:'Task 29 Tactical Advisor scope regression',checks:checks.length,passed:checks.length-failures.length,failed:failures.length,failures},null,2));
if(failures.length)process.exit(1);
