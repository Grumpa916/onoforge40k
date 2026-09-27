# OnoForge 40K — Refactor QA Gates

Last updated: 2026-09-27

## Purpose

This document defines the minimum verification gates for structural/refactoring work on OnoForge 40K.

The objective is to make the monolith smaller **without changing known-good gameplay behavior**.

A structural change is not considered complete merely because the application builds or deploys. The affected behavioral contract must also remain intact.

## Working principle

> One logical change → one commit → Actions verification → inspect result → next change.

Do not bundle unrelated refactors into the same commit.

## Gate 1 — Repository / deployment integrity

Required for every commit that changes application or workflow files.

- GitHub Actions workflow completes successfully.
- GitHub Pages deployment succeeds when the workflow is applicable.
- No unexpected files are modified.
- No generated artifact is accidentally committed in place of source.
- No unrelated gameplay/data files change.

## Gate 2 — JavaScript / application startup

Required for every `index.html` or JavaScript-module change.

Verify:

- HTML remains parseable.
- JavaScript remains syntactically valid.
- Application initialization completes.
- Initial render succeeds.
- Existing storage/state initialization does not throw.
- Missing optional data is handled according to the existing fallback contract.

A successful Pages deployment alone does **not** prove this gate.

## Gate 3 — Core state integrity

Required for changes touching state, persistence, model identity, deployment, or battlefield logic.

Protect:

- canonical model identity
- persistent model roster
- unit identity
- surviving/casualty state
- deployment plans
- reserves
- live battlefield positions
- objective-map state
- save/load
- undo/recovery

### Critical invariant

A physical model must retain a stable identity across:

`roster → deployment → battlefield → combat → casualty → scoring → persistence`

Do not replace persistent identity with temporary combat/render identifiers.

## Gate 4 — Combat protection

Required for changes that can affect combat helpers, combat state, weapon eligibility, or result application.

### Shooting — protected baseline

The existing Shooting workflow is a known-good baseline.

Protect:

- weapon/model eligibility
- attached-unit handling
- Tactical Advisor integration
- pre-roll workflow
- physical dice entry
- staged hit/wound/save resolution
- damage application
- casualty handling
- event logging

Structural work should not change Shooting behavior unless explicitly intended and separately tested.

### Physical dice — authoritative

The physical-dice workflow must continue to treat player-entered dice as authoritative.

No structural refactor may silently substitute generated/random dice for the physical-dice workflow.

### Charge

Protect:

- charge eligibility
- target context
- charge recommendations
- charge resolution
- resulting state mutations

### Fight

When Fight is implemented, it becomes a protected combat workflow with equivalent gates.

## Gate 5 — Missions / scoring

Required for changes touching objectives, VP, CP, missions, end-turn scoring, or result application.

Protect:

- objective ownership/control
- primary scoring
- secondary scoring
- VP mutation
- CP mutation
- scoring snapshots
- end-game state

Tactical recommendations must not directly mutate authoritative scoring outcomes.

## Gate 6 — Tactical systems

Required for changes touching Tactical Context, Tactical Advisor, Tactical Impact Layer, or Event Companion.

### Tactical Context

Must continue to represent the current tactical pair/context without becoming an alternate source of authoritative battle state.

### Tactical Advisor

Recommendations must remain advisory. A recommendation must not silently perform the player's action or mutate authoritative combat results.

### Tactical Impact Layer

Impact analysis remains downstream of authoritative/contextual state and must not become a hidden result-authoring engine.

### Event Companion

Event-specific/reference data must remain separated from core battle-state authority.

## Gate 7 — Rendering / UI

Required for changes to rendering, components, modals, navigation, or event wiring.

Protect:

- state → render flow
- modal state
- navigation state
- user input handling
- battle workflow controls

Rendering should not silently introduce game-rule mutations.

## Gate 8 — Data / rules integrity

Required for rules-data, datasheet, points, faction-rule, FAQ/errata, or data-loader changes.

Verify:

- source/version metadata remains identifiable
- pinned data can be distinguished from newer upstream data
- no unrelated faction data changes
- points/rules changes are traceable to their source
- malformed/missing data produces a controlled failure or documented fallback

## Gate 9 — Refactor-specific compatibility

Required whenever code moves from `index.html` into a module.

Before extraction:

1. Identify the exact current implementation.
2. Identify all known callers.
3. Identify state reads/writes.
4. Identify DOM dependencies.
5. Identify global-variable dependencies.
6. Identify side effects.
7. Record expected inputs/outputs.

During extraction:

- Preserve behavior exactly.
- Prefer compatibility wrappers over simultaneous call-site rewrites.
- Avoid renaming unrelated symbols.
- Avoid formatting/reminifying unrelated code.

After extraction:

- Run the applicable QA gates.
- Compare changed files.
- Confirm only intended files changed.
- Commit the extraction separately from subsequent cleanup.

## Gate 10 — Regression checkpoint

For a low-risk extraction, minimum checkpoint:

```text
Build/deploy
    ↓
Startup
    ↓
Affected subsystem
    ↓
Known protected workflow
    ↓
State integrity
```

For a high-risk extraction, expand this to the complete regression suite available in the repository.

## Refactor risk levels

### LOW

Examples:

- pure geometry helpers
- pure formatting helpers
- isolated constants
- pure normalization utilities

Required: Gates 1, 2, and affected-specific checks.

### MEDIUM

Examples:

- state normalization
- logging helpers
- persistence wrappers
- deployment helpers
- UI components with limited state access

Required: Gates 1–3 plus affected subsystem gates.

### HIGH

Examples:

- combat resolution
- model identity
- casualty handling
- scoring
- Tactical Advisor calculations
- main rendering
- event wiring

Required: full applicable regression coverage before and after extraction.

## Explicit protected areas

Until their dependencies are fully mapped, do not use them as the first extraction targets:

- `render()`
- Shooting resolution
- physical dice handling
- model casualty logic
- live battlefield state
- deployment/reserve state
- Tactical Advisor internals
- Tactical Impact calculations
- broad event-handler rewrites

## Known infrastructure caveats

A green deployment does not necessarily mean the game is fully testable.

Previous project audits identified situations where:

- a preview/build artifact was malformed despite a successful workflow
- required rules/data files were missing from a test artifact

Therefore, deployment success is a **necessary but insufficient** QA signal.

## Current refactor checkpoint

The current geometry extraction is intentionally paused because the exact one-line `index.html` source cannot presently be retrieved through the available GitHub file interface in a safe way.

Do not reconstruct or rewrite the geometry functions from memory.

When exact source access becomes available, resume with:

1. exact implementation capture
2. caller inventory
3. focused geometry tests
4. compatibility-preserving extraction
5. Actions verification
6. only then the next extraction

## Commit discipline

For the current architectural cleanup:

- Prefer one documentation/structural concern per commit.
- Do not combine refactoring with gameplay changes.
- Do not combine multiple unrelated module extractions.
- Stop after a failed gate.
- Fix the failure in a separate, clearly named commit when practical.

The goal is not maximum commit velocity. The goal is a repository history where every step is understandable and reversible.
