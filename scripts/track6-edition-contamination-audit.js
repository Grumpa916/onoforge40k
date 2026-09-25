#!/usr/bin/env node
'use strict';
const fs=require('fs');
const files=['index.html',...fs.readdirSync('scripts').filter(x=>x.endsWith('.js')).map(x=>'scripts/'+x)];
const obsolete=[/Big Guns Never Tire/i,/\b10th edition\b/i];
const findings=[];
for(const file of files){
 const text=fs.readFileSync(file,'utf8');
 for(const re of obsolete)if(re.test(text))findings.push({file,pattern:String(re)});
}
console.log(JSON.stringify({audit:'Track 6 edition contamination audit',scanned:files.length,findings},null,2));
if(findings.length)process.exit(1);
