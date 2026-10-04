# CHAT SAVEPOINT — 2026-10-04 HTML UTILITY VERIFIED

## Repository / branch
- Repository: `Grumpa916/onoforge40k`
- Authoritative branch: `feature/opponent-turn-history`
- Save point created after successful browser verification.

## Save point purpose
This checkpoint captures the verified extraction of the pure HTML escaping helper from `index.html` into a dedicated utility module.

## Previous save point
- `b2b198f080d73995bb4cb1d1aae23ec0358d794b`
- `CHAT_SAVEPOINT_2026-10-04_SAVED_LIST_DISPLAY_VERIFIED.md`

## Extraction completed
Moved only the pure `esc(s)` HTML escaping helper from `index.html` to:
- `js/ui/html-utils.js`

The existing browser-global `esc` name remains intact so all current callers continue to work without caller changes.

The module also exposes:
- `OnoForgeHtmlUtils.esc`

## Regression coverage
Added:
- `tests/html-utils.test.js`

Coverage includes:
- plain strings
- HTML metacharacters
- null / undefined
- numeric input
- namespace access

## Boundary documentation
Added:
- `INDEX_HTML_HTML_UTILS_BOUNDARY.md`

The boundary is intentionally limited to a pure, state-free, DOM-free, network-free utility. No battle state, events/undo, Tactical Advisor, combat engine, physical-dice resolver, renderer/bootstrap, or cloud authentication was moved.

## Workflow integration
Updated:
- `.github/workflows/opponent-turn-event-preview.yml`

The workflow now:
- runs the HTML utility regression
- syntax-checks `js/ui/html-utils.js`
- copies the utility into the preview tree
- bundles it into the standalone iPad preview

## CI verification
Successful GitHub Actions run:
- Run ID: `37211610252`
- Workflow: `Opponent Turn Event Capture Preview`
- Head SHA: `c2c840d752dbe93d8d830c7a7886b7719c478206`
- Conclusion: `success`
- All validation steps passed, including the new HTML utility regression, syntax validation, preview build, standalone preview generation, and artifact upload.

Artifact:
- `onoforge40k-opponent-turn-event-preview`
- Artifact ID: `11306607089`

## Browser verification
User manually opened the generated standalone preview and confirmed:
- application loaded normally
- Saved Lists rendered normally
- saved roster names displayed correctly
- saved dates displayed correctly
- intentional Permanent Test badges appeared correctly
- no visible rendering regression was observed

User explicitly reported:
- `pass. ready for the save point`

## Current code state
The extraction commit that changed `index.html` is:
- `b0ff48a8a65b994b822b12e87489ae178a62bf9f`

The subsequent workflow-integration commit is:
- `c2c840d752dbe93d8d830c7a7886b7719c478206`

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
