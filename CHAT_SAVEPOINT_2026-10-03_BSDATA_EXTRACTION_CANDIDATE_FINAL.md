# OnoForge 40K — BSData Extraction Candidate Final Checkpoint

**Date:** 2026-10-03
**Candidate branch:** `refactor/bsdata-extraction-candidate`
**Target branch:** `feature/opponent-turn-history`
**PR:** `#3` — Candidate: extract BSData parser from index.html
**Status:** Extraction complete and statically/regression validated; browser/application smoke test remains the final merge gate.

## Exact source

Pre-extraction source supplied and verified:

- `index.html`
- 1,067,876 bytes
- Git blob: `4941fcffc41072fd9f60dcf870a0227b4437b74c`

Candidate extracted `index.html`:

- Git blob: `3b00ee0fe2ee21654da8a7bea125c0a05f826687`

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

The dedicated extraction workflow completed successfully with:

- seven BSData baseline cases passing;
- extracted parser module loading;
- old parser definitions absent from `index.html`;
- parser module loader present;
- hidden object-map assignment absent;
- inline application JavaScript syntax valid;
- diff hygiene valid.

The existing Opponent Turn Event Capture Preview validation also passed on the extracted candidate, including:

- opponent-turn event tests;
- resolver render bridge regression;
- bidirectional combat edge-case regression;
- architecture audit;
- inline `index.html` syntax validation;
- preview artifact construction.

## CI audit correction

The first Tactical Advisor Preview Validation run failed at a pre-existing audit assertion because that audit expected the BSData `Range -> rng` normalization code to remain inside `index.html`.

That expectation is no longer correct after the intentional extraction.

The candidate branch now updates the Tactical Advisor audit to inspect `js/data/bsdata-parser.js` for the normalization marker and updates the downloadable preview to bundle the extracted parser module.

The original Tactical Advisor test file was restored byte-for-byte; no gameplay/test logic was changed.

The corrected audit has been locally verified against the extracted parser. A fresh green GitHub run is still desirable before merge.

## Protected branches

- `feature/opponent-turn-history`: **not merged yet**
- `main`: **unchanged**

## Merge gate

Do not merge PR #3 until:

1. corrected CI validation is green where applicable;
2. a real browser/application smoke test is completed;
3. BSData refresh/import behavior is manually verified;
4. no unrelated gameplay/UI regression is observed;
5. the PR diff is reviewed as the intended first monolith extraction only.

## Next chat continuation

Resume from this file and PR #3. Treat `feature/opponent-turn-history` as the development source and `main` as the stable/reference branch. Do not start another extraction until this candidate has either passed the smoke-test gate and been merged, or been explicitly rejected and rolled back.
