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
      targetPoints: 150,
      ...overrides.combat
    },
    mission: {
      objectiveSwing: 10,
      primaryImpact: 10,
      secondaryImpact: 0,
      scoringDenial: 10,
      isCriticalObjective: false,
      turnUrgency: 10,
      vpDifferential: 0,
      ...overrides.mission
    },
    tactical: {
      threatSuppression: 10,
      boardPosition: 10,
      futureSetup: 10,
      opportunityCost: 10,
      counterattackRisk: 20,
      targetThreat: 10,
      protectsFriendlyAsset: 0,
      ...overrides.tactical
    },
    execution: {
      distanceSource: 'map-estimate',
      physicalDistanceConfirmed: false,
      legalityConfirmed: false,
      reliability: 40,
      ...overrides.execution
    }
  });
}

// 1. High-kill / low-tactical target must not win on kills alone.
const highKill = evaluate({
  combat: { expectedDamage: 18, expectedKills: 8, expectedReturnDamage: 5 },
  mission: { objectiveSwing: 0, primaryImpact: 0, scoringDenial: 0, turnUrgency: 0 },
  tactical: { threatSuppression: 10, boardPosition: 5, futureSetup: 0, targetThreat: 10 }
});
const lowKillHighImpact = evaluate({
  combat: { expectedDamage: 4, expectedKills: 1, expectedReturnDamage: 2 },
  mission: { objectiveSwing: 95, primaryImpact: 90, scoringDenial: 95, turnUrgency: 90, isCriticalObjective: true },
  tactical: { threatSuppression: 75, boardPosition: 80, futureSetup: 70, targetThreat: 80 }
});
assert(lowKillHighImpact.score > highKill.score, 'Mission/tactical impact should beat raw kill volume when the difference is substantial');

// 2. Good damage / terrible return exchange should be penalized.
const safeExchange = evaluate({ combat: { expectedDamage: 8, expectedKills: 3, expectedReturnDamage: 1 } });
const badExchange = evaluate({ combat: { expectedDamage: 8, expectedKills: 3, expectedReturnDamage: 12 } });
assert(safeExchange.score > badExchange.score, 'Counterattack risk should reduce engagement value');

// 3. Opportunity cost matters.
const lowCost = evaluate({ tactical: { opportunityCost: 5 } });
const highCost = evaluate({ tactical: { opportunityCost: 90 } });
assert(lowCost.score > highCost.score, 'Opportunity cost should reduce engagement value');

// 4. Future position can matter even when immediate combat is similar.
const futureSetup = evaluate({ tactical: { futureSetup: 90, boardPosition: 85 } });
const noSetup = evaluate({ tactical: { futureSetup: 0, boardPosition: 0 } });
assert(futureSetup.score > noSetup.score, 'Future positioning should affect engagement value');

// 5. Map distance is never authoritative.
const mapOnly = evaluate({ execution: { distanceSource: 'map-estimate', physicalDistanceConfirmed: false, legalityConfirmed: false } });
assert.strictEqual(mapOnly.mapGeometryAuthoritative, false);
assert.strictEqual(mapOnly.executionConfidence, 'tactical-only');
assert.strictEqual(mapOnly.requiresPhysicalConfirmation, true);

// 6. Physical measurement changes execution confidence, not tactical geometry authority.
const measured = evaluate({ execution: { distanceSource: 'physical-measurement', physicalDistanceConfirmed: true, legalityConfirmed: false } });
assert.strictEqual(measured.executionConfidence, 'measured');
assert.strictEqual(measured.mapGeometryAuthoritative, false);

// 7. Fully confirmed execution is explicitly represented.
const confirmed = evaluate({ execution: { distanceSource: 'physical-measurement', physicalDistanceConfirmed: true, legalityConfirmed: true } });
assert.strictEqual(confirmed.executionConfidence, 'confirmed');
assert.strictEqual(confirmed.requiresPhysicalConfirmation, false);

console.log('Tactical Advisor engine tests: 7/7 passed');
