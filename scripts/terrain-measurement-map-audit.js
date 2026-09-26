#!/usr/bin/env node
'use strict';
const fs=require('fs');
const html=fs.readFileSync('index.html','utf8');
const checks=[];
const check=(name,pass,detail)=>checks.push({name,pass:!!pass,detail});
const has=s=>html.includes(s);
const re=r=>r.test(html);

check(
  'Terrain setup uses the official Event Companion page as its guide',
  has('function terrainReferenceImageHtml(model)') && has('const src=pdf+\'#page=\'+page+\'&zoom=125\';'),
  'Terrain Setup must display the selected Event Companion diagram instead of rebuilding its measurements.'
);
check(
  'Reference page follows the authoritative layout page',
  has('const page=Number(model?.page);') && has('objectiveLayoutPage()'),
  'The terrain reference must use the page number stored by the verified mission/layout mapping.'
);
check(
  'Reference uses the official Event Companion PDF source',
  has('const WARHAMMER_EVENT_COMPANION_PDF=') && has('assets.warhammer-community.com/'),
  'The terrain guide must remain tied to the official Event Companion source.'
);
check(
  'Terrain setup is separate from deployment maps',
  has('const battlefieldMarkup=terrainSetup?terrainReferenceImageHtml(model):') &&
  has("objectiveMapRendererHtml('setup')") &&
  has("objectiveMapRendererHtml('deployment')"),
  'The source diagram is used only in Terrain Setup; deployment planning and live tracking retain their own map renderers.'
);
check(
  'Old reconstructed measurement payload is no longer used',
  !has('EVENT_COMPANION_EDGE_MEASUREMENTS_B64') &&
  !has('terrainMeasurementOverlayHtml(model,pct)'),
  'Terrain placement should not depend on the previous reconstructed measurement overlay.'
);
check(
  'Terrain setup is explicitly reference-only',
  has('Official Event Companion reference.') &&
  has('does not reconstruct or infer the diagram measurements.'),
  'The UI should clearly tell the player to use the source diagram directly.'
);
check(
  'Terrain setup can still be completed and minimized',
  has('function completeTerrainSetup()') &&
  has('state.terrainSetupComplete=true;') &&
  has('terrain-setup-locked'),
  'Completing terrain setup must preserve the existing locked/minimized workflow.'
);
check(
  'Permanent test armies remain available after persisted state loads',
  has('function ensurePermanentSampleArmies()') &&
  has('ensurePermanentSampleArmies();') &&
  has('sample-tyranid-skirmish') &&
  has('sample-ultramarine-infantry') &&
  has('sample-tyranid-heavy'),
  'The three permanent sample armies must be re-established when the app initializes.'
);

const failures=checks.filter(x=>!x.pass);
console.log(JSON.stringify({
  audit:'Terrain setup and sample-army regression audit',
  checks:checks.length,
  passed:checks.length-failures.length,
  failed:failures.length,
  failures
},null,2));
if(failures.length)process.exit(1);
