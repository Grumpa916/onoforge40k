const fs = require('fs');
const path = require('path');

const src = fs.readFileSync('index.html', 'utf8');
const outDir = path.join('deployment-map-extraction-preview');
fs.mkdirSync(outDir, { recursive: true });

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
  const start = m.index;
  const brace = src.indexOf('{', start);
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

const manifest = {
  source: 'index.html',
  bytes: Buffer.byteLength(src, 'utf8'),
  generatedAt: new Date().toISOString(),
  functions: []
};

for (const name of targets) {
  const body = extractFunction(name);
  if (!body) {
    manifest.functions.push({ name, found: false });
    continue;
  }
  const filename = `${name}.js`;
  fs.writeFileSync(path.join(outDir, filename), `// Preview extraction from index.html; not yet application code.\n${body}\n`, 'utf8');
  manifest.functions.push({ name, found: true, chars: body.length, file: filename });
}

fs.writeFileSync(path.join(outDir, 'MANIFEST.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8');
console.log(JSON.stringify(manifest, null, 2));
