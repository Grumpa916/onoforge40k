# CHAT SAVEPOINT 2026-10-04 TERRAIN REFERENCE VERIFIED

## Repository
- Repo: `Grumpa916/onoforge40k`
- Authoritative branch: `feature/opponent-turn-history`
- `main` remains untouched.

## Verified checkpoint
Terrain reference behavior is now browser-verified on the standalone preview.

### Terrain reference fix
Code commit:
- `a06773132487cccbe9b44eebc5f847b05b9d2e52`
- `Fix terrain map preview for standalone Safari/iPad`

Regression test commit:
- `6236b6c997faaf94b1bebe7fc1eaa1e9e0e74744`

Workflow integration:
- `1775b81ba57565b9efe0d03f94e01c8aecf00522`

GitHub Actions:
- Run: `37217572209`
- Result: SUCCESS
- Artifact: `onoforge40k-opponent-turn-event-preview`
- Artifact ID: `11309170899`
- Digest: `sha256:304b68147114681294d9511fc5f89c8e4c48fe77f748cf933f6227a5eba3f4d7`

## Browser verification — PASSED
Verified in the standalone preview:
- Terrain Setup Step 4 renders correctly.
- Layout A is selected and displays the correct Event Companion page reference.
- `Open Official Map • Page 21` opens successfully.
- The browser PDF viewer opens the correct official Event Companion page.
- `Terrain Setup Complete — Continue to Deployment Planning` works after the map is opened/checked.
- No embedded PDF iframe is required; this avoids the standalone Safari/iPad broken-preview behavior.

## Current terrain architecture
The app does not reconstruct the official terrain diagram. It references the official Warhammer 40,000 Event Companion and directs the player to the selected mission/layout page for physical terrain placement.

The terrain reference renderer now uses a browser-openable official PDF link rather than an embedded iframe.

## Other verified extraction state
Previously verified and retained:
- `js/data/bsdata-parser.js`
- `js/ui/game-timer.js`
- `js/core/geometry.js`
- `js/battle/primary-scoring-utils.js`
- `js/data/saved-list-utils.js`
- `js/ui/html-utils.js`
- `js/data/unit-list-utils.js`
- `js/ui/unit-display-utils.js`
- `js/ui/secondary-input-utils.js`

Timer stale-variable regression was fixed and covered by:
- `tests/timer-snapshot-scope.test.js`

Secondary input utility:
- `secondaryInputId(side,name)`
- `tests/secondary-input-utils.test.js`

## Important boundaries
Do not:
- touch `main`
- merge/rebase `feature/opponent-turn-history-clean-reset`
- broadly extract battle state, events/undo, Tactical Advisor, combat engine, physical-dice resolver, renderer/bootstrap, or cloud authentication
- assume local Python is available

## Next logical step
The terrain reference browser behavior is complete and verified. Continue the controlled extraction audit from this checkpoint, one small reversible boundary at a time, with CI and browser verification before the next save point.
