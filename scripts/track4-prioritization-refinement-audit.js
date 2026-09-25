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
  return v2>=0&&pressure>v2&&priority>pressure&&priority>v1;
})(),'Stratagem-aware prioritization must execute in v2, after the pressure object is available.');
check('No v1 prioritization references undefined stratagem pressure',(()=>{
  const v1=html.indexOf('function tacticalAdvisorV1(');
  const v2=html.indexOf('function tacticalAdvisorV2(');
  const block=html.slice(v1,v2);
  return !block.includes('stratagemPressure?.pressure')&&!block.includes('advisorStratagemPressure');
})(),'v1 must remain independent of v2-only stratagem pressure state.');
check('Advisor preserves confidence and objective tie breakers',html.includes('decisionConfidence')&&html.includes('objectiveValue'));
check('Advisor surfaces near-tie threshold',html.includes('const nearTieThreshold=0.015'));
const failures=checks.filter(x=>!x.pass);
console.log(JSON.stringify({audit:'Track 4 prioritization refinement audit',checks,failures},null,2));
if(failures.length)process.exit(1);
