# OnoForge 40K — `index.html` Dependency Map

**Status:** Architecture mapping only — no application-code extraction
**Branch:** `feature/opponent-turn-history`
**Source:** `index.html`
**Baseline blob:** `4941fcffc41072fd9f60dcf870a0227b4437b74c`
**Companion architecture map:** `INDEX_HTML_ARCHITECTURE_MAP_V2.md`

## Purpose

This document continues the monolith inventory from architecture-level grouping into dependency-boundary mapping. It is deliberately conservative: a subsystem is not considered extractable merely because its functions are adjacent or have a recognizable name.

## Dependency model

For each future extraction, record:

- **Inputs:** arguments, globals, embedded data, and `state` fields read.
- **Outputs:** return values, DOM changes, state mutations, events, persistence effects.
- **Callers:** code that must continue to reach the extracted API.
- **Callees:** functions the extracted code still requires.
- **Side effects:** DOM, localStorage, cloud, timers, event history, rendering.
- **Boundary:** the smallest stable public interface that can replace the inline implementation.
- **Validation:** syntax/startup checks plus targeted manual or automated tests.

## Mapping status

| Subsystem | Boundary visibility | Main dependencies | Side effects | Risk | Mapping status |
|---|---|---|---|---|---|
| CSS / presentation | High | DOM class names, HTML structure | DOM presentation only | Low | Ready for detailed selector inventory |
| Pure utilities | Medium | Mixed globals; some candidates are pure | Usually none | Low | Needs function-level purity scan |
| Cloud integration | Medium | auth/config, `state.cloud`, saved lists/battles | Network + state | Low/Medium | Needs complete call graph |
| Data / normalization | Medium/High | embedded catalogue, BSData, `unitDatabase`, `state` | Data mutation/refresh | Medium | Needs interface map |
| Deployment | High | `state`, battlefield/objective data, roster | State + rendering | Medium | Needs state-field map |
| Wargear / roster support | Medium | roster objects, unit data, state | State + rendering | Medium | Later |
| Builder / UI | Low/Medium | state, data, rendering | DOM + state | Medium | Later |
| Scoring / missions | Medium | battle state, objectives, secondary state | State + logs | Medium/High | Later |
| Battle state | Low | nearly all combat/state layers | State + rendering | High | Protected |
| Events / undo | Low | state snapshots, event schema, rendering | State/history/persistence | Very High | Protected |
| Tactical Advisor | Low | battle state, rules/data, combat context | cache/rendering | Very High | Protected |
| Combat engine | Low/Medium | model roster, weapon profiles, resolver state | Combat state | High | Protected |
| Physical-dice resolver | Low | state, roster, tactical context, events | Combat mutation/events | Critical | Protected |
| Bootstrap / render | Low | nearly every subsystem | DOM/global startup | High | Protected |

## Current concrete boundaries

### 1. Deployment / battlefield

The source contains a coherent family around objective layouts, deployment plans, reserves, transports, battlefield positions, and deployment validation. Known function families include:

- objective layout/mission helpers;
- reserve declaration and reserve checks;
- transport embarkation/entry helpers;
- deployment-plan creation/loading/saving;
- deployment positions and validation;
- battlefield/map state.

**Likely interface:** read/write a defined deployment slice of `state`, with rendering delegated to the existing UI layer.

**Do not extract yet:** deployment functions that directly perform broad `render()` calls or reach unrelated battle state.

### 2. Data / catalogue

The source distinguishes canonical runtime data from embedded/bootstrap data and includes BSData normalization and runtime database refresh. Known concepts include:

- canonical unit database;
- bootstrap/embedded catalogue;
- BSData object collection and normalization;
- weapon/ability/wargear parsing;
- supplemental-unit merging;
- runtime database refresh.

**Likely interface:** `load/normalize/refresh` functions that return or update a defined canonical database object.

**Critical rule:** preserve the current source-of-truth policy. Data extraction must not introduce a second canonical database.

### 3. Cloud integration

The source contains authentication/configuration plus cloud synchronization for army lists and battles. Known function families include cloud configuration, sign-up/sign-in/sign-out, password recovery/update, and cloud list/battle synchronization.

**Likely interface:** a cloud service object with explicit methods and explicit state synchronization inputs/outputs.

**Critical rule:** cloud failures must remain non-fatal to local battle state.

### 4. Pure utilities

The function inventory contains candidates for pure formatting, calculation, normalization, and small helper functions. These must be screened individually rather than extracted by source location alone.

A function qualifies as an early pure-utility candidate only if its implementation does not:

- read or mutate application state through hidden globals;
- touch DOM APIs;
- emit events;
- write localStorage/cloud state;
- depend on mutable singleton objects;
- call rendering/bootstrap functions.

### 5. CSS / presentation

The stylesheet is embedded in `index.html` and includes application layout, cards, forms, tabs, logs, modals, physical-dice UI, leader/bodyguard UI, wargear UI, Game Assistant, and battle-dashboard presentation.

**Likely interface:** none at runtime beyond the existing class/id contract. The safest first extraction is therefore CSS-only, provided the existing HTML class/id names remain unchanged.

## Protected dependency chains

### Combat authority

```text
physical action
  -> physical-dice resolver
  -> canonical model/state mutation
  -> event
  -> Action Log
  -> Combat History
```

No refactor may create a competing mutation path.

### Persistence

```text
state
  -> save/load
  -> local persistence
  -> backup import/export
  -> restore/undo semantics
```

Timer and event-history semantics must remain unchanged.

### Tactical Advisor

```text
battle state
  -> tactical context
  -> legality/context calculations
  -> advisor result/cache
  -> UI rendering
```

Do not move advisor functions until their state/context inputs are explicit.

## Mapping work still required before extraction

1. Produce a function-level caller/callee map for CSS-adjacent utilities, cloud, data, and deployment.
2. Identify exact `state` fields read/written by each candidate subsystem.
3. Identify direct DOM access in each candidate.
4. Identify event and persistence calls.
5. Define the smallest replacement interface.
6. Identify validation checks and manual smoke tests.
7. Record the map here before moving code.

## Proposed extraction sequence

1. CSS-only extraction.
2. Individually verified pure utilities.
3. Cloud integration.
4. Data/normalization.
5. Deployment.
6. Wargear/roster support.
7. Builder/UI.
8. Scoring/mission systems.
9. State/events/undo only after explicit contracts are documented.
10. Tactical/combat systems last.

## Refactoring rule

**Map → define boundary → extract → validate → commit → update this document.**

Never combine a large architectural extraction with a gameplay behavior change unless there is a specific reason and a separate validation plan.
