# OnoForge 40K — `index.html` Low-Level Caller/Callee Map

**Status:** Mapping only — no application-code extraction
**Branch:** `feature/opponent-turn-history`
**Source:** uploaded `index.html`, independently verified against GitHub blob `4941fcffc41072fd9f60dcf870a0227b4437b74c`

## Method

This pass uses the complete uploaded source as the authoritative inspection artifact. Function declarations were located in source order and direct call sites were traced within the same source. The GitHub code-search index is currently unavailable for this repository, so this document does not depend on GitHub code-search results.

The purpose is to identify the first low-risk extraction boundaries, not to declare any function safe solely because it has few callers.

## Candidate call graph

| Function | Signature | Direct callers | Direct callees | Hidden side effects found in body | Initial assessment |
|---|---|---|---|---|---|
| `battlefieldDistanceBetween` | `(a,b)` | `battlefieldTerrainContextBetweenUnits`; `battlefieldTerrainPathIntersections`; `clearBattlefieldUnitPosition`; `objectiveDistanceFromUnit` | none | none detected | **Strong pure utility candidate** |
| `mergeSupplementalUnits` | `(canonical,supplemental)` | **No call sites found** | none | none detected | **Currently unreferenced; do not extract until dead-code status is confirmed** |
| `collectBSDataObjects` | `(root)` | `refreshCurrentUnitDatabase` | nested `walk` | none detected | **Good data utility candidate** |
| `bsProfile` | `(entry,typeName)` | `bsUnitFromEntry` | none | none detected | **Strong pure data helper** |
| `bsCharacteristics` | `(profile)` | `bsUnitFromEntry`; `walk` | none | none detected | **Strong pure data helper** |
| `normalize11eWeaponAbilities` | `(raw)` | `walk` | none | none detected | **Strong pure normalization helper** |
| `isPermanentSampleArmy` | `(id)` | `deleteSavedArmyList` | none | none detected | **Strong pure policy helper** |
| `formatSavedListDate` | `(value)` | `dataSyncStatusHtml`; `localDataSavedLabel`; `savedListsPage` | none | none detected | **Strong pure formatting helper** |
| `primaryScoringRoundRange` | `(timing)` | `primaryScoringRowAvailable` | none | none detected | **Strong pure scoring helper** |
| `primaryScoringVP` | `(value)` | `objectivePrimaryScoringImpact`; `primaryObjectiveCheckpointHtml`; `primaryScoringEvidence`; `primaryScoringRowsForRound`; `scorePrimaryItem` | none | none detected | **Strong pure scoring helper** |
| `primaryScoringIsPer` | `(row)` | `primaryMissionDetailsHtml`; `primaryScoringEvidence`; `scorePrimaryItem` | none | none detected | **Strong pure scoring helper** |
| `getCloudConfig` | `()` | `cloudConfigReady`; `dataManagementPage`; `ensureSupabaseClient` | none | reads `ONOFORGE_CLOUD_CONFIG` | **Small service-boundary candidate; global config must become explicit** |
| `cloudConfigReady` | `()` | `dataSyncStatusHtml`; `initCloudOnLoad` | `getCloudConfig` | none detected | **Good wrapper candidate after cloud config contract is defined** |
| `cloudArmyPayload` | `(list,userId)` | `cloudSyncSavedLists`; `cloudUpsertArmyList` | none | deep clone; timestamp generation | **Good cloud adapter candidate; time semantics must be preserved** |

## Detailed notes

### `battlefieldDistanceBetween`

Implementation is a direct coordinate-distance calculation over its two arguments. It has three identified gameplay callers plus objective-distance support and no DOM/state/persistence/cloud access in its body.

**Boundary candidate:** `geometry.js` or `battlefield/geometry.js`.

**Required validation:** existing battlefield/objective distance behavior and any geometry-dependent Tactical Advisor calculations.

### `mergeSupplementalUnits`

The complete source scan found the declaration but no call site. Its implementation copies canonical records, marks source roles, keys by faction/name, and merges supplemental records without external state access.

**Important:** this is not automatically an extraction candidate. First determine whether it is intentionally dormant, legacy, or reachable through an indirect mechanism. If confirmed dead, remove only in a separate cleanup change—not as part of module extraction.

### BSData helpers

`collectBSDataObjects`, `bsProfile`, `bsCharacteristics`, and `normalize11eWeaponAbilities` form a coherent normalization cluster. The strongest boundary is the BSData ingestion/normalization layer rather than four unrelated utility exports.

Observed flow:

```text
BSData root
  -> collectBSDataObjects
  -> walk / entry traversal
  -> bsProfile / bsCharacteristics
  -> normalize11eWeaponAbilities
  -> canonical unit/database representation
```

The public interface should be defined around normalized data, not around internal recursive traversal helpers.

### Saved-list helpers

`isPermanentSampleArmy` and `formatSavedListDate` are independent pure helpers used by UI/data-management code. They are low-risk candidates, but their extraction value is small. They should probably travel with a broader saved-list/data-management utility module rather than creating one-file-per-function fragmentation.

### Primary scoring helpers

`primaryScoringRoundRange`, `primaryScoringVP`, and `primaryScoringIsPer` are pure-looking helpers with multiple callers. They belong together conceptually under primary scoring rules. Their extraction should wait until the scoring subsystem's rule-data contract is documented, because their callers span scoring and UI/evidence rendering.

### Cloud helpers

`getCloudConfig` is tiny and reads the singleton `ONOFORGE_CLOUD_CONFIG`. `cloudConfigReady` depends only on `getCloudConfig`. `cloudArmyPayload` clones an army list and adds cloud metadata/timestamps.

Potential boundary:

```text
cloud adapter
  ├── config()
  ├── ready()
  └── armyPayload(list,userId,now?)
```

A future `now` argument could make `cloudArmyPayload` deterministic for tests, but changing its current signature should be treated as a deliberate interface change rather than bundled into extraction.

## Low-level dependency conclusions

### Strongest first-wave pure candidates

1. `battlefieldDistanceBetween`
2. `bsProfile`
3. `bsCharacteristics`
4. `normalize11eWeaponAbilities`
5. `formatSavedListDate`
6. `isPermanentSampleArmy`
7. `primaryScoringRoundRange`
8. `primaryScoringVP`
9. `primaryScoringIsPer`

These functions have no detected DOM, state, persistence, cloud, or rendering side effects in their bodies.

### Strongest coherent module candidates

**Geometry:** `battlefieldDistanceBetween` plus related geometry functions after their own call graph is mapped.

**BSData normalization:** `collectBSDataObjects`, `bsProfile`, `bsCharacteristics`, `normalize11eWeaponAbilities`.

**Cloud adapter:** `getCloudConfig`, `cloudConfigReady`, `cloudArmyPayload`, followed by the surrounding cloud synchronization functions once their state contract is mapped.

**Primary scoring:** the three primary-scoring helpers, but only after the surrounding scoring data contract is mapped.

## Important distinction

A low caller count does **not** automatically mean low extraction risk. A function can be pure but still sit on a critical execution path. Conversely, a function with many callers may be easy to extract if its interface is stable.

Therefore the next mapping pass should identify:

- exact state fields used by the callers;
- whether callers expect global names;
- whether any caller depends on declaration order;
- whether the function is reachable during startup;
- whether the function is part of the combat path;
- what validation covers the callers.

## Recommended next mapping target

Before any code extraction, map the **callers of the nine strongest pure candidates**, then map the immediate callers/callees of the BSData cluster and cloud cluster. This will tell us whether to extract individual helpers or coherent modules.

## Refactor rule

**Map → define boundary → extract → validate → commit → update the maps.**

No gameplay behavior changes are included in this mapping artifact.
