# OnoForge 40K — BSData Pre-Extraction / Extraction-Ready Save Point

**Date:** 2026-09-29
**Branch:** `feature/opponent-turn-history`
**Application baseline:** `index.html` blob `4941fcffc41072fd9f60dcf870a0227b4437b74c`

## Purpose

Cross-chat-safe checkpoint immediately before replacing the BSData parser in the monolith with the isolated parser module. Documentation, harness tooling, baseline fixtures, and the new parser module are present. The committed `index.html` has **not yet been replaced** by the extracted version.

## Completed mapping

- Complete `index.html` inventory.
- Architecture map.
- Dependency map.
- Low-level caller/callee mapping.
- BSData interface contract.
- BSData dependency audit.
- Hidden `window.__BS_OBJECT_MAP` dependency identified and converted to explicit parser-context design.
- `refreshCurrentUnitDatabase()` separated from parser ownership.
- Complete unit-parser helper family identified.

## Test tooling and baseline cases

- `tools/bsdata-baseline-harness.js`
- `tools/bsdata-baseline-adapter.js`
- `tools/verify-bsdata-baseline.js`
- `tools/verify-bsdata-extraction.js`
- `tools/extract-bsdata-parser.js`
- `tests/fixtures/bsdata-baseline/`

Seven deterministic parser-behavior cases are recorded:

1. normal unit
2. multiple profiles
3. multiple weapons
4. weapon abilities
5. missing/optional characteristics
6. wargear/options
7. linked/object-map edge case

The pre-extraction verifier was run against the exact downloaded `index.html`: **7/7 cases pass**.

The candidate extracted module was also executed in isolation against the same seven fixtures: **7/7 cases pass**.

## Current parser module

```text
js/data/bsdata-parser.js
```

Public browser-global API:

```text
window.OnoForgeBSDataParser.collectBSDataObjects(source)
window.OnoForgeBSDataParser.bsUnitFromEntry(entry, faction, context)
```

The helper family remains private to the module.

## Corrected dependency boundary

The old parser uses `window.__BS_OBJECT_MAP` inside weapon/ability traversal. The extracted implementation accepts `{ objectMap }` explicitly through parser context.

Conceptually:

```text
refreshCurrentUnitDatabase()
    -> collect BSData objects
    -> construct parser context { objectMap, ... }
    -> bsUnitFromEntry(entry, faction, context)
         -> bsWeapons(..., context)
         -> bsAbilities(..., context)
```

## Loading strategy

Use an explicit browser script boundary for this first extraction. Do not convert the entire application to ES modules in the same change.

The deterministic extraction tool:

`tools/extract-bsdata-parser.js`

removes the eight parser declarations from `index.html`, loads `js/data/bsdata-parser.js` before the inline application script, and rewires the two application call sites to use the explicit parser/context API.

## Extraction gate

- [x] architecture map
- [x] dependency map
- [x] parser contract
- [x] dependency audit
- [x] object-map correction
- [x] baseline harness
- [x] seven baseline cases
- [x] loading strategy selected
- [x] pre-extraction verifier: 7/7
- [x] candidate extracted module: 7/7
- [ ] replace committed `index.html` with deterministic extracted output
- [ ] run post-extraction verifier against committed branch
- [ ] run application startup/smoke tests
- [ ] record extraction commit and next save point

## Non-negotiable protections

The extraction must not modify:

- combat resolver
- canonical combat state mutation
- event system
- Action Log / Combat History
- undo/persistence semantics
- Tactical Advisor
- scoring behavior
- roster mutation semantics

## Current status

**EXTRACTION-READY.** The parser module and deterministic extraction path are prepared and the seven behavioral fixtures pass before and after the isolated parser transformation. The remaining operation is replacing the 1 MB monolith with the generated extracted version, followed immediately by branch-level verification.
