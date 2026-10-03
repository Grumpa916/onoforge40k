# OnoForge 40K — Low-Risk Caller/Callee Map v2

**Status:** Mapping only — no application-code extraction
**Branch:** `feature/opponent-turn-history`
**Source:** verified `index(4).html` / GitHub `index.html`
**Source blob:** `4941fcffc41072fd9f60dcf870a0227b4437b74c`

This pass uses the complete uploaded source, which was previously verified byte-for-byte against the GitHub blob. GitHub code search is not treated as authoritative for this large monolith.

## 1. Strong pure candidates

| Function | Direct callers found | Callees / internal dependencies | Hidden global/state dependency | Assessment |
|---|---|---|---|---|
| `battlefieldDistanceBetween(a,b)` | `objectiveDistanceFromUnit`; `battlefieldTerrainPathIntersections`; tactical combat-pair context | `Number.isFinite`, `Math.hypot` | None | Strong pure utility |
| `mergeSupplementalUnits(canonical,supplemental)` | No non-declaration caller found in complete source scan | Array/map/object operations only | None | Pure but currently appears dormant; verify before extraction |
| `collectBSDataObjects(root)` | BSData refresh/loading path | Private recursive `walk`; `Map`, `Set`, `Object.keys` | None | Strong data-parser candidate |
| `bsProfile(entry,typeName)` | `bsUnitFromEntry` | Array `.find` only | None | Strong data-parser candidate |
| `bsCharacteristics(profile)` | `bsWeapons`; `bsUnitFromEntry` | String normalization, array traversal | None | Strong data-parser candidate |
| `normalize11eWeaponAbilities(raw)` | `bsWeapons` | String/array operations, regex | None | Strong data-parser candidate |
| `isPermanentSampleArmy(id)` | `deleteSavedArmyList` | String conversion/prefix test | None | Strong pure utility |
| `formatSavedListDate(value)` | saved-list UI; local/cloud sync status UI | `Date`, `toLocaleString` | None | Pure presentation utility; locale behavior must be preserved |
| `primaryScoringRoundRange(timing)` | `primaryScoringRowAvailable` | String/regex/Number | None | Strong pure scoring utility |
| `primaryScoringVP(value)` | multiple scoring functions/UI helpers | String/regex/Number | None | Strong pure scoring utility |
| `primaryScoringIsPer(row)` | scoring evidence/detail/UI paths | String/regex | None | Strong pure scoring utility |
| `getCloudConfig()` | `cloudConfigReady`; `ensureSupabaseClient`; `dataManagementPage` | Reads `ONOFORGE_CLOUD_CONFIG` | Config constant only | Strong cloud-config utility |
| `cloudConfigReady()` | `dataSyncStatusHtml`; `initCloudOnLoad`; config UI | Calls `getCloudConfig` | Config constant through callee | Strong cloud predicate |
| `cloudArmyPayload(list,userId)` | `cloudUpsertArmyList`; `cloudSyncSavedLists` | Deep clone; date creation | None | Strong cloud transformation candidate |

## 2. Caller/callee detail

### `battlefieldDistanceBetween`

**Definition:** line 877.

**Direct callers found:**
- `objectiveDistanceFromUnit` (line 886)
- `battlefieldTerrainPathIntersections` (line 918)
- tactical combat-pair state/context path (line ~7165)

**Callees:** only built-in numeric primitives (`Number`, `Number.isFinite`, `Math.hypot`).

**Boundary:** `distance(a,b) -> number|null`.

**Recommendation:** excellent candidate for a generic geometry utility, but callers should eventually receive explicit coordinate objects rather than application records where practical.

### `mergeSupplementalUnits`

**Definition:** line 1015.

**Direct callers:** no non-declaration call found in the complete source scan.

**Callees:** array/map/object operations only.

**Recommendation:** do not extract until its intended lifecycle is confirmed. A function with zero callers is a cleanup candidate, not automatically a module candidate.

### BSData parser cluster

`collectBSDataObjects` is called by the 11E data-loading path around line 1183. That path then builds `window.__BS_OBJECT_MAP`, resolves catalogue links, and calls `bsUnitFromEntry`.

`bsUnitFromEntry` calls:
- `bsProfile`
- `bsCharacteristics`
- `bsWeapons`

`bsWeapons` calls:
- `bsCharacteristics`
- `normalize11eWeaponAbilities`

This gives the following dependency tree:

```text
load 11E data
  -> collectBSDataObjects(root)
  -> catalogue links
      -> bsUnitFromEntry(entry,faction)
          -> bsProfile(entry,'Unit')
          -> bsCharacteristics(profile)
          -> bsWeapons(entry)
              -> bsCharacteristics(profile)
              -> normalize11eWeaponAbilities(raw)
```

**Conclusion:** these parser functions should probably be extracted as one coherent `data/bsdata-parser.js` boundary rather than as many tiny utility files.

### `isPermanentSampleArmy`

**Caller:** `deleteSavedArmyList`.

**Callees:** none beyond built-in string conversion.

**Boundary:** `id -> boolean`.

**Recommendation:** safe pure utility, but likely belongs with saved-list policy rather than generic utilities if its semantics remain domain-specific.

### `formatSavedListDate`

**Callers:** saved-list UI plus local/cloud synchronization status rendering.

**Callees:** `Date`, `Number.isNaN`, `toLocaleString`.

**Hidden dependency:** locale/environment only.

**Recommendation:** pure but presentation-oriented. Keep behavior exactly as-is if moved.

### Primary scoring helpers

`primaryScoringRoundRange` is called by `primaryScoringRowAvailable`.

`primaryScoringVP` is called by scoring mutation/evidence/detail paths and multiple UI helpers.

`primaryScoringIsPer` is called by scoring evidence and detail/UI paths.

All three have explicit inputs and no direct state/DOM/storage access.

**Recommendation:** do not scatter them into generic utilities. A `scoring-utils.js` boundary is more coherent.

### Cloud configuration

```text
ONOFORGE_CLOUD_CONFIG
  -> getCloudConfig()
      -> cloudConfigReady()
          -> dataSyncStatusHtml()
          -> initCloudOnLoad()

getCloudConfig()
  -> ensureSupabaseClient()
  -> dataManagementPage()
```

The config helpers have no state mutation. `ensureSupabaseClient` is the first point where browser/library/network side effects enter.

### Cloud payload

```text
cloudArmyPayload(list,userId)
  -> cloudUpsertArmyList(list)
      -> Supabase insert/update
  -> cloudSyncSavedLists()
      -> Supabase insert/update
```

`cloudArmyPayload` itself is a transformation and does not need Supabase access.

**Boundary:** `army list + user id -> Supabase row payload`.

## 3. Declaration-order / initialization findings

The monolith is a single script, so declaration order matters even when a function's body looks pure.

### Confirmed important initialization dependencies

- `getCloudConfig` depends on `ONOFORGE_CLOUD_CONFIG` being initialized before runtime invocation.
- `cloudConfigReady` depends on `getCloudConfig` and therefore inherits that configuration dependency.
- BSData loading depends on `CURRENT_11E_DATA_SOURCES` and the parser functions being available before the runtime refresh path executes.
- `bsWeapons` uses `window.__BS_OBJECT_MAP`, which is populated by the data-loading path after `collectBSDataObjects` runs. This is a **runtime dependency**, not a lexical declaration dependency.
- `unitDatabase` / `canonicalUnitDatabase` are application-level authority accessors and must remain above/available to consumers during bootstrap.
- scoring helpers rely on the `PRIMARY_SCORING` data object through their callers; the helpers themselves do not read it directly except where noted by caller context.

### Important distinction

Function declarations are hoisted, so moving a function body to an external module does not preserve every dependency automatically. `const`/`let` configuration/data objects and browser globals must be explicitly passed or imported in the extracted module.

## 4. First extraction candidates after this map

### Candidate A — `data/bsdata-parser.js`

Preferred contents:
- `collectBSDataObjects`
- `bsProfile`
- `bsCharacteristics`
- `normalize11eWeaponAbilities`
- `bsWeapons`
- `bsWargearOptions`
- `bsUnitFromEntry`

This is preferable to extracting the tiny functions separately because they form a coherent parser graph.

### Candidate B — `core/geometry.js`

Initial contents:
- `battlefieldDistanceBetween`

Potential later additions only after mapping:
- `battlefieldTerrainAtPoint`
- `battlefieldTerrainPathIntersections`

### Candidate C — `cloud/cloud-utils.js`

Initial contents:
- `getCloudConfig`
- `cloudConfigReady`
- `cloudArmyPayload`

The actual Supabase lifecycle and synchronization functions remain in the monolith until their state contract is mapped.

### Candidate D — `battle/scoring-utils.js`

Initial contents:
- `primaryScoringRoundRange`
- `primaryScoringVP`
- `primaryScoringIsPer`

### Candidate E — `core/string/date-policy.js` or saved-list utility

Potential:
- `isPermanentSampleArmy`
- `formatSavedListDate`

These should not necessarily be grouped just because both are pure. Domain cohesion is preferable to file-count reduction.

## 5. Validation anchors

Before any extraction, preserve these behaviors:

- BSData loading still creates the same canonical unit records.
- Cloud config status UI is unchanged.
- Cloud army payload shape is unchanged.
- Saved-list date display is unchanged.
- Primary scoring timing/VP classification is unchanged.
- Battlefield distance calculations are numerically identical.
- No combat/event/resolver code is changed in the first extraction.

## 6. Current conclusion

The low-risk mapping now supports **coherent module boundaries**, not merely isolated function moves. The best first JavaScript extraction is likely the BSData parser cluster, while CSS remains the lowest-risk overall extraction.

No application-code extraction should occur until the chosen module's interface and validation test are written down.
