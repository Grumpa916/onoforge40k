#!/usr/bin/env node
'use strict';
const fs=require('fs');
const html=fs.readFileSync('index.html','utf8');
const checks=[];
const check=(name,pass,detail)=>checks.push({name,pass:!!pass,detail});
const has=re=>re.test(html);
check('Tournament lifecycle state exists',has(/tournamentLifecycle:'SETUP'/)&&has(/ensureTournamentLifecycle\(/)&&has(/setTournamentLifecycle\(/),'Lifecycle must distinguish setup, deployment, live battle and completed result states.');
check('Battle completion transitions to COMPLETED',has(/state\.battleResultLocked=true[\s\S]{0,180}setTournamentLifecycle\('COMPLETED'\)/), 'Completed battles must enter an explicit locked lifecycle.');
check('Battle start clears result lock and enters LIVE',has(/state\.battleResultLocked=false[\s\S]{0,180}state\.battleResult=null/)&&has(/setTournamentLifecycle\('LIVE'\)/),'Starting a new battle must explicitly reopen the authoritative battle state.');
check('VP and CP mutations are locked after completion',has(/function changeVP\\(side,d\\)\\{\\s*if\\(!battleMutationAllowed\\('VP changes'\\)\\)/), 'Final tournament results must not be altered through manual score controls.'');
check('Phase and round mutations are locked after completion',has(/function advancePhase\\(\\)\\{\\s*if\\(!battleMutationAllowed\\('phase changes'\\)\\)/), 'Final tournament results must remain stable after completion.'');
check('Secondary scoring is locked after completion',has(/function scoreSecondary\\(side,name,vpInput,rowMeta=null\\)\\{\\s*if\\(!battleMutationAllowed\\('secondary scoring'\\)\\)/), 'Scoring controls must respect the completed result lock.'');
check('Tournament result export remains read-only',has(/if\(!state\.battleEnded\|\|!state\.battleResult\)/)&&has(/JSON\.stringify\(state\.battleResult/),'Result export must consume the captured snapshot rather than recomputing mutable state.');
const failures=checks.filter(x=>!x.pass);
console.log(JSON.stringify({audit:'Track 5 result locking and lifecycle audit',checks:checks.length,passed:checks.length-failures.length,failed:failures.length,failures},null,2));
if(failures.length)process.exit(1);
