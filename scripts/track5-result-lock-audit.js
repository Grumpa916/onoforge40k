#!/usr/bin/env node
'use strict';
const fs=require('fs');
const html=fs.readFileSync('index.html','utf8');
const checks=[];
const check=(name,pass,detail)=>checks.push({name,pass:!!pass,detail});
const has=x=>html.includes(x);
check('Tournament lifecycle state exists',has("tournamentLifecycle:'SETUP'")&&has('function ensureTournamentLifecycle()')&&has('function setTournamentLifecycle(next)'), 'Lifecycle must distinguish setup, deployment, live battle and completed result states.');
check('Battle completion transitions to COMPLETED',has('state.battleResultLocked=true;')&&has("setTournamentLifecycle('COMPLETED')"),'Completed battles must enter an explicit locked lifecycle.');
check('Battle start clears result lock and enters LIVE',has('state.battleResultLocked=false;')&&has('state.battleResult=null;')&&has("setTournamentLifecycle('LIVE')"),'Starting a new battle must explicitly reopen the authoritative battle state.');
check('VP and CP mutations are locked after completion',has("if(!battleMutationAllowed('VP changes'))return;")&&has("if(!battleMutationAllowed('CP changes'))return;"),'Final tournament results must not be altered through manual score controls.');
check('Phase and round mutations are locked after completion',has("if(!battleMutationAllowed('phase changes'))return;")&&has("if(!battleMutationAllowed('round changes'))return;"),'Final tournament results must remain stable after completion.');
check('Secondary scoring is locked after completion',has("if(!battleMutationAllowed('secondary scoring'))return;"),'Scoring controls must respect the completed result lock.');
check('Completed result retains deployment audit fields',has('deploymentReadyMy:')&&has('deploymentReadyOpp:')&&has('deploymentState:{'),'Result locking must preserve the deployment context captured at battle completion.');
check('Completed result retains transport declarations',has('transportEmbarkations:JSON.parse(JSON.stringify(ensureTransportEmbarkations()))')&&has('tournamentResultIntegrityCheck'),'Locked results must preserve the transport formation declaration state.');
check('Completed result retains explicit lifecycle state',has("tournamentLifecycle:'COMPLETED'")&&has('tournamentResultIntegrityCheck'),'Result locking must preserve the Completed lifecycle as part of authoritative verification.');
check('Result verification covers scoring and final turn state',
  has('primaryMyVP:')&&has('secondaryMyVP:')&&has('battleReadyMy:')&&has('firstTurn:')&&has('currentTurn:')&&has('phase:'),
  'Locked verification must cover final scoring and authoritative turn state, not only total VP.');
check('Result verification covers persisted timer state',
  has('gameElapsedMs:')&&has('turnMyMs:')&&has('turnOppMs:'),
  'Locked verification must detect post-completion timing drift.');
check('Result verification compares structured state deterministically',
  has("const comparable=(value)=>value&&typeof value==='object'?JSON.stringify(value):String(value??'');")&&has('comparable(r[k])!==comparable(expected[k])'),
  'Structured transport and rules-pin data must be compared by value rather than object string coercion.');
check('Tournament result export remains read-only',has('JSON.stringify(state.battleResult,null,2)')&&has('if(!state.battleEnded||!state.battleResult)'), 'Result export must consume the captured snapshot rather than recomputing mutable state.');
const failures=checks.filter(x=>!x.pass);
console.log(JSON.stringify({audit:'Track 5 result locking and lifecycle audit',checks:checks.length,passed:checks.length-failures.length,failed:failures.length,failures},null,2));
if(failures.length)process.exit(1);
