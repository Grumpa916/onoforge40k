# OnoForge 40K — Development Guide

## Canonical project

- Repository: `Grumpa916/onoforge40k`
- Branch: `main`
- Live app: GitHub Pages
- Repository identity guardrail: `REPOSITORY_IDENTITY.md`
- Architecture map: `ARCHITECTURE_MAP.md`
- Feature roadmap: `ROADMAP.md`

Do not use `Grumpa916/ono40k` as the source of truth.

## Current baseline

The current main branch includes the live-tested physical shooting workflow and the model-ID mapping fix.

Baseline reference before architecture work:
`0603fb8de11ba5e83c0fb0ac7c9fd585fbb11cbc`

The current branch may advance with documentation-only commits after that baseline. Treat the latest green deployment on `main` as operational state.

## Recently verified live workflow

Live test completed:

`Shooting → Exocrine → Lieutenant → 15" → LOS Yes → Bio-plasmic Cannon`

Verified path:

`Pre-Roll → physical dice entry → hits → wounds → saves → resolution review → damage → casualty → action log → repeat-action prevention`

The test exposed and fixed a model identity mismatch between persistent model-roster IDs and generic combat-snapshot IDs.

## Where to start when making a future change

1. Read `ARCHITECTURE_MAP.md`.
2. Read the relevant section of `ROADMAP.md`.
3. Inspect the smallest affected subsystem in `index.html`.
4. Check the existing audit(s) under `scripts/`.
5. Make the smallest change that preserves existing state and event contracts.
6. Run the relevant audit(s) locally when possible.
7. Let GitHub Actions remain the final integration/deployment gate.
8. Re-test the live workflow when the change affects tournament/gameplay behavior.

## Current monolith facts

`index.html` currently contains:

- the page shell and UI
- global application state
- persistence
- event history / undo
- Army Builder
- Deployment / reserves / battlefield map
- Objectives / primary and secondary missions
- Tactical Advisor
- combat eligibility and combat engine
- physical-dice resolution
- tournament operations and timer

The file is approximately 1 MB and contains one large inline JavaScript block.

## Current supporting modules

These root-level JavaScript files are diagnostic/checkpoint scaffolding:

- `battleCheckpoint.js`
- `battleCheckpointAdapter.js`
- `battleCheckpointMapper.js`
- `battleStateInspector.js`
- `checkpointIntegrationPlan.js`
- `checkpointLoader.js`

They currently expose diagnostic functions through `window.OnoForgeDebug` and are not imported by `index.html`.

## Current QA / deployment flow

The active deployment workflow is:

`.github/workflows/deploy.yml`

It performs repository audits, syntax validation, runtime symbol validation, build preparation, and GitHub Pages deployment.

Avoid adding post-build hotfix workflows for application code. Source-of-truth application changes should live in the repository itself.

## Safe refactoring direction

The planned architecture migration is incremental:

1. Shared contracts and identity helpers
2. Deployment / reserves / battlefield map
3. Combat and physical-dice resolution
4. Missions / objectives / scoring
5. Tactical Advisor
6. UI shell

Do not perform a large rewrite of `index.html`.

### Non-negotiable boundaries

- Deployment plans are reference/planning state.
- Live battlefield positions are authoritative live state.
- Physical dice are authoritative for real-game resolution.
- Mathhammer simulation must remain separate from physical-dice resolution.
- Tactical Advisor recommendations remain read-only with respect to authoritative outcomes.
- Model/unit/weapon identity must remain stable across Deployment → Live Map → Movement → Shooting → Damage → Casualties.

## Development note

A future chat or developer should be able to start from this file plus `ARCHITECTURE_MAP.md` and understand where to continue without relying on conversation history.
