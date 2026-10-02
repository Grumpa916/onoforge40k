# OnoForge 40K — Save Point
## Deployment Interaction Seam Integrated — 2026-10-02

Repository: `Grumpa916/onoforge40k`

Authoritative branch:
`feature/opponent-turn-history-clean-reset`

Current save-point HEAD before this documentation commit:
`bdc7e804576dfd3493994b90fa51fca9cde0e831`

## Canonical project references

Do not create duplicate project-plan documents.

- `DEVELOPMENT_GUIDE.md` — development method
- `ARCHITECTURE_MAP.md` — architecture and boundaries
- `ROADMAP.md` — project direction
- newest `CHAT_SAVEPOINT_*.md` — current state

Older handoffs/save points are historical unless the newest save point explicitly references them.

## Protected baseline

Known-good gameplay checkpoint:
`132551b340bdff635eeb9b193470f2c1a8e46ccd`

Preserved pre-reset history:
`archive/deployment-redesign-2026-10-01`
→ `aee09c197b70af523bfad59d14d117fd79c8303c`

## Completed milestone

### Deployment state seam

`deployment-state.js` remains the extracted deployment-state subsystem.

### Compatibility bridge

`deployment-bridge.js` remains the compatibility surface and owns no duplicate state.

The monolithic application routes the deployment-state wrapper calls through `OnoForgeDeploymentBridge`.

### Deployment interaction seam

`deployment-interaction.js` is now integrated as the deployment/map DOM interaction layer.

The integration moved the following responsibilities out of the inline monolith event-handler block:

- Live Deployment Tracking panel toggle state capture
- deployment-side selection
- deployment/map unit selection
- reserve selection
- deployment/map pointer drag handling
- map placement click handling
- deployment/battlefield coordinate editor actions
- deployment plan save/load/clear controls

The external module receives an explicit adapter from `index.html` for state access and application actions. It does not create a second application state store.

The monolith now loads:
`./deployment-interaction.js`

The one-time CI integrator used to modify the >1 MB `index.html` was removed after successful integration.

## Verification

The deployment-panel regression workflow for commit:
`bdc7e804576dfd3493994b90fa51fca9cde0e831`

completed successfully.

Verified workflow steps:
- full `index.html` deployment-boundary audit: success
- deployment-state compatibility bridge audit: success
- deployment panel regression: success

The boundary audit now additionally verifies:
- deployment interaction script tag is present
- deployment interaction adapter installation is present
- the previous inline deployment toggle/change/pointer interaction markers are absent

## Important architectural result

The deployment subsystem now has three explicit layers:

`deployment-state.js`
→ state/data operations

`deployment-bridge.js`
→ compatibility surface for the existing monolith

`deployment-interaction.js`
→ deployment/map DOM interaction lifecycle

`index.html`
→ remaining application orchestration and rendering

The battlefield map renderer itself remains in `index.html` at this milestone. Event Companion geometry/data has not been changed.

## Live Deployment Tracking issue

The original user-observed symptom was:
- panel closes after unit selection
- panel closes after changing My army ↔ Opponent army

This milestone deliberately does not claim browser/tablet verification of the fix.

The interaction layer now owns the relevant event handling, but the actual user-visible behavior still needs HTTP/tablet verification against an artifact generated from this committed branch.

Do not claim the panel bug is fixed until the user verifies it.

## Large-file workflow improvement

`index.html` is approximately 1.066 MB. GitHub Actions is now the authoritative mechanism for full-file inspection and controlled monolith transformations. Manual download/copy/paste of the monolith should be avoided unless a browser test artifact specifically requires it.

## Local environment constraint

Python is NOT installed on the Windows computer used for OnoForge testing. Do not instruct the user to use `python`, `py`, or `python3` for local serving unless the user explicitly confirms Python has been installed.

## Next bounded target

First generate/validate a browser-test artifact from the exact committed branch source and perform the HTTP/tablet test of Deployment Planning and Live Deployment Tracking.

If the interaction behavior is verified, continue extracting the deployment/map rendering seam from `index.html`.

If the panel still closes, inspect the interaction adapter/state lifecycle using the committed module boundary rather than returning to ad-hoc inline event-handler patches.

Preserve:
- Event Companion battlefield geometry and data source
- physical tabletop measurement authority
- deployment planning vs live battlefield-position distinction
- Shooting, Charge, Fight/opponent-turn, and round-transition behavior
