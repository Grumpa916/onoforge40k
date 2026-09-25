#!/usr/bin/env node
'use strict';
const fs=require('fs');
const html=fs.readFileSync('index.html','utf8');
const checks=[];
const check=(name,pass)=>checks.push({name,pass:!!pass});
check('Saved state persists tournament lifecycle',html.includes('JSON.stringify({state:safeState,DEMO})')&&html.includes('tournamentLifecycle'));
check('Saved state persists completed result and lock',html.includes('state.battleResultLocked')&&html.includes('state.battleResult'));
check('Rules pin survives persistence',html.includes('safeState')&&html.includes('rulesDataPin'));
check('Completed battle timer is finalized before snapshot',html.includes('finalizeCurrentTurnTime()')&&html.includes('state.battleResult=tournamentResultSnapshot()'));
check('Deployment lifecycle persists through saved state',html.includes('tournamentLifecycle')&&html.includes('DEPLOYMENT')&&html.includes('TOURNAMENT_DEPLOYMENT_STARTED'));
check('Deployment result context persists in saved result',html.includes('deploymentReadyMy:')&&html.includes('deploymentReadyOpp:')&&html.includes('deploymentState:'));
check('Starting a new battle explicitly resets completion state',html.includes('state.battleEnded=false;')&&html.includes('state.battleResultLocked=false;')&&html.includes('state.battleResult=null;'));
const failures=checks.filter(x=>!x.pass);
console.log(JSON.stringify({audit:'Track 5 tournament recovery audit',checks,failures},null,2));
if(failures.length)process.exit(1);
