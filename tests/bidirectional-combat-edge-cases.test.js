const assert = require('assert');
const fs = require('fs');

// Regression harness for the shared pre-roll target-allocation contract.
// The production index currently contains the same helper bodies. Keep this
// test deliberately small: it verifies the side-aware behavior that the
// live bidirectional resolver requires without creating a second combat engine.

function tacticalUnitState(side, entry) {
  return { destroyed: false, side, uid: entry.uid };
}

function tacticalPreRollNormalizePoolAllocations(pool, raw, targetSide = 'opp') {
  const ids = Array.isArray(pool?.modelIds) ? pool.modelIds.map(String) : [];
  const ts = targetSide === 'my' ? 'my' : 'opp';
  const valid = new Set((state[ts] || [])
    .filter(e => !e.attachedTo && !tacticalUnitState(ts, e)?.destroyed)
    .map(e => String(e.uid)));
  let rows = Array.isArray(raw?.allocations)
    ? raw.allocations.map(x => ({
        targetUid: String(x?.targetUid || ''),
        count: Math.max(0, Math.floor(Number(x?.count) || 0)),
        modelIds: Array.isArray(x?.modelIds) ? x.modelIds.map(String) : []
      }))
    : [];
  if (!rows.length && raw?.targetUid) {
    rows = [{ targetUid: String(raw.targetUid), count: ids.length, modelIds: [] }];
  }
  const remaining = new Set(ids);
  const out = [];
  rows.forEach(row => {
    if (!valid.has(row.targetUid) || row.count <= 0) return;
    const assigned = [];
    for (const id of row.modelIds) {
      if (assigned.length >= row.count) break;
      if (remaining.has(id)) {
        assigned.push(id);
        remaining.delete(id);
      }
    }
    for (const id of ids) {
      if (assigned.length >= row.count) break;
      if (remaining.has(id)) {
        assigned.push(id);
        remaining.delete(id);
      }
    }
    if (assigned.length) out.push({ targetUid: row.targetUid, count: assigned.length, modelIds: assigned });
  });
  if (!out.length && ids.length) out.push({ targetUid: '', count: ids.length, modelIds: ids.slice() });
  const assignedIds = new Set(out.flatMap(x => x.modelIds));
  const unassigned = ids.filter(id => !assignedIds.has(id));
  if (unassigned.length) out.push({ targetUid: '', count: unassigned.length, modelIds: unassigned });
  return out;
}

const state = {
  my: [{ uid: 'myTarget' }],
  opp: [{ uid: 'oppTarget' }]
};
const pool = { modelIds: ['m1', 'm2'] };
const allocation = { allocations: [{ targetUid: 'myTarget', count: 2, modelIds: ['m1', 'm2'] }] };

assert.deepStrictEqual(
  tacticalPreRollNormalizePoolAllocations(pool, allocation, 'my'),
  [{ targetUid: 'myTarget', count: 2, modelIds: ['m1', 'm2'] }],
  'opponent -> my target allocation must survive normalization'
);

assert.deepStrictEqual(
  tacticalPreRollNormalizePoolAllocations(pool, { allocations: [{ targetUid: 'oppTarget', count: 2, modelIds: ['m1', 'm2'] }] }, 'opp'),
  [{ targetUid: 'oppTarget', count: 2, modelIds: ['m1', 'm2'] }],
  'my -> opponent target allocation must remain valid'
);

assert.deepStrictEqual(
  tacticalPreRollNormalizePoolAllocations(pool, allocation),
  [{ targetUid: '', count: 2, modelIds: ['m1', 'm2'] }],
  'default target side remains opponent-compatible'
);

// Regression for the live casualty failure found in Test 1: after a model
// roster is mutated, synchronization must consume that already-mutated
// e.modelRoster rather than rehydrate stale state from e.game.modelRoster.
const html = fs.readFileSync('index.html', 'utf8');
const syncStart = html.indexOf('function syncModelRosterBattleState');
assert(syncStart >= 0, 'syncModelRosterBattleState must exist');
const syncBody = html.slice(syncStart, html.indexOf('\n}', syncStart) + 2);
assert(
  syncBody.includes('Array.isArray(e.modelRoster)?e.modelRoster:ensureModelRoster(e,u)'),
  'model roster synchronization must preserve the already-mutated e.modelRoster'
);

console.log('Bidirectional combat edge-case regression passed');
