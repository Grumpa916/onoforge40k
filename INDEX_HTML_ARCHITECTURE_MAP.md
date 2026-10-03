# OnoForge 40K — `index.html` Architecture Map

**Status:** Inventory baseline — no application code changes
**Source branch:** `feature/opponent-turn-history`
**Source file:** `index.html`
**Verified Git blob SHA:** `4941fcffc41072fd9f60dcf870a0227b4437b74c`
**Verified source size:** 1,066,805 bytes (UTF-8 text)
**Verified line count:** 11,634

## Purpose

This document is the architectural baseline for safely dismantling the `index.html` monolith. It is intentionally an inventory and dependency-boundary document, not an extraction plan that changes runtime behavior.

The source file was downloaded from GitHub and independently verified against the Git blob SHA above before inventory work. No application code was modified as part of this inventory.

## Executive summary

`index.html` is a complete browser application containing the document shell, CSS, embedded catalogue/bootstrap data, application state, persistence, data normalization, roster construction, deployment, scoring, secondary missions, battle UI, event history, undo, tactical systems, physical-dice resolution, combat/math engines, cloud integration, rendering, and bootstrap.

A source-level scan identifies:

- 724 named `function` declarations (728 declaration occurrences; 4 duplicate names).
- 28 unique arrow-function variable assignments (31 matches under the inventory pattern).
- 11,634 source lines.
- Approximately 1.067 MB of UTF-8 source.

The monolith is therefore large, but it is not architecturally random. Distinct domains are visible in contiguous regions and through function naming. This gives us viable extraction boundaries.

## Architectural layers

### 1. Presentation / CSS

Large inline stylesheet plus HTML templates and modal markup. Includes battle dashboard, deployment map, Game Assistant, leader/bodyguard UI, wargear UI, physical-dice modal, logs, forms, and responsive layout.

**Risk:** Low for CSS-only extraction; medium for UI-template extraction.

### 2. Bootstrap / global runtime

The application establishes globals, the embedded catalogue, source policy, state, event handlers, and the root renderer. `window.ONOFORGE_APP_STATE` exposes the canonical application state through a getter.

**Risk:** High. Keep in the shell until explicit interfaces exist.

### 3. Data / catalogue

Includes canonical-vs-bootstrap data selection, BSData normalization, weapon/ability/wargear parsing, current runtime database refresh, saved-list persistence helpers, and source-policy logic.

**Risk:** Medium. Good extraction candidate after public interfaces are documented.

### 4. Deployment / battlefield

Includes mission/layout selection, reserve declarations, transport embarkation, deployment plans, battlefield positions, deployment validation, and deployment rendering support.

**Risk:** Medium. Strong candidate for a dedicated deployment module.

### 5. Scoring / missions

Includes primary scoring, score snapshots, round caps, scoring evidence, detachments, stratagem tracking, secondary missions, secondary scoring, and tournament-result validation/export.

**Risk:** Medium/high because scoring mutates canonical battle state and feeds the event/history layer.

### 6. Roster / army builder

Includes saved rosters, unit addition/removal, configuration, model composition, leader/bodyguard attachments, support units, wargear, model-roster construction, validation, and battle roster loading.

**Risk:** Medium/high because roster structures feed combat and state synchronization.

### 7. Core state / persistence

Includes the large `state` object, `save`, timer persistence, backup export/import, local-data reset, and state compatibility/defaulting.

**Risk:** Very high. Treat as an architectural anchor.

### 8. Event / Action Log / Undo

Includes event creation, event classification, action-log rendering, undo snapshots/restoration, scoring log generation, and Combat History derivation.

**Risk:** Very high. Do not extract until the event schema and mutation contract are documented.

### 9. Battle state / canonical roster

Includes battle UI, model/unit state mutation, model roster synchronization, wounds/destroyed state, Battle-shocked state, turn state, score ledgers, and objective-control history.

**Risk:** Very high. Protect the canonical mutation path.

### 10. Tactical Advisor

Includes tactical unit/action state, weapon availability, ranges, abilities, target legality, movement/engagement context, objective advice, render cache, V1/V2 advisor results, and battle-state snapshots/signatures.

**Risk:** Very high. It consumes broad application state and should not be an early extraction target.

### 11. Physical-dice pre-roll resolver

Includes pool identity, model allocation, weapon selection, save groups, mixed saves, rerolls, FNP, variable damage, Devastating Wounds, Precision, resolution state, and application of resolved damage/results.

**Risk:** Critical. This is a protected regression anchor because it is part of the recently validated physical-dice → canonical roster → event/history architecture.

### 12. Combat / Mathhammer

Includes deterministic attack resolution, probability distributions, allocation groups, Precision allocation, damage application, Monte Carlo simulation, and mathhammer UI.

**Risk:** High. Extract only after state/event interfaces are stable.

### 13. Cloud integration

Includes Supabase/client setup, authentication, cloud army-list synchronization, cloud battle save/load/delete, and configuration/status helpers.

**Risk:** Low/medium. One of the better early JavaScript extraction candidates after pure utilities.

### 14. Rendering / bootstrap

Includes `renderBattleOnly`, `render`, page dispatch, root DOM updates, event listeners, and application startup.

**Risk:** High. Keep centralized initially.

## Major region inventory

| Approx. source lines | Functions | Primary region |
|---:|---:|---|
| 501–1000 | 53 | Deployment / battlefield |
| 1001–1500 | 40 | Data / catalogue / saved lists / primary scoring |
| 1501–2000 | 35 | Primary scoring / missions |
| 2001–2500 | 30 | Detachments / stratagems / Game Assistant |
| 2501–3000 | 47 | Secondary missions / secondary scoring |
| 3001–3500 | 26 | Secondary totals / utility / wargear start |
| 3501–4000 | 39 | Wargear / leaders / bodyguards |
| 4001–4500 | 47 | Model roster / validation / builder |
| 4501–5000 | 39 | Builder / setup / timer / battle start |
| 5001–5500 | 31 | Tournament state / deployment validation / events / undo |
| 5501–6000 | 29 | Combat History / battle UI / canonical model state |
| 6001–6500 | 42 | Objective metadata / geometry / battlefield objectives |
| 6501–7000 | 34 | Phase/CP / combat engine foundations |
| 7001–7500 | 52 | Tactical state / weapon-use state |
| 7501–8000 | 24 | Tactical legality / combat context |
| 8001–8500 | 33 | Physical-dice pre-roll resolver |
| 8501–9000 | 15 | Physical-dice resolution continuation |
| 9001–9500 | 21 | Opponent-turn capture / Tactical Advisor |
| 9501–10000 | 7 | Tactical Advisor V1/V2 |
| 10001–10500 | 31 | Mathhammer / attack engine |
| 10501–11000 | 20 | Combat engine / cloud start |
| 11001–11634 | 33 | Cloud / data management / logs / rendering tail |

## Protected architectural anchors

These should not be casually extracted or duplicated during early refactoring:

1. **Canonical application state** — the `state` object is the shared source for battle, roster, scoring, deployment, events, timer, and settings.
2. **Canonical model roster mutation** — battle model state must remain authoritative.
3. **Event creation and event history** — Action Log and Combat History depend on the event stream.
4. **Physical-dice resolver** — must continue to feed canonical state rather than a parallel/projection state.
5. **Opponent-turn capture** — must remain an adapter around the same canonical combat/event path.
6. **Tactical Advisor state context** — must not acquire a second authoritative state model.
7. **Persistence/undo** — extraction must preserve exact state snapshots and restoration semantics.

## Candidate extraction order

This is a sequencing recommendation, not permission to begin all extractions at once.

### Phase A — architecture baseline

- Preserve this map in the repository.
- Identify exact public interfaces for each domain.
- Establish a repeatable syntax/runtime validation step before moving code.

### Phase B — low-risk presentation

- Extract CSS into an external stylesheet.
- Validate page load and all existing UI paths.
- Do not alter JavaScript state or combat logic.

### Phase C — pure utilities

Extract functions that have no DOM access, no implicit global state mutation, no event emission, and deterministic inputs/outputs.

### Phase D — cloud integration

Extract the relatively isolated cloud client/auth/synchronization layer behind explicit functions.

### Phase E — data layer

Extract catalogue/source/normalization functions while preserving the current canonical/bootstrap source contract.

### Phase F — deployment / wargear support

Extract deployment and then lower-level roster-support systems once their state interfaces are explicit.

### Phase G — UI subsystems

Extract builder/battle/scoring presentation only after the state and data boundaries are stable.

### Phase H — state/event architecture

Only after earlier boundaries are proven should state, persistence, event history, and undo be separated from the UI.

### Phase I — combat/tactical systems

Extract combat engine and Tactical Advisor only after the core state/event contracts are explicit and protected by regression tests.

## Current target architecture

The eventual architecture should make `index.html` primarily an application shell/bootstrap rather than the implementation of every domain:

```text
index.html
  ├── application shell
  ├── root DOM
  └── bootstrap

css/
  └── styles.css

js/
  ├── core/
  │   ├── state.js
  │   ├── events.js
  │   ├── persistence.js
  │   └── utilities.js
  ├── data/
  │   ├── catalogue.js
  │   ├── normalization.js
  │   └── sources.js
  ├── roster/
  │   ├── army-builder.js
  │   ├── leaders.js
  │   └── wargear.js
  ├── deployment/
  │   └── deployment.js
  ├── battle/
  │   ├── phases.js
  │   ├── scoring.js
  │   └── objectives.js
  ├── combat/
  │   ├── attack-engine.js
  │   ├── resolver.js
  │   └── allocation.js
  ├── tactical/
  │   └── advisor.js
  ├── cloud/
  │   └── cloud.js
  └── ui/
      ├── builder.js
      ├── battle.js
      └── rendering.js
```

This target is deliberately aspirational. We should not create all of these files in one change.

## Function inventory

The following is the source-order inventory of named function declarations. Duplicate declaration names are retained because source order matters when reasoning about the monolith.

```text
"""