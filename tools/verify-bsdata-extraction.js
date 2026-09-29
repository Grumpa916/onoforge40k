#!/usr/bin/env node
/**
 * Post-extraction verification for the BSData parser boundary.
 *
 * Checks the committed index.html after extraction and runs the seven parser
 * behavior fixtures against js/data/bsdata-parser.js.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const indexPath = path.join(root, 'index.html');
const modulePath = path.join(root, 'js', 'data', 'bsdata-parser.js');
const fixtureDir = path.join(root, 'tests', 'fixtures', 'bsdata-baseline');
const source = fs.readFileSync(indexPath, 'utf8');
const moduleSource = fs.readFileSync(modulePath, 'utf8');

const parserFunctions = [
  'collectBSDataObjects', 'bsProfile', 'bsCharacteristics',
  'normalize11eWeaponAbilities', 'bsAbilities', 'bsWeapons',
  'bsWargearOptions', 'bsUnitFromEntry'
];

for (const name of parserFunctions) {
  if (new RegExp(`function\\s+${name}\\s*\\(`).test(source)) {
    throw new Error(`Parser function remains in index.html: ${name}`);
  }
}
if (!source.includes('js/data/bsdata-parser.js')) throw new Error('Parser module is not loaded by index.html');
if (!source.includes('window.OnoForgeBSDataParser.bsUnitFromEntry(entry,faction,{objectMap:map})')) {
  throw new Error('Explicit parser-context call site not found');
}

const sandbox = { window: {}, console };
vm.createContext(sandbox);
new vm.Script(moduleSource, { filename: modulePath }).runInContext(sandbox);
const parser = sandbox.window.OnoForgeBSDataParser;
if (!parser) throw new Error('Parser module did not initialize');

const prof = (typeName, chars, name = '') => ({
  typeName, name,
  characteristics: Object.entries(chars).map(([name, $text]) => ({ name, $text }))
});
const weapon = (typeName, name, chars) => prof(typeName, chars, name);
const unit = (name, profiles, extra = {}) => ({
  id: `u-${name.toLowerCase().replace(/\\s+/g, '-')}`,
  type: 'unit', name, profiles,
  costs: [{ name: 'pts', value: 100 }],
  categoryLinks: [{ name: 'INFANTRY' }], ...extra
});
const cases = {
  normal_unit: unit('Baseline Squad', [prof('Unit', { M:'6"', T:4, Sv:'3+', W:'2', OC:'1', LD:'7' })]),
  multiple_profiles: unit('Multi Profile', [prof('Unit', { M:'6"', T:4, Sv:'3+', W:'2', OC:'1' }), prof('Abilities', { Description:'Should not be treated as unit stats' }, 'Test Ability'), prof('Other', { X:'Y' }, 'Secondary')]),
  multiple_weapons: unit('Weapons Unit', [prof('Unit', { M:'6"', T:4, Sv:'3+', W:'2', OC:'1' }), weapon('Ranged Weapons', 'Rifle', { A:'2', S:4, AP:'0', D:'1', Keywords:'ASSAULT' }), weapon('Melee Weapons', 'Sword', { A:'4', S:5, AP:'-1', D:'1', Keywords:'TWIN LINKED' })]),
  weapon_abilities: unit('Ability Weapons', [prof('Unit', { M:'6"', T:4, Sv:'3+', W:'2', OC:'1' }), weapon('Ranged Weapons', 'Pistol', { A:'1', S:5, AP:'-1', D:'1', Keywords:'PISTOL' }), weapon('Ranged Weapons', 'Heavy Gun', { A:'2', S:8, AP:'-2', D:'2', Keywords:'HEAVY' })]),
  missing_optional_characteristics: unit('Sparse Unit', [prof('Unit', { T:4, W:'2' })]),
  wargear_options: unit('Wargear Unit', [prof('Unit', { M:'6"', T:4, Sv:'3+', W:'2', OC:'1' })], { selectionEntries:[{type:'upgrade', name:'Power Fist'}, {type:'upgrade', name:'Plasma Gun'}, {type:'upgrade', name:'Power Fist'}] }),
  edge_case_linked_ability: unit('Linked Unit', [prof('Unit', { M:'6"', T:4, Sv:'3+', W:'2', OC:'1', LD:'7' })], { entryLinks:[{id:'ability-1'}], selectionEntries:[{id:'ability-1', profiles:[prof('Abilities', { Description:'Linked ability text' }, 'Linked Ability')]}] })
};

let failures = 0;
for (const name of Object.keys(cases)) {
  const expected = JSON.parse(fs.readFileSync(path.join(fixtureDir, `${name}.json`), 'utf8'));
  const entry = cases[name];
  const map = parser.collectBSDataObjects(entry);
  const actual = parser.bsUnitFromEntry(entry, 'Test Faction', { objectMap: map });
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    failures++;
    console.error(`FAIL ${name}`);
  } else {
    console.log(`PASS ${name}`);
  }
}
if (failures) process.exit(1);
console.log('BSData extraction verification: 7/7 behavioral cases pass.');
