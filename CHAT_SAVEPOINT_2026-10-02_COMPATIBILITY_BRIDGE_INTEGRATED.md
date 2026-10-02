# OnoForge 40K — Save Point
## Deployment Compatibility Bridge Integrated — 2026-10-02

Repository: `Grumpa916/onoforge40k`

Authoritative branch:
`feature/opponent-turn-history-clean-reset`

Current save-point commit:
`33b1ee411169c45b41a6c87a0a489d69987262e4`

The application state captured by this save point is the immediately preceding commit:
`b1db8b257a9d8d0ac9f5c24eef16202e183f8682`

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

## Completed in this milestone

### Historical drift reduction

Existing project documents were reconciled so the current development line and controlled-reset methodology are consistent. No new master-plan hierarchy was created.

### Large-file development constraint addressed

The repository's `index.html` is approximately 1.066 MB and cannot be reliably handled through the normal chat file-transfer path. GitHub Actions now performs full-file audits against the checked-out repository source, avoiding manual transfer of the monolith for development changes.

### Compatibility bridge

`deployment-state.js` remains the extracted deployment-state seam.

`deployment-bridge.js` provides the compatibility surface and owns no duplicate state. The monolith now loads the bridge and the deployment wrapper functions route their extracted-state calls through `OnoForgeDeploymentBridge`.

The automated integration migrated 12 direct `OnoForgeDeploymentState.*` references in `index.html` to the bridge and added the bridge script tag.

The resulting monolith change was committed by GitHub Actions as:
`cdb0e79` (`feat: integrate deployment compatibility bridge [deployment-bridge-integrated]`)

The one-time integrator script/workflow was then removed. The captured application state was validated by Deployment Panel Regression run #39 on `b1db8b257a9d8d0ac9f5c24eef16202e183f8682`.

## CI verification

Deployment Panel Regression run #39:
head SHA `b1db8b257a9d8d0ac9f5c24eef16202e183f8682`
conclusion: `success`

Verified steps:
- full `index.html` deployment-boundary audit: success
- deployment-state compatibility bridge audit: success
- deployment panel regression: success

The inline JavaScript regression test was corrected so external `<script src="...">` files are excluded from the inline `index.html` syntax extraction. This was a test-harness correction, not an application behavior change.

## Important architectural finding

The CI boundary audit exposed that the monolith's deployment compatibility surface is already concentrated in a small wrapper block around lines approximately 730–871, with the map/rendering and event orchestration remaining in the monolith.

The next extraction target should therefore be the **deployment interaction/rendering lifecycle**, not another state-store rewrite.

The Live Deployment Tracking symptom remains:
- panel closes after unit selection
- panel closes after changing My army ↔ Opponent army

Do not return to speculative panel-only patches first. Use the new bridge boundary to continue separating deployment interaction/rendering from the monolithic `render()` lifecycle.

## Preserve

- Event Companion battlefield geometry and data source
- physical tabletop measurement authority
- deployment planning vs live battlefield-position distinction
- Shooting, Charge, Fight/opponent-turn, and round-transition behavior

## Local environment constraint

Python is NOT installed on the Windows computer used for OnoForge testing. Do not instruct the user to use `python`, `py`, or `python3` for local serving unless the user explicitly confirms Python has been installed.

## Next bounded target

Inspect and extract the **deployment interaction/rendering seam** around:
- `objectiveMapRendererHtml`
- `deploymentTrackingControlsHtml`
- `deploymentTrackingEditorHtml`
- deployment-side/unit selection event handling
- live deployment panel state/render lifecycle

Use GitHub Actions for full `index.html` inspection/modification where needed. Avoid manual monolith transfer unless browser testing actually requires a generated artifact.

Do not modify battlefield geometry to solve the state/UI problem.
