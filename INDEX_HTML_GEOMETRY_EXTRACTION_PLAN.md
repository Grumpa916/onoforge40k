# OnoForge 40K — Geometry Extraction Plan

## Candidate

First geometry extraction candidate:
- `battlefieldDistanceBetween(a,b)`

Current source location in the verified timer-build inspection:
- near the battlefield position helpers.
- direct implementation is coordinate-only.

## Dependency audit

### Direct callers

`battlefieldDistanceBetween` is used by:
1. `objectiveDistanceFromUnit(side,uid,objectiveName)`
2. `battlefieldTerrainPathIntersections(a,b)`
3. `battlefieldTerrainContextBetweenUnits(attackerSide,attackerUid,targetSide,targetUid)`
4. `objectiveMapUnitNodesHtml(...)` indirectly through `objectiveDistanceFromUnit`

### Callees

Only built-in numeric primitives:
- `Number`
- `Number.isFinite`
- `Math.hypot`

### Hidden dependencies

None.

The function:
- does not read or write `state`;
- does not access the DOM;
- does not call persistence;
- does not call cloud services;
- does not emit events;
- does not depend on embedded mission data;
- does not depend on declaration-order state.

## Proposed boundary

New module:
- `js/core/geometry.js`

Browser-compatible public surface:
- global `battlefieldDistanceBetween(a,b)`
- `window.OnoForgeGeometry.battlefieldDistanceBetween`

The compatibility global is intentional for the same reason used by the BSData parser extraction: existing application callers remain unchanged in the first migration step.

## Scope restriction

Do NOT extract these functions in the same change:
- `battlefieldTerrainGeometry`
- `battlefieldTerrainAtPoint`
- `battlefieldTerrainPathIntersections`
- `objectiveDistanceFromUnit`

Those functions have application/data dependencies and require a separate mapping pass.

## Validation required

1. Pure unit regression:
   - valid coordinates;
   - decimal coordinates;
   - missing input;
   - non-finite input;
   - identical points.
2. Full application syntax/architecture checks through GitHub Actions.
3. Browser regression:
   - Battle Mode map/objective-distance rendering remains unchanged;
   - Tactical terrain-context distance remains numerically identical;
   - no change to combat/resolver behavior.

## Why this is the next extraction

This is the smallest coherent pure utility boundary remaining after the verified BSData parser and Game Timer extractions. It reduces `index.html` by removing real business logic while introducing no new state contract.
