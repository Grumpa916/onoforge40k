const fs = require('fs');
const { spawnSync } = require('child_process');

const html = fs.readFileSync('index.html', 'utf8');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

assert(
  html.includes("deploymentTrackingSide:'my',liveDeploymentPanelOpen:true,"),
  'Live Deployment panel state is not initialized.'
);

assert(
  html.includes("const liveDeploymentPanel=document.querySelector('[data-live-deployment-panel]');"),
  'render() does not capture the current Live Deployment panel state before replacing the DOM.'
);

assert(
  html.includes("state.liveDeploymentPanelOpen=!!liveDeploymentPanel.open;"),
  'render() does not persist the Live Deployment panel open/closed state.'
);

assert(
  html.includes("data-live-deployment-panel"),
  'Live Deployment panel marker is missing.'
);

const scripts = [...html.matchAll(/<script\\b[^>]*>([\\s\\S]*?)<\\/script>/gi)]
  .map((match) => match[1])
  .filter((source) => source.trim().length > 0);

assert(scripts.length > 0, 'No JavaScript was extracted from index.html.');

const extractedPath = '/tmp/onoforge-index-extracted.js';
fs.writeFileSync(extractedPath, scripts.join('\n\n'), 'utf8');

const check = spawnSync(process.execPath, ['--check', extractedPath], {
  encoding: 'utf8'
});

if (check.status !== 0) {
  process.stderr.write(check.stderr || check.stdout || 'node --check failed');
  process.exit(check.status || 1);
}

console.log('Deployment panel regression checks passed.');
console.log(`Checked index.html JavaScript syntax across ${scripts.length} script block(s).`);
