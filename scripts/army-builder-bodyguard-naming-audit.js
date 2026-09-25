#!/usr/bin/env node
'use strict';
const fs=require('fs');
const html=fs.readFileSync('index.html','utf8');
const checks=[];
const check=(name,pass,detail)=>checks.push({name,pass:!!pass,detail});
check('Bodyguard lookup reverses leader attachment map',/function leaderNamesForBodyguard\(u\)\{[\s\S]*Object\.entries\(LEADER_ATTACHMENTS_11E\)/.test(html));
check('Bodyguard candidate path uses reverse lookup',html.includes('const allowed=leaderNamesForBodyguard(get(body.unitId))'));
check('Bodyguard attach validates against reverse lookup',html.includes("!leaderNamesForBodyguard(bu).includes(lu.name)"));
check('Detached eligible Leader retains Bodyguard action',html.includes("const addBodyguardButton=isLeader&&!attachedBodyguard&&bodyguardNamesForLeader(u).length"));
check('Leader detach clears reciprocal link by stable UID comparison',html.includes("filter(id=>String(id)!==String(leaderUid))"));
check('Greek duplicate labels are defined',html.includes("const greek=['α','β','γ'"));
check('Unit display uses Greek labels',html.includes("unitDisplayName(side,e)")&&html.includes("alphaLabel(idx+1)"));
check('Greek labels support repeated groups beyond omega',html.includes("n=Math.floor(n/greek.length)"));
const failures=checks.filter(x=>!x.pass);
console.log(JSON.stringify({audit:'Army Builder Bodyguard + duplicate naming audit',checks,failures},null,2));
if(failures.length)process.exit(1);
