#!/usr/bin/env node
'use strict';
const fs=require('fs');
const html=fs.readFileSync('index.html','utf8');
const checks=[];
const check=(name,pass,detail)=>checks.push({name,pass:!!pass,detail});
const has=re=>re.test(html);

check('Tablet game-at-a-glance dashboard exists',has(/class="battle-dashboard"/)&&has(/class="round-card"/)&&has(/class="score-grid"/),'Tournament players need round/phase and score state visible together.');
check('High-frequency command rail remains sticky',has(/\.battle-bottom-actions\{[^}]*position:sticky/),'Core tournament commands must remain accessible while scrolling.');
check('Primary phase control communicates turn transitions',has(/End Turn → Opponent/)&&has(/End Turn → Next Round/)&&has(/Finish Battle/),'The main transition control must explain its consequence.');
check('Tablet touch targets meet minimum sizing',has(/\.bottom-action-buttons \.btn\{[^}]*min-height:44px/)&&has(/\.battle-control-row \.btn\{[^}]*min-height:44px/),'Primary controls must be finger-operable.');
check('Intermediate tablet layout is explicit',has(/@media \(min-width:701px\) and \(max-width:1100px\)/),'Tablet widths require an intentional responsive profile.');
check('Score controls remain compact',has(/\.score-card\{background:[\s\S]*?padding:9px 10px/)&&has(/\.score-controls \.btn\{[^}]*min-height:22px/),'Frequent score entry should not consume excessive vertical space.');
check('Tactical Advisor remains visible in battle flow',has(/id="onoforge-advisor-render"/)&&has(/tacticalAdvisorV2/),'UX work must not disconnect the decision surface.');
check('Completed battle exposes result export',has(/Export Tournament Result/)&&has(/exportTournamentResult\(\)/),'Tournament UX must provide a direct result handoff after completion.');
check('Legacy 10th-edition rule remains absent',!/Big Guns Never Tire/i.test(html),'Tournament UX must not reintroduce obsolete rules text.');
const failures=checks.filter(x=>!x.pass);
console.log(JSON.stringify({audit:'Track 7 tournament UX audit',checks:checks.length,passed:checks.length-failures.length,failed:failures.length,failures},null,2));
if(failures.length)process.exit(1);
