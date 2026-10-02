# OnoForge 40K — Chat Save Point
## Controlled Reset / Deployment Diagnostic Pause / 2026-10-02

Repository: `Grumpa916/onoforge40k`

## Authoritative branch

`feature/opponent-turn-history-clean-reset`

Save-point HEAD at time of creation:
`e10ac4c76a6e1400d10c1c555dc56199ae0f8625`

Parent:
`5c26870c86df8dc52722115288e168cac3710865`

This save point supersedes the 2026-10-01 controlled-reset save point for continuation purposes. The older save point remains in the repository as historical context.

## What was completed before this pause

The clean-reset development branch was established from the known-good gameplay checkpoint:

`132551b340bdff635eeb9b193470f2c1a8e46ccd`

The prior deployment-redesign/debugging line remains preserved on:

`archive/deployment-redesign-2026-10-01`

at:
`aee09c197b70af523bfad59d14d117fd79c8303c`

### Deployment-state extraction

A bounded `deployment-state.js` module was created and corrected to preserve the existing deployment semantics, including:

- deployment-plan key/fallback behavior
- coordinate normalization to 0.1"
- side/source semantics
- battlefield round support
- reserve/mutation constraints
- existing deployment/battlefield state accessors

The module exposes `window.OnoForgeDeploymentState` with the established deployment/battlefield state functions.

The integration commit was:
`6b6becb5dc5e7a66d74c6766168a6545178b6b1b`

The corrected module contract was committed at:
`2f35c041b840e75f6f68f3f154296278a0dad0af`

An integration documentation save point was:
`4afe547f641b281e3d21e5df8c0a94c98d812886`

The integrated `index.html` blob at that stage was:
`0438ed19967977b6180bb94bd3bc16e3644daac9`

### Live Deployment Tracking investigation

The observed bug is:

**Live Deployment Tracking collapses/ closes when the user selects a unit or changes My army ↔ Opponent army.**

The first bounded code change removed DOM-state capture from `render()`:

```
const liveDeploymentPanel=document.querySelector('[data-live-deployment-panel]');
if(liveDeploymentPanel)state.liveDeploymentPanelOpen=!!liveDeploymentPanel.open;
```

Application upload/commit:
`92761fccbc57eb7f499d30b44383917ba0a77e71`

The regression test was then aligned with the intended state-driven behavior:
`d49455aaa46f5d6542ce7d1e03229ed340acbc5d`

A later test-only baseline restoration commit was:
`5c26870c86df8dc52722115288e168cac3710865`

### Current GitHub Actions status at save point

The latest observed deployment-panel regression workflow for the current HEAD completed successfully:

Run #21:
- workflow: Deployment Panel Regression
- head SHA: `e10ac4c76a6e1400d10c1c555dc56199ae0f8625`
- conclusion: `success`

Run #20 on `5c26870c86df8dc52722115288e168cac3710865` also completed successfully.

A prior diagnostic/prohibition test run failed by design because the test temporarily asserted that the global Live Deployment toggle listener must not exist. That test-only assertion was subsequently removed/restored by the passing baseline commit. The failure was not evidence that the production application upload itself had failed.

## Manual testing findings

The user tested multiple local artifacts over HTTP.

Verified:
- The deployment planning UI and verified Event Companion geometry rendered correctly when served in the proper HTTP environment.
- Deployment maps were populated and usable enough to confirm that the geometry/data path was working.
- The Live Deployment Tracking panel still closed when selecting a unit.
- Changing My army to Opponent army also caused the panel to close.

Important:
**Do not claim the Live Deployment Tracking repair is browser-verified. It is not.**

## Diagnostic artifact status

A local-only diagnostic artifact was prepared:

`index-live-panel-debug.html`

and then:

`index-live-panel-debug-v2.html`

These were diagnostic test artifacts only and were **not committed as production application changes**.

The v2 diagnostic was designed to expose:
- whether `state.liveDeploymentPanelOpen` is true/false
- render count
- render-state observations
- summary click state
- post-task summary state
- state observed immediately before a side-change render
- last diagnostic action

The user initially did not see the debug strip, so a more obvious diagnostic banner was added.

The investigation then revealed a local-server path problem: the user's port-8000 HTTP server was not serving the Downloads folder containing the diagnostic file. A direct request to:

`http://127.0.0.1:8000/index-live-panel-debug-v2.html`

returned 404.

A `view-source:http://127.0.0.1:8000/` check confirmed that the currently served `index.html` did not contain the diagnostic banner text.

Therefore:
**the absence of the diagnostic banner was a local test-environment/source-selection issue, not evidence about the production diagnostic logic.**

No additional production patch should be made based on that failed diagnostic delivery.

## Permanent local environment constraint

The repository now contains:

`PROJECT_ENVIRONMENT_NOTES.md`

Commit:
`e10ac4c76a6e1400d10c1c555dc56199ae0f8625`

Permanent fact:

**Python is NOT installed on the Windows computer used for OnoForge local testing.**

Do not instruct the user to use:
- `python ...`
- `py ...`
- `python3 ...`

unless the user explicitly confirms Python has since been installed.

This was verified repeatedly, including the 2026-10-02 session.

The established local OnoForge server runs on port 8000. Future local-server troubleshooting should first identify the existing server's serving directory/process rather than assuming Python is available.

## Important testing/environment lesson

The recent test loop exposed uncertainty about which exact `index.html` was being served.

For future work:

**GitHub commit is authoritative. A local downloaded file is only a test artifact.**

Before asking the user to test an artifact:
1. establish the exact source commit,
2. establish the exact artifact relationship to that commit,
3. establish the server directory/path,
4. then perform the manual HTTP/tablet-style test.

Avoid repeated:
diagnose → speculative patch → upload → wrong-file discovery → another patch → retrigger loop.

Use:
inspect → bounded change → commit → validate exact commit → generate artifact → verify artifact source → test → record result.

## What must NOT happen on resume

Do not:
- restart the project from zero
- discard the clean-reset branch
- treat the old deployment-redesign branch as authoritative
- patch Live Deployment Tracking again without first establishing the actual runtime state transition
- alter Event Companion battlefield geometry to solve a file:// or serving problem
- use Python-based local-server instructions
- make manual index.html uploads the normal development workflow
- claim browser verification without the user's actual result

## What should happen next

The next session should begin by verifying:

Repository:
`Grumpa916/onoforge40k`

Branch:
`feature/opponent-turn-history-clean-reset`

Current save-point HEAD:
`e10ac4c76a6e1400d10c1c555dc56199ae0f8625`

Then read this save point and inspect the exact deployment/reserves/battlefield boundary.

The preferred development target remains:

**establish a trustworthy deployment subsystem boundary around the existing playable application rather than continuing to patch the monolithic Live Deployment Tracking symptom.**

The extraction should be incremental and behavior-preserving.

Preserve previously verified:
- Shooting
- Charge
- Fight/opponent-turn flow
- round transition

Physical tabletop measurements remain authoritative; map positioning is contextual/rough.

## Broader project state to preserve

The project philosophy remains:
- tablet-first tournament workflow
- fast live data entry
- reduced player bookkeeping
- phase-relevant information
- complete the actual game loop before advanced expansion
- one bounded action/system at a time

The earlier handoffs establish successful live testing of the main Shooting, Charge, Fight, opponent-turn, and round-transition workflows. The broader known gap remains full melee dice/wound transaction integration inside Fight Execution.

## Resume instruction

When resuming from this save point:

**Do not assume the local diagnostic artifact is currently being served.**
First verify the local server source path if manual browser testing is needed.

**Do not make another Live Deployment panel workaround first.**
Start with repository inspection and the bounded deployment subsystem boundary.

Never claim a code change, upload, test, or deployment unless GitHub/tool evidence or the user's actual manual result establishes it.
