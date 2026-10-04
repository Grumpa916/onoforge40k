# CHAT SAVEPOINT — 2026-10-04 — GEOMETRY EXTRACTION VERIFIED

## Repository / branch
- Repository: `Grumpa916/onoforge40k`
- Authoritative development branch: `feature/opponent-turn-history`
- Verified code HEAD: `831ea465d0322db937bf73cbbcd2d5e7e7214394`
- `main` remains untouched; current main HEAD: `4e2d47dbe7785abb371bb6b0f24ee35f60a26d32`
- `feature/opponent-turn-history-clean-reset` remains separate/diverged.
- User does not have Python installed locally; never require local Python.

## Verified preceding milestone
### Game Timer
Extracted to `js/ui/game-timer.js`.

Browser-verified:
- Game Time runs.
- Friendly turn clock runs.
- Opponent turn clock runs.
- Turn switching tracks correct side.
- Pause stops timers.
- Resume restarts timers.
- Save Battle saves locally.

Verified timer functional commit:
- `f57dd5ba57452371994fd4d16adb2cb975cf9b42`

Successful timer CI:
- Tactical Advisor Preview Validation: `37181941102`
- Opponent Turn Event Capture Preview: `37181941119`

## Geometry extraction completed
### New module
- `js/core/geometry.js`

Extracted function:
- `battlefieldDistanceBetween(a,b)`

The application continues to call the same global function name. The module also exposes:
- `window.OnoForgeGeometry.battlefieldDistanceBetween`

### Boundary
The function is pure coordinate math:
- no `state` access;
- no DOM access;
- no persistence;
- no cloud access;
- no event emission;
- no embedded-data dependency.

Direct callers mapped before extraction included:
- `objectiveDistanceFromUnit`
- `battlefieldTerrainPathIntersections`
- `battlefieldTerrainContextBetweenUnits`
- objective/map UI paths through distance helpers.

The extraction deliberately did NOT move the surrounding terrain/objective functions.

### Test coverage
New regression:
- `tests/geometry.test.js`

Covers:
- standard 3-4-5 distance;
- decimal coordinates;
- identical points;
- null inputs;
- malformed/non-finite coordinates.

### CI
The final green geometry preview run:
- Opponent Turn Event Capture Preview: `37182498915`
- Geometry regression passed.
- Opponent-turn event regression passed.
- Resolver regression passed.
- Bidirectional combat regression passed.
- Architecture audit passed.
- inline JavaScript syntax validation passed.
- standalone preview build passed.

CI artifact:
- artifact id: `11295941419`
- digest: `sha256:810515fc197a40a11000247701102c81e1783079aad78196f16835574ae98764`
- expires 2026-10-18

## Browser verification — PASSED
User manually tested the CI-generated geometry preview.

Verified:
- Battlefield map rendered normally.
- Map distance behavior remained correct after the extraction.
- Moving a unit changed the displayed distance appropriately.
- Existing Tactical Context/map distance behavior remained intact.

No timer, combat, resolver, or scoring retest was required because the geometry change was isolated and the affected map-distance workflow passed.

## Earlier verified combat/data milestones
Do not regress:
- BSData parser extraction in `js/data/bsdata-parser.js`
- shared Saves -> Damage physical-dice flow
- Action Log wrapping
- opponent Shooting eligibility
- Ballistus Armoured feet excluded from Shooting while ranged weapons remain available.

Functional checkpoint for opponent Shooting:
- `5fb0fb7f39fc7ab375355415f13f9fb7fa4aaeea`

## Current monolith-extraction status
Two coherent extraction boundaries are now verified:
1. `js/data/bsdata-parser.js`
2. `js/ui/game-timer.js`
3. `js/core/geometry.js`

The third item is the newest.

## Next task
Return to read-only dependency analysis before extracting another subsystem.

Strong remaining candidates from the prior call-graph map:
- primary scoring helper cluster;
- cloud utility/config cluster;
- saved-list policy/formatting helpers;
- broader geometry only after mapping its additional dependencies.

Preferred next step:
1. map the callers/callees of the remaining pure candidates;
2. inspect which callers cross state/render/persistence boundaries;
3. choose one coherent small module;
4. document the boundary;
5. extract only after the interface is explicit;
6. run CI;
7. browser-test the affected workflow;
8. create another save point only after verification.

Avoid:
- battle state;
- events/undo;
- Tactical Advisor;
- combat engine;
- physical-dice resolver;
- broad renderer/bootstrap extraction.

## Branch safety
Keep all work on `feature/opponent-turn-history`.
Do not modify `main`.
Do not merge/rebase `feature/opponent-turn-history-clean-reset` without explicit approval.
