# OnoForge 40K — Audit Inventory and Consolidation Plan

Last updated: 2026-09-26
Repository: `Grumpa916/onoforge40k`
Branch: `main`

## Executive finding

The repository currently contains **38 files matching `scripts/*audit.js`**, plus the separate orchestration utility `scripts/preflight-batch.js`.

The audit set contains valuable regression knowledge, but it has grown more granular than the current application architecture needs. Several audits test substantially overlapping source contracts across the same subsystem.

**Recommendation:** preserve the coverage, consolidate the overlapping audits, and reduce the normal deployment gate to approximately **10–12 maintained audit suites plus orchestration**, rather than 38 independently maintained audit files.

Do **not** delete the current audits as the first step. Consolidate their checks into durable suites first, run both old and new coverage during transition, then retire redundant files.

## Inventory and disposition

Legend:

- **KEEP** — retain as a focused, independently useful audit.
- **MERGE** — fold into a broader subsystem suite.
- **REWORK** — retain the concept, but change the audit's scope to remove duplication.
- **ORCHESTRATOR** — not itself a regression audit; coordinates other checks.
- **ARCHITECTURE** — structural/development guard rather than a gameplay subsystem audit.

| Current file | Current role | Main overlap | Proposed disposition |
|---|---|---|---|
| `army-builder-bodyguard-naming-audit.js` | Bodyguard attachment, naming, loader safeguards | Mostly unique | **KEEP** |
| `catalogue-audit.js` | Embedded catalogue identity, weapon completeness, legacy/bootstrap reconciliation | Some overlap with Track 6 rules coverage | **KEEP**, later narrow to catalogue/data only |
| `deployment-map-integrity-audit.js` | Deployment planning/live map separation, persistence, logging | Live deployment, map interaction, reserve, playtest | **MERGE** into Deployment/Map suite |
| `dice-entry-architecture-audit.js` | Physical-dice/count-first architecture | Track 2 combat regression | **MERGE** into Combat/Dice suite |
| `fnp-resolution-audit.js` | Feel No Pain resolution | Track 2 combat regression/model-level damage | **MERGE** into Combat/Dice suite |
| `live-deployment-map-audit.js` | Live deployment drag/touch/positioning | Deployment-map, map interaction, reserve | **MERGE** into Deployment/Map suite |
| `map-interaction-audit.js` | Interactive map behavior, geometry, placement | Deployment-map, live deployment, terrain | **MERGE** into Deployment/Map suite |
| `model-level-damage-audit.js` | Model-level damage/casualty semantics | Track 2 combat, FNP | **MERGE** into Combat/Dice suite |
| `objective-control-refinement-audit.js` | Objective ownership/control and scoring linkage | Objective scoring, tournament playtest | **MERGE** into Missions/Objectives suite |
| `objective-scoring-audit.js` | Geometry-backed scoring catalogue and mission layouts | Objective control, tournament playtest, Track 3 | **MERGE** into Missions/Objectives suite, retaining geometry/data checks |
| `permanent-sample-armies-audit.js` | Sample army fixtures | No major subsystem overlap | **KEEP** |
| `reserve-map-integrity-audit.js` | Reserve declaration/tray/deployment | Deployment/map, tournament operations | **MERGE** into Deployment/Map suite |
| `runtime-internal-symbol-audit.js` | `ensure*` symbol definition guard | Applies globally | **KEEP** as a lightweight runtime guard |
| `tactical-advisor-integration-audit.js` | Advisor data/state integration | Track 4 v2, scope, prioritization | **MERGE** into Tactical Advisor suite |
| `tactical-advisor-scope-audit.js` | Advisor variable/scope regression | Track 4 v2 | **MERGE** into Tactical Advisor suite |
| `terrain-measurement-map-audit.js` | Terrain/sample-map validation | Map, tournament playtest | **MERGE** into Deployment/Map suite |
| `tournament-playtest-audit.js` | Broad end-to-end tournament smoke checks | Map/objectives/scoring | **REWORK** as true cross-subsystem integration smoke test |
| `tournament-regression-audit.js` | Large broad tournament source/integration gate | Nearly every subsystem | **REWORK** into thin cross-system release/integration checks |
| `tournament-ui-optimization-audit.js` | Tablet/touch UI optimization | Track 7 UX | **MERGE** into Tournament UX suite |
| `track1-completion-audit.js` | Track 1 overall state/scoring/turn completion | Other 3 Track 1 audits | **MERGE** into Authoritative Game State suite |
| `track1-end-turn-scoring-audit.js` | Automated end-turn scoring | Track 1 completion | **MERGE** into Authoritative Game State suite |
| `track1-scoring-vp-cp-audit.js` | VP/CP integrity | Track 1 completion | **MERGE** into Authoritative Game State suite |
| `track1-turn-phase-action-log-audit.js` | Turn/phase/action log | Track 1 completion | **MERGE** into Authoritative Game State suite |
| `track2-combat-regression-audit.js` | Physical combat end-to-end architecture/regression | Dice, FNP, model damage | **KEEP as umbrella**, absorb the other Track 2 checks |
| `track3-mission-catalogue-audit.js` | Mission catalogue/scoring metadata | Track 3 mission system, objective scoring | **MERGE** into Missions/Objectives suite |
| `track3-mission-system-audit.js` | Secondary workflow/state machine | Track 3 catalogue, Track 1 scoring | **MERGE** into Missions/Objectives suite |
| `track4-prioritization-refinement-audit.js` | Advisor prioritization | Tactical Advisor integration/v2 | **MERGE** into Tactical Advisor suite |
| `track4-tactical-advisor-v2-audit.js` | Advisor battle-state integration | Integration, scope, prioritization | **KEEP as umbrella**, absorb other Track 4 checks |
| `track5-result-lock-audit.js` | Completion/result lock | Track 5 operations/day/recovery | **MERGE** into Tournament Operations suite |
| `track5-tournament-day-workflow-audit.js` | SETUP → DEPLOYMENT → LIVE → COMPLETED workflow | Track 5 operations/recovery/result lock | **MERGE** into Tournament Operations suite |
| `track5-tournament-operations-audit.js` | Timer/setup/deployment/result/export | Other Track 5 audits | **KEEP as umbrella**, absorb other Track 5 checks |
| `track5-tournament-recovery-audit.js` | Persistence/recovery of tournament state | Track 5 operations/day/result lock | **MERGE** into Tournament Operations suite |
| `track6-edition-contamination-audit.js` | 10th/11th-edition contamination guard | Track 6 rules audits | **MERGE** into Rules Data/Edition suite |
| `track6-rules-coverage-audit.js` | Rules-domain coverage/provenance | Track 6 data/source consistency | **MERGE** into Rules Data/Edition suite |
| `track6-rules-data-integrity-audit.js` | Source/version/pinning integrity | Track 6 coverage/source consistency | **MERGE** into Rules Data/Edition suite |
| `track6-source-consistency-audit.js` | Runtime/manifest/data consistency | Track 6 rules integrity/coverage | **MERGE** into Rules Data/Edition suite |
| `track7-tournament-ux-audit.js` | Tournament UI/UX | Tournament UI optimization | **KEEP as umbrella**, absorb Task 26 checks |
| `architecture-map-audit.js` | Structural architecture guard | No gameplay suite | **KEEP** |

## The main duplication clusters

### Cluster 1 — Deployment / Map

Current files:

- `deployment-map-integrity-audit.js`
- `live-deployment-map-audit.js`
- `map-interaction-audit.js`
- `reserve-map-integrity-audit.js`
- `terrain-measurement-map-audit.js)

These already describe one coherent architecture boundary:

**deployment plans → reserves → deployment placement → live battlefield positions → map interaction → geometry**

The existing checks themselves confirm important boundaries such as deployment plans being separate from live battlefield positions, reserve units being excluded from ordinary live positions, 0.1-inch coordinate normalization, and deployment/movement logging.

**Target:** one `deployment-map-audit.js` suite with sections for:
1. planning
2. reserves
3. live deployment
4. map interaction
5. geometry

### Cluster 2 — Physical Combat

Current files:

- `track2-combat-regression-audit.js`
- `dice-entry-architecture-audit.js`
- `model-level-damage-audit.js`
- `fnp-resolution-audit.js`

These all protect one continuous pipeline:

**pre-roll → physical dice → hits → wounds → saves → damage → FNP → model casualties → logging**

The live shooting test also demonstrated why identity must be treated as part of this suite.

**Target:** one `combat-regression-audit.js` with subsections for:
- architecture
- physical dice
- Precision
- mixed saves
- variable damage
- FNP
- model-level damage
- resolution logging

### Cluster 3 — Authoritative Game State

Current files:

- `track1-completion-audit.js`
- `track1-end-turn-scoring-audit.js`
- `track1-scoring-vp-cp-audit.js`
- `track1-turn-phase-action-log-audit.js`

These are four views of the same state lifecycle:

**turn/phase → scoring → VP/CP → event history → undo**

**Target:** one `game-state-audit.js`.

### Cluster 4 — Missions / Objectives / Scoring

Current files:

- `objective-control-refinement-audit.js`
- `objective-scoring-audit.js`
- `track3-mission-system-audit.js`
- `track3-mission-catalogue-audit.js`

These overlap around objective state, primary/secondary scoring, mission metadata, geometry-backed scoring evidence, and scoring history.

**Target:** one `mission-objective-audit.js`.

### Cluster 5 — Tactical Advisor

Current files:

- `tactical-advisor-integration-audit.js`
- `tactical-advisor-scope-audit.js`
- `track4-tactical-advisor-v2-audit.js`
- `track4-prioritization-refinement-audit.js`

These form one coherent Advisor suite.

**Target:** one `tactical-advisor-audit.js`.

### Cluster 6 — Tournament Operations

Current files:

- `track5-tournament-operations-audit.js`
- `track5-result-lock-audit.js`
- `track5-tournament-recovery-audit.js`
- `track5-tournament-day-workflow-audit.js`

The 43-check Track 5 operations audit already overlaps most of the other three.

**Target:** one `tournament-operations-audit.js`.

### Cluster 7 — Rules Data

Current files:

- `track6-rules-data-integrity-audit.js`
- `track6-rules-coverage-audit.js`
- `track6-source-consistency-audit.js`
- `track6-edition-contamination-audit.js`

These are four layers of one rules-data integrity boundary.

**Target:** one `rules-data-audit.js`.

### Cluster 8 — Tournament UX

Current files:

- `tournament-ui-optimization-audit.js`
- `track7-tournament-ux-audit.js`

**Target:** one `tournament-ux-audit.js`.

## Broad audits that should change scope

### `tournament-regression-audit.js`

This is currently much too broad for a durable release gate. It contains a large list of requirements already protected by dedicated subsystem audits.

The replacement should verify only **cross-subsystem wiring**, such as:

- lifecycle transitions connect to deployment state
- deployment state connects to live positions
- live positions connect to tactical context
- combat resolution emits authoritative events
- scoring reads authoritative objective/battle state
- completion locks state and enables export
- rules-data pin follows the battle

It should not repeat every internal subsystem check.

### `tournament-playtest-audit.js`

This should become a genuine integration smoke test rather than another copy of map/objective/scoring checks.

Its job should be to prove that the subsystems work together, not to re-audit each subsystem.

## Proposed maintained audit set

A reasonable final structure is:

1. `catalogue-audit.js`
2. `army-builder-bodyguard-naming-audit.js`
3. `game-state-audit.js`
4. `deployment-map-audit.js`
5. `combat-regression-audit.js`
6. `mission-objective-audit.js`
7. `tactical-advisor-audit.js`
8. `tournament-operations-audit.js`
9. `rules-data-audit.js`
10. `tournament-ux-audit.js`
11. `tournament-integration-audit.js`
12. `runtime-internal-symbol-audit.js`
13. `architecture-map-audit.js`

Plus:

- `permanent-sample-armies-audit.js` as a fixture-specific audit
- `preflight-batch.js` as orchestration, not a regression suite

This gives us roughly **13 core maintained checks**, while preserving the specialized sample-army fixture and the development preflight.

## Transition strategy

Do not delete the 38 current audits immediately.

### Stage 1 — Consolidate

Create the new umbrella audits and carry forward the existing checks.

### Stage 2 — Dual-run

For a short period, run both the new suites and the old audits in GitHub Actions.

### Stage 3 — Compare coverage

Confirm that every check in the old audit set is either:

- preserved in a new suite,
- intentionally retired as redundant,
- or intentionally converted into an integration check.

### Stage 4 — Retire duplicates

Remove the redundant files only after the consolidated suites are green and coverage has been reconciled.

### Stage 5 — Simplify deployment.yml

Replace the long sequence of individual historical task audits with the smaller maintained audit set.

## Important architectural observation

The live shooting bug is a strong example of why consolidation must not simply mean "fewer tests."

The useful lesson was not only that the shooting UI worked. It was that **model identity crosses Deployment, Map, Combat, Damage, and Casualty subsystems**.

The consolidated audits should therefore test **contracts between subsystems** in addition to internal implementation details.

## Success criteria

The audit cleanup is complete when:

- The full regression coverage from the current audits is preserved.
- The normal deployment gate is reduced from dozens of repeated task-specific scripts to a small maintained set.
- Subsystem audits have clear ownership.
- Cross-subsystem integration is tested explicitly.
- Historical task names no longer determine the permanent QA architecture.
- Future refactors can run a focused subsystem audit instead of navigating a large collection of overlapping scripts.
