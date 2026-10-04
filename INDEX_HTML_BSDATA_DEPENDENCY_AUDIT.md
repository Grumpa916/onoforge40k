# OnoForge 40K — BSData Parser Dependency Audit

**Status:** Verified against uploaded authoritative `index.html`; no application-code changes
**Branch:** `feature/opponent-turn-history`
**Source baseline:** `index.html` blob `4941fcffc41072fd9f60dcf870a0227b4437b74c`
**Contract:** `INDEX_HTML_BSDATA_INTERFACE_CONTRACT.md`

## Audit conclusion

The proposed BSData parser boundary is viable, but the original two-function public interface is too narrow if it requires preserving the current implementation literally. Two hidden dependencies must be made explicit during extraction:

1. `bsWeapons()` and `bsAbilities()` currently resolve linked entries through `window.__BS_OBJECT_MAP`.
2. `bsUnitFromEntry()` calls `bsAbilities()` and `bsWargearOptions()` in addition to the functions named in the initial contract.

These are **parser-local dependencies**, not application-state dependencies, so they can be contained inside the module. No battle-state, roster-state, rendering, event, persistence, cloud, Tactical Advisor, or combat dependency was found in the parser functions audited here.

## Direct caller/callee map

### `collectBSDataObjects(root)`

**Declaration:** line ~1027.

**Non-declaration caller:** `refreshCurrentUnitDatabase()` at line ~1183.

**Callees:** local recursive helper `walk()` only.

**External dependencies:** none.

**Side effects:** none; returns a `Map` of object IDs to source objects.

**Assessment:** strong extraction candidate.

### `bsProfile(entry, typeName)`

**Declaration:** ~1039.

**Non-declaration callers:** `bsUnitFromEntry()` (~1152).

**Callees:** Array `.find()` only.

**External dependencies:** none.

**Assessment:** pure parser helper; keep private.

### `bsCharacteristics(profile)`

**Declaration:** ~1043.

**Non-declaration callers:** `bsWeapons()` (~1112), `bsUnitFromEntry()` (~1154).

**Callees:** array iteration and string normalization only.

**External dependencies:** none.

**Assessment:** pure parser helper; keep private.

### `bsAbilities(entry)`

**Declaration:** ~1054.

**Non-declaration caller:** `bsUnitFromEntry()` (~1167).

**Callees:** local recursive `walk()`.

**Hidden dependency:** `window.__BS_OBJECT_MAP` when resolving `entryLinks`.

**Assessment:** parser-local dependency. During extraction, replace the implicit window lookup with an explicit object-map argument or parser context.

### `normalize11eWeaponAbilities(raw)`

**Declaration:** ~1082.

**Non-declaration caller:** `bsWeapons()` (~1113).

**Callees:** array/string methods only.

**External dependencies:** none.

**Assessment:** pure parser helper; keep private.

### `bsWeapons(entry)`

**Declaration:** ~1098.

**Non-declaration caller:** `bsUnitFromEntry()` (~1157).

**Callees:** `bsCharacteristics()`, `normalize11eWeaponAbilities()`, local recursive `walk()`.

**Hidden dependency:** `window.__BS_OBJECT_MAP` for `entryLinks` resolution.

**Assessment:** parser-local dependency. Convert to explicit context/map input during extraction.

### `bsWargearOptions(entry)`

**Declaration:** ~1134.

**Non-declaration caller:** `bsUnitFromEntry()` (~1169).

**Callees:** local recursive `walk()`.

**External dependencies:** none detected.

**Assessment:** pure parser helper; keep private.

### `bsUnitFromEntry(entry, faction)`

**Declaration:** ~1150.

**Non-declaration caller:** `refreshCurrentUnitDatabase()` (~1189).

**Callees:** `bsProfile()`, `bsCharacteristics()`, `bsWeapons()`, `bsAbilities()`, `bsWargearOptions()`.

**External dependencies:** only its explicit `entry` and `faction` inputs plus parser-local callees. No `state`, DOM, persistence, cloud, combat, or Tactical Advisor access detected in its body.

**Assessment:** suitable module-boundary function. Its return shape must remain unchanged.

### `refreshCurrentUnitDatabase(showMessage=true)`

**Declaration:** ~1176.

**Callers:** UI/application code (direct calls exist around ~4646 and a source-location occurrence near the end of the file).

**Responsibilities:** network fetch, `CURRENT_11E_DATA_SOURCES`, parser invocation, `window.__BS_OBJECT_MAP`, `window.SUPPLEMENTAL_UNIT_DATABASE`, `state.bsDataCrossCheckUpdatedAt`, `save()`, `render()`, and user alerts.

**Assessment:** DO NOT move into the parser module. It is an application data-refresh/orchestration function and belongs outside the pure parser boundary.

## Dependency graph

```text
refreshCurrentUnitDatabase()
  ├── CURRENT_11E_DATA_SOURCES
  ├── fetch()
  ├── collectBSDataObjects(root)
  │     └── local walk()
  ├── window.__BS_OBJECT_MAP = map
  ├── bsUnitFromEntry(entry, faction)
  │     ├── bsProfile()
  │     ├── bsCharacteristics()
  │     ├── bsWeapons(entry, objectMap)
  │     │     ├── bsCharacteristics()
  │     │     └── normalize11eWeaponAbilities()
  │     ├── bsAbilities(entry, objectMap)
  │     └── bsWargearOptions()
  ├── window.SUPPLEMENTAL_UNIT_DATABASE
  ├── state.bsDataCrossCheckUpdatedAt
  ├── save()
  └── render()
```

## Hidden-global remediation

The current code writes `window.__BS_OBJECT_MAP` before parsing and reads it from `bsWeapons()` and `bsAbilities()`.

The extracted module should instead use an explicit parser context, e.g. conceptually:

```text
parserContext = {
  objectMap
}
```

The internal functions may then receive `objectMap` directly or a context object. This removes the parser's dependence on a mutable browser global without changing the external behavior.

`refreshCurrentUnitDatabase()` can continue to own the source-data fetch and create the object map, then pass it to the parser.

## Public interface decision

The initial contract remains:

```text
collectBSDataObjects(source)
bsUnitFromEntry(entry, context)
```

but `context` must explicitly carry the linked-object map required by `bsWeapons()` and `bsAbilities()`.

No helper needs to become public solely because it exists in the current monolith.

## Initialization-order audit

The parser functions themselves do not depend on earlier mutable application initialization. Their dependencies are:

- JavaScript built-ins (`Map`, `Set`, `Array`, `String`, etc.);
- parser-local helper functions;
- the explicitly supplied entry/faction/context data;
- current browser `window.__BS_OBJECT_MAP` only in the two functions identified above.

The last item is the only initialization-order/global issue found in this parser family.

`refreshCurrentUnitDatabase()` does depend on application initialization and must remain outside the parser.

## Data-shape preservation requirements

`bsUnitFromEntry()` currently returns:

- `id`
- `name`
- `faction`
- `points`
- `models`
- `wounds`
- `profile`
- `keywords`
- `abilities`
- `weapons`
- `weaponOptions`
- `dataSource`
- `dataVersion`
- `sourceRole`

The first extraction must preserve this shape and values for the same inputs.

## Readiness assessment

| Requirement | Status |
|---|---|
| Direct callers identified | PASS |
| Direct callees identified | PASS |
| Non-local identifiers identified | PASS for audited parser family |
| State dependencies | NONE in parser family |
| DOM dependencies | NONE in parser family |
| Persistence/cloud dependencies | NONE in parser family |
| Combat/Tactical Advisor dependencies | NONE in parser family |
| Hidden global dependency | IDENTIFIED: `window.__BS_OBJECT_MAP` |
| Hidden dependency can be made explicit | YES |
| Canonical database ownership unchanged | YES |
| Application orchestration separated | YES |
| Baseline outputs captured | NOT YET |
| Module loading strategy selected | NOT YET |
| Pre-extraction checkpoint created | NOT YET |

## Decision

**The BSData parser boundary is technically viable and sufficiently understood to proceed to baseline capture.**

Do not create `bsdata-parser.js` yet.

The next step is to capture representative outputs from the current monolith and establish the pre-extraction checkpoint. Then the parser can be extracted as one isolated architectural commit.
