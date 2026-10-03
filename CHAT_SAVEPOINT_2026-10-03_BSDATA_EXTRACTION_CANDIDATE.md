# OnoForge 40K — BSData Extraction Candidate Checkpoint

**Date:** 2026-10-03
**Working candidate branch:** `refactor/bsdata-extraction-candidate`
**Target development branch:** `feature/opponent-turn-history`
**Status:** First BSData monolith extraction completed on candidate branch; pending application-level smoke test and review before merge.

## Source verification

The exact source supplied for this extraction was verified as:

- `index.html`
- size: 1,067,876 bytes before extraction
- Git blob SHA: `4941fcffc41072fd9f60dcf870a0227b4437b74c`

The candidate extracted `index.html` blob is:

`3b00ee0fe2ee21654da8a7bea125c0a05f826687`

## Extraction scope

Removed from `index.html`:

1. `collectBSDataObjects`
2. `bsProfile`
3. `bsCharacteristics`
4. `normalize11eWeaponAbilities`
5. `bsAbilities`
6. `bsWeapons`
7. `bsWargearOptions`
8. `bsUnitFromEntry`

Added the parser script load:

`js/data/bsdata-parser.js`

Rewired application calls to:

- `window.OnoForgeBSDataParser.collectBSDataObjects(root)`
- `window.OnoForgeBSDataParser.bsUnitFromEntry(entry,faction,{objectMap:map})`

Removed the now-unused `window.__BS_OBJECT_MAP=map` assignment.

## Verification completed

The extraction workflow verified:

- extracted parser module loads;
- seven deterministic BSData baseline cases pass;
- old parser definitions are absent from `index.html`;
- parser module loader is present;
- hidden object-map assignment is absent;
- inline application JavaScript syntax parses;
- generated diff passes Git diff hygiene checks.

The GitHub Actions extraction job completed successfully.

## Regression cases

- normal unit — PASS
- multiple profiles — PASS
- multiple weapons — PASS
- weapon abilities — PASS
- missing/optional characteristics — PASS
- wargear/options — PASS
- linked/object-map edge case — PASS

## Candidate PR

Pull request: `#3`

Base: `feature/opponent-turn-history`

Head: `refactor/bsdata-extraction-candidate`

The PR remains **draft** intentionally. It must not be merged until application-level smoke testing is completed.

## Protected branch state

`feature/opponent-turn-history` has not received the extracted `index.html` from this candidate.

`main` has not been modified.

## Next gate

1. Inspect the candidate application in a real browser/runtime.
2. Verify BSData refresh behavior and unit import behavior.
3. Verify no unrelated application initialization/regression is present.
4. Review the PR diff.
5. If smoke testing passes, merge the candidate into `feature/opponent-turn-history` using the repository's branch strategy.
6. Create a post-merge save point.
