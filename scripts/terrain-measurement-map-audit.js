#!/usr/bin/env node
'use strict';
const fs=require('fs');
const html=fs.readFileSync('index.html','utf8');
const checks=[];
const check=(name,pass,detail)=>checks.push({name,pass:!!pass,detail});
const has=re=>re.test(html);
check('Terrain setup uses the official Event Companion page as its guide',has(/function terrainReferenceImageHtml(model)/),'Terrain setup should display the selected Event Companion layout rather than reconstructing it from inferred measurements.');
check('Reference page is selected from the authoritative layout page number',has(/const page=Number(model?.page)/)&&has(/#page=\'+page/),'The displayed reference must follow the mission/layout page stored in the verified Event Companion layout data.');
check('Reference uses the official Event Companion PDF source',has(/WARHAMMER_EVENT_COMPANION_PDF/)&&has(/warhammer-community.com/),'Terrain setup must remain tied to the official Event Companion source.');
check('Terrain setup remains separate from deployment maps',has(/terrainSetup?terrainReferenceImageHtml(model)/)&&has(/data-objective-map-mode="'+esc(mode)/),'The reference guide is rendered only for Terrain Setup; deployment planning and live tracking keep their own map renderers.');
check('Terrain setup does not reconstruct measurement overlays',!has(/terrainMeasurementOverlayHtml(model,pct)/)&&!has(/EVENT_COMPANION_EDGE_MEASUREMENTS_B64/),'The terrain guide should use the source diagram directly instead of a second inferred measurement renderer.');
check('Terrain setup explicitly identifies the guide as reference-only',has(/Official Event Companion reference/)&&has(/does not reconstruct or infer the diagram measurements/),'The UI must make clear that the source diagram is the placement authority.');
check('Terrain setup can still be locked after physical placement',has(/completeTerrainSetup()/)&&has(/terrain-setup-locked/),'Completing terrain setup should continue to collapse the setup display before deployment planning.');
const failures=checks.filter(x=>!x.pass);
console.log(JSON.stringify({audit:'Terrain setup Event Companion reference audit',checks:checks.length,passed:checks.length-failures.length,failed:failures.length,failures},null,2));
if(failures.length)process.exit(1);
