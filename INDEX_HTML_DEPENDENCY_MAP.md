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
| CSS / presentation | High | DOM class names, HTML structure | DOM presentation only | Low | Selector/class inventory remains |
| Pure utilities | Medium/High | Mostly explicit arguments for selected candidates; transitive calls still need checking | Usually none | Low | **Initial function-level screen complete; candidates identified** |
| Cloud integration | Medium | auth/config, `state.cloud`, saved lists/battles, Supabase | Network + state | Low/Medium | **Function families mapped; call graph still needed** |
| Data / normalization | High | embedded catalogue, BSData objects, canonical database | Database refresh | Medium | **Core parser/normalizer functions mapped** |
| Deployment | High | `state`, objective/map data, roster, deployment slices | State + rendering | Medium | **Core state helpers mapped; UI/render helpers separated** |
| Wargear / roster support | Medium | roster objects, unit data, state | State + rendering | Medium | Later |
| Builder / UI | Low/Medium | state, data, rendering | DOM + state | Medium | Later |
| Scoring / missions | Medium | battle state, objectives, secondary state | State + logs | Medium/High | Later |
| Battle state | Low | nearly all combat/state layers | State + rendering | High | Protected |
| Events / undo | Low | state snapshots, event schema, rendering | State/history/persistence | Very High | Protected |
| Tactical Advisor | Low | battle state, rules/data, combat context | cache/rendering | Very High | Protected |
| Combat engine | Low/Medium | model roster, weapon profiles, resolver state | Combat state | High | Protected |
| Physical-dice resolver | Low | state, roster, tactical context, events | Combat mutation/events | Critical | Protected |
| Bootstrap / render | Low | nearly every subsystem | DOM/global startup | High | Protected |

## Source-level mapping pass — low-risk areas

The following mapping is based on the verified complete `index.html` source, not on naming alone. Line numbers refer to the current 11,634-line baseline.

### A. Deployment / battlefield — lines 724–977

The deployment region contains both **state/domain helpers** and **presentation/render helpers**. They must not be extracted as one block.

#### A1. Low-level/domain candidates

| Function | Lines | Direct state/side effect | Dependency notes | Preliminary boundary |
|---|---:|---|---|---|
| `objectiveMissionKey()` | 724 | No direct state; calls `primaryMission()` | Depends on mission state transitively | Pure helper candidate, but not standalone yet |
| `objectiveLayoutInfo()` | 725 | No direct DOM/storage/event | Calls `primaryMission`, `OBJECTIVE_LAYOUT_INDEX` | Pure lookup candidate |
| `deploymentPlanKey()` | 729 | Reads `state.objectiveMapLayout`, `state.objectiveMapMissionKey` | Global state read only | Pass a deployment context instead of reading state |
| `isUnitReserved(side, uid)` | 737 | Reads reserve state through `ensureReserveState()` | Transitive state dependency | Candidate after state slice interface |
| `reserveUnitsForSide(side)` | 738 | Reads `state.my` / `state.opp` | Depends on `entry()` and reserve state | Candidate with explicit roster/reserve inputs |
| `transportEntry(side, uid)` | 786 | No direct state | Calls `entry()` and reads unit keywords | Candidate with explicit entry/unit database |
| `isUnitEmbarked(side, uid)` | 791 | No direct DOM/storage/event | Reads transport-embarkation state transitively | Candidate after transport-state interface |
| `transportPassengers(side, transportUid)` | 796 | No direct DOM/storage/event | Reads transport-embarkation state transitively | Candidate after transport-state interface |
| `deploymentPlanForCurrentMap()` | 844 | Reads deployment-plan state transitively | Calls `ensureDeploymentPlans()` and `deploymentPlanKey()` | Candidate with explicit deployment plan |
| `deploymentPlanPosition(uid)` | 845 | No direct DOM/storage/event | Reads current deployment plan | Candidate |
| `battlefieldDistanceBetween(a,b)` | 877 | Pure calculation | Only explicit coordinates | **Strong early pure utility candidate** |
| `objectiveDistanceFromUnit(side,uid,objectiveName)` | 883 | Reads battlefield/objective state through helpers | Calls `battlefieldUnitPosition`, `objectiveStateRecord` | Candidate after context interface |
| `battlefieldTerrainGeometry()` | 888 | Reads objective battlefield geometry | Calls `objectiveBattlefieldGeometry` | Candidate after geometry interface |
| `battlefieldTerrainAtPoint(x,y)` | 894 | No direct DOM/storage/event | Depends on terrain geometry | Pure geometry candidate if geometry passed in |
| `battlefieldTerrainPathIntersections(a,b)` | 915 | No direct DOM/storage/event | Depends on terrain geometry and distance calculation | Pure geometry candidate if geometry passed in |

#### A2. State-mutating deployment functions

These should **not** be extracted during the first low-risk pass:

- `setObjectiveMapLayout`
- `setReserveDeclaration`
- `deployReserveByMap`
- `setTransportEmbarkation`
- `setDeploymentPlanPosition`
- `clearDeploymentPlanPosition`
- `clearDeploymentPlanForCurrentMap`
- `saveDeploymentPlan`
- `loadDeploymentPlan`
- `setBattlefieldUnitPosition`
- `clearBattlefieldUnitPosition`
- `completeTerrainSetup`

They form the write side of the deployment state contract and need explicit mutation/event/persistence mapping before movement.

#### A3. Presentation functions

The following are UI/render functions and should remain separate from domain extraction:

- `reserveDeclarationSectionHtml`
- `reserveTrayHtml`
- `transportDeclarationSectionHtml`
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
- `objectiveLayoutHtml`

**Boundary rule:** these may eventually move to `ui/deployment.js`, but only after domain helpers are separated from rendering calls.

### B. Data / normalization — lines 1003–1176

This is the cleanest non-CSS architectural region identified so far.

#### B1. Strong candidates for data module

| Function | Lines | Direct state/DOM | Dependencies | Preliminary boundary |
|---|---:|---|---|---|
| `bootstrapUnitDatabase()` | 1012 | None | `EXPANDED_CATALOGUE` / `DEMO` globals | Return bootstrap database |
| `mergeSupplementalUnits(canonical, supplemental)` | 1015 | None | Explicit arrays | **Strong pure candidate** |
| `collectBSDataObjects(root)` | 1027 | None | Recursive object traversal | **Strong pure candidate** |
| inner `walk(x)` | 1029 | None | Local Map/Set | Private helper; keep inside module |
| `bsProfile(entry,typeName)` | 1039 | None | Explicit entry | **Strong pure candidate** |
| `bsCharacteristics(profile)` | 1043 | None | Explicit profile | **Strong pure candidate** |
| `bsAbilities(entry)` | 1054 | None | Explicit entry; local traversal | Candidate after exact output contract documented |
| `normalize11eWeaponAbilities(raw)` | 1082 | None | Explicit raw value | **Strong pure candidate** |
| `bsWeapons(entry)` | 1098 | None | Explicit entry; local traversal | Candidate |
| `bsWargearOptions(entry)` | 1134 | None | Explicit entry; local traversal | Candidate |
| `bsUnitFromEntry(entry,faction)` | 1150 | None | Parser helpers + explicit entry | Candidate, but higher transitive coupling |

#### B2. Data boundary

The clean interface should eventually resemble:

```text
source data
  -> collect/normalize/parse
  -> canonical unit records
  -> application data layer
```

The extraction must preserve the existing distinction between canonical runtime data and bootstrap/supplemental data. It must not create a second `unitDatabase` authority.

#### B3. Functions that remain state/application-level

- `unitDatabase()` — application accessor/authority boundary
- `canonicalUnitDatabase()` — canonical authority accessor
- `refreshCurrentUnitDatabase()` — runtime refresh orchestration

These should consume the extracted parser/data module rather than being moved wholesale with it.

### C. Low-level scoring/formatting utilities encountered immediately after data

These are not part of the first extraction boundary, but several are genuine pure candidates:

- `isPermanentSampleArmy(id)` — pure string classification.
- `formatSavedListDate(value)` — pure date formatting.
- `primaryScoringRoundRange(timing)` — pure parse.
- `primaryScoringRowAvailable(timing,round)` — pure rule/availability calculation if its inputs remain explicit.
- `primaryScoringVP(value)` — pure parse/clamp.
- `primaryScoringIsPer(row)` — pure text classification.

They should be considered for a future `core/utils.js` or `battle/scoring-utils.js`, depending on transitive callers.

### D. Cloud integration — lines 10826–11214

Cloud is reasonably bounded but **not pure**. The function families are:

#### D1. Configuration/status helpers

- `getCloudConfig()` — pure config read from global configuration.
- `cloudConfigReady()` — pure predicate over cloud config.
- `cloudStatusClass()` — reads `state.cloud`.
- `cloudStatusText()` — reads `state.cloud`.
- `cloudMark(status,error)` — mutates `state.cloud`.

`getCloudConfig` and `cloudConfigReady` are early pure candidates. The status helpers belong with the cloud adapter because they depend on the cloud state contract.

#### D2. Supabase lifecycle

- `loadSupabaseLibrary()`
- `ensureSupabaseClient()`
- `connectCloudFromInputs()`
- `initCloudOnLoad()`

These depend on browser globals/network/library loading and should be kept together.

#### D3. Authentication

- `cloudSignUp()`
- `cloudForgotPassword()`
- `cloudUpdatePassword()`
- `cloudSignIn()`
- `cloudSignOut()`
- `clearCloudConfiguration()`
- `ensureCloudProfile(user)`

These mutate cloud/auth state and should not be mixed with local data utilities.

#### D4. Cloud data synchronization

- `cloudArmyPayload(list,userId)` — transformation candidate; explicit list/user inputs.
- `cloudUpsertArmyList(list)`
- `cloudDeleteArmyList(list)`
- `cloudSyncSavedLists()`
- `cloudSaveCurrentBattle(opts)`
- `cloudRefreshBattles()`
- `cloudLoadBattle(id)`
- `cloudNewBattle()`
- `cloudBattleDeleteConfirm(id)`
- `cloudDeleteBattle(id)`

`cloudArmyPayload` is the strongest pure transformation candidate in this group. The remaining functions are service methods with network/state effects.

**Cloud boundary:**

```text
local application
  -> explicit cloud adapter
  -> Supabase/auth
  -> explicit result/error
  -> local state synchronization
```

The adapter must not become authoritative for local battle state.

### E. Combat/math utility candidates — mapped but protected from extraction

Several genuinely pure-looking helpers exist in the combat region:

- `engineExpectedDice`
- `engineRoll`
- `engineFnp`
- `engineSustained`
- `engineAntiForTarget`
- `engineDistForNeed`
- `engineRollDistribution`
- `engineWoundDistribution`
- `engineSaveDistribution`
- `engineRollDistributionExact`
- `approxKillChance`

However, they are intentionally **not first-wave extraction candidates**. Their transitive relationship with the Tactical Advisor and physical-dice/combat resolver must be mapped before moving them. The function being mathematically pure is not sufficient if its callers depend on shared combat conventions.

## Low-level dependency conclusions

### First-wave candidates

The mapping now supports these as the strongest low-risk candidates:

1. `battlefieldDistanceBetween(a,b)`
2. `mergeSupplementalUnits(canonical,supplemental)`
3. `collectBSDataObjects(root)` and its private traversal helper
4. `bsProfile(entry,typeName)`
5. `bsCharacteristics(profile)`
6. `normalize11eWeaponAbilities(raw)`
7. `isPermanentSampleArmy(id)`
8. `formatSavedListDate(value)`
9. `primaryScoringRoundRange(timing)`
10. `primaryScoringVP(value)`
11. `primaryScoringIsPer(row)`
12. `getCloudConfig()`
13. `cloudConfigReady()`
14. `cloudArmyPayload(list,userId)`

These are **candidates, not yet extracted**. Each still requires caller/callee verification and a decision about which module owns the function.

### Explicitly deferred

- deployment state writers;
- persistence;
- event creation/undo;
- battle-state synchronization;
- Tactical Advisor;
- physical-dice resolver;
- combat engine;
- master rendering/bootstrap.

## Next mapping pass

The next pass should trace **callers and callees of the 14 first-wave candidates**, then record:

1. every direct caller;
2. every transitive global dependency;
3. exact state fields, if any;
4. whether the function can accept explicit inputs instead;
5. proposed destination module;
6. required regression check.

Only after that call graph is recorded should the first extraction be considered.

## Refactoring rule

**Map → define boundary → extract → validate → commit → update this document.**

Never combine a large architectural extraction with a gameplay behavior change unless there is a specific reason and a separate validation plan.
