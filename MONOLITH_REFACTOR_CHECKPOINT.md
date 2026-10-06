# OnoForge 40K — Monolith Refactor Checkpoint

## Current workstream

The recent field-test/UI/combat adjustments are intentionally parked. They remain preserved on:

- `feature/opponent-turn-history-clean-reset`
- latest verified live-test fixes include `d78ea5f4262e7a5a9738d8239c07a75527cb0f1a` (live distance no longer depends on terrain verification)
- `2938d4f15cef446daa0cad6d9f044517f23c048f` and `c6c3eb5fc73b8f0b01011b889b460545b2353351` (actual damage becomes the normal combat-history input; detailed dice remains optional)

Do not alter those commits as part of this refactor work.

## Active refactor branch

`refactor/clean-reset-monolith`

Base:

`d78ea5f4262e7a5a9738d8239c07a75527cb0f1a`

Purpose: reduce the `index.html` monolith through small, reversible, behavior-preserving extractions.

## Proven extraction

A BSData parser extraction was previously completed and browser-tested on the separate `feature/opponent-turn-history` development line.

Extracted module:

`js/data/bsdata-parser.js`

Functions extracted:

- collectBSDataObjects
- bsProfile
- bsCharacteristics
- normalize11eWeaponAbilities
- bsAbilities
- bsWeapons
- bsWargearOptions
- bsUnitFromEntry

That work reduced the corresponding `index.html` content by 148 lines and established the first successful extraction pattern.

The clean-reset branch does not currently contain that module. Do not merge the old development branch wholesale; selectively reproduce the proven extraction against the current source after exact source capture.

## Current monolith problem

Current `index.html` blob:

`a6c30914e23f47fb36247e34d18d4eb8965c419f`

The GitHub connector can resolve the file and blob SHA but cannot currently return its ~1 MB content through the file interface. This is an infrastructure/source-access constraint, not evidence that the file is missing.

Therefore:

- do not reconstruct large functions from memory;
- do not hand-copy code without exact source;
- do not begin a broad rewrite;
- use the smallest exact-source extraction available.

## Refactor sequence

1. Obtain exact current source for the target extraction.
2. Identify callers, state dependencies, DOM/global dependencies, and side effects.
3. Capture focused regression tests before moving code.
4. Extract into a dedicated module.
5. Keep compatibility wrappers where necessary.
6. Run GitHub Actions.
7. Browser-smoke-test the affected subsystem when a real preview is available.
8. Review the diff.
9. Only then select the next extraction.

## Preferred extraction order

Low-risk first:

1. pure data/normalization utilities
2. pure geometry utilities
3. isolated formatting/helpers
4. other functions with explicit inputs/outputs

Do not use these as early extraction targets:

- model identity
- casualty state
- live battlefield state
- combat resolution
- physical dice resolver
- scoring
- render()
- broad event handlers
- Tactical Advisor internals

## Preview infrastructure

The old `htmlpreview.github.io` route is no longer considered a reliable feature-branch preview mechanism.

The eventual preview should use a real GitHub Pages/Actions deployment architecture rather than a third-party HTML wrapper. GitHub supports custom Pages workflows using `configure-pages`, `upload-pages-artifact`, and `deploy-pages`.

For now, preview infrastructure and application refactoring remain separate work items.

## Success criterion

The goal is not merely a smaller file. The goal is a smaller file with:

- unchanged gameplay behavior;
- explicit module boundaries;
- reproducible tests;
- reversible commits;
- preserved data/state contracts;
- a clear path to a maintainable application structure.
