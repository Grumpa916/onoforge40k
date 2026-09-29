# OnoForge 40K — BSData Pre-Extraction Save Point

**Date:** 2026-09-29
**Branch:** `feature/opponent-turn-history`
**Checkpoint commit:** `492d4b6803b1c837501856ef1d454029f3cd29b9`
**Application baseline:** `index.html` blob `4941fcffc41072fd9f60dcf870a0227b4437b74c`

## Purpose

Cross-chat-safe checkpoint immediately before the first proposed JavaScript extraction. This checkpoint contains documentation and mapping only; application runtime code has not been extracted or behaviorally changed.

## Completed

- Complete `index.html` inventory.
- Architecture map.
- Dependency map.
- Low-level caller/callee mapping.
- BSData interface contract.
- BSData dependency audit.
- Correction of the hidden `window.__BS_OBJECT_MAP` dependency into an explicit parser-context requirement.
- Separation of `refreshCurrentUnitDatabase()` from the parser boundary.
- Identification of the complete unit-parser helper family.

## Current proposed module

```text
js/data/bsdata-parser.js
```

Initial public API:

```text
collectBSDataObjects(source)
bsUnitFromEntry(entry, context)
```

Private helper family unless external callers require compatibility:

```text
bsProfile
bsCharacteristics
bsWeapons
bsAbilities
bsWargearOptions
normalize11eWeaponAbilities
```

## Important dependency correction

`bsWeapons()` / `bsAbilities()` currently rely on `window.__BS_OBJECT_MAP`. The extracted parser must receive the object map explicitly through parser context rather than retain this hidden global dependency.

`refreshCurrentUnitDatabase()` remains outside the parser because it owns application-level loading/refresh behavior.

## Baseline status

The authoritative source baseline is captured by Git blob SHA `4941fcffc41072fd9f60dcf870a0227b4437b74c` and the exact uploaded source used for analysis was verified against that SHA.

A runtime serialized fixture baseline has **not** been generated yet because the available environment does not provide a browser/runtime execution harness for the full monolithic application. We therefore do not claim runtime fixture equivalence at this checkpoint.

Before extraction, the next safe task is to create a minimal parser harness that loads the existing parser functions against representative embedded/BSData objects and records serialized outputs. That harness must be test-only and must not alter `index.html` behavior.

## No-code-change guarantee

At this checkpoint:

- no parser code has been extracted;
- no combat code has been changed;
- no state/event semantics have been changed;
- no Tactical Advisor code has been changed;
- no data definitions have been corrected;
- no rendering behavior has been changed.

## Next steps

1. Build a test-only baseline harness around the existing parser family.
2. Capture representative serialized outputs.
3. Record those fixtures in the repository.
4. Implement `js/data/bsdata-parser.js` in one isolated extraction commit.
5. Update the application loader/import path without changing parser semantics.
6. Compare extracted outputs to the baseline fixtures.
7. Run application startup and roster/battle smoke tests.
8. If validation fails, revert the extraction commit and update the dependency map rather than changing gameplay logic.
