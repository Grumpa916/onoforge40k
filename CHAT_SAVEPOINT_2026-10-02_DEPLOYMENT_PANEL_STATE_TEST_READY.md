# OnoForge 40K — Deployment Panel State Test Ready

Date: 2026-10-02
Branch: `feature/opponent-turn-history-clean-reset`

## Verified checkpoint

Application integration commit:
`7b99003159926c18f39afd0ab616c100df67afc2`

Regression-test alignment commit:
`d49455aaa46f5d6542ce7d1e03229ed340acbc5d`

The current branch contains the state-driven Live Deployment panel architecture and the regression test aligned to that architecture.

## Verified application change

`index.html` no longer captures `[data-live-deployment-panel]` from the outgoing DOM inside `render()`.

The panel remains rendered from `state.liveDeploymentPanelOpen`, and the panel `toggle` handler persists its open/closed state.

## Automated validation

GitHub Actions workflow:
Deployment Panel Regression run #14
Run ID: `36975786636`
Head SHA: `d49455aaa46f5d6542ce7d1e03229ed340acbc5d`
Conclusion: SUCCESS

Job:
`deployment-panel`
Conclusion: SUCCESS

The previous run #13 failed because its test asserted the obsolete DOM-capture implementation. That test has now been rewritten to validate the intended state-driven behavior.

## Manual test required

Use the exact committed local HTTP artifact.

Test only:
1. Open Live Deployment Tracking.
2. Select a unit.
3. Confirm the panel remains open after the render.
4. Repeat with another unit selection if useful.

Do not combine this test with combat, reserve, geometry, or other deployment changes.

## Next milestone

After the manual panel-state test passes, proceed to deployment-state persistence testing and then save the result as a separate milestone.
