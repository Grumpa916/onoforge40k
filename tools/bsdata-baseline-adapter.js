const fs = require('fs');
const vm = require('vm');

const REQUIRED_FUNCTIONS = [
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
  if (brace < 0) throw new Error(`Function body not found: ${name}`);

  let depth = 0;
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let i = brace; i < source.length; i++) {
    const c = source[i];
    const n = source[i + 1];

    if (lineComment) {
      if (c === '\n') lineComment = false;
      continue;
    }
    if (blockComment) {
      if (c === '*' && n === '/') { blockComment = false; i++; }
      continue;
    }
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
    else if (c === '}' && --depth === 0) return source.slice(start, i + 1);
  }

  throw new Error(`Unterminated function: ${name}`);
}

function createParserFromSource(source) {
  const extracted = REQUIRED_FUNCTIONS.map(name => extractFunction(source, name)).join('\n');
  const sandbox = { window: {}, console };
  vm.createContext(sandbox);
  new vm.Script(extracted, { filename: 'onoforge-bsdata-parser-adapter.js' }).runInContext(sandbox);

  for (const name of REQUIRED_FUNCTIONS) {
    if (typeof sandbox[name] !== 'function') throw new Error(`Adapter failed to load ${name}`);
  }

  return {
    collectBSDataObjects: sandbox.collectBSDataObjects,
    parseUnit(entry, faction, root = entry) {
      const objectMap = sandbox.collectBSDataObjects(root);
      sandbox.window.__BS_OBJECT_MAP = objectMap;
      return sandbox.bsUnitFromEntry(entry, faction);
    },
    normalizeWeaponAbilities: sandbox.normalize11eWeaponAbilities,
    extractFunction: name => extractFunction(source, name)
  };
}

function createParserFromFile(sourcePath) {
  return createParserFromSource(fs.readFileSync(sourcePath, 'utf8'));
}

module.exports = {
  REQUIRED_FUNCTIONS,
  extractFunction,
  createParserFromSource,
  createParserFromFile
};
