# OnoForge 40K — Current Architecture Map & Refactoring Plan

## Current controlled-reset architecture overlay — 2026-10-02

This overlay is authoritative for the current deployment refactor and supersedes older branch/baseline/current-phase statements elsewhere in this historical architecture map.

- Authoritative development branch: `feature/opponent-turn-history-clean-reset`
- Known-good gameplay checkpoint: `132551b340bdff635eeb9b193470f2c1a8e46ccd`
- Current state pointer: newest `CHAT_SAVEPOINT_*.md` on the authoritative branch
- Active extraction boundary: Deployment / reserves / battlefield map
- First extracted seam: `deployment-state.js`
- Immediate implementation target: compatibility bridge delegating to `OnoForgeDeploymentState`
- Do not patch Live Deployment Tracking behavior as the primary task; use the observed panel-closing behavior as evidence of monolith/render coupling.
- Preserve Event Companion battlefield geometry and the distinction between deployment planning state and live battlefield position state.

This is a controlled extraction, not a project restart. Larger bounded extraction batches are permitted when they reduce monolith coupling and remain recoverable through Git history.

## Current architecture at a glance

### Primary application

- `index.html` is the application shell, UI, state store, rendering layer, game logic, rules/math logic, and event/logging implementation.
- Current `index.html` size is approximately **1.03 MB**.
- The HTML contains **one inline JavaScript block** of approximately **938 KB**.
- There are currently **no external `<script src="...">` imports** in `index.html` in the historical baseline represented by this map. Current extracted modules may be integrated through controlled artifact/build seams; verify the current save point before assuming browser loading behavior.
- A source scan identifies approximately **708 named JavaScript functions** in the inline application code.

### Supporting repository modules

The repository also contains separate JavaScript files for checkpoint/debug infrastructure:

- `battleCheckpoint.js`
- `battleCheckpointAdapter.js`
- `battleCheckpointMapper.js`
- `battleStateInspector.js`
- `checkpointIntegrationPlan.js`
- `checkpointLoader.js`

These currently expose diagnostic functions through `window.OnoForgeDebug`. They are not loaded by `index.html` through script imports, so they should be treated as supporting/test scaffolding until explicitly integrated.

The deployment extraction adds `deployment-state.js` as an active state seam. Its current contract is state-only: no rendering, persistence, rules, reserves, or geometry.

### Data layer

The `data/` directory contains versioned/provenance-oriented rules and event-companion data, including:

- `rules-coverage-matrix.json`
- `warhammer-event-companion-v1.1.json`
- `warhammer-event-companion-v1.2.json`

### QA / deployment layer

The repository has a single active GitHub Actions deployment workflow:

- `.github/workflows/deploy.yml`

It performs integrity/regression audits, JavaScript syntax validation, runtime/internal-symbol validation, deployment preparation, and GitHub Pages publication.

The obsolete shooting UI hotfix workflow was removed after it became clear that repeated post-build mutation was creating unnecessary deployment complexity.

## Functional architecture map

### 1. Application state / persistence

Representative state families currently live under the global `state` object:

- battle identity/lifecycle
- current round/phase/turn
- friendly and opponent rosters
- army/list selections
- mission and scoring
- VP/CP
- objectives
- deployment plans
- reserves
- battlefield unit positions
- tactical advisor state
- tactical pair context
- combat/math rules
- secondary missions
- stratagem state
- action/history logs
- tournament timer
- rules-data pin

Key state helpers include:

- `ensureTacticalState`
- `ensureReserveState`
- `ensureDeploymentPlans`
- `ensureBattlefieldUnitPositions`
- `ensureModelRoster`
- `save`
- `load`
- snapshot/undo helpers
- event logging helpers

**Risk:** state schemas are broad and many subsystems read/write the same global object directly.

### 2. Army / model identity layer

Important model/roster functions include:

- `buildModelRoster`
- `ensureModelRoster`
- `modelRosterRule`
- `modelRosterWeaponCounts`
- `survivingModelRoster`
- `combatModelSnapshot`
- `combatSnapshot`

This layer is critical because model IDs cross subsystem boundaries.

**Known issue found during live shooting:** persistent roster IDs use an `<entry>-mN` form while generic combat snapshot IDs can use an `<entry>-model-N` form. The shooting pre-roll system therefore needed an ordinal mapping fallback.

**Refactor priority:** establish one canonical model identity contract before extracting combat/map modules.

### 3. Deployment / reserve / battlefield map

Deployment and map state is split into several related systems:

- deployment plans
- reserve declarations
- live battlefield positions
- objective/map geometry
- deployment tracking UI
- reserve tray / reserve deployment

Representative functions:

- `ensureDeploymentPlans`
- `deploymentPlanForCurrentMap`
- `setDeploymentPlanPosition`
- `saveDeploymentPlan`
- `loadDeploymentPlan`
- `ensureReserveState`
- `setReserveDeclaration`
- `deployReserveByMap`
- `ensureBattlefieldUnitPositions`
- `setBattlefieldUnitPosition`
- `battlefieldDistanceBetween`
- `battlefieldTerrainPathIntersections`
- `objectiveMapRendererHtml`

The repository already contains deployment/map regression audits confirming separation between planned deployment and live battlefield positions.

**Important boundary:**

`deploymentPlans` are planning/reference state.

`battlefieldUnitPositions` are live authoritative position state.

Do not merge these during refactoring.

**Current extraction seam:** `deployment-state.js` owns the normalized deployment-plan and live-position access/mutation functions without owning the map renderer, reserves, persistence, or geometry. The next bridge must delegate to this seam rather than create a duplicate state store.

### 4. Tactical context / advisor

Representative functions:

- `tacticalPairState`
- `setTacticalPairField`
- `tacticalAdvisorActionState`
- `tacticalAdvisorWeaponGroups`
- `tacticalPreRollPoolManifest`
- `tacticalPreRollCheck`
- `tacticalPreRollHtml`

The Tactical Advisor is intended to be read-only with respect to authoritative game outcomes.

### 5. Combat engine / physical dice resolution

Combat spans several layers:

**Eligibility / availability**
- `tacticalWeaponPhaseEligible`
- `tacticalWeaponModelAvailable`
- `tacticalWeaponModelUseCount`
- `attachedCombatWeaponGroups`

**Rules / math**
- `engineContext`
- `engineWeaponPoolKey`
- `engineApplicableWeaponAbilities`
- `engineOneAttack`

**Pre-roll**
- `tacticalPreRollWeaponState`
- `setTacticalPreRollWeapon`
- `tacticalPreRollCheck`
- `tacticalPreRollResolutionPlan`

**Physical-dice session**
- `tacticalPreRollOpenResolution`
- staged hit/wound/save entry
- resolution review
- application of result
- action logging

The repository already has a dedicated dice-entry architecture audit enforcing the rule that physical-dice battle resolution does not generate random dice.

### 6. Missions / objectives / scoring

Representative groups:

- primary mission selection and scoring
- secondary mission state machines
- objective control
- VP/CP
- scoring snapshots
- end-turn scoring
- end-game report

Examples:

- `primaryMission`
- `scorePrimary`
- `primaryObjectiveScoreSnapshot`
- `objectiveCountsForSide`
- `secondaryCatalogHtml`
- `secondaryScoringHtml`
- `changeVP`
- `changeCP`

### 7. Turn / phase / tournament operations

Representative systems:

- phase transitions
- current-turn state
- battle lifecycle
- game timer
- result locking
- recovery

The roadmap describes the intended lifecycle as:

`SETUP → DEPLOYMENT → LIVE → COMPLETED`

### 8. UI / rendering

Most UI is rendered from functions returning HTML strings, including:

- Army Builder UI
- Tactical Advisor
- Tactical Context
- Shooting Result
- Pre-Roll UI
- Battle Map
- deployment controls
- reserve tray
- mission/scoring panels
- modals
- tournament controls

Representative naming patterns include:

- `...Html()`
- `...PanelHtml()`
- `...Modal...`
- `...RendererHtml()`

The global `render()` function is the central assembly point.

## Critical cross-subsystem flow

The most important state flow to protect during refactoring is:

```
Army / roster definition
        ↓
Canonical entry + model identity
        ↓
Deployment / reserves
        ↓
Live battlefield position
        ↓
Tactical context
        ↓
Weapon / model eligibility
        ↓
Physical dice pre-roll
        ↓
Hits / wounds / saves
        ↓
Damage allocation
        ↓
Model wounds / casualty state
        ↓
Objective / scoring consequences
        ↓
Action log / persistence / recovery
```

This flow is more important than any individual UI module.

## Refactoring principles

1. **No gameplay changes during extraction.**
2. **One subsystem at a time.**
3. Preserve existing global behavior first; introduce explicit module APIs second.
4. Establish canonical model/unit/weapon identity before moving combat/map code.
5. Keep Mathhammer simulation separate from physical-dice resolution.
6. Keep deployment plans separate from live battlefield positions.
7. Keep Tactical Advisor read-only against authoritative battle state.
8. Keep event logging and undo semantics intact.
9. Run the existing repository audits after every extraction batch.
10. Do not introduce a framework solely for modernization.

The controlled-reset overlay modifies the size of an extraction batch, not these state/behavior boundaries.

## Recommended extraction order

### Phase 0 — Baseline

- Preserve the known-good gameplay checkpoint `132551b340bdff635eeb9b193470f2c1a8e46ccd`.
- Preserve `archive/deployment-redesign-2026-10-01` at `aee09c197b70af523bfad59d14d117fd79c8303c`.
- Use the newest controlled-reset save point as the current state pointer.

### Phase 1 — Shared contracts

Extract small, low-risk modules for:

- model identity helpers
- state schema/normalization helpers
- event/logging helpers
- constants and version identifiers

This phase should reduce coupling before moving larger features.

### Phase 2 — Deployment / map

Extract:

- deployment plan state
- reserve state
- live battlefield positions
- map geometry/render helpers
- compatibility bridge to the existing monolith

This is the first major extraction because the subsystem boundary is already relatively clear and covered by dedicated audits.

### Phase 3 — Combat

Extract:

- model/weapon identity adapters
- combat snapshots
- weapon eligibility
- physical-dice pre-roll
- physical-dice resolution session

Preserve the existing public function names as compatibility shims during migration where practical.

### Phase 4 — Missions / scoring

Extract:

- objectives
- primary scoring
- secondary missions
- VP/CP scoring state

### Phase 5 — Tactical Advisor

Extract:

- tactical state/context
- advisor calculations
- decision-surface rendering

Keep it read-only against the authoritative battle state.

### Phase 6 — UI shell

Reduce `index.html` toward:

- page shell
- navigation
- root mount area
- stylesheet imports
- module imports
- small compatibility bootstrap

## Proposed target repository structure

```
onoforge40k/
├── index.html
├── js/
│   ├── app.js
│   ├── state/
│   │   ├── state.js
│   │   ├── identity.js
│   │   └── events.js
│   ├── battle/
│   │   ├── lifecycle.js
│   │   ├── phases.js
│   │   └── timer.js
│   ├── deployment/
│   │   ├── plans.js
│   │   ├── reserves.js
│   │   └── battlefield.js
│   ├── combat/
│   │   ├── snapshots.js
│   │   ├── eligibility.js
│   │   ├── engine.js
│   │   └── physical-dice.js
│   ├── missions/
│   │   ├── primary.js
│   │   ├── secondary.js
│   │   └── objectives.js
│   ├── advisor/
│   │   ├── context.js
│   │   └── advisor.js
│   └── ui/
│       ├── render.js
│       ├── battle.js
│       ├── shooting.js
│       └── modals.js
├── data/
├── scripts/
└── tests/
```

This is a target structure, not an instruction to create all of these files immediately.

## Current immediate extraction batch

The current batch is the **Deployment compatibility bridge**.

Purpose:

- provide a stable API to the existing application;
- delegate state operations to `OnoForgeDeploymentState`;
- preserve the existing deployment-plan/live-position distinction;
- give future call sites a module boundary without requiring the entire `index.html` to move at once;
- make the bridge testable independently of map rendering.

The bridge must not:

- render the map;
- own terrain/objective geometry;
- persist state independently;
- create a second deployment state store;
- infer tabletop distances;
- alter existing deployment behavior.

## Definition of success

The refactor is successful when:

- the live app behaves identically,
- existing regression audits remain green,
- `index.html` no longer contains the majority of business logic,
- future edits can target a subsystem file instead of a 1 MB monolith,
- model/unit/weapon identity is consistent across Deployment → Live Map → Combat → Casualties,
- deployment produces the same app without post-build hotfix mutation.
