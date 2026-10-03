# OnoForge 40K — Save Point
## Deployment Workflow — All Live Tests Pass — 2026-10-02

Repository: `Grumpa916/onoforge40k`
Authoritative branch: `feature/opponent-turn-history-clean-reset`

## Verified baseline

The previous checkpoint `CHAT_SAVEPOINT_2026-10-02_DEPLOYMENT_MAP_LIVE_VERIFIED.md` established that the Live Deployment Tracking map renders and supports unit selection and movement.

The present checkpoint extends that verification to the surrounding deployment workflow.

## Manual live-test results

Using the known-good local test artifact:

`onoforge40k-known-good-game-test-deployment-toggle-fix\of-fixed\index.html`

served successfully at:

`http://127.0.0.1:8001/of-fixed/index.html`

All requested deployment tests passed:

1. Opponent-side unit selection works.
2. Opponent-side units can be moved on the deployment map.
3. Switching between My Army and Opponent Army works without losing the deployment display.
4. Units on both sides retain their moved positions when switching sides.
5. Alternating deployment interactions work: My unit → Opponent unit → My unit → Opponent unit.
6. The deployment map remains functional throughout the workflow.

## Current conclusion

The Live Deployment Tracking map and its tested bidirectional deployment interaction/state workflow are manually verified working in the test artifact.

The map itself is no longer an active blocker for development.

Do not reopen map geometry, serving/path, or speculative panel-only repairs without new evidence.

## Protected local baseline

Keep the tested local artifact untouched as a fallback/reference copy. It is a manual-test artifact and should not be treated as a Git commit or assumed byte-for-byte identical to the authoritative branch without verification.

## Next bounded development target

Proceed with the planned deployment interaction/rendering extraction seam, using the now-verified behavior as the regression target. Preserve:

- Event Companion battlefield geometry and data source
- physical tabletop measurement authority
- deployment planning vs live battlefield-position distinction
- current working My Army/Opponent Army interaction
- unit selection and movement behavior

Use GitHub Actions for full `index.html` inspection/modification where needed; avoid manual monolith transfer unless browser testing requires a generated artifact.

## Environment constraint

Python is NOT installed on the Windows test computer. Node.js is also not available there. Do not use Python or Node as prerequisites for local testing unless the user explicitly confirms installation.

The successful local test used a PowerShell `System.Net.HttpListener` server on port 8001.
