#!/usr/bin/env node
'use strict';
const fs=require('fs');
const html=fs.readFileSync('index.html','utf8');
const checks=[];
const check=(name,pass,detail)=>checks.push({name,pass:!!pass,detail});
check('Advisor derives stratagem pressure inputs',html.includes("Number(stratagemPressure?.pressure)")&&html.includes("Number(stratagemPressure?.preserveCP)"));
check('Advisor exposes stratagem pressure adjustment',html.includes('stratagemPressureAdjustment')&&html.includes('priorityScore'));
check('Advisor sorts by refined priority score',html.includes('Number(b.priorityScore??b.decisionScore'));
check('Prioritization runs inside v2 after stratagem pressure exists',(()=>{
  const v2=html.indexOf('function tacticalAdvisorV2(');
  const pressure=html.indexOf('const stratagemPressure=tacticalAdvisorStratagemPressure(battle,top);',v2);
  const priority=html.indexOf('x.priorityScore=',v2);
  const v1=html.indexOf('function tacticalAdvisorV1(');
  return v2>=0&&pressure>v2&&priority>pressure&&priority<(v1>v2?v1:html.length);
})(),'Stratagem-aware prioritization must execute in v2, after the pressure object is available.');
check('No v1 prioritization references undefined stratagem pressure',(()=>{
  const v1=html.indexOf('function tacticalAdvisorV1(');
  if(v1<0)return false;
  const nextFns=[html.indexOf('function tacticalAdvisorV2(',v1+1),html.indexOf('function getTacticalAdvisorV2Result(',v1+1)].filter(i=>i>=0);
  const end=nextFns.length?Math.min(...nextFns):html.length;
  const block=html.slice(v1,end);
  return !block.includes('stratagemPressure?.pressure')&&!block.includes('advisorStratagemPressure');
})(),'v1 must remain independent of v2-only stratagem pressure state.');
check('Advisor preserves confidence and objective tie breakers',html.includes('decisionConfidence')&&html.includes('objectiveValue'));
check('Advisor surfaces near-tie threshold',html.includes('const nearTieThreshold=0.015'));
check('v2 refreshes explanation after final priority sort',(()=>{
  const v2=html.indexOf('function tacticalAdvisorV2(');
  const sort=html.indexOf('recommendations.sort((a,b)=>',v2);
  const refresh=html.indexOf('const v2NearTieThreshold=0.015;',v2);
  const top=html.indexOf('const top=recommendations[0]||null;',v2);
  return v2>=0&&sort>v2&&refresh>sort&&top>refresh&&
    html.includes('x.recommendationExplanation={')&&
    html.includes('rank:i+1')&&html.includes('nearTie:margin<=v2NearTieThreshold');
})(),'Final v2 recommendation explanations must be recalculated after priorityScore sorting.');
check('v2 close-call alert uses final sorted recommendation',(()=>{
  const v2=html.indexOf('function tacticalAdvisorV2(');
  const top=html.indexOf('const top=recommendations[0]||null;',v2);
  const alert=html.indexOf('top?.recommendationExplanation?.nearTie',v2);
  return top>=0&&alert>top;
})(),'The v2 close-call alert must inspect the post-sort top recommendation.');
const failures=checks.filter(x=>!x.pass);
console.log(JSON.stringify({audit:'Track 4 prioritization refinement audit',checks,failures},null,2));
if(failures.length)process.exit(1);
