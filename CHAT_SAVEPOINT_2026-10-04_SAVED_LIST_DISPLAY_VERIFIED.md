# OnoForge 40K Save Point — 2026-10-04 Saved-List Display Verified

Repository: Grumpa916/onoforge40k
Authoritative branch: feature/opponent-turn-history

## Verified starting point
Previous timer/extraction milestone:
- 186808ffb6a987182c63a08a64c4d4531206efe1
- Application code reference before that save point: a2a9389673011ba30f76bda3c94d526dc81b481f

## Completed extraction
Chosen low-risk pure boundary: saved-roster display utilities.

Extracted from index.html into js/data/saved-list-utils.js:
- rosterCreatedLabel(value)
- savedRosterDisplayName(x)

Existing global names were preserved for compatibility.

Tests added/updated:
- tests/saved-list-utils.test.js

Boundary documentation:
- INDEX_HTML_SAVED_LIST_DISPLAY_UTILS_BOUNDARY.md

## Browser verification
PASSED.

Verified saved-list behavior:
- Saved roster names display correctly.
- Saved roster date/display labels remain correct.
- Active roster labeling remains functional.
- No cloud-auth testing performed; cloud authentication remains parked until hosted HTTPS testing.

## CI verification
GitHub Actions passed on the extraction:
- saved-list utility regression
- game timer turn-boundary regression
- geometry utility regression
- primary scoring utility regression
- opponent-turn resolver/capture regressions
- bidirectional combat edge-case regression
- architecture audit
- inline JavaScript syntax validation
- standalone preview build

CI preview artifact was built successfully.

## Current code commit
f2b400408db0779ead7536be185f1db99541cbe6

Note: the branch subsequently contains the save-point documentation commit itself.

## Next task
Perform another fresh read-only dependency audit of remaining low-risk index.html candidates. Prefer another coherent pure utility boundary. Compare candidates before editing. Make one small reversible extraction, run CI, browser-test the affected feature, and only then create the next save point.

## Explicit exclusions
Do not broadly extract:
- battle state
- events/undo
- Tactical Advisor
- combat engine
- physical-dice resolver
- renderer/bootstrap
- cloud authentication

Keep work on feature/opponent-turn-history. Do not merge/rebase feature/opponent-turn-history-clean-reset. User does not have Python locally; use GitHub Actions for Python-based checks.
