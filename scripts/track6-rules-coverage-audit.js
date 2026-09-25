#!/usr/bin/env node
'use strict';

const fs=require('fs');
const html=fs.readFileSync('index.html','utf8');
const source=JSON.parse(fs.readFileSync('data/40kapp-source.json','utf8'));
const companion=JSON.parse(fs.readFileSync('data/warhammer-event-companion-v1.2.json','utf8'));
const matrix=JSON.parse(fs.readFileSync('data/rules-coverage-matrix.json','utf8'));
const checks=[];
const check=(name,pass,detail)=>checks.push({name,pass:!!pass,detail});
const has=re=>re.test(html);

check('Coverage matrix has complete source/runtime/audit ownership',
  matrix?.edition==='11th'&&matrix?.canonicalSource==='40k.app'&&Array.isArray(matrix?.coverage)&&matrix.coverage.length>=10&&matrix.coverage.every(x=>x?.area&&x?.source&&x?.runtime&&x?.audit),
  'Every tracked rules area must identify its source, runtime consumer, and regression audit.');
check('40k.app manifest declares all core rules data domains',
  Array.isArray(source.dataDomains)&&['datasheets','unitProfiles','weapons','abilities','wargear','unitComposition','leaderAttachments','points','armyRules','detachments','enhancements','stratagems','coreRules','missions'].every(x=>source.dataDomains.includes(x)),
  'The provenance manifest must cover every major rules-data domain the application can consume.');
check('Faction catalogue is explicitly enumerated',
  Array.isArray(source.factions)&&source.factions.length>=38&&source.factions.every(x=>x&&x.name&&x.slug),
  'The canonical source manifest must retain an explicit faction index rather than an unbounded inferred list.');
check('Core rules sections include attack, phases, objectives, stratagems and reserves',
  Array.isArray(source.coreRuleSections)&&['04-making-attacks','05-attack-sequence','08-command-phase','09-movement-phase','10-shooting-phase','11-charge-phase','12-fight-phase','14-objectives','15-stratagems','20-strategic-reserves'].every(x=>source.coreRuleSections.includes(x)),
  'The manifest must identify the core rules areas required by the tournament engine.');
check('Runtime canonical-source policy is authoritative',
  has(/name:'40k\.app'[sS]{0,500}role:'authoritative'/),
  'Runtime must identify 40k.app as the canonical source.');
check('Runtime preserves supplemental-source boundaries',
  has(/role:'supplemental'/)&&has(/role:'fallback-only'/),
  'Supplemental/reference data must remain visibly non-canonical.');
check('Active Event Companion is official and verified',
  companion?.source?.version==='1.2'&&/^https:\/\/assets\.warhammer-community\.com\//.test(String(companion?.source?.sourceUrl||''))&&Array.isArray(companion?.layoutGeometry?.layouts)&&companion.layoutGeometry.layouts.length===45&&companion.layoutGeometry.layouts.every(x=>x?.verified===true),
  'The active mission/geometry dataset must remain tied to the official v1.2 source and 45 verified layouts.');
check('Active battle pins rules provenance',
  has(/state\.rulesDataPin/)&&has(/ONOFORGE_RULES_DATA_PIN/)&&has(/rulesDataPin:state\.rulesDataPin/),
  'Tournament state must preserve the exact rules-data provenance used at battle start.');
check('Legacy 10th-edition Big Guns rule remains absent',
  !/Big Guns Never Tire/i.test(html),
  'The application must not silently reintroduce the obsolete rule text.');
const failures=checks.filter(x=>!x.pass);
console.log(JSON.stringify({audit:'Track 6 rules coverage audit',checks:checks.length,passed:checks.length-failures.length,failed:failures.length,failures},null,2));
if(failures.length)process.exit(1);
