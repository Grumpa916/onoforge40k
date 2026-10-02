const fs = require('fs');
const src = fs.readFileSync('index.html','utf8');
const markers = [
  'objectiveMap',
  'objective-map',
  'battlefield map',
  'battlefieldMap',
  'terrain',
  'deployment zone',
  'deployment-zone',
  'objectives'
];
const lines = src.split(/\r?\n/);
const hits = [];
for (let i=0;i<lines.length;i++) {
  const line = lines[i];
  if (markers.some(m => line.toLowerCase().includes(m.toLowerCase()))) {
    hits.push({line:i+1,text:line.trim().slice(0,300)});
  }
}
const fn = /(?:function\s+([A-Za-z_$][\w$]*)\s*\(|(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\(?[^=]*\)?\s*=>)/g;
const functions=[]; let m;
while((m=fn.exec(src))) functions.push({name:m[1]||m[2],offset:m.index});
const related = functions.filter(f => /map|objective|terrain|battlefield|deployment/i.test(f.name));
console.log('DEPLOYMENT MAP BOUNDARY AUDIT');
console.log(`index.html bytes: ${Buffer.byteLength(src,'utf8')}`);
console.log(`marker hits: ${hits.length}`);
console.log('Related function names:');
for(const f of related) console.log(`- ${f.name}`);
console.log('First 120 relevant source lines:');
for(const h of hits.slice(0,120)) console.log(`${h.line}: ${h.text}`);
if(!hits.length) process.exit(1);
