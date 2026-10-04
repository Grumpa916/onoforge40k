# CHAT SAVEPOINT — 2026-10-04 — BSData EXTRACTION MERGED + POST-MERGE RUNTIME REPAIRS

## Authoritative project state

- Repository: `Grumpa916/onoforge40k`
- Active development branch: `feature/opponent-turn-history`
- Current HEAD: `e37c13a2ba5501ef1a47f722de6e7ad145e07d7d`
- Current HEAD commit: `Restore catalogue-aware opponent weapon selection`
- BSData parser extraction merge commit: `10757225ea6fcaa1be5ba0b3d3c50cc9dd91fc8b`
- PR #6: merged into `feature/opponent-turn-history`
- Do not treat the older BSData extraction savepoint as current for merge/CI status; it is historical.

## What is now landed

PR #6 extracted the first BSData parser boundary from `index.html` into:

`js/data/bsdata-parser.js`

The extracted functions are:

- `collectBSDataObjects`
- `bsProfile`
- `bsCharacteristics`
- `normalize11eWeaponAbilities`
- `bsAbilities`
- `bsWeapons`
- `bsWargearOptions`
- `bsUnitFromEntry`

The application bootstrap remains inline in `index.html`; the first extraction intentionally preserves browser-global compatibility.

## Post-merge work already on the active branch

Five commits were added after the PR #6 merge:

1. `a835c6b0` — Restore streamlined physical dice result entry
2. `69201e08` — Fix quick physical result controls flow
3. `7745ab5b` — Harden quick physical result eligibility for complex attacks
4. `497c65e7` — Fix quick physical result control JavaScript escaping
5. `e37c13a2` — Restore catalogue-aware opponent weapon selection

These changes are all in `index.html`. The active branch is five commits ahead of the PR #6 merge and zero commits behind it.

## Current CI verification

For current HEAD `e37c13a2ba5501ef1a47f722de6e7ad145e07d7d`, the following GitHub Actions runs completed successfully:

- Tactical Advisor Preview Validation — run #317
- Opponent Turn Event Capture Preview — run #331

Therefore the current branch has fresh successful CI after the post-merge runtime repairs.

## Branch safety

- `main`: `1081a8f1633dd105e4d66a7edb993534e4866cfa`
- `feature/opponent-turn-history`: `e37c13a2ba5501ef1a47f722de6e7ad145e07d7d`
- `feature/opponent-turn-history-clean-reset`: `044f047adf186a6525a8fe21acd4a98ca460d3f2`

Do not merge/rebase `feature/opponent-turn-history-clean-reset` into the active branch casually. Keep `main` untouched until the controlled verification/merge gate is explicitly reached.

## Browser verification status

The BSData extraction candidate previously passed browser smoke testing for:

- List Builder rendering
- existing list/army preservation
- BSData 11e cross-check
- unit search/add
- leader attachment
- leader configuration/save
- preservation of the attached leader
- explicit confirmation that verified runtime BSData was not overwritten

That browser test occurred before PR #6 was merged. The current HEAD also contains five later opponent-combat UI repairs, so a fresh browser smoke test against the current immutable HEAD is the next verification gate.

## Next controlled gate

1. Browser-test the current HEAD `e37c13a2ba5501ef1a47f722de6e7ad145e07d7d`.
2. Confirm the app loads and List Builder remains functional.
3. Confirm the current opponent-turn weapon-selection path is present.
4. Confirm the streamlined physical-dice result entry path works and complex attacks still use the appropriate full resolver path.
5. If the browser test passes, create the next development savepoint before beginning another monolith extraction.
6. Only after that gate should we select the next extraction boundary from `index.html`.

## Important constraints

- Do not ask the user to install or run Python locally.
- Do not replace verified runtime BSData merely to prove parser functionality.
- Do not start another monolith extraction before the current HEAD receives browser verification.
- Keep deployment/index extraction concerns separate unless a real dependency requires otherwise.
