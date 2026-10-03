#!/usr/bin/env node
/**
 * OnoForge 40K — BSData baseline harness
 *
 * Loads only the BSData parser function family from the verified index.html
 * inside an isolated Node VM context. It does not execute the application,
 * bootstrap the UI, mutate battle state, or perform network requests.
 */

const fs = require('fs');
const path = require('path');
const { createParserFromFile } = require('./bsdata-baseline-adapter');

const repoRoot = path.resolve(__dirname, '..');
const sourcePath = path.join(repoRoot, 'index.html');
const fixtureDir = path.join(repoRoot, 'tests', 'fixtures', 'bsdata-baseline');
const EXPECTED_SOURCE_SHA = '4941fcffc41072fd9f60dcf870a0227b4437b74c';

function readSource() {
  return fs.readFileSync(sourcePath, 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function gitBlobSha(content) {
  const crypto = require('crypto');
  const header = Buffer.from(`blob ${Buffer.byteLength(content)}\0`, 'utf8');
  return crypto.createHash('sha1').update(Buffer.concat([header, Buffer.from(content, 'utf8')])).digest('hex');
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') {
    return Object.keys(value).sort().reduce((out, key) => {
      out[key] = stable(value[key]);
      return out;
    }, {});
  }
  return value;
}

function stableSerialize(value) {
  return JSON.stringify(stable(value), null, 2) + '\n';
}

function ensureFixtureDir() {
  fs.mkdirSync(fixtureDir, { recursive: true });
}

function writeFixture(name, value) {
  ensureFixtureDir();
  fs.writeFileSync(path.join(fixtureDir, `${name}.json`), stableSerialize(value), 'utf8');
}

function makeSyntheticUnit(overrides = {}) {
  const base = {
    id: 'unit-normal',
    type: 'unit',
    name: 'Baseline Test Unit',
    profiles: [{
      typeName: 'Unit',
      characteristics: [
        { name: 'M', $text: '6"' },
        { name: 'T', $text: '4' },
        { name: 'W', $text: '2' },
        { name: 'LD', $text: '7' }
      ]
    }],
    costs: [{ name: 'pts', value: 100 }],
    categoryLinks: [{ name: 'INFANTRY' }],
    selectionEntries: [
      {
        id: 'weapon-1',
        profiles: [{
          typeName: 'Ranged Weapons',
          name: 'Baseline Rifle',
          characteristics: [
            { name: 'Range', $text: '24"' },
            { name: 'A', $text: '2' },
            { name: 'BS', $text: '3+' },
            { name: 'S', $text: '4' },
            { name: 'AP', $text: '0' },
            { name: 'D', $text: '1' },
            { name: 'Keywords', $text: 'PISTOL' }
          ]
        }]
      }
    ]
  };
  return { ...base, ...overrides };
}

function main() {
  const source = readSource();
  const sourceSha = gitBlobSha(source);
  assert(sourceSha === EXPECTED_SOURCE_SHA, `Unexpected index.html blob SHA: ${sourceSha}`);

  const parser = createParserFromFile(sourcePath);
  const root = makeSyntheticUnit();
  const result = parser.parseUnit(root, 'TEST', root);

  assert(result && result.name === 'Baseline Test Unit', 'Parser did not produce expected unit');
  assert(result.profile.Ld === '7', 'LD -> Ld normalization failed');
  assert(result.weapons.length === 1, 'Expected one baseline weapon');
  assert(result.weapons[0].abilities.includes('CLOSE QUARTERS'), 'PISTOL normalization failed');

  console.log('BSData baseline adapter verified.');
  console.log(`Source SHA: ${sourceSha}`);
  console.log(`Loaded parser functions: ${parser ? 'yes' : 'no'}`);
  console.log('Application bootstrap was not executed.');
  console.log('Synthetic baseline output was validated in isolation.');

  // Fixture writing is intentionally not enabled until the representative
  // baseline set is finalized. This first run proves the adapter boundary.
  void writeFixture;
}

main();
