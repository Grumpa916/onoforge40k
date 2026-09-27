# OnoForge 40K — `index.html` Function Inventory

Last updated: 2026-09-27

## Purpose

This is the first function-level inventory pass for the `index.html` monolith.

The repository's existing architecture map identifies approximately 708 named JavaScript functions in the inline application code. Because the current script is compressed/minified into a single physical line, this inventory uses **semantic function families and known named functions** rather than pretending that source-line positions are meaningful.

The inventory is therefore a migration map, not yet a generated AST report.

## Inventory legend

| Field | Meaning |
|---|---|
| Class | Pure / Read / Mutate / Render / Bridge |
| Risk | Low / Medium / High / Critical |
| State | Main authoritative state touched |
| Dependencies | Major subsystem dependencies |
| Extraction | Current recommendation |

---

## A. State / persistence

| Function | Class | Risk | State | Dependencies | Extraction |
|---|---|---:|---|---|---|
| `save` | Mutate/IO | High | global `state`, storage | state schema | Later |
| `load` | Mutate/IO | High | global `state` | normalization, persistence | Later |
| `snapshotForUndo` | Read | High | battle state | event/history | Later |
| `undoLastAction` | Mutate | Critical | battle state | snapshots, render, logging | Do not extract yet |
| `ensureTacticalState` | Mutate/normalize | Medium | tactical state | advisor | Candidate |
| `ensureReserveState` | Mutate/normalize | Medium | reserves | deployment | Candidate |
| `ensureDeploymentPlans` | Mutate/normalize | Medium | deployment plans | deployment UI | Candidate |
| `ensureBattlefieldUnitPositions` | Mutate/normalize | High | live map | battlefield UI, combat | Later |
| `ensureModelRoster` | Mutate/normalize | Critical | model roster | identity, combat | Do not extract yet |

### Notes

The global state object is currently a broad shared contract. Small `ensure*` normalizers are safer extraction candidates than arbitrary state reads/writes.

---

## B. Model / roster identity

| Function | Class | Risk | State | Dependencies | Extraction |
|---|---|---:|---|---|---|
| `buildModelRoster` | Mutate/derive | Critical | roster/model identity | army list, combat | Do not extract yet |
| `modelRosterRule` | Read | Medium | model roster | rules | Candidate |
| `modelRosterWeaponCounts` | Read | High | model roster | wargear, combat | Later |
| `survivingModelRoster` | Read | Critical | casualty/model state | combat, scoring | Later |
| `combatModelSnapshot` | Read/derive | Critical | combat state | identity, weapons | Do not extract yet |
| `combatSnapshot` | Read/derive | Critical | combat state | identity, weapon state | Do not extract yet |

### Known identity boundary

Persistent roster IDs and generic combat snapshot IDs have historically differed. The Shooting pre-roll workflow introduced an ordinal fallback for this reason.

**Invariant:** do not make model identity less canonical during extraction.

---

## C. Deployment / reserves / battlefield

| Function | Class | Risk | State | Dependencies | Extraction |
|---|---|---:|---|---|---|
| `deploymentPlanForCurrentMap` | Read | Medium | deployment plans | map configuration | Candidate |
| `setDeploymentPlanPosition` | Mutate | High | deployment plans | deployment UI | Later |
| `saveDeploymentPlan` | Mutate/IO | High | deployment plans | persistence | Later |
| `loadDeploymentPlan` | Mutate/IO | High | deployment plans | persistence | Later |
| `setReserveDeclaration` | Mutate | High | reserves | deployment | Later |
| `deployReserveByMap` | Mutate | Critical | reserves + live positions | battlefield, lifecycle | Do not extract yet |
| `setBattlefieldUnitPosition` | Mutate | Critical | live battlefield positions | Tactical Advisor, combat | Do not extract yet |
| `battlefieldDistanceBetween` | Pure | Low | none | map geometry | Strong early candidate |
| `battlefieldTerrainPathIntersections` | Pure | Low | none | terrain geometry | Strong early candidate |
| `objectiveMapRendererHtml` | Render | Medium | live map/objectives | UI | Later |

### Critical separation

`deploymentPlans` = planning/reference state.

`battlefieldUnitPositions` = authoritative live physical state.

Never merge these while reorganizing.

---

## D. Tactical Context

| Function | Class | Risk | State | Dependencies | Extraction |
|---|---|---:|---|---|---|
| `tacticalPairState` | Read | Medium | tactical pair | advisor/combat | Candidate |
| `setTacticalPairField` | Mutate | High | tactical pair | advisor/combat | Later |
| `tacticalAdvisorActionState` | Read/derive | Medium | tactical action state | advisor | Candidate |

### Boundary

Tactical Context is input state for advisory and combat UI. It must not become an alternate authoritative battle-state store.

---

## E. Tactical Advisor

| Function | Class | Risk | State | Dependencies | Extraction |
|---|---|---:|---|---|---|
| `tacticalAdvisorWeaponGroups` | Read/derive | High | roster + tactical context | weapons, rules | Later |
| `tacticalPreRollPoolManifest` | Read/derive | High | tactical pre-roll state | weapon eligibility | Later |
| `tacticalPreRollWeaponState` | Read | Medium | tactical pre-roll state | advisor | Candidate |
| `setTacticalPreRollWeapon` | Mutate | High | tactical pre-roll state | shooting workflow | Later |
| `tacticalPreRollCheck` | Read/validate | High | tactical pre-roll state | rules, combat | Later |
| `tacticalPreRollResolutionPlan` | Read/derive | Critical | combat snapshot | physical dice workflow | Do not extract yet |
| `tacticalPreRollHtml` | Render | Medium | tactical pre-roll state | advisor + UI | Later |

### Product invariant

Advisor functions provide decision support. They do not independently author authoritative game outcomes.

---

## F. Rules / Mathhammer engine

| Function | Class | Risk | State | Dependencies | Extraction |
|---|---|---:|---|---|---|
| `engineContext` | Read/derive | High | combat/rules state | identity, rules | Later |
| `engineWeaponPoolKey` | Pure/derive | Medium | weapon data | rules | Candidate |
| `engineApplicableWeaponAbilities` | Read/derive | High | weapon/unit rules | rules data | Later |
| `engineOneAttack` | Pure/derive | High | attack inputs | rules/math | Later |
| weapon/math helpers | Pure/derive | Medium | none or inputs | rules data | Candidate batch |

### Boundary

Mathhammer is simulation/analysis. It is not the authoritative source of physical dice entered during a live battle.

---

## G. Physical dice / Shooting workflow

| Function/family | Class | Risk | State | Dependencies | Extraction |
|---|---|---:|---|---|---|
| pre-roll weapon selection | Mutate | Critical | tactical pre-roll | advisor, combat | Do not extract yet |
| pre-roll resolution plan | Read/derive | Critical | combat snapshot | rules, identity | Do not extract yet |
| physical dice modal open | Bridge/UI | Critical | active dice session | shooting | Do not extract yet |
| staged hit entry | Mutate | Critical | dice session | rules | Do not extract yet |
| staged wound entry | Mutate | Critical | dice session | hit state | Do not extract yet |
| staged save entry | Mutate | Critical | dice session | wound state | Do not extract yet |
| resolution review | Render/bridge | Critical | dice session | result application | Do not extract yet |
| result application | Mutate | Critical | model wounds/casualties | scoring/logging | Do not extract yet |

### Protected baseline

The current Shooting workflow is a known working baseline. Structural work must not change its behavior.

---

## H. Charge workflow

| Function/family | Class | Risk | State | Dependencies | Extraction |
|---|---|---:|---|---|---|
| charge target evaluation | Read/derive | High | battlefield + tactical context | distance, eligibility | Later |
| charge advisor | Read/derive | High | tactical context | fight implications | Later |
| charge target UI | Render | Medium | charge state | battlefield | Candidate after mapping |
| charge resolution | Mutate | Critical | battle state | positions, combat | Do not extract yet |

Charge remains a current development area. Keep its boundary explicit without forcing it into the Shooting module.

---

## I. Fight workflow

The Fight implementation is not yet treated as an extraction target. Reserve the structural location now, but preserve the current roadmap: Charge → Fight.

Expected families:

- eligible attackers
- weapon grouping
- melee modifiers
- attack resolution
- damage/casualty application
- fight-phase scoring consequences

Risk: **Critical** once implemented.

---

## J. Missions / objectives / scoring

| Function | Class | Risk | State | Dependencies | Extraction |
|---|---|---:|---|---|---|
| `primaryMission` | Read/config | Medium | mission state | mission data | Candidate |
| `scorePrimary` | Mutate | Critical | VP/objectives | battle state | Later |
| `primaryObjectiveScoreSnapshot` | Read | High | objectives/VP | battle state | Later |
| `objectiveCountsForSide` | Read | High | live map/objectives | model state | Later |
| `secondaryCatalogHtml` | Render | Medium | secondary state | mission data | Later |
| `secondaryScoringHtml` | Render | Medium | secondary state | scoring | Later |
| `changeVP` | Mutate | High | VP | scoring/event log | Later |
| `changeCP` | Mutate | High | CP | stratagems/event log | Later |

### Boundary

Scoring consumes authoritative battle state. Advisory layers should not directly mutate VP/CP.

---

## K. Battle lifecycle / turn / timer

| Function/family | Class | Risk | State | Dependencies | Extraction |
|---|---|---:|---|---|---|
| lifecycle transitions | Mutate | Critical | battle lifecycle | deployment, phases | Later |
| phase transition handlers | Mutate | Critical | round/phase/turn | combat/scoring | Do not extract yet |
| `ensureGameTimer` | Normalize | Medium | timer state | UI | Candidate |
| `startGameTimer` | Mutate | Medium | timer state | UI | Candidate |
| `toggleGameTimer` | Mutate | Medium | timer state | UI | Candidate |
| `finishGameTimer` | Mutate | Medium | timer state | lifecycle | Candidate |

Lifecycle is a high-value boundary but should be extracted only after state mutation contracts are explicit.

---

## L. UI rendering

| Function/family | Class | Risk | State | Dependencies | Extraction |
|---|---|---:|---|---|---|
| `render` | Render/assembly | Critical | nearly all state | nearly all UI | Do not extract yet |
| `objectiveMapRendererHtml` | Render | Medium | map/objectives | deployment | Later |
| `tacticalAdvisorHtml` | Render | Medium | tactical state | advisor | Later |
| `tacticalContextHtml` | Render | Medium | tactical context | advisor/combat | Later |
| `tacticalShootingResultHtml` | Render | High | combat result | shooting | Later |
| `tacticalPreRollHtml` | Render | High | pre-roll | shooting/advisor | Later |
| `secondaryScoringHtml` | Render | Medium | scoring | missions | Later |
| `...PanelHtml()` families | Render | Medium | subsystem-specific | subsystem state | Batch by subsystem |
| `...Modal...` families | Render/bridge | High | transient state | event handlers | Later |

### Boundary

Rendering should read state and return UI. Rendering functions should not silently become game-rule mutation points.

---

## M. Event handlers / interaction bridges

The event layer is expected to contain the highest concentration of UI → state → render bridges.

Representative families:

- navigation click handlers
- builder handlers
- deployment handlers
- reserve handlers
- tactical selection handlers
- pre-roll modal handlers
- phase transition handlers
- scoring controls
- import/export controls

**Extraction recommendation:** keep event handlers inside `index.html` until their destination module has an explicit API. Moving them first creates circular dependencies and hidden state coupling.

Risk: **High/Critical**.

---

## N. Initialization

Expected responsibilities:

- default state construction
- storage loading
- normalization
- initial render
- event wiring
- startup compatibility

Risk: **Critical** because initialization order is behavior.

Keep initialization at the end of the eventual module graph.

---

# Cross-subsystem dependency inventory

## Highest-risk calls

```text
Model identity
  → combat snapshots
  → weapon eligibility
  → physical dice
  → casualties

Live battlefield state
  → Tactical Advisor
  → Charge
  → objective control
  → scoring

Tactical Advisor
  → Shooting pre-roll
  → Charge evaluation
  → Tactical Impact Layer

Combat result application
  → model wounds
  → casualty state
  → scoring
  → event log
  → persistence / undo

render()
  → reads almost every state family
```

## First extraction candidates

These are the current safest targets because they can be made explicit with small APIs:

1. pure battlefield geometry helpers
2. version/constants helpers
3. small state normalization helpers
4. isolated event formatting/logging helpers
5. model identity utility functions **only after the canonical ID contract is written down**

## First extraction candidates to avoid

Do not start with:

- `render()`
- Shooting
- physical dice
- `undoLastAction`
- `deployReserveByMap`
- `setBattlefieldUnitPosition`
- casualty application
- phase transitions
- Tactical Advisor calculation internals

## Inventory confidence

### High confidence

- subsystem boundaries already documented in `ARCHITECTURE_MAP.md`
- named functions explicitly documented there
- known critical state contracts
- Shooting/physical-dice invariants
- deployment/live-map separation

### Medium confidence

- exact function-to-function call graph
- exact physical source ordering inside the minified script
- complete list of all ~708 functions

### Pending automated pass

A future repository tooling pass should parse the inline script into an AST and emit a complete machine-generated inventory with:

- function name
- source offset
- parameters
- direct calls
- state reads/writes where statically detectable
- declarations by region

Until that exists, this document deliberately does **not** invent exact line numbers or a false complete call graph.

## Next action

Use this inventory to identify **one low-risk extraction boundary** and create a compatibility-preserving module around it. Do not extract multiple subsystems in the same change.
