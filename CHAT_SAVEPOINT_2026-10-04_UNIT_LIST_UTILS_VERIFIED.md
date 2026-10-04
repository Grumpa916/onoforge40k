# CHAT SAVEPOINT — 2026-10-04 UNIT LIST UTILS VERIFIED

## Repository / branch
- Repository: `Grumpa916/onoforge40k`
- Authoritative branch: `feature/opponent-turn-history`
- Save point created after successful browser verification.

## Previous save point
- `1dc3d12c6c79fc5fa2fcceaf45ef08cda003deb3`
- `CHAT_SAVEPOINT_2026-10-04_HTML_UTILITY_VERIFIED.md`

## Extraction completed
Moved one coherent pure unit-list utility boundary from `index.html` into:
- `js/data/unit-list-utils.js`

Extracted helpers:
- `unitListCategory(u)`
- `sortUnitList(arr)`
- `unitListCategoryName(u)`

Existing browser-global names remain intact so current List Builder callers require no changes.

## Regression coverage
Added:
- `tests/unit-list-utils.test.js`

Coverage includes:
- Character classification
- Infantry classification
- Monster / Vehicle classification
- Aircraft and Transport classification
- Other classification
- category display names
- category ordering
- alphabetical ordering within categories
- preservation of the input array by `sortUnitList`

## Boundary documentation
Added:
- `INDEX_HTML_UNIT_LIST_UTILS_BOUNDARY.md`

The boundary is intentionally pure and excludes unit-selection state handlers, rendering, army state, validation, battle state, events/undo, Tactical Advisor, combat engine, physical-dice resolver, renderer/bootstrap, and cloud authentication.

## Workflow integration
Updated:
- `.github/workflows/opponent-turn-event-preview.yml`

The workflow now:
- runs the unit-list utility regression
- syntax-checks `js/data/unit-list-utils.js`
- copies the utility into the preview tree
- bundles it into the standalone preview

## CI verification
Successful GitHub Actions run:
- Run ID: `37215028154`
- Workflow: `Opponent Turn Event Capture Preview`
- Head SHA: `2db10df119c0c1c30d6ef7b2efd87554ba2736e6`
- Conclusion: `success`
- All validation steps passed, including the new unit-list regression, existing utility/timer/opponent-turn/combat regressions, architecture validation, syntax checks, standalone preview build, and artifact upload.

Artifact:
- `onoforge40k-opponent-turn-event-preview`
- Artifact ID: `11307494622`

## Browser verification
User manually opened the generated standalone preview and tested the affected List Builder / unit-selection behavior.

User explicitly reported:
- `pass`

Therefore the browser gate for this extraction is closed successfully.

## Current code state
Extraction sequence commits:
- `50426f4fc1fc718886e2085c12a450ced3d18833` — utility file
- `becb6e98bddb075cecf2819dbe720a39aa44888a` — regression test
- `6227281d9fc771f648a984dce03a6a1f047d3432` — boundary documentation
- `beb99b3d77035233ca6508c926207e71f0941c9b` — index.html extraction
- `2db10df119c0c1c30d6ef7b2efd87554ba2736e6` — workflow integration and CI-tested head

This save-point documentation commit is the next commit on the same branch.

## Explicit project constraints
- Keep work on `feature/opponent-turn-history`.
- Do not merge or rebase `feature/opponent-turn-history-clean-reset`.
- Do not touch `main`.
- User does not have Python locally; use GitHub Actions for Python-based checks.
- Continue using small, reversible extraction boundaries.

## Explicit exclusions for future extraction work
Do not broadly extract:
- battle state
- events/undo
- Tactical Advisor
- combat engine
- physical-dice resolver
- renderer/bootstrap
- cloud authentication

## Next task
Perform a fresh READ-ONLY dependency audit of the remaining low-risk `index.html` candidates. Compare candidates before editing and prefer another coherent pure utility boundary. Make only one small reversible extraction, run CI, browser-test the affected feature, and create the next save point only after browser verification.
