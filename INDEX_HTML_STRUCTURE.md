# OnoForge 40K — `index.html` Structure Map

Last mapped: 2026-09-27
Repository: `Grumpa916/onoforge40k`
Branch: `main`

## Purpose

This document is the working structural map for the current `index.html` monolith.

It is intentionally **descriptive before refactoring**. The first goal is to identify ownership, dependencies, mutation points, and safe boundaries without changing gameplay behavior.

## Current entry point

`index.html` remains the primary application shell and currently contains the application's HTML, CSS, state, rendering, rules/math logic, battle workflows, event handling, and initialization.

Current repository architecture documentation records approximately:

- 1.03 MB total file size
- 938 KB inline JavaScript
- 1 inline JavaScript block
- 0 external script imports
- ~708 named JavaScript functions

See `ARCHITECTURE_MAP.md` and `ARCHITECTURE_INDEX.json` for the authoritative baseline measurements.

## Structural sections

### 01 — Document / global CSS

**Responsibilities**

- document metadata
- page shell styling
- shared controls
- cards, grids, buttons, status elements
- modal styling
- responsive behavior
- subsystem-specific CSS blocks

**Important rule:** CSS can be reorganized independently from application logic, but visual behavior should not change during structural work.

---

### 02 — Application shell

**Responsibilities**

- top-level application container
- branding/version display
- primary navigation
- tools menu
- root render mount

**Boundary:** shell owns navigation and mounting, not battle rules.

---

### 03 — Core constants / static data

**Responsibilities**

- identifiers
- configuration constants
- version identifiers
- static lookup data
- UI labels where centralized

**Boundary:** static definitions should not mutate authoritative battle state.

---

### 04 — Application state / persistence

**Responsibilities**

- global `state`
- state initialization and normalization
- save/load
- undo/snapshots
- event/history persistence
- rules-data pinning

Known entry functions include:

- `save`
- `load`
- `snapshotForUndo`
- `undoLastAction`
- `ensureTacticalState`
- `ensureReserveState`
- `ensureDeploymentPlans`
- `ensureBattlefieldUnitPositions`
- `ensureModelRoster`

**High-risk boundary:** many current subsystems directly read/write the global state object. Do not extract state piecemeal until its contracts are documented.

---

### 05 — Army / roster / physical model identity

**Responsibilities**

- army/list representation
- unit entries
- model roster creation
- persistent model identity
- model survival/casualty representation
- weapon counts by physical model

Important functions include:

- `buildModelRoster`
- `ensureModelRoster`
- `modelRosterRule`
- `modelRosterWeaponCounts`
- `survivingModelRoster`
- `combatModelSnapshot`
- `combatSnapshot`

**Critical contract:** one physical model must remain identifiable as the same model across deployment, battlefield movement, combat, damage and casualty state.

The recent Shooting work exposed a persistent-roster-ID versus combat-snapshot-ID mismatch, so this is a **do-not-break boundary** during future extraction.

---

### 06 — Rules / data / Mathhammer engine

**Responsibilities**

- rules interpretation
- weapon/stat calculations
- abilities and modifiers
- Mathhammer/simulation calculations
- rules-data provenance/pinning

Representative engine functions are documented in `ARCHITECTURE_MAP.md`.

**Important distinction:** Mathhammer simulation is not authoritative physical dice resolution.

---

### 07 — Deployment / reserves / battlefield

This should be treated as three related but distinct subsystems.

#### 07A — Deployment plans

Planning/reference state.

Key state:

- `deploymentPlans`
- `deploymentMapPlacement`
- `deploymentTrackingSide`

#### 07B — Reserves

Reserved units are not ordinary live battlefield positions until actually deployed.

Key state:

- `reserveDeclarations`

#### 07C — Live battlefield map

Authoritative current physical positions.

Key state:

- `battlefieldUnitPositions`
- `objectiveMapLayout`
- `terrainSetupComplete`

**Critical boundary:** deployment plans and live battlefield positions must remain separate.

---

### 08 — Battle lifecycle / phase management

**Responsibilities**

- battle lifecycle
- round
- phase
- current turn
- game timer
- completion/result locking
- recovery state

Current lifecycle model:

`SETUP → DEPLOYMENT → LIVE → COMPLETED`

Representative timer functions:

- `ensureGameTimer`
- `startGameTimer`
- `toggleGameTimer`
- `finishGameTimer`

---

### 09 — Missions / objectives / scoring

**Responsibilities**

- primary mission
- secondary missions
- objective control
- VP
- CP
- scoring snapshots
- end-turn/end-game scoring

Representative functions:

- `scorePrimary`
- `objectiveCountsForSide`
- `primaryObjectiveScoreSnapshot`
- `secondaryScoringHtml`
- `changeVP`
- `changeCP`

**Boundary:** scoring consumes authoritative battle state; tactical recommendation systems should not directly author scoring outcomes.

---

### 10 — Combat engine

Combat should eventually be understood as several layers rather than one block.

#### 10A — Combat snapshots

- target/unit snapshots
- model snapshots
- current combat state

#### 10B — Weapon eligibility

- phase eligibility
- model availability
- weapon-use limits
- attached-unit weapon groups

#### 10C — Rules/math resolution

- attack math
- weapon pools
- applicable abilities
- modifiers

#### 10D — Physical-dice workflow

- pre-roll setup
- physical dice entry
- staged hit/wound/save entry
- resolution review
- result application
- action/event logging

**Critical rule:** physical dice entered by the player are authoritative. The application must not generate random dice for the physical-dice battle workflow.

---

### 11 — Phase workflows

The combat engine and phase workflow are related but should remain distinguishable.

#### 11A — Movement

Movement eligibility, actions, positioning and related battle-state mutations.

#### 11B — Shooting

Current mature workflow includes:

- weapon/model eligibility
- Tactical Advisor interaction
- pre-roll workflow
- physical dice entry
- staged resolution
- application of results
- logging

**Protection rule:** Shooting is a known working baseline and should not be behaviorally altered during structural organization.

#### 11C — Charge

Current development area.

Includes:

- target evaluation
- charge eligibility/context
- charge recommendations
- charge result handling

Charge work should be organized without coupling it unnecessarily to Shooting internals.

#### 11D — Fight

Future/next major combat workflow.

The structure should reserve a clear location for Fight now, even before its implementation is complete.

---

### 12 — Tactical Context

**Responsibilities**

- tactical pair state
- selected attacker/target context
- contextual inputs used by advisory systems

Representative functions:

- `tacticalPairState`
- `setTacticalPairField`
- `tacticalAdvisorActionState`

**Boundary:** context is input/state for decision support and should not independently author physical combat outcomes.

---

### 13 — Tactical Advisor

**Responsibilities**

- tactical recommendations
- weapon-group analysis
- pre-roll recommendations
- tactical decision surfaces
- action-state guidance

Representative functions include:

- `tacticalAdvisorWeaponGroups`
- `tacticalPreRollPoolManifest`
- `tacticalPreRollCheck`
- `tacticalPreRollHtml`

**Core product principle:** the Tactical Advisor supports player decisions; it does not replace player authority or mutate authoritative game outcomes simply by making a recommendation.

---

### 14 — Tactical Impact Layer

This deserves its own structural section rather than being buried inside generic Tactical Advisor code.

**Responsibilities**

- downstream tactical consequences
- likely combat/mission impact
- context-aware evaluation
- tactical significance beyond raw damage output

**Boundary:** advisory/evaluative layer. It must remain separate from authoritative result application.

---

### 15 — Event Companion

**Responsibilities**

- event/tournament reference information
- companion rules/data
- event-specific presentation

Versioned companion data already exists under `data/`.

This subsystem should remain data-oriented and should not become a hidden source of core battle-state mutations.

---

### 16 — UI rendering

Most current UI is generated through functions returning HTML strings.

Major rendering families include:

- `render`
- `objectiveMapRendererHtml`
- `tacticalAdvisorHtml`
- `tacticalContextHtml`
- `tacticalShootingResultHtml`
- `tacticalPreRollHtml`
- `secondaryMissionsHtml`
- `primaryMissionPanel`

Rendering should consume state and produce UI. It should not silently implement game rules or authoritative mutations.

---

### 17 — Modals / temporary interaction surfaces

Includes:

- pre-roll physical dice modal
- leader attachment modal
- wargear selection
- confirmation dialogs
- battle/result dialogs
- other transient interaction surfaces

These can eventually be extracted as UI modules after their state dependencies are understood.

---

### 18 — Event handlers / interaction wiring

**Responsibilities**

- button/input handlers
- navigation events
- builder interactions
- battle controls
- phase transitions
- modal actions
- workflow completion

**Refactor caution:** event handlers frequently bridge UI → state → rendering. They are therefore a later extraction target, not an early one.

---

### 19 — Import / export / debug / diagnostics

Includes persistence helpers, development diagnostics and compatibility utilities.

The repository also has separate diagnostic modules, but they are currently not imported by `index.html` at runtime.

---

### 20 — Application initialization

**Responsibilities**

- initial state setup
- first render
- browser/storage initialization
- compatibility setup
- startup event wiring

Initialization should remain the final structural section so future developers can quickly identify the application boot path.

## Critical dependency graph

```text
Army / roster
      ↓
Canonical model identity
      ↓
Deployment ───────→ Reserves
      ↓                 ↓
      └──────→ Live battlefield state
                         ↓
                 Tactical Context
                         ↓
                  Weapon eligibility
                         ↓
                 Combat / phase flow
                         ↓
                 Physical dice entry
                         ↓
                  Damage / casualties
                         ↓
                   Mission scoring
                         ↓
                Event log / persistence
```

Advisory systems sit beside this authoritative flow:

```text
Authoritative battle state
          ↓
 Tactical Context
          ↓
 Tactical Advisor
          ↓
 Tactical Impact Layer
          ↓
Player decision
          ↓
Authoritative workflow
```

## High-risk boundaries

1. Model identity ↔ combat snapshots
2. Deployment plans ↔ live battlefield positions
3. Tactical recommendations ↔ authoritative outcomes
4. Mathhammer ↔ physical dice resolution
5. Combat result ↔ casualty/model state
6. Casualty state ↔ objective/scoring state
7. State mutation ↔ event logging/undo
8. UI rendering ↔ state mutation

## Safe first extraction candidates

After this map is reviewed, the safest early candidates are expected to be:

1. small identity helpers
2. pure constants/version helpers
3. isolated state normalization helpers
4. event/logging helpers with compatibility wrappers

Larger systems should wait until their cross-dependencies are explicitly mapped.

## Do not extract yet

Do not begin by moving:

- the main `render()` function
- Shooting resolution
- physical dice handling
- model casualty logic
- deployment/live-map state
- Tactical Advisor calculation internals
- event handlers as a group

These are high-coupling areas where a structural-only change can easily become a gameplay change.

## Refactor invariants

Every structural change must preserve:

- existing gameplay behavior
- existing state schema unless intentionally versioned
- existing physical-dice authority
- model identity continuity
- deployment/live-map separation
- event logging
- undo/recovery behavior
- existing regression audits
- deployment integrity

## Next mapping task

The next step is a **function-level inventory of `index.html`**, grouped against these sections. That inventory should identify:

- function name
- current location/order
- proposed section
- state read/write behavior
- major dependencies
- whether the function is pure/rendering/mutating
- extraction risk

No gameplay code should be moved until that inventory exists.
