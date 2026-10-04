# CHAT SAVEPOINT — 2026-10-04 — PRIMARY SCORING UTILITIES EXTRACTION VERIFIED

## Repository / branch
- Repository: `Grumpa916/onoforge40k`
- Authoritative development branch: `feature/opponent-turn-history`
- Current verified code HEAD: `85fcb8c35925eb40af563cf1a55db4e7def7d3c1`
- `main` remains untouched; current main HEAD: `4e2d47dbe7785abb371bb6b0f24ee35f60a26d32`
- `feature/opponent-turn-history-clean-reset` remains separate/diverged.
- User does not have Python installed locally; never require local Python.

## Current extracted modules
1. `js/data/bsdata-parser.js`
2. `js/ui/game-timer.js`
3. `js/core/geometry.js`
4. `js/battle/primary-scoring-utils.js`

## Primary scoring extraction
Extracted only the three pure helpers:
- `primaryScoringRoundRange(timing)`
- `primaryScoringVP(value)`
- `primaryScoringIsPer(row)`

The module preserves the existing global function names and also exposes:
- `window.OnoForgePrimaryScoringUtils`

Stateful helpers remain in `index.html`:
- `primaryScoringRowAvailable`
- `primaryScoringRowsForRound`
- objective/scoring state logic
- primary scoring mutation/UI logic

This distinction was important: an earlier test exposed a regression because `primaryScoringRowsForRound` was accidentally removed. It was restored before final verification.

## Regression tests
New:
- `tests/primary-scoring-utils.test.js`

Existing geometry and opponent-turn/combat regressions continue to run.

## CI verification
Final CI run:
- Opponent Turn Event Capture Preview: `37184489087`
- Tactical Advisor Preview Validation for the extraction sequence: successful.

The final preview artifact from the corrected source:
- artifact id: `11296217495`
- digest: `sha256:7593f9eccaa080831eecd939267ea8a0bc4a83e7d23d3c77ad9ada1baf5796b1`
- expires 2026-10-18

The later source-only restoration commit `85fcb8c...` triggered CI and the final validation run also passed.

## Browser verification — PASSED
User manually tested the corrected CI standalone build.

Verified:
- Battle Mode loads without `primaryScoringRowsForRound is not defined`.
- Primary Mission → Show Scoring displays the scoring panels normally.
- The displayed primary scoring rows and projections render correctly.
- Example screenshot showed:
  - Tyranid Heavy: projected primary 0 VP across 0 eligible scoring items.
  - Ultramarine Infantry: projected primary 6 VP across 2 eligible scoring items.
- No timer or geometry retest was required because those modules were unchanged and already browser-verified.

## Earlier verified milestones — preserve
### Game Timer
- Game Time works.
- Friendly and opponent clocks work.
- Pause/resume works.
- Save Battle saves locally.

### Geometry
- Battlefield map renders.
- Changing unit position changes displayed distance correctly.

### BSData
- BSData parser extraction remains valid.
- Existing list-builder/data behavior remains verified.

### Opponent-turn/combat
- Shared physical Saves → Damage flow works.
- Action Log wraps results.
- Opponent Shooting eligibility is correct.
- Ballistus Armoured feet excluded from Shooting while ranged weapons remain available.

## Important extraction lesson
Do not extract a helper solely because it is adjacent to pure helpers. `primaryScoringRowsForRound` and `primaryScoringRowAvailable` are state/data-dependent and must remain in the host application layer.

## Next task
Do a new read-only dependency audit for the next small coherent extraction candidate.

Previously identified remaining candidates:
- cloud config / cloud payload utility cluster;
- saved-list policy/formatting utilities;
- broader geometry only after mapping more terrain dependencies.

Preferred next step:
1. map direct callers/callees;
2. map state/DOM/persistence/cloud dependencies;
3. document the boundary;
4. make one small reversible extraction;
5. run CI;
6. browser-test affected workflow;
7. create another save point only after browser verification.

Avoid battle state, events/undo, Tactical Advisor, combat engine, physical-dice resolver, and broad renderer/bootstrap extraction at this stage.

## Branch safety
Keep work on `feature/opponent-turn-history`.
Do not modify `main`.
Do not merge/rebase `feature/opponent-turn-history-clean-reset` without explicit approval.
