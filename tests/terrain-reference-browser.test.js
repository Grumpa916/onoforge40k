const assert=require('assert');
const fs=require('fs');

const html=fs.readFileSync('index.html','utf8');

const start=html.indexOf('function terrainReferenceImageHtml(model)');
assert(start>=0,'terrainReferenceImageHtml definition missing');
const end=html.indexOf('\n}\n',start);
assert(end>start,'terrainReferenceImageHtml end not found');
const source=html.slice(start,end+3);

assert(source.includes("const src=pdf+'#page='+page;"),'terrain reference must preserve the selected Event Companion page');
assert(source.includes('target="_blank"'),'terrain reference must open the official PDF in a top-level browser viewer');
assert(source.includes('Open Official Map'),'terrain reference open-map control missing');
assert(source.includes('Official Event Companion Terrain Layout'),'terrain reference card missing');
assert(!source.includes('<iframe'),'terrain reference must not depend on embedded PDF iframe rendering');

console.log('terrain-reference-browser.test.js: PASS');
