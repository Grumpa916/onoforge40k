#!/usr/bin/env node
'use strict';
const fs=require('fs');
const html=fs.readFileSync('index.html','utf8');
const checks=[];
const check=(name,pass,detail)=>checks.push({name,pass:!!pass,detail});
const has=re=>re.test(html);
check('Terrain measurement overlay function exists',has(/function terrainMeasurementOverlayHtml\(model,pct\)/),'Setup needs a dedicated measurement layer over verified terrain geometry.');
check('Measurement layer consumes verified terrain geometry',has(/model\?\.verified/)&&has(/model\.terrainGeometry/),'Measurements must be blocked when Event Companion geometry is not verified.');
check('Measurements use 60 x 44 coordinate system',has(/pct\(x,60\)/)&&has(/pct\(44-y,44\)/),'Terrain measurements must share the authoritative battlefield coordinate system.');
check('Terrain footprint bounds are derived from verified polygons',has(/const minX=Math\.min\(\.\.\.xs\),maxX=Math\.max\(\.\.\.xs\),minY=Math\.min\(\.\.\.ys\),maxY=Math\.max\(\.\.\.ys\)/),'Terrain edge distances must be derived from the verified polygon bounds rather than hard-coded terrain dimensions.');
check('Nearest board-edge distances are displayed',has(/const left=minX, right=60-maxX;/)&&has(/const horizontalDistance=/)&&has(/const bottom=minY, top=44-maxY;/)&&has(/const verticalDistance=/)&&has(/fmt\(horizontalDistance\)+'″'/)&&has(/fmt\(verticalDistance\)+'″'/),'Players need the physical board-edge distances for terrain placement.');
check('Setup map is enlarged for terrain planning',has(/\.terrain-measurement-map\{min-height:clamp\(/),'Terrain placement deserves a larger tablet-first map surface.');
check('Measurement overlay is setup-only',has(/(?:terrainSetup|setup)\?terrainMeasurementOverlayHtml\(model,pct\):''/),'Measurement annotations must not contaminate live battlefield state views.');
check('Measurement view is explicitly reference-only',has(/Reference only — no deployment state is changed/),'Terrain planning measurements must not mutate authoritative deployment state.');
check('Verified Event Companion source remains the geometry source',has(/Event Companion vector geometry/)&&has(/geometry-only/)==false,'Terrain geometry must remain tied to the verified Event Companion data pipeline.');
const failures=checks.filter(x=>!x.pass);
console.log(JSON.stringify({audit:'Terrain measurement map audit',checks:checks.length,passed:checks.length-failures.length,failed:failures.length,failures},null,2));
if(failures.length)process.exit(1);
