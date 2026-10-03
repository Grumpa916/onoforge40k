const fs = require('fs');
const src = fs.readFileSync('index.html', 'utf8');

const targets = [
  'objectiveMapModel',
  'objectiveMapUnitNodesHtml',
  'objectiveMapPlanGhostNodesHtml',
  'deploymentPlanMapControlsHtml',
  'deploymentTrackingControlsHtml',
  'deploymentTrackingEditorHtml',
  'objectiveMapPlacementPanelHtml',
  'terrainReferenceImageHtml',
  'objectiveMapRendererHtml'
];

function extractFunction(name) {
  const re = new RegExp(`(?:function\\s+${name}\\s*\\([^)]*\\)\\s*\\{|(?:const|let|var)\\s+${name}\\s*=\\s*(?:async\\s*)?\\([^)]*\\)\\s*=>\\s*\\{)`);
  const m = re.exec(src);
  if (!m) return null;
  let start = m.index;
  let brace = src.indexOf('{', start);
  let depth = 0;
  let quote = null;
  let escape = false;
  for (let i = brace; i < src.length; i++) {
    const c = src[i];
    if (quote) {
      if (escape) escape = false;
      else if (c === '\\') escape = true;
      else if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { quote = c; continue; }
    if (c === '{') depth++;
    else if (c === '}' && --depth === 0) return src.slice(start, i + 1);
  }
  return null;
}

const allFunctionNames = [];
const fn = /(?:function\s+([A-Za-z_$][\w$]*)\s*\(|(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>)/g;
let m;
while ((m = fn.exec(src))) allFunctionNames.push(m[1] || m[2]);

console.log('DEPLOYMENT MAP EXTRACTION AUDIT');
console.log(`index.html bytes: ${Buffer.byteLength(src, 'utf8')}`);

for (const name of targets) {
  const body = extractFunction(name);
  if (!body) {
    console.log(`\n[MISSING] ${name}`);
    continue;
  }
  const called = [...new Set(allFunctionNames.filter(fnName => fnName !== name && new RegExp(`\\b${fnName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\(`).test(body)))];
  console.log(`\n[FOUND] ${name} (${body.length} chars)`);
  console.log(`calls: ${called.join(', ') || '(none)'}`);
  console.log(`first line: ${body.split(/\r?\n/)[0].slice(0, 300)}`);
}
