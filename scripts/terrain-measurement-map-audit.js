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
check('Terrain footprint dimensions are derived from polygon bounds',has(/maxX-minX/)&&has(/maxY-minY/),'Displayed footprint dimensions must be derived from the verified geometry rather than hard-coded guesses.');
check('Nearest board-edge distance is displayed',has(/edgeDistances=\[\['LEFT',minX\],\['RIGHT',60-maxX\],\['BOTTOM',minY\],\['TOP',44-maxY\]\]/)&&has(/nearestEdgeDistance/)&&has(/from \'\+nearestEdgeName\+\' edge/),'Players need the nearest physical board-edge distance for terrain placement.');
check('Setup map is enlarged for terrain planning',has(/\.terrain-measurement-map\{min-height:clamp\(/),'Terrain placement deserves a larger tablet-first map surface.');
check('Measurement overlay is setup-only',has(/(?:terrainSetup|setup)\?terrainMeasurementOverlayHtml\(model,pct\):''/),'Measurement annotations must not contaminate live battlefield state views.');
check('Measurement view is explicitly reference-only',has(/Reference only — no deployment state is changed/),'Terrain planning measurements must not mutate authoritative deployment state.');
check('Verified Event Companion source remains the geometry source',has(/Event Companion vector geometry/)&&has(/geometry-only/)==false,'Terrain geometry must remain tied to the verified Event Companion data pipeline.');
const failures=checks.filter(x=>!x.pass);
console.log(JSON.stringify({audit:'Terrain measurement map audit',checks:checks.length,passed:checks.length-failures.length,failed:failures.length,failures},null,2));
if(failures.length)process.exit(1);
