# CHAT SAVEPOINT — 2026-10-04 — TIMER TURN-BOUNDARY VERIFIED

## Repository / branch
- Repository: `Grumpa916/onoforge40k`
- Authoritative development branch: `feature/opponent-turn-history`
- Current verified HEAD: `c101b423d19ce89c138befae6083275b010b53d0`
- `main` remains untouched; current main HEAD: `4e2d47dbe7785abb371bb6b0f24ee35f60a26d32`
- `feature/opponent-turn-history-clean-reset` remains separate/diverged.
- User does not have Python installed locally; never require local Python.

## Verified extracted modules
1. `js/data/bsdata-parser.js`
2. `js/ui/game-timer.js`
3. `js/core/geometry.js`
4. `js/battle/primary-scoring-utils.js`
5. `js/data/saved-list-utils.js`

## Timer status
The Game Timer extraction is fully browser-verified.

Verified:
- Overall Game Time increments.
- Friendly turn clock increments.
- Opponent turn clock increments.
- Pause stops timers.
- Resume restarts timers.
- Save Battle saves locally.
- Turn switching attributes elapsed time to the correct outgoing side.
- Cycling through phases and crossing the turn boundary no longer clears one side's time or transfers it to the other side.
- Switching back and forth preserves cumulative per-side time.

### Important timer fix
Root cause:
Application turn-transition callers often changed `state.currentTurn` before invoking `switchTurnClock()`. The timer previously inferred the outgoing side from the already-mutated state.

Repair:
- `switchTurnClock(next,outgoingSide)` now accepts the outgoing side explicitly.
- Callers pass the side whose turn is ending.
- Backward-compatible fallback remains for older callers.

Functional timer turn-boundary fix:
- commit `f9e63dceeeb3400e21031e115fb26fa317b5a5e5`
- caller-order correction:
  - commit `7758e3cbbba41d453acb6a07a5780ab04d2a31f0`
- final branch tip including corrected regression fixture:
  - `c101b423d19ce89c138befae6083275b010b53d0`

### Timer regression test
- `tests/game-timer.test.js`
- Covers:
  - normal my -> opp -> my timing;
  - the exact application ordering where `currentTurn` is mutated before timer boundary handling.

CI now passes this regression.

## Saved-list extraction
Extracted only:
- `isPermanentSampleArmy()`
- `formatSavedListDate()`

Stateful saved-list page and cloud/auth logic remain in `index.html`.

Important:
- A prior test showed that state-dependent `primaryScoringRowsForRound` must remain in the host.
- The same discipline is required for cloud/auth code.

## Primary scoring extraction
Extracted only pure helpers:
- `primaryScoringRoundRange()`
- `primaryScoringVP()`
- `primaryScoringIsPer()`

Browser verified:
- Primary Mission → Show Scoring renders normally.
- Primary scoring projections/rows display correctly.

## Geometry extraction
Extracted:
- `battlefieldDistanceBetween()`

Browser verified:
- Battlefield map renders.
- Moving units changes displayed distance correctly.

## BSData parser
Extracted:
- `js/data/bsdata-parser.js`

Previously merged via PR #6.
Do not re-extract.

## Combat / opponent-turn verified behavior
Preserve:
- Shared physical Saves -> Damage workflow.
- Action Log result wrapping.
- Opponent Shooting eligibility.
- Ballistus Armoured feet excluded from Shooting; ranged weapons remain available.
- Existing opponent-turn resolver/regression suite.

## Cloud Login note
The standalone build currently reports `Failed to fetch` in Cloud Login.
This is isolated from the saved-list helper extraction and is expected to be tested later using the hosted HTTPS app, not the local standalone HTML.
Do not modify cloud authentication blindly before hosted testing.

## Latest CI
Current final branch tip `c101b423d19ce89c138befae6083275b010b53d0` has successful:
- Tactical Advisor Preview Validation: `37208777909`
- Opponent Turn Event Capture Preview: `37208777919`
- Opponent Turn Event Capture Preview: `37208775262`

The latest successful standalone artifact came from:
- run `37208777919`
- artifact id `11305518926`

## Latest browser verification
User explicitly confirmed:
- timer test successful after the turn-boundary fix;
- per-side timer values persist correctly through turn switches.

## Next task
Return to the monolith extraction program.

Do not re-extract the modules listed above.

Next step:
1. perform a read-only dependency audit of the remaining low-risk candidates;
2. compare cloud utility/config and other pure utility clusters;
3. choose the smallest coherent boundary;
4. document it before editing;
5. implement one reversible extraction;
6. run GitHub Actions;
7. browser-test only the affected workflow;
8. create the next save point after verification.

Avoid broad extraction of:
- battle state;
- events/undo;
- Tactical Advisor;
- combat engine;
- physical-dice resolver;
- broad renderer/bootstrap;
- cloud authentication until hosted HTTPS testing is explicitly undertaken.

## Branch safety
- Keep work on `feature/opponent-turn-history`.
- Do not modify `main`.
- Do not merge/rebase `feature/opponent-turn-history-clean-reset` without explicit approval.
