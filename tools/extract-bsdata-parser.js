#!/usr/bin/env node
/**
 * Deterministically produces the first BSData extraction of index.html.
 *
 * The tool removes the eight parser functions from the monolith, loads
 * js/data/bsdata-parser.js before the inline application script, replaces the
 * two application call sites with the explicit parser/context boundary, and
 * removes the now-unused hidden object-map global.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root, 'index.html');
const outputPath = path.join(root, 'index.extracted.html');

const FUNCTIONS = [
  'collectBSDataObjects',
  'bsProfile',
  'bsCharacteristics',
  'normalize11eWeaponAbilities',
  'bsAbilities',
  'bsWeapons',
  'bsWargearOptions',
  'bsUnitFromEntry'
];

function extractFunction(source, name) {
  const marker = `function ${name}(`;
  const start = source.indexOf(marker);
  if (start < 0) throw new Error(`Function not found: ${name}`);
  const brace = source.indexOf('{', start);
  let depth = 0;
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;
  for (let i = brace; i < source.length; i++) {
    const c = source[i];
    const n = source[i + 1];
    if (lineComment) { if (c === '\n') lineComment = false; continue; }
    if (blockComment) { if (c === '*' && n === '/') { blockComment = false; i++; } continue; }
    if (quote) {
      if (escaped) { escaped = false; continue; }
      if (c === '\\') { escaped = true; continue; }
      if (c === quote) quote = null;
      continue;
    }
    if (c === '/' && n === '/') { lineComment = true; i++; continue; }
    if (c === '/' && n === '*') { blockComment = true; i++; continue; }
    if (c === '"' || c === "'" || c === '`') { quote = c; continue; }
    if (c === '{') depth++;
    else if (c === '}' && --depth === 0) return [start, i + 1];
  }
  throw new Error(`Unterminated function: ${name}`);
}

let source = fs.readFileSync(sourcePath, 'utf8');
const ranges = FUNCTIONS.map(name => extractFunction(source, name));
for (const [start, end] of ranges.sort((a, b) => b[0] - a[0])) source = source.slice(0, start) + source.slice(end);

source = source.replace(
  'const map=collectBSDataObjects(root);',
  'const map=window.OnoForgeBSDataParser.collectBSDataObjects(root);'
);
source = source.replace(
  'const u=bsUnitFromEntry(entry,faction);',
  'const u=window.OnoForgeBSDataParser.bsUnitFromEntry(entry,faction,{objectMap:map});'
);
source = source.replace('      window.__BS_OBJECT_MAP=map;\\n', '');

const loader = '<div id="app"></div><script src="js/data/bsdata-parser.js"></script><script>';
if (!source.includes(loader)) {
  const needle = '<div id="app"></div><script>';
  if (!source.includes(needle)) throw new Error('Application inline script anchor not found');
  source = source.replace(needle, loader);
}

fs.writeFileSync(outputPath, source, 'utf8');
console.log(`Wrote ${outputPath}`);
console.log(`Removed ${FUNCTIONS.length} parser functions and wired explicit parser context.`);
