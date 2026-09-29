# OnoForge 40K — BSData Parser Baseline

**Status:** Baseline/correction record — no application-code extraction
**Branch:** `feature/opponent-turn-history`
**Source baseline:** `index.html` blob `4941fcffc41072fd9f60dcf870a0227b4437b74c`
**Contract:** `INDEX_HTML_BSDATA_INTERFACE_CONTRACT.md`
**Dependency audit:** `INDEX_HTML_BSDATA_DEPENDENCY_AUDIT.md`

## Purpose

Record the pre-extraction behavior and the corrections to the proposed BSData parser boundary before any runtime code is moved out of `index.html`.

## Verified corrections to the contract

### 1. Explicit object-map dependency

The current parser implementation uses `window.__BS_OBJECT_MAP` inside the weapon/ability path. This is an implicit dependency created by the existing monolith's initialization flow.

The extracted parser must not retain this hidden global as its normal interface.

Instead, the object map becomes explicit parser context:

```text
refreshCurrentUnitDatabase()
    -> collect BSData objects
    -> construct parser context { objectMap, ... }
    -> bsUnitFromEntry(entry, context)
         -> bsWeapons(..., context)
         -> bsAbilities(..., context)
```

### 2. Complete unit-parser helper family

The unit parser boundary includes these helper concepts:

- `bsProfile`
- `bsCharacteristics`
- `bsWeapons`
- `bsAbilities`
- `bsWargearOptions`
- `normalize11eWeaponAbilities`
- `bsUnitFromEntry`

The initial interface remains intentionally small. These helpers remain private unless a verified external caller requires them.

### 3. Application refresh remains outside the parser

`refreshCurrentUnitDatabase()` remains an application/data-layer operation. It owns fetching/loading, runtime database refresh, persistence/rendering behavior, and user-facing error handling.

It must not be moved into `js/data/bsdata-parser.js` during the first extraction.

## Baseline capture policy

The authoritative behavioral baseline will be captured as serialized parser outputs from the current monolith before extraction. The comparison set must include:

1. normal unit;
2. unit with multiple profiles;
3. unit with multiple weapons;
4. weapon with multiple abilities;
5. missing/optional characteristics;
6. wargear/options where represented;
7. at least one BSData edge case represented by the current catalogue.

The baseline must compare normalized data rather than incidental object identity or UI rendering details.

## Expected invariants

The first extraction must preserve:

- unit identity and names;
- characteristics/stat values;
- weapon names and characteristics;
- ability/rule text and normalized ability representation;
- wargear/options represented by the parser;
- profile/reference relationships;
- ordering where current consumers depend on it;
- missing-field behavior;
- canonical database precedence;
- bootstrap versus runtime source semantics.

## Non-goals

This baseline does not authorize changes to:

- BSData contents;
- catalogue correctness;
- runtime data-model semantics;
- combat rules;
- roster mutation;
- Tactical Advisor;
- event history;
- persistence;
- rendering.

## Extraction gate

Before creating `js/data/bsdata-parser.js`, all of the following must be true:

- [x] GitHub source verified against blob SHA.
- [x] Parser contract written.
- [x] Direct dependency audit completed.
- [x] Hidden `window.__BS_OBJECT_MAP` dependency identified.
- [x] Parser/application boundary corrected.
- [ ] Representative serialized baseline fixtures captured from the running monolith.
- [ ] Pre-extraction known-good commit recorded.
- [ ] Module loading strategy selected.
- [ ] Extraction performed as an isolated commit.
- [ ] Post-extraction fixture comparison passes.
- [ ] Application smoke test passes.

## Current status

**READY FOR BASELINE FIXTURE CAPTURE, NOT YET READY FOR CODE EXTRACTION.**

The next implementation step is to generate the representative baseline fixtures from the exact verified `index.html`. No gameplay code should be changed as part of that capture.
