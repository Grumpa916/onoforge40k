#!/usr/bin/env node
'use strict';
const fs=require('fs');
const html=fs.readFileSync('index.html','utf8');
const checks=[];
const check=(name,pass,detail)=>checks.push({name,pass:!!pass,detail});
check('Permanent sample armies are seeded',/function ensurePermanentSampleArmies\(\)/.test(html)&&html.includes('sample-tyranid-skirmish')&&html.includes('sample-ultramarine-infantry')&&html.includes('sample-tyranid-heavy'),'Three stable test fixtures must exist.');
check('Sample armies are restored on every app load',/ensurePermanentSampleArmies\(\);/.test(html),'Seeding must run after persisted state is loaded.');
check('Sample armies are protected from deletion',/function isPermanentSampleArmy\(id\)/.test(html)&&/Permanent test armies cannot be deleted/.test(html),'The fixtures must remain available for repeated testing.');
check('Saved Lists identifies permanent fixtures',/Permanent Test/.test(html),'Test armies should be visually distinguishable from user-created lists.');
check('Sample armies use normal saved-list loading',/loadSavedArmyList\(\x27\$\{x\.id\}\x27\)/.test(html),'Fixtures should exercise the same load path as ordinary saved lists.');
const failures=checks.filter(x=>!x.pass);
console.log(JSON.stringify({audit:'Permanent sample armies audit',checks:checks.length,passed:checks.length-failures.length,failed:failures.length,failures},null,2));
if(failures.length)process.exit(1);
