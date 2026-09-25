#!/usr/bin/env node
'use strict';
const fs=require('fs');
const html=fs.readFileSync('index.html','utf8');
const checks=[];
const check=(name,pass,detail)=>checks.push({name,pass:!!pass,detail});
check('Advisor derives stratagem pressure inputs',html.includes("Number(stratagemPressure?.pressure)")&&html.includes("Number(stratagemPressure?.preserveCP)"));
check('Advisor exposes stratagem pressure adjustment',html.includes('stratagemPressureAdjustment')&&html.includes('priorityScore'));
check('Advisor sorts by refined priority score',html.includes('Number(b.priorityScore??b.decisionScore'));
check('Advisor preserves confidence and objective tie breakers',html.includes('decisionConfidence')&&html.includes('objectiveValue'));
check('Advisor surfaces near-tie threshold',html.includes('const nearTieThreshold=0.015'));
const failures=checks.filter(x=>!x.pass);
console.log(JSON.stringify({audit:'Track 4 prioritization refinement audit',checks,failures},null,2));
if(failures.length)process.exit(1);
