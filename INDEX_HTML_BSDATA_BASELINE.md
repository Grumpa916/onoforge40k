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

## Baseline fixtures captured

The seven deterministic serialized outputs are now stored under:

`tests/fixtures/bsdata-baseline/`

Cases:

1. `normal_unit.json` — standard unit profile.
2. `multiple_profiles.json` — Unit profile plus unrelated profile types and an ability profile.
3. `multiple_weapons.json` — multiple ranged/melee weapon profiles with keyword normalization.
4. `weapon_abilities.json` — multiple weapon abilities, including legacy `PISTOL` normalization to `CLOSE QUARTERS`.
5. `missing_optional_characteristics.json` — sparse Unit profile to preserve missing-field behavior.
6. `wargear_options.json` — duplicate upgrade names to verify de-duplication/order.
7. `edge_case_linked_ability.json` — linked-entry traversal through the object map.

### Fixture provenance

These are **synthetic deterministic BSData-shaped inputs** designed to exercise the parser behavior documented in the contract. They are not claims that these exact synthetic units occur in the live BSData catalogue.

The linked-entry edge case is based on the current parser's supported `entryLinks`/object-map behavior. A future live-catalogue fixture may be added if an actual downloaded BSData source is available in the repository/test environment.

The fixtures were generated against the verified monolith source before extraction. They compare normalized parser output, not object identity or UI rendering.

## Verification harness

`tools/verify-bsdata-baseline.js` regenerates the seven cases through the isolated adapter and compares the resulting serialized objects to the committed fixtures.

The adapter isolates only the parser functions from `index.html`; it does not execute the OnoForge application bootstrap.

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
- [x] Seven deterministic serialized baseline fixtures captured.
- [x] Baseline verification harness created.
- [ ] Pre-extraction known-good commit recorded.
- [ ] Module loading strategy selected.
- [ ] Extraction performed as an isolated commit.
- [ ] Post-extraction fixture comparison passes.
- [ ] Application smoke test passes.

## Current status

**BASELINE CAPTURE COMPLETE. READY FOR PRE-EXTRACTION CHECKPOINT AND MODULE-LOADING DECISION.**
