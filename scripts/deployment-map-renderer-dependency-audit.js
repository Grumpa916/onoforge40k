const fs = require('fs');

const src = fs.readFileSync('index.html', 'utf8');
const name = 'objectiveMapRendererHtml';

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

const body = extractFunction(name);
if (!body) throw new Error(`${name} not found`);

const identifiers = new Set();
const tokenRe = /\b[A-Za-z_$][\w$]*\b/g;
let m;
while ((m = tokenRe.exec(body))) identifiers.add(m[0]);

const builtins = new Set([
  'function','return','const','let','var','if','else','for','of','in','true','false','null','undefined',
  'Number','String','Math','Object','Array','JSON','Date','NaN','Infinity'
]);
const params = new Set(['mode','model','status','pct','point','terrainSetup','setup','deployment','regionLabel','regionClass','renderRegion','renderTerrain','regions','terrain','ghostNodes','unitNodes','measurementToggle','objectiveNodes','pending','title','subtitle','controls','reserveTray','editor','battlefieldMarkup','footer']);
const candidates = [...identifiers].filter(x => !builtins.has(x) && !params.has(x) && !/^[A-Z]$/.test(x));

const likely = candidates.filter(x => /Map|map|deployment|Deployment|battlefield|Battlefield|terrain|Terrain|objective|Objective|reserve|Reserve|state|esc/.test(x));

console.log('DEPLOYMENT MAP RENDERER DEPENDENCY AUDIT');
console.log(`renderer chars: ${body.length}`);
console.log('Likely application dependencies:');
for (const x of likely.sort()) console.log(`- ${x}`);
