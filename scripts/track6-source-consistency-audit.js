#!/usr/bin/env node
'use strict';
const fs=require('fs');
const html=fs.readFileSync('index.html','utf8');
const manifest=JSON.parse(fs.readFileSync('data/40kapp-source.json','utf8'));
const matrix=JSON.parse(fs.readFileSync('data/rules-coverage-matrix.json','utf8'));
const companion=JSON.parse(fs.readFileSync('data/warhammer-event-companion-v1.2.json','utf8'));
const checks=[];
const check=(name,pass)=>checks.push({name,pass:!!pass});
check('Runtime canonical source matches manifest',html.includes("canonical:{name:'40k.app',manifest:'data/40kapp-source.json',role:'authoritative'}")&&manifest.source.name==='40k.app');
check('Runtime unit revision matches manifest',html.includes("unitRevision:925")&&Number(manifest.source.revision)===925);
check('Runtime Event Companion pin matches active file',html.includes("eventCompanionVersion:'1.2'")&&companion?.source?.version==='1.2');
check('Coverage matrix uses canonical source',matrix.canonicalSource==='40k.app'&&matrix.edition==='11th');
check('Coverage matrix areas are uniquely owned',Array.isArray(matrix.coverage)&&matrix.coverage.length>=10&&new Set(matrix.coverage.map(x=>x.area)).size===matrix.coverage.length);
const failures=checks.filter(x=>!x.pass);
console.log(JSON.stringify({audit:'Track 6 source consistency audit',checks,failures},null,2));
if(failures.length)process.exit(1);
