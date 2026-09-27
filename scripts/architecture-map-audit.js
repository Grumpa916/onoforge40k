#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const workflow = fs.readFileSync(path.join(ROOT, '.github', 'workflows', 'deploy.yml'), 'utf8');

const checks = [];
const warnings = [];

function check(name, pass, detail='') {
  checks.push({name, pass: !!pass, detail});
}

function warn(name, condition, detail='') {
  if (condition) warnings.push({name, detail});
}

// Source shape
const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
const externalScripts = [...html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)].map(m => m[1]);

check('Single inline application script is present', scripts.length === 1,
  `found ${scripts.length} inline script block(s)`);
check('No external script imports currently hide application code', externalScripts.length === 0,
  externalScripts.join(', ') || 'none');
check('Application remains a single HTML entry point', fs.existsSync(path.join(ROOT, 'index.html')));

// Shared state boundaries
check('Global battle state exists', /\bstate\s*=|let state\s*=|const state\s*=/.test(html));
check('Deployment plan state exists', /state\.deploymentPlans|function ensureDeploymentPlans\(/.test(html));
check('Live battlefield position state exists', /state\.battlefieldUnitPositions|function ensureBattlefieldUnitPositions\(/.test(html));
check('Reserve state exists', /state\.reserveDeclarations|function ensureReserveState\(/.test(html));
check('Tactical state exists', /function ensureTacticalState\(/.test(html));
check('Model roster normalization exists', /function ensureModelRoster\(/.test(html));

// Identity boundaries
const modelIdPatterns = {
  persistentRoster: /[+']-m(?:'|\d)/.test(html),
  snapshotOrdinal: /-model-/.test(html),
  availabilityMapping: /Generic combat snapshots use UID-model-N ids/.test(html)
};
check('Model snapshot identity exists', modelIdPatterns.snapshotOrdinal);
check('Model roster identity exists', modelIdPatterns.persistentRoster);
check('Current model-ID compatibility mapping is explicit', modelIdPatterns.availabilityMapping);

warn('Two model-ID conventions still exist', modelIdPatterns.persistentRoster && modelIdPatterns.snapshotOrdinal,
  'Keep the compatibility mapping until canonical model identity is extracted in the refactor.');

// Deployment/map boundaries
check('Deployment plan and live position setters are distinct',
  /function setDeploymentPlanPosition\(/.test(html) &&
  /function setBattlefieldUnitPosition\(/.test(html));
check('Reserve deployment uses the live battlefield setter',
  /setBattlefieldUnitPosition\(side,uid,x,y,'reserve'\)/.test(html));
check('Movement uses the live battlefield setter',
  /setBattlefieldUnitPosition\(d\.side,d\.uid,x,y,'movement'\)/.test(html));
check('Deployment and live position events are distinct',
  /UNIT_DEPLOYED/.test(html) && /UNIT_BATTLEFIELD_POSITION_CHANGED/.test(html));

// Tactical / combat boundaries
check('Shooting Result renders the Pre-Roll component',
  /expected\+tacticalPreRollHtml\(\)/.test(html));
check('Physical dice resolution entry point exists',
  /function tacticalPreRollOpenResolution\(/.test(html));
const physicalStart = html.indexOf('function tacticalPreRoll');
const physicalEnd = html.indexOf('function engineExpectedDice', physicalStart);
const physicalDiceSurface = physicalStart >= 0 && physicalEnd > physicalStart ? html.slice(physicalStart, physicalEnd) : '';
check('Physical dice resolution is not RNG-driven',
  !(/Math\\.random\\(|crypto\\.getRandomValues\\(/i.test(physicalDiceSurface)),
  'Random generation is allowed elsewhere for Mathhammer simulation but must not appear in the physical-dice resolution surface.');
check('Combat snapshot layer exists',
  /function combatSnapshot\(/.test(html));
check('Weapon availability checks model identity',
  /function tacticalWeaponModelAvailable\(/.test(html));

// Rendering / state assembly
check('Single central render entry point exists', /function render\(/.test(html));
check('Battle rendering composes map and shooting systems',
  /objectiveMapRendererHtml\(|tacticalShootingResultHtml\(/.test(html));

// Supporting modules
const supportModules = [
  'battleCheckpoint.js',
  'battleCheckpointAdapter.js',
  'battleCheckpointMapper.js',
  'battleStateInspector.js',
  'checkpointIntegrationPlan.js',
  'checkpointLoader.js'
];
const unloaded = supportModules.filter(name => !new RegExp('src=["\'][^"\']*' + name.replace('.', '\.') + '["\']').test(html));
check('Checkpoint helper modules remain clearly separate from app runtime',
  unloaded.length === supportModules.length,
  unloaded.length === supportModules.length ? 'diagnostic modules are not imported by index.html' : unloaded.join(', '));

// CI/deployment architecture
const deploymentWorkflowFiles = fs.existsSync(path.join(ROOT, '.github', 'workflows'))
  ? fs.readdirSync(path.join(ROOT, '.github', 'workflows')).filter(x => x.endsWith('.yml') || x.endsWith('.yaml'))
  : [];
check('Exactly one GitHub Actions deployment workflow is present', deploymentWorkflowFiles.length === 1,
  deploymentWorkflowFiles.join(', '));

warn('Deployment workflow mutates the Pages artifact after checkout',
  /p\.write_text\(html, encoding="utf-8"\)/.test(workflow),
  'Current deployment adds a generated Tactical Advisor render surface before publishing. This should become source-owned during UI modularization.');

warn('Deployment workflow still performs source-shape injection',
  /Render Tactical Advisor decision surface/.test(workflow),
  'Target architecture should remove post-checkout application mutation after the extracted UI is committed to source.');

// Function inventory
const functions = [...new Set([...html.matchAll(/(?:^|\n)\s*(?:async\s+)?function\s+([A-Za-z0-9_$]+)\s*\(/g)].map(m => m[1]))];

console.log(JSON.stringify({
  audit: 'ONOForge 40K architecture map audit',
  summary: {
    htmlBytes: html.length,
    inlineScriptBytes: scripts[0]?.length || 0,
    namedFunctions: functions.length,
    externalScriptImports: externalScripts.length,
    deploymentWorkflowFiles: deploymentWorkflowFiles.length
  },
  checks: {
    total: checks.length,
    passed: checks.filter(x => x.pass).length,
    failed: checks.filter(x => !x.pass).length
  },
  warnings
}, null, 2));

const failures = checks.filter(x => !x.pass);
if (failures.length) {
  console.error('ARCHITECTURE AUDIT FAILED');
  for (const f of failures) console.error('FAIL:', f.name, f.detail);
  process.exit(1);
}

console.log('ARCHITECTURE AUDIT PASSED');
