# OnoForge 40K Chat Save Point — Deployment Map Live Verified

**Date:** 2026-10-02 (local test session)
**Repository:** `Grumpa916/onoforge40k`
**Authoritative development branch at checkpoint creation:** `feature/opponent-turn-history-clean-reset`

## Checkpoint purpose

This checkpoint records the first successful live/manual verification that the deployment tracking map is functional in the current test artifact after the extended map/serving investigation.

## Repository state

At the start of this checkpoint, the authoritative development branch was at:

`1134c9984ed0a28311869d9e9b0d5c37107b480c`

Commit message:

`audit: map extraction dependencies in CI`

The checkpoint document itself is the only repository change made specifically to preserve this testing milestone.

## Known-good local test artifact

The manually tested artifact was the folder:

`onoforge40k-known-good-game-test-deployment-toggle-fix`

The actual application file was located one level below the folder root:

`of-fixed\index.html`

The root-level `index.html` did not exist in the test folder; this caused the earlier HTTP 404 when the folder root was served. The application loaded successfully when the `of-fixed` directory was addressed directly.

Successful test URL:

`http://127.0.0.1:8001/of-fixed/index.html`

## Environment constraint discovered/reconfirmed

The Windows test computer does **not** have Python installed and does **not** have Node.js available on PATH. Do not use Python or Node as prerequisites for reproducing this local test environment.

The successful local test used a Windows PowerShell `System.Net.HttpListener` server on port `8001`.

## Manual verification completed

The following were visibly verified in the live browser test:

- OnoForge 40K v337 application loads.
- Battle Setup/deployment workflow loads.
- Live Deployment Tracking map renders.
- Board geometry renders.
- Both deployment zones render.
- Terrain renders.
- Existing unit markers render.
- Deployment controls render.
- Unit selection works.
- Units can be dragged/moved on the deployment tracking map.
- Placement state visibly updates, including the `7 units placed` indicator in the tested state.

## Important diagnostic conclusion

The long-running map problem was **not demonstrated to be a fundamental failure of the deployment-map implementation**. The successful test established that the tested build contains a functioning deployment map and interaction layer.

The immediate 404 encountered during testing was caused by serving the parent directory instead of the directory containing `index.html`.

## Do not disturb this baseline

Treat the local `onoforge40k-known-good-game-test-deployment-toggle-fix\of-fixed\index.html` artifact as a **known-good manual-test baseline**. Do not modify that test copy while continuing development unless a separate copy is explicitly created.

Do not infer that this local artifact is itself a Git commit or that it is byte-for-byte identical to the authoritative branch without verification. The authoritative repository remains the GitHub branch named above.

## Next development/testing target

Proceed from this checkpoint by verifying the surrounding deployment workflow without breaking the now-proven map interaction:

1. Verify opponent-side deployment interaction.
2. Verify the complete alternating deployment workflow around the map.
3. Verify persistence/continuation of deployment state where applicable.
4. Preserve the known-good test artifact as the fallback reference while making subsequent changes.

Do not restart the map extraction or re-open the previously resolved serving/path problem unless new evidence requires it.

## Cross-chat resume instruction

When resuming this project, treat this document as a historical verification checkpoint, then reconcile it with the authoritative branch and the project's standing guidance documents before making changes.

The key fact to preserve is:

> **Deployment Tracking map selection and movement are manually verified working in the known-good local test artifact.**
