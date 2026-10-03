// Temporary CI retrigger for the BSData extraction candidate audit.
const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

const source = fs.readFileSync(require('path').join(__dirname, '..', 'tactical-advisor-engine.js'), 'utf8');
const context = { window: {} };
vm.createContext(context);
vm.runInContext(source, context);
const advisor = context.window.ONOFORGE_TACTICAL_ADVISOR;
assert(advisor && typeof advisor.evaluateEngagement === 'function');

function evaluate(overrides = {}) {
  return advisor.evaluateEngagement({
    combat: {
      expectedDamage: 5,
      expectedKills: 2,
      expectedReturnDamage: 3,
      attackerSurvival: 80,
      targetSurvival: 60,
      attackerPoints: 150,