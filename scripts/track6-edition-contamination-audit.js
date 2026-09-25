#!/usr/bin/env node
'use strict';
const fs=require('fs');
const path=require('path');

// Scan runtime/data surfaces only. Audit scripts intentionally contain obsolete
// edition terms as negative-test assertions and must not contaminate this gate.
const files=['index.html'];
for(const dir of ['data']){
  if(fs.existsSync(dir)){
    for(const name of fs.readdirSync(dir)){
      const full=path.join(dir,name);
      if(fs.statSync(full).isFile()&&/\.(json|js|txt|md)$/i.test(name))files.push(full);
    }
  }
}
const obsolete=[/Big Guns Never Tire/i,/\b10th edition\b/i];
const findings=[];
for(const file of files){
  const text=fs.readFileSync(file,'utf8');
  for(const re of obsolete)if(re.test(text))findings.push({file,pattern:String(re)});
}
console.log(JSON.stringify({audit:'Track 6 edition contamination audit',scanned:files.length,findings},null,2));
if(findings.length)process.exit(1);
