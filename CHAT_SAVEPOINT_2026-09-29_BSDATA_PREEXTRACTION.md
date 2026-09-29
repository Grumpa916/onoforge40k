# OnoForge 40K — BSData Pre-Extraction Save Point

**Date:** 2026-09-29
**Branch:** `feature/opponent-turn-history`
**Checkpoint purpose:** Freeze the documented state immediately before the first JavaScript monolith extraction.
**Application baseline:** `index.html` blob `4941fcffc41072fd9f60dcf870a0227b4437b74c`

## Purpose

Cross-chat-safe checkpoint immediately before the first proposed JavaScript extraction. This checkpoint contains documentation, mapping, harness tooling, and baseline fixtures only; application runtime code has not been extracted or behaviorally changed.

## Completed mapping

- Complete `index.html` inventory.
- Architecture map.
- Dependency map.
- Low-level caller/callee mapping.
- BSData interface contract.
- BSData dependency audit.
- Correction of the hidden `window.__BS_OBJECT_MAP` dependency into an explicit parser-context requirement.
- Separation of `refreshCurrentUnitDatabase()` from the parser boundary.
- Identification of the complete unit-parser helper family.

## Test tooling and baseline cases

- `tools/bsdata-baseline-harness.js`
- `tools/bsdata-baseline-adapter.js`
- `tools/verify-bsdata-baseline.js`
- `tests/fixtures/bsdata-baseline/`

Seven deterministic parser-behavior cases are recorded:

1. normal unit
2. multiple profiles
3. multiple weapons
4. weapon abilities
5. missing/optional characteristics
6. wargear/options
7. linked/object-map edge case

These fixtures are synthetic BSData-shaped cases used to fingerprint parser behavior. They are not claims that the synthetic entries are current live catalogue records.

## Current proposed module

```text
js/data/bsdata-parser.js
```

Initial public API:

```text
collectBSDataObjects(source)
bsUnitFromEntry(entry, context)
```

Private helper family unless verified external callers require compatibility:

```text
bsProfile
bsCharacteristics
bsWeapons
bsAbilities
bsWargearOptions
normalize11eWeaponAbilities
```

## Corrected dependency boundary

`bsWeapons()` / `bsAbilities()` currently rely on `window.__BS_OBJECT_MAP`. The extracted parser must receive the object map explicitly through parser context rather than retain this hidden global dependency.

`refreshCurrentUnitDatabase()` remains outside the parser because it owns application-level loading/refresh behavior.

Conceptually:

```text
refreshCurrentUnitDatabase()
    -> collect BSData objects
    -> construct parser context { objectMap, ... }
    -> bsUnitFromEntry(entry, context)
         -> bsWeapons(..., context)
         -> bsAbilities(..., context)
```

## Loading strategy

Use an explicit browser script/module boundary rather than dynamically evaluating the monolith at runtime.

During the first extraction, preserve existing browser-global compatibility where required. Do not convert the entire application to ES modules in the same change.

The first extraction should be minimal:

1. create the parser module/file;
2. expose only the intended parser entry point(s);
3. load it before the application code that consumes it;
4. replace the old parser implementation with calls to the module;
5. leave unrelated application initialization untouched.

## Extraction gate

- [x] architecture map
- [x] dependency map
- [x] parser contract
- [x] dependency audit
- [x] object-map correction
- [x] baseline harness
- [x] seven baseline cases
- [x] loading strategy selected
- [ ] run baseline verifier against the exact branch state
- [ ] perform isolated parser extraction
- [ ] run post-extraction baseline comparison
- [ ] run application smoke test
- [ ] record extraction commit and next save point

## Non-negotiable protections

Do not modify in this extraction:

- combat resolver
- canonical combat state mutation
- event system
- Action Log / Combat History
- undo/persistence semantics
- Tactical Advisor
- scoring behavior
- roster mutation semantics

## Rollback

If the extraction causes unexpected behavior, revert the extraction commit and return to this checkpoint. Do not repair unrelated behavior in the same rollback/fix commit.

## Current status

**READY FOR FINAL BASELINE VERIFIER RUN, THEN FIRST ISOLATED PARSER EXTRACTION.**
