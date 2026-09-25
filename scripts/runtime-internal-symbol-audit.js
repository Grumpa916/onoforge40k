#!/usr/bin/env node
'use strict';
const fs=require('fs');
const html=fs.readFileSync('index.html','utf8');
const defs=new Set([...html.matchAll(/function\s+(ensure[A-Za-z0-9_]+)\s*\(/g)].map(m=>m[1]));
const calls=new Set([...html.matchAll(/\b(ensure[A-Za-z0-9_]+)\s*\(/g)].map(m=>m[1]));
const missing=[...calls].filter(name=>!defs.has(name)).sort();
const checks=[
  {name:'Internal ensure* calls have definitions',pass:missing.length===0,missing}
];
console.log(JSON.stringify({audit:'Runtime internal symbol audit',defined:defs.size,called:calls.size,checks},null,2));
if(missing.length)process.exit(1);
