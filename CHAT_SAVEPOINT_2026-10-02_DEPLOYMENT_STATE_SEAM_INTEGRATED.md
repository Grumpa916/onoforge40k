# OnoForge 40K — Deployment State Seam Integration Save Point

Date: 2026-10-02
Branch: `feature/opponent-turn-history-clean-reset`

## Verified milestone

The controlled-reset deployment state seam has been integrated into the monolithic application.

Verified baseline/save-point ancestry remains based on `fca58ec69031e9b64ec04e96afe534b91301bebd`.

Integrated `index.html` blob before this documentation-only commit:
`0438ed19967977b6180bb94bd3bc16e3644daac9`

Branch integration commit before this save-point document:
`6b6becb5dc5e7a66d74c6766168a6545178b6b1b`

## Integrated boundary

`deployment-state.js` provides the bounded state-only contract for:
- deployment-plan keying and initialization
- deployment-plan position read/write/delete
- 0.1-inch coordinate normalization and bounds rejection
- battlefield position initialization/read/write/delete
- friendly/opponent side and source preservation
- optional battlefield round preservation

`index.html` loads `deployment-state.js` and retains compatibility wrappers so existing render, save, event-log, reserve, and combat callers remain in the monolith.

## Explicitly not changed by this milestone

- Live Deployment Tracking panel behavior/state diagnosis
- deployment geometry
- terrain/objective geometry
- reserve workflow
- Shooting, Charge, Fight, opponent-turn, or round-transition gameplay logic

## Validation performed

- Branch HEAD verified after user upload.
- Compare against controlled-reset save point shows the bounded deployment integration files only: `index.html`, `deployment-state.js`, contract audit, and existing controlled-reset documentation.
- `deployment-state.js` source verified from the branch.
- `deployment-state-contract-audit.js` contains 14 contract assertions.
- Local integrated HTML was checked for exactly one `deployment-state.js` script reference and the expected compatibility wrapper references.
- Extracted inline application JavaScript passed `node --check`.
- HTTP serving of the integrated HTML returned HTTP 200 with the expected 1,066,413-byte artifact.
- Headless Chromium launch was attempted but did not complete within the execution timeout; no successful browser-runtime claim is made from that attempt.
- GitHub combined status for commit `6b6becb5dc5e7a66d74c6766168a6545178b6b1b` returned no status entries, and no workflow runs were associated with that commit. This is not a failure result; it means CI did not provide a run for this commit.

## Next step

Generate/serve the exact committed branch artifact for manual HTTP/tablet testing. The first manual test target is deployment setup and state persistence only; do not use the Live Deployment Tracking symptom as the first test target.
