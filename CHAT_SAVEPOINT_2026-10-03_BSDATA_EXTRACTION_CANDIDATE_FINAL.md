# OnoForge 40K — BSData Extraction Candidate Final Checkpoint

**Date:** 2026-10-03
**Candidate branch:** `refactor/bsdata-extraction-current-base`
**Target branch:** `feature/opponent-turn-history`
**PR:** `#4` — Candidate: extract BSData parser from current feature baseline
**Status:** Extraction has been reconciled against the current feature baseline and fresh CI validation is green; browser/application smoke test and final diff review remain before merge.

## Exact source

Pre-extraction source supplied and verified:

- `index.html`
- 1,067,876 bytes
- Git blob: `4941fcffc41072fd9f60dcf870a0227b4437b74c`

Original extracted candidate `index.html`:

- Git blob: `3b00ee0fe2ee21654da8a7bea125c0a05f826687`

Current-baseline reconciled `index.html` is carried on PR #4; the current branch blob is verified separately in the repository.

## Code extraction

The following eight parser functions are now external to `index.html`:

- `collectBSDataObjects`
- `bsProfile`
- `bsCharacteristics`
- `normalize11eWeaponAbilities`
- `bsAbilities`
- `bsWeapons`
- `bsWargearOptions`
- `bsUnitFromEntry`

Module:

`js/data/bsdata-parser.js`

The application now uses an explicit parser boundary and passes `{objectMap}` to the unit parser. The old `window.__BS_OBJECT_MAP=map` assignment was removed.

## Automated validation

The extraction baseline verification passes all seven deterministic cases.

The current PR's fresh Opponent Turn Event Capture Preview validation is green, including:

- opponent-turn event tests;
- resolver render bridge regression;
- bidirectional combat edge-case regression;
- architecture audit;
- inline `index.html` syntax validation;
- preview artifact construction and upload;
- extracted parser syntax validation.

The current PR's fresh Tactical Advisor Preview Validation is also green, including the extracted-parser normalization audit and downloadable preview construction.

## CI audit correction

The first Tactical Advisor Preview Validation run failed at a pre-existing audit assertion because that audit expected the BSData `Range -> rng` normalization code to remain inside `index.html`.

That expectation is no longer correct after the intentional extraction.

The candidate now updates the Tactical Advisor audit to inspect `js/data/bsdata-parser.js` for the normalization marker and bundles the extracted parser in the downloadable Tactical Advisor preview and the Opponent Turn preview.

The original Tactical Advisor test file was restored without gameplay/test changes.

## Current-baseline reconciliation

PR #3 was closed because it was based on stale pre-current-baseline history. PR #4 starts from the current `feature/opponent-turn-history` baseline.

The extraction was applied as a three-way patch using merge-base `009056353d3ff3ffebee2afb7ede1a552cc27902`, the current feature branch as the baseline, and the controlled extraction candidate as the source of the parser-removal hunks. The reconciled `index.html` preserves the current feature branch changes while applying the extraction.

The temporary reconciliation automation has been removed from the candidate branch after successful reconciliation. The final PR contains only the intended extraction changes and supporting validation/savepoint updates.

## Protected branches

- `feature/opponent-turn-history`: **not merged**
- `main`: **unchanged**

## Merge gate

Do not merge PR #4 until:

1. fresh CI validation remains green;
2. a real browser/application smoke test is completed against the current reconciled candidate;
3. BSData refresh/import behavior is manually verified;
4. no unrelated gameplay/UI regression is observed;
5. the PR diff is reviewed as the intended first monolith extraction only.

## Next chat continuation

Resume from this file and PR #4. Treat `feature/opponent-turn-history` as the development source and `main` as the stable/reference branch. The candidate remains isolated until the smoke-test and final-review gates are explicitly cleared.
