// One-time deployment compatibility-bridge integration helper.
// Runs in GitHub Actions against the full checkout so the 1 MB+ index.html never
// has to pass through the chat/file-transfer workflow.
const fs = require('fs');

const path = 'index.html';
let html = fs.readFileSync(path, 'utf8');

const stateTag = '<script src="./deployment-state.js">';
const bridgeTag = '<script src="./deployment-bridge.js">';

if(!html.includes(stateTag)) throw new Error('deployment-state.js script tag not found');

if(!html.includes(bridgeTag)){
  html = html.replace(stateTag, `${stateTag}\n<script src="./deployment-bridge.js">`);
}

// The deployment wrapper functions are the compatibility boundary used by the
// monolith. Route their extracted-state calls through the explicit bridge.
const directBefore = (html.match(/OnoForgeDeploymentState\./g)||[]).length;
html = html.replace(/OnoForgeDeploymentState\./g, 'OnoForgeDeploymentBridge.');
const directAfter = (html.match(/OnoForgeDeploymentState\./g)||[]).length;
const bridgeCalls = (html.match(/OnoForgeDeploymentBridge\./g)||[]).length;

if(directBefore < 1) throw new Error('No extracted deployment-state references found in index.html');
if(directAfter !== 0) throw new Error(`Expected all deployment-state references to migrate; ${directAfter} remain`);
if(bridgeCalls < directBefore) throw new Error('Bridge call count is lower than migrated state call count');

fs.writeFileSync(path, html, 'utf8');
console.log(`Integrated deployment-bridge.js script tag: ${html.includes(bridgeTag)}`);
console.log(`Migrated OnoForgeDeploymentState references: ${directBefore}`);
console.log(`Remaining direct OnoForgeDeploymentState references: ${directAfter}`);
console.log(`OnoForgeDeploymentBridge references in index.html: ${bridgeCalls}`);
