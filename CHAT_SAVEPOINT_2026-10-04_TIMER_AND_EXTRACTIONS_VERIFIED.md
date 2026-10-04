# CHAT SAVEPOINT — 2026-10-04 — TIMER + EXTRACTIONS VERIFIED

## Repository / branch
- Repository: `Grumpa916/onoforge40k`
- Authoritative development branch: `feature/opponent-turn-history`
- Current HEAD: `a2a9389673011ba30f76bda3c94d526dc81b481f`
- `main` remains untouched; current main HEAD: `4e2d47dbe7785abb371bb6b0f24ee35f60a26d32`
- Do not merge/rebase `feature/opponent-turn-history-clean-reset`.
- User does not have Python installed locally.

## Current extracted modules
1. `js/data/bsdata-parser.js`
2. `js/ui/game-timer.js`
3. `js/core/geometry.js`
4. `js/battle/primary-scoring-utils.js`
5. `js/data/saved-list-utils.js`

## Game Timer — VERIFIED
The Game Timer extraction and subsequent fixes are browser-verified.

Verified:
- Overall Game Time runs.
- Friendly turn clock runs.
- Opponent turn clock runs.
- Pause stops timers.
- Resume restarts timers.
- Save Battle saves locally.
- Cycling phases works.
- Turn boundary preserves the outgoing player's accumulated time.
- Opponent starts from zero instead of inheriting the prior player's time.
- Switching back preserves both players' cumulative times.

### Timer design now in place
The timer has an explicit active-side field:
- `gameTimer.turnSide`

The timer uses that field as the authoritative active-side clock source, with `state.currentTurn` as compatibility fallback.

This avoids errors when application code mutates `state.currentTurn` before calling timer persistence/boundary logic.

Relevant branch commits:
- `f9e63dceeeb3400e21031e115fb26fa317b5a5e5` — explicit outgoing-side timer boundary support
- `7758e3cbbba41d453acb6a07a5780ab04d2a31f0` — corrected previous-round caller
- `c101b423d19ce89c138befae6083275b010b53d0` — corrected timer regression fixture
- `a2a9389673011ba30f76bda3c94d526dc81b481f` — make timer active side authoritative

## Timer regression coverage
- `tests/game-timer.test.js`
- Covers ordinary turn switching and the application ordering where `currentTurn` is already mutated.
- CI passes this regression.

## Other browser-verified extraction milestones

### BSData parser
- `js/data/bsdata-parser.js`
- Already merged through PR #6.
- Do not re-extract.

### Geometry
- `js/core/geometry.js`
- Extracted pure `battlefieldDistanceBetween()`.
- Browser verified: map renders and displayed distance changes correctly when unit positions change.

### Primary scoring utilities
- `js/battle/primary-scoring-utils.js`
- Extracted pure:
  - `primaryScoringRoundRange()`
  - `primaryScoringVP()`
  - `primaryScoringIsPer()`
- Stateful helpers remain in `index.html`.
- Browser verified: Primary Mission → Show Scoring renders correctly.
- Earlier regression where `primaryScoringRowsForRound` was accidentally removed was fixed; it remains in the host application.

### Saved-list utilities
- `js/data/saved-list-utils.js`
- Extracted pure:
  - `isPermanentSampleArmy()`
  - `formatSavedListDate()`
- Browser/local saved-list behavior remains verified.
- Cloud/auth code remains in `index.html`.

## Integrated local-state test — PASSED
User also confirmed the broader non-cloud local test set passed before the latest timer turn-boundary test, including:
- Local Save Battle.
- Phase cycling.
- Primary scoring display.
- Battlefield map/distance behavior.
- Existing opponent-turn/combat workflows.

## Opponent-turn/combat milestones — preserve
- Shared physical Saves → Damage flow.
- Action Log result wrapping.
- Opponent Shooting eligibility.
- Ballistus Armoured feet excluded from Shooting while ranged weapons remain available.
- Existing opponent-turn event/resolver/combat regressions.

## Cloud Login — PARKED
The standalone build showed `Failed to fetch` on Cloud Login.
Do not treat this as a saved-list extraction failure.
Do not modify cloud authentication blindly.
Test Cloud Login later from the hosted HTTPS application rather than the local standalone HTML.

## Current CI
Latest timer-validating workflows on the branch have passed, including:
- Tactical Advisor Preview Validation.
- Opponent Turn Event Capture Preview.

The latest corrected standalone build was produced from the timer turn-boundary fix sequence and manually verified.

## Next task
Resume the monolith-extraction program with a read-only dependency audit.

Do not re-extract any of the five modules above.

Compare remaining low-risk candidates, especially:
- cloud-independent pure utilities;
- saved-list adjacent pure helpers not already extracted;
- carefully scoped terrain/geometry helpers only after dependency mapping.

For each candidate:
1. inventory functions;
2. map direct callers/callees;
3. map state/DOM/persistence/cloud dependencies;
4. check declaration-order assumptions;
5. document the boundary;
6. implement one small reversible extraction;
7. run GitHub Actions;
8. browser-test only the affected workflow;
9. create the next save point after browser verification.

Avoid broad extraction of battle state, events/undo, Tactical Advisor, combat engine, physical-dice resolver, renderer/bootstrap, and cloud authentication.

## Branch safety
Keep work on `feature/opponent-turn-history`.
Do not modify `main`.
Do not merge/rebase `feature/opponent-turn-history-clean-reset` without explicit approval.
