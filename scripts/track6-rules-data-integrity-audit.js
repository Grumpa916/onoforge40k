#!/usr/bin/env node
'use strict';

/*
 * OnoForge 40K — Track 6 rules-data integrity audit.
 * This gate verifies provenance/version metadata and guards the active
 * Event Companion data path. It is intentionally deterministic.
 */
const fs=require('fs');
const html=fs.readFileSync('index.html','utf8');
const source=JSON.parse(fs.readFileSync('data/40kapp-source.json','utf8'));
const companion=JSON.parse(fs.readFileSync('data/warhammer-event-companion-v1.2.json','utf8'));
const checks=[];
const check=(name,pass,detail)=>checks.push({name,pass:!!pass,detail});

check('Canonical unit/rules source is identified',
  source?.source?.name==='40k.app'&&Number.isFinite(Number(source?.source?.revision)),
  'The canonical rules-data manifest must identify its source and revision.');
check('Canonical source has revision date',
  /^\d{4}-\d{2}-\d{2}$/.test(String(source?.source?.revisionDate||'')),
  'Rules data needs a dated provenance marker.');
check('Event Companion source is versioned',
  companion?.source?.title==='Warhammer Event Companion'&&String(companion?.source?.version)==='1.2',
  'The active Event Companion dataset must be explicitly versioned.');
check('Event Companion has source URL',
  /^https:\/\/assets\.warhammer-community\.com\//.test(String(companion?.source?.sourceUrl||'')),
  'Mission geometry/rules data must retain its official provenance.');
check('Runtime loads Event Companion v1.2',
  html.includes('warhammer-event-companion-v1.2.json')&&!html.includes('warhammer-event-companion-v1.1.json'),
  'The active runtime must not fall back to the obsolete v1.1 Event Companion file.');
check('Canonical source policy is embedded',
  html.includes("name:'40k.app'")&&html.includes("role:'authoritative'"),
  'Runtime source policy must distinguish authoritative data from supplemental/fallback data.');
check('Supplemental sources are explicitly classified',
  html.includes("role:'supplemental'")&&html.includes("role:'fallback-only'"),
  'Non-authoritative sources must not silently become canonical.');
check('Active mission geometry is verified',
  Array.isArray(companion?.layoutGeometry?.layouts)&&companion.layoutGeometry.layouts.length===45&&companion.layoutGeometry.layouts.every(x=>x?.verified===true),
  'The active Event Companion geometry dataset must retain all 45 verified layouts.');
check('Rules-data version is represented in source state',
  /rulesDataVersion|rulesDataRevision|dataRevision|sourceRevision/.test(html),
  'Active state must have a path toward pinning tournament state to the rules-data revision.');

const failures=checks.filter(x=>!x.pass);
console.log(JSON.stringify({
  audit:'Track 6 Rules Data Integrity audit',
  checks:checks.length,
  passed:checks.length-failures.length,
  failed:failures.length,
  failures
},null,2));
if(failures.length)process.exit(1);
