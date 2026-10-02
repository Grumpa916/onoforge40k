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
  html.includes("data-live-deployment-panel"),
  'Live Deployment panel marker is missing.'
);

assert(
  html.includes('data-live-deployment-panel'),
  'Live Deployment panel element is missing its expected marker.'
);

assert(
  html.includes('ontoggle="state.liveDeploymentPanelOpen=this.open;save()"'),
  'The Live Deployment panel does not directly persist its open/closed state.'
);

assert(
  html.includes("(state.liveDeploymentPanelOpen===false?'':'open ')+'data-live-deployment-panel"),
  'The rendered Live Deployment panel is not driven by state.liveDeploymentPanelOpen.'
);

const renderMatch = html.match(/function render\(\)\{([\s\S]*?)\n\s*const pages=/);
assert(renderMatch, 'render() function boundary could not be located.');

assert(
  !renderMatch[1].includes("document.querySelector('[data-live-deployment-panel]')"),
  'render() still reads the Live Deployment panel DOM state before replacing the DOM.'
);

assert(
  !renderMatch[1].includes('state.liveDeploymentPanelOpen=!!liveDeploymentPanel.open;'),
  'render() still overwrites the Live Deployment panel state from the outgoing DOM.'
);

const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)]
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
console.log('Verified state-driven panel persistence and render behavior.');
console.log(`Checked index.html JavaScript syntax across ${scripts.length} script block(s).`);
