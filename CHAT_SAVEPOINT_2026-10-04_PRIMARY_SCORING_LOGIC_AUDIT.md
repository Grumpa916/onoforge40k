# CHAT SAVEPOINT 2026-10-04 PRIMARY SCORING LOGIC AUDIT

## Repository / branch
- Repository: Grumpa916/onoforge40k
- Authoritative development branch: feature/opponent-turn-history
- main remains untouched.
- Continue from this branch only.
- Do not merge/rebase feature/opponent-turn-history-clean-reset.

## Latest verified save point before this one
- Terrain reference save point commit: c1d60a9938459476c833e66fba7357e3680409b
- Save-point document: CHAT_SAVEPOINT_2026-10-04_TERRAIN_REFERENCE_VERIFIED.md

## Work completed and verified

### Timer
- gameTimer.turnSide is authoritative for active-side timing.
- switchTurnClock(next,outgoingSide) preserves each side's accumulated time.
- Browser verification passed for:
  - overall game timer
  - friendly/opponent clocks
  - pause/resume
  - Save Battle
  - phase cycling
  - turn switching without clearing the player's accumulated time
  - opponent starting from zero
  - switching back while preserving both clocks
- Timer stale-variable regression was found after secondary-input extraction and fixed.
- Commit: 31aa793cca974a8710a843d801e5780519384368
- Regression test: tests/timer-snapshot-scope.test.js
- CI run: 37217077839 — SUCCESS
- Artifact: 11308832714

### Verified extracted modules
- js/data/bsdata-parser.js
- js/ui/game-timer.js
- js/core/geometry.js
- js/battle/primary-scoring-utils.js
- js/data/saved-list-utils.js
- js/ui/html-utils.js
- js/data/unit-list-utils.js
- js/ui/unit-display-utils.js
- js/ui/secondary-input-utils.js

### Saved-list display utilities
- rosterCreatedLabel(value)
- savedRosterDisplayName(x)
- Existing helpers retained:
  - isPermanentSampleArmy(id)
  - formatSavedListDate(value)
- Save-point history includes:
  - 1dc3d12c6c79fc5fa2fcceaf45ef08cda003deb3

### HTML utility extraction
- esc(s) extracted to js/ui/html-utils.js
- global esc preserved
- namespace OnoForgeHtmlUtils.esc
- tests/html-utils.test.js
- Browser verification passed.
- Save point: 1dc3d12c6c79fc5fa2fcceaf45ef08cda003deb3

### Unit-list utilities
- unitListCategory(u)
- sortUnitList(arr)
- unitListCategoryName(u)
- extracted to js/data/unit-list-utils.js
- tests/unit-list-utils.test.js
- CI run 37215028154 — SUCCESS
- Browser verification passed.
- Save point: e69ab8f7e1da4ccf8a4900fd0e60914cf3fc30a0

### Unit display utility
- alphaLabel(n)
- extracted to js/ui/unit-display-utils.js
- global preserved
- namespace OnoForgeUnitDisplayUtils.alphaLabel
- tests/unit-display-utils.test.js
- CI run 37215989894 — SUCCESS
- Browser verification passed.
- Save point: 2098efbf2b3d400db726f7dfce3407a03d32dce1

### Secondary input utility
- secondaryInputId(side,name)
- extracted to js/ui/secondary-input-utils.js
- global preserved
- namespace OnoForgeSecondaryInputUtils.secondaryInputId
- tests/secondary-input-utils.test.js
- index integration commit: 566688e911173a5fa5f0bc18136d7d116f7d4318
- workflow integration: 94fe0e1f101e157ddb8e1fc09e49580db4437809
- initial CI run 37216716228 — SUCCESS

## Terrain reference work

### Problem
- Terrain Step 4 originally embedded the official Event Companion PDF in an iframe.
- On standalone Safari/iPad the embedded PDF showed a broken-page icon.
- The external Open Map link itself worked.

### Fix
- Commit: a06773132487cccbe9b44eebc5f847b05b9d2e52
- Message: Fix terrain map preview for standalone Safari/iPad
- Removed embedded PDF iframe.
- Replaced it with a clear terrain reference card and a browser-openable official Event Companion link.
- Terrain logic/data was not changed.
- Official PDF remains authoritative; app does not reconstruct the terrain diagram.

### Regression test / workflow
- tests/terrain-reference-browser.test.js
- Test commit: 6236b6c997faaf94b1bebe7fc1eaa1e9e0e74744
- Workflow commit: 1775b81ba57565b9efe0d03f94e01c8aecf00522
- CI run: 37217572209 — SUCCESS
- Artifact ID: 11309170899
- Digest: sha256:304b68147114681294d9511fc5f89c8e4c48fe77f748cf933f6227a5eba3f4d7

### Browser verification PASSED
User tested the standalone preview and confirmed:
- Layout A renders.
- Correct Event Companion page is referenced.
- Open Official Map • Page 21 opens correctly.
- The official PDF opens in the browser to the correct page.
- Terrain Setup Complete — Continue to Deployment Planning works.
- This resolves the standalone Safari/iPad terrain-map issue.

## Current unresolved issue — PRIMARY SCORING DISPLAY / LOGIC

During browser testing after terrain verification, the user noticed an apparent scoring inconsistency.

Visible UI:
- My Army:
  - Primary Mission: Inescapable Dominion
  - Round 1 scoring
  - Projected primary this round: 0 VP across 0 eligible scoring items.
  - Condition: “Control 3+ objectives”
  - Text beneath it is red: “Objective control condition is not met”
- Opponent Army:
  - Primary Mission: Secure Asset
  - Projected primary this round: 6 VP across 2 eligible scoring items.
  - Conditions appear eligible/green.

User's concern:
> “unclear on the logic here. i could possibly control 3 objectives. why is it red?”

IMPORTANT: This is NOT resolved yet. Do not assume the red state is correct or incorrect.

Likely investigation target:
- Determine whether the UI is intentionally showing the CURRENT recorded state of objective control, versus a hypothetical/possible state.
- Determine how “Control 3+ objectives” is evaluated in the primary scoring helpers and UI.
- Determine whether the red text means “condition is not currently recorded as satisfied” rather than “you cannot satisfy it.”
- Determine whether the projected scoring engine should distinguish:
  1. current/confirmed objective-control state,
  2. possible/forecast state,
  3. scoring eligibility.
- The user specifically says they could possibly control 3 objectives, so the UX may need clearer wording if the current state is simply unknown/not yet entered.

Do NOT change scoring logic until the current implementation is audited and understood.

## Last technical action before this save point
We began auditing index.html on branch feature/opponent-turn-history.
- fetch_file confirmed index.html exists on the branch.
- GitHub code searches were initiated for:
  - “Control 3+ objectives”
  - “Objective control condition is not met”
  - “projected primary this round”
  - unit-list references
- The exact implementation has NOT yet been fully retrieved/analyzed.
- Continue from this audit rather than guessing.

## Important project boundaries
Do not:
- touch main
- merge/rebase feature/opponent-turn-history-clean-reset
- broadly extract battle state
- extract events/undo
- extract Tactical Advisor
- extract combat engine
- extract physical-dice resolver
- extract renderer/bootstrap
- extract cloud authentication
- assume local Python is available

Preferred workflow:
1. Read-only audit first.
2. Compare the relevant scoring helpers/UI logic.
3. Identify the smallest coherent boundary or UX correction.
4. Make one reversible change only if justified.
5. Add/update regression test.
6. Run GitHub Actions.
7. Browser-test the affected behavior.
8. Only then create the next save point.

## User workflow preference
- Continue uninterrupted when possible.
- Avoid unnecessary questions.
- User tests in browser/iPad and appreciates simple testing instructions.
- Keep changes small and reversible.
- Do not create a save point until browser verification passes for the current change.

## Suggested restart prompt
Resume the OnoForge 40K project from:
- branch: feature/opponent-turn-history
- save point: c1d60a9938459476c833e66fba7357e3680409b
- new save-point document: CHAT_SAVEPOINT_2026-10-04_PRIMARY_SCORING_LOGIC_AUDIT.md

Read this save-point document first.

The terrain reference fix is complete and browser-verified. Do not revisit it unless a regression appears.

Continue the unfinished audit of the Primary Mission scoring display. The user sees “Control 3+ objectives” marked red with “Objective control condition is not met,” but believes they could possibly control 3 objectives. Determine exactly what the current code means by that red state before making any changes. Distinguish current recorded state, unknown state, possible state, and actual scoring eligibility. Do not guess.

Use GitHub to inspect the relevant primary-scoring helper functions and index.html UI/rendering code. Then propose the smallest correct change, add a focused regression test if needed, run CI, and browser-test before creating another save point.

Do not touch main or perform broad architectural extraction.
