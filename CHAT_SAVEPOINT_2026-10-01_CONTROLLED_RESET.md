# OnoForge 40K — Chat Save Point
## Controlled Reset Entry / 2026-10-01

Repository: `Grumpa916/onoforge40k`

### Authoritative continuation branch

**Clean development branch created for this reset:**
`feature/opponent-turn-history-clean-reset`

**Current clean-reset HEAD:**
`9da4e713241b1ad78266e4d1b72d713f6bde08d2`

The branch was created from the known-good gameplay checkpoint:
`132551b340bdff635eeb9b193470f2c1a8e46ccd`

That checkpoint was the latest known-good checkpoint carried forward from the bidirectional-combat work. The existing handoff identifies `6969ac316727c100c1092c1724f33a81a016dc18` as the earlier Tactical Advisor/Fight known-good UI checkpoint, while `132551...` is the later tested current branch checkpoint.

### Preservation branch

The prior deployment-redesign/debugging state was preserved without altering it:

`archive/deployment-redesign-2026-10-01`

Archive branch points to:
`aee09c197b70af523bfad59d14d117fd79c8303c`

That commit's purpose was only to remove the temporary deployment-panel repair workflow. The deployment/debug history remains intact on that archive line.

---

# Why this reset was started

The immediate issue was repeated failure around the new deployment workflow, especially:

- both deployment maps initially appearing blank in local testing
- `Start Battle` being blocked by deployment validation during development
- the Live Deployment Tracking panel collapsing when a unit was selected
- multiple temporary GitHub Actions/patch workflows and manual `index.html` uploads
- uncertainty about which exact `index.html` was actually being tested
- a repair workflow being applied/removed without establishing a reliable source-to-test chain

The important conclusion from the conversation was:

**Do not restart OnoForge from zero. Restart the deployment implementation/development method from a known-good checkpoint.**

The project itself, prior gameplay work, handoffs, audits, and existing files are retained.

---

# Exact technical findings from the last investigation

The exact `index.html` used in the user's local test was uploaded into the conversation and inspected directly. It was approximately 1.06 MB and about 11,754 parsed lines.

The deployment UI is still part of the large `index.html` monolith.

Relevant functions found in the deployment region include:

- `objectiveMissionKey`
- `objectiveLayoutInfo`
- `ensureObjectiveLayoutForMission`
- `setObjectiveMapLayout`
- `deploymentPlanKey`
- `ensureReserveState`
- `isUnitReserved`
- `reserveUnitsForSide`
- `clearReserveDeclarationsForSide`
- `setReserveDeclaration`
- `reserveDeclarationSectionHtml`
- `reserveTrayHtml`
- `deployReserveByMap`
- `ensureTransportEmbarkations`
- `transportEntry`
- `isUnitEmbarked`
- `transportPassengers`
- `clearTransportEmbarkation`
- `setTransportEmbarkation`
- `transportDeclarationSectionHtml`
- `ensureDeploymentPlans`
- `deploymentPlanForCurrentMap`
- `deploymentPlanPosition`
- `setDeploymentPlanPosition`
- `clearDeploymentPlanPosition`
- `clearDeploymentPlanForCurrentMap`
- `saveDeploymentPlan`
- `loadDeploymentPlan`
- `objectiveMapModel`
- `ensureBattlefieldUnitPositions`
- `battlefieldUnitPosition`
- `setBattlefieldUnitPosition`
- `clearBattlefieldUnitPosition`
- `battlefieldDistanceBetween`
- `objectiveDistanceFromUnit`
- `battlefieldTerrainGeometry`
- `battlefieldTerrainAtPoint`
- `battlefieldTerrainPathIntersections`
- `battlefieldPositionEditorHtml`
- `deploymentTrackingControlsHtml`
- `deploymentTrackingEditorHtml`
- `objectiveMapPlacementPanelHtml`
- `objectiveMapUnitNodesHtml`
- `objectiveMapPlanGhostNodesHtml`
- `terrainReferenceImageHtml`
- `objectiveMapRendererHtml`
- `deploymentPlanMapControlsHtml`
- `deploymentPlanPositionEditorHtml`
- `completeTerrainSetup`
- `objectiveLayoutHtml`

The exact source showed that `objectiveLayoutHtml()` constructs the Live Deployment Tracking section as a `<details>` element whose `open` state is derived from:

`state.liveDeploymentPanelOpen`

The source also contains a document-level `toggle` listener which writes:

`state.liveDeploymentPanelOpen = !!panel.open`

The unit-selection/change handler then updates `state.battlefieldMapPlacement` and calls `render()`.

The state initialization inspected did **not** include a reliable initial `liveDeploymentPanelOpen` property.

This means the observed collapse behavior is consistent with the full app re-render replacing the `<details>` element and rebuilding it without a reliably preserved open state.

Important: this diagnosis is based on the exact uploaded local-test `index.html`; it is not an assumption about an unseen file.

---

# Deployment geometry finding

The blank-map problem was traced separately from the panel-state issue.

The deployment renderer requires verified Event Companion geometry. The application loads:

`./data/warhammer-event-companion-v1.2.json`

When the application was served over HTTP with the `data/` asset available, the user successfully saw populated deployment maps with:

- battlefield geometry
- deployment zones
- terrain
- objectives

That manual test established that the Event Companion geometry/environment was loading correctly in the proper HTTP test environment.

Therefore:

**Do not change the verified battlefield geometry merely because the earlier file:// test showed blank maps.**

The live-game workflow also established an important product requirement:

**Precise tabletop measurements are not to be inferred from the map. The user physically measures the real battlefield; map positioning is context/rough positioning, not the authoritative exact charge measurement.**

---

# Start Battle finding

The source contains `startBattle()`.

In the deployment-redesign history, development temporarily changed its gating behavior to allow Start Battle during setup/development. The current clean-reset branch should not blindly carry forward that temporary deployment redesign.

The new development approach must first re-establish the authoritative tournament/deployment lifecycle behavior and test it cleanly.

---

# Git history findings

The current `feature/opponent-turn-history` branch had accumulated a large number of deployment-related commits after the known-good gameplay checkpoint.

Relevant commits include:

- `132551b340bdff635eeb9b193470f2c1a8e46ccd` — latest known-good gameplay checkpoint used as the clean-reset starting point
- `2d444b842c8b467d4140cbc6f9da0dbbee8058c9` — Apply verified Pass 1A UI baseline
- `e3aa5262ea2ea550fcacc5c0b55b97bba35b7a77` — Replace `index.html` with Pass 1A deployment redesign
- `5a0c064508f65e9181e4840c4467deb092f7ebc2` — Include Event Companion geometry data in preview artifact
- `0db4b4c36cc1a44b70d480993c42ff0aefebf739` — deployment panel state repair
- `d3717063549a42fa98d8621846c60f8163a68896` — add temporary deployment panel repair workflow
- `6b6ece4697b4b0bee207cfaa196e66f5fa2e0232` — retrigger repair
- `a51d95a499a00215355fb1d8aeae98ff818c6a8d` — repair workflow guard
- `0628c673b75eb62991810d09402626dab97d794a` — retrigger repair
- `1e855fe10e94b7ab00c9809c5ee8f1dbe108b515` — fix deployment tracking panel state on unit selection
- `d7c9bd2d0eb3c2f725f5f7e4f34bc65ea683865c` — Add files via upload
- `aee09c197b70af523bfad59d14d117fd79c8303c` — remove temporary deployment panel repair workflow

The history demonstrates why the next method must avoid repeated patch/upload/retrigger loops.

---

# What has already been verified in the broader project

The repository handoffs establish these major gameplay milestones as previously tested:

### Shooting

Verified live end-to-end:

Shooting → Exocrine → Lieutenant → 15"
→ LOS Yes → Bio-plasmic Cannon
→ Pre-Roll → physical dice → hits
→ wounds → saves → resolution review
→ damage → casualty → Action Log

A model identity mismatch between generic combat-snapshot IDs and persistent roster IDs was fixed.

### Charge

Previously verified:

- Charge phase opens
- Tactical Advisor attacker can be changed
- Tactical Context enemy target can be changed independently
- battlefield movement changes distance/eligibility
- Tactical Advisor cache invalidates when battlefield positions move
- charge context defaults to not already engaged
- no legal target does not trap the user
- physically measured distance is the authoritative charge-distance input
- charge success/failure can be recorded
- successful charge carries into Fight

### Fight / opponent-turn loop

Previously verified in the handoff:

- Fight setup UI
- friendly Fight resolution state
- enemy Fight Back resolution state
- Action Log entries for both
- full My-turn phase sequence
- End Turn → Opponent
- opponent Command → Movement → Shooting → Charge → Fight
- End Turn → Next
- Round 2 → Command → My turn

The known current gameplay gap before the deployment work was full actual melee dice/wound transaction integration inside Fight Execution.

These prior milestones must be preserved while the deployment subsystem is rebuilt.

---

# Project North Star

The original project philosophy remains:

- tablet-first tournament workflow
- fast live data entry
- reduce player bookkeeping
- surface phase-relevant information
- complete the actual game loop before expanding advanced systems
- make one complete game action work, test it live, then expand

Do not let architecture/audit bookkeeping displace playable-app development.

---

# Architecture guardrails already established

The earlier architecture work established:

1. No gameplay changes during structural extraction batches.
2. One subsystem at a time.
3. Preserve public behavior.
4. Do not use refactoring work to displace playable-app development.
5. Keep regression/deployment gates green.
6. Proposed extraction order:
   - shared identity/state contracts
   - deployment/reserves/battlefield
   - combat/physical dice
   - missions/objectives/scoring
   - tactical advisor
   - UI shell

The immediate reset work belongs to the deployment/reserves/battlefield layer.

---

# New development method agreed in this conversation

This is the key difference from the failed patch cycle.

### Source of truth

**GitHub is the authoritative source.**

Do not make manual `index.html` upload/re-upload the normal development process.

Every intended code change should be tied to a specific commit on:

`feature/opponent-turn-history-clean-reset`

### Development sequence

1. Start from the exact clean-reset checkpoint described above.
2. Inspect and isolate the deployment subsystem boundary.
3. Build the deployment subsystem as a bounded unit.
4. Validate it before reconnecting it to broader feature work.
5. Generate the test package from the committed branch source.
6. Verify that the file being tested corresponds to the intended commit.
7. Perform the manual HTTP/tablet-style test.
8. Only after the deployment gate passes should broader integration continue.

### Anti-loop rule

Do not do this again:

diagnose → patch → upload → discover wrong file → patch repair → retrigger workflow → upload again.

Instead:

inspect → define one bounded change → commit → validate exact commit → test → record result.

A failed test is evidence about the implementation. It is not automatically a reason to add another workaround.

---

# Immediate next development target

The first target on the clean-reset branch is **not** another fix to the existing monolithic Live Deployment panel.

The first target is to establish a trustworthy deployment subsystem boundary around the existing playable application.

That subsystem must ultimately support:

- tournament deployment setup
- verified Event Companion battlefield geometry
- deployment planning for both armies
- live deployment tracking for both armies
- authoritative unit-position state
- unit selection/movement without collapsing the tracking panel
- state persistence through normal renders
- undo
- deployment event logging
- transition into battle without losing authoritative live positions

The exact implementation should be chosen after inspection of the checkpoint source and dependency boundary. Do not invent a separate parallel deployment system merely to hide the existing problem.

---

# Important operational note about the current monolith

The repository's `index.html` is about 1.06 MB and contains the majority of the application's runtime.

The clean-reset effort should therefore treat extraction as a controlled process, not as a giant rewrite.

Do not attempt to extract the entire application at once.

Do not alter unrelated combat, mission, scoring, or Tactical Advisor behavior during the first deployment extraction increment.

---

# User experience requirement

The user has repeatedly needed downloadable/locally testable packages and has been frustrated by manual file replacement.

The desired future workflow is:

**commit in GitHub → automated validation → generated test artifact → user tests the artifact**

rather than manual source-file swapping.

---

# Instructions for the next ChatGPT session

Start by reading this save point.

Then inspect GitHub directly.

Do **not** assume the prior current branch is the source of truth for new deployment work.

Use:

- repository: `Grumpa916/onoforge40k`
- clean branch: `feature/opponent-turn-history-clean-reset`
- clean-reset HEAD at save point: `9da4e713241b1ad78266e4d1b72d713f6bde08d2`
- deployment/debug archive: `archive/deployment-redesign-2026-10-01`

The first task is to verify these refs and inspect the exact source/dependency structure at the clean checkpoint.

**Do not start by patching the Live Deployment Tracking panel.**

First establish the deployment subsystem boundary and identify the smallest safe extraction/integration increment.

Never claim a change was made, uploaded, tested, or deployed unless GitHub/tool evidence confirms it.

Never treat an uploaded local file as authoritative unless its exact relationship to the intended commit is established.

The user wants the project to continue from this save point without repeating the previous patch/re-upload loop.
