// OnoForge 40K — deployment compatibility bridge audit
// Verifies that the bridge is a delegation layer over deployment-state.js and does not create a second store.
const fs = require('fs');
const vm = require('vm');

const stateSource = fs.readFileSync('deployment-state.js', 'utf8');
const bridgeSource = fs.readFileSync('deployment-bridge.js', 'utf8');

const sandbox = { console };
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(stateSource, sandbox, { filename: 'deployment-state.js' });
vm.runInContext(bridgeSource, sandbox, { filename: 'deployment-bridge.js' });

const stateApi = sandbox.OnoForgeDeploymentState;
const bridge = sandbox.OnoForgeDeploymentBridge;

if(!stateApi) throw new Error('Missing OnoForgeDeploymentState');
if(!bridge) throw new Error('Missing OnoForgeDeploymentBridge');

const required = [
  'deploymentPlanKey',
  'ensureDeploymentPlans',
  'deploymentPlanForCurrentMap',
  'deploymentPlanPosition',
  'setDeploymentPlanPosition',
  'clearDeploymentPlanPosition',
  'clearDeploymentPlanForCurrentMap',
  'normalizePosition',
  'ensureBattlefieldUnitPositions',
  'battlefieldUnitPosition',
  'setBattlefieldUnitPosition',
  'clearBattlefieldUnitPosition'
];

for(const name of required){
  if(typeof bridge[name] !== 'function') throw new Error(`Bridge missing ${name}`);
  if(bridge[name] !== stateApi[name]) throw new Error(`Bridge must delegate ${name} directly to OnoForgeDeploymentState`);
}

const state = { objectiveMapMissionKey:'mission', objectiveMapLayout:'A' };

if(!bridge.setDeploymentPlanPosition(state,'u1',10.04,20.06)) throw new Error('Deployment-plan write failed');
const planned = bridge.deploymentPlanPosition(state,'u1');
if(!planned || planned.x !== 10 || planned.y !== 20 || planned.source !== 'deployment-plan'){
  throw new Error('Deployment-plan normalization/delegation failed');
}

if(!bridge.setBattlefieldUnitPosition(state,'opp','u2',30.04,40.06,'manual',2)) throw new Error('Live-position write failed');
const live = bridge.battlefieldUnitPosition(state,'opp','u2');
if(!live || live.x !== 30 || live.y !== 40 || live.side !== 'opp' || live.round !== undefined){
  // battlefieldUnitPosition intentionally exposes the normalized public position, not the raw round metadata.
  throw new Error('Live-position delegation failed');
}

if(!state.deploymentPlans || !state.battlefieldUnitPositions) throw new Error('Expected state containers were not created');
if(Object.keys(state).some(k => k.toLowerCase().includes('bridge'))) throw new Error('Bridge created a duplicate state container');

console.log('Deployment compatibility bridge audit: PASS');
