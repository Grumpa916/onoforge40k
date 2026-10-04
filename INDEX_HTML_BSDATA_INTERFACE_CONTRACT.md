# OnoForge 40K — BSData Parser Interface Contract

**Status:** Contract only — no application-code extraction
**Branch:** `feature/opponent-turn-history`
**Source baseline:** `index.html` blob `4941fcffc41072fd9f60dcf870a0227b4437b74c`
**Purpose:** Define the boundary for a future BSData parser extraction without changing runtime behavior.

## 1. Scope

This contract covers the BSData/catalogue parsing and normalization family currently embedded in `index.html`.

It includes the conceptual pipeline:

```text
raw BSData / catalogue objects
        ↓
collectBSDataObjects()
        ↓
entry/profile/characteristic traversal
        ↓
bsUnitFromEntry()
   ├── bsProfile()
   ├── bsCharacteristics()
   └── bsWeapons()
          └── normalize11eWeaponAbilities()
        ↓
canonical unit representation
        ↓
application database consumers
```

It does **not** own:

- battle state;
- roster state mutation;
- combat resolution;
- Tactical Advisor decisions;
- rendering;
- persistence;
- cloud synchronization;
- user interaction.

## 2. Design objective

The future module must convert external/embedded BSData representations into the application's existing canonical data shape **without changing the meaning, precedence, or availability of data**.

The first extraction is an architectural move, not a data-model redesign.

## 3. Proposed module

Target location:

```text
js/data/bsdata-parser.js
```

The initial module should expose a small public API. Internal traversal helpers should remain private unless an existing external caller requires them.

### Proposed public API

```js
collectBSDataObjects(source)
bsUnitFromEntry(entry, context)
```

Additional public functions should be added only when a real caller outside the parser boundary requires them.

The following are candidates to remain private implementation helpers:

```text
bsProfile
bsCharacteristics
bsWeapons
normalize11eWeaponAbilities
```

If existing code directly calls one of these helpers, the extraction must preserve that compatibility temporarily or migrate the caller explicitly.

## 4. Inputs

The parser may consume:

- BSData catalogue objects;
- embedded/bootstrap catalogue objects;
- entry/profile/characteristic structures;
- weapon and wargear profile data;
- parser context needed to resolve local references.

Inputs must be passed explicitly wherever practical.

The parser must not silently read battle state, selected UI state, or unrelated global application state.

## 5. Outputs

The parser produces the same canonical data structures currently expected by OnoForge's runtime database.

The extraction must preserve:

- unit identity;
- unit names;
- characteristics/stat profiles;
- weapons;
- weapon characteristics;
- abilities/rules text;
- wargear/options where represented by the parser;
- profile/reference relationships;
- BSData-derived metadata required by current consumers.

No output field should be renamed or reinterpreted during the first extraction unless a compatibility shim is added and validated.

## 6. Canonical database rule

The parser must **not create a competing canonical database**.

Current architecture distinguishes canonical runtime data from embedded/bootstrap data. The extracted parser is responsible for parsing/normalizing source material; ownership of the canonical runtime database remains with the existing data layer until that layer is separately mapped.

Conceptually:

```text
source data
   ↓
BSData parser
   ↓
normalized records
   ↓
existing canonical database ownership
```

## 7. Function contracts

### `collectBSDataObjects(source)`

**Role:** Traverse BSData/catalogue material and collect the source objects needed by downstream normalization.

**Reads:** supplied `source` and its nested BSData structures.

**Writes:** should not mutate battle state or roster state.

**Returns:** the same collection/shape currently expected by the downstream parser.

**Side effects:** none intended.

**Extraction requirement:** source data must be passed explicitly rather than obtained through unrelated globals.

### `bsProfile(...)`

**Role:** Extract a BSData profile/characteristic group from a source entry.

**Reads:** supplied profile/entry structures.

**Writes:** none intended.

**Returns:** existing profile representation expected by callers.

**Side effects:** none intended.

### `bsCharacteristics(...)`

**Role:** Extract/normalize characteristics from a BSData profile.

**Reads:** supplied characteristic structures.

**Writes:** none intended.

**Returns:** existing characteristic representation.

**Side effects:** none intended.

### `normalize11eWeaponAbilities(...)`

**Role:** Normalize 11th-edition weapon ability text/representation into the application's expected form.

**Reads:** supplied weapon ability information.

**Writes:** none intended.

**Returns:** normalized ability representation.

**Side effects:** none intended.

### `bsWeapons(...)`

**Role:** Convert weapon profile information into the canonical weapon representation used by the application.

**Reads:** supplied weapon/profile/characteristic structures.

**Calls:** characteristic and ability normalization helpers as required.

**Writes:** none outside its returned representation.

**Returns:** normalized weapon collection.

### `bsUnitFromEntry(...)`

**Role:** Assemble a unit-level canonical representation from a BSData entry.

**Reads:** supplied entry and parsing context.

**Calls:** profile, characteristic, weapon, and ability parsing helpers.

**Writes:** none outside returned unit representation.

**Returns:** normalized unit record compatible with the current runtime data layer.

## 8. Dependency boundary

The parser may depend on:

```text
BSData input structures
parser constants/helpers
normalization rules
```

The parser must not depend directly on:

```text
state
render()
event()
undoLastAction()
localStorage
Supabase/cloud APIs
battle state
Tactical Advisor state
combat resolver state
DOM elements
```

If a current implementation does depend on one of these, that dependency must be identified and either passed explicitly or retained behind a documented compatibility adapter before extraction.

## 9. Declaration-order / initialization requirements

Because the current implementation lives in one script, some references may rely on declarations appearing earlier in the monolith.

Before extraction, identify every non-local identifier referenced by the parser functions and classify it as:

1. function dependency;
2. constant/data dependency;
3. runtime global;
4. initialization-order dependency;
5. browser API;
6. application-state dependency.

Only categories 1–2 should normally remain implicit inside the extracted module. Categories 3–6 require explicit review.

## 10. Error behavior

The first extraction must preserve existing error behavior.

Do not introduce broad silent fallbacks merely to make the module independent.

Malformed or unsupported BSData should continue to produce the same observable behavior unless a separate bug-fix change is intentionally scoped and tested.

## 11. Compatibility requirements

The extraction must preserve:

- existing function results for representative catalogue entries;
- unit/weapon/ability names and values;
- missing-field behavior;
- optional-field behavior;
- ordering where consumers depend on it;
- canonical database precedence rules;
- bootstrap versus runtime data semantics.

## 12. Validation plan

Before extraction, capture representative parser outputs from the current monolith for:

- a normal unit;
- a unit with multiple profiles;
- a unit with multiple weapons;
- a weapon with several abilities;
- missing/optional characteristics;
- wargear/options where applicable;
- at least one BSData edge case already represented in the current catalogue.

After extraction, compare the module output with the baseline.

Then perform an application smoke test covering:

1. application startup;
2. data loading;
3. army/unit search;
4. adding a unit to a roster;
5. opening the battle workflow;
6. a previously validated combat path.

The combat test is a regression guard, not because the parser owns combat, but because data shape changes can propagate into combat calculations.

## 13. Rollback strategy

The extraction must be one isolated commit with no gameplay behavior changes.

If validation fails:

```text
revert extraction commit
↓
return to known-good monolith
↓
inspect dependency mismatch
↓
update contract/map
↓
retry
```

Do not repair a failed extraction by simultaneously changing combat logic, state semantics, or data definitions.

## 14. Extraction readiness checklist

The module is **not ready to extract** until all are checked:

- [ ] Every direct caller identified.
- [ ] Every direct callee identified.
- [ ] Every non-local identifier identified.
- [ ] All state dependencies eliminated or explicitly contracted.
- [ ] No DOM dependency remains.
- [ ] No persistence/cloud dependency remains.
- [ ] Canonical database ownership remains unchanged.
- [ ] Representative baseline outputs captured.
- [ ] Import/loading mechanism selected.
- [ ] Existing application startup path can load the module.
- [ ] Automated/smoke validation plan ready.
- [ ] Pre-extraction checkpoint created.

## 15. Non-goals for first extraction

Do **not** combine the parser extraction with:

- data corrections;
- catalogue redesign;
- BSData schema redesign;
- combat-rule changes;
- Tactical Advisor changes;
- roster-state redesign;
- rendering changes;
- event-system changes.

Those can be separate future changes after the module boundary is proven.

## 16. Contract status

**Current status: DEFINED — NOT YET EXTRACTED.**

The next task is to perform the final direct-caller and non-local-dependency audit against the verified `index.html`, then create a pre-extraction checkpoint. Only after that should `bsdata-parser.js` be created.
