# OnoForge 40K — Development Guide

## Current controlled-reset execution overlay — 2026-10-02

This section is authoritative for the current development line and supersedes older branch/current-objective statements elsewhere in this historical guide.

- Repository: `Grumpa916/onoforge40k`
- Authoritative development branch: `feature/opponent-turn-history-clean-reset`
- Current state pointer: the newest `CHAT_SAVEPOINT_*.md` on that branch
- Known-good gameplay checkpoint: `132551b340bdff635eeb9b193470f2c1a8e46ccd`
- Preserved pre-reset history: `archive/deployment-redesign-2026-10-01` at `aee09c197b70af523bfad59d14d117fd79c8303c`
- Current development objective: continue the controlled deployment/map extraction, then establish a compatibility bridge between the extracted deployment subsystem and the existing monolithic application.

### Document precedence

For a new chat or development session, use this precedence order:

1. **Newest save point on the authoritative development branch** — current project state and immediate next step.
2. **This `DEVELOPMENT_GUIDE.md`** — development method and guardrails.
3. **`ARCHITECTURE_MAP.md`** — current structural model and extraction boundaries.
4. **`ROADMAP.md`** — product-level goals and feature tracks.
5. Older handoffs, save points, and historical task notes — reference only unless the newest save point explicitly revives them.

Do not create a competing project-plan document when an existing document can be updated.

### Controlled-reset development method

The current deployment refactor uses a protected-baseline / experimental-branch model:

1. Preserve the known-good checkpoint and archive branch.
2. Work directly on the authoritative clean-reset branch.
3. Prefer repository-native source changes over manual cross-device file transfer.
4. Larger bounded extraction batches are allowed when they reduce monolith coupling; they do not need to be artificially reduced to one function at a time.
5. Commit frequently enough to preserve recovery points.
6. Use meaningful save points at milestones rather than documenting every tiny change.
7. Validate the exact committed source before manual browser testing.
8. Do not claim a browser/deployment result without repository/tool evidence or the user's actual test result.

The goal is to protect the known-good baseline, not to make every intermediate experimental commit production-safe.

## Canonical project

- Repository: `Grumpa916/onoforge40k`
- Branch: `feature/opponent-turn-history-clean-reset` for current development
- Live app: GitHub Pages from `main`
- Repository identity guardrail: `REPOSITORY_IDENTITY.md`
- Architecture map: `ARCHITECTURE_MAP.md`
- Feature roadmap: `ROADMAP.md`

Do not use `Grumpa916/ono40k` as the source of truth.

## Current baseline

The current clean-reset line preserves the known-good gameplay checkpoint `132551b340bdff635eeb9b193470f2c1a8e46ccd` while deployment work proceeds on the clean-reset branch. Older references in this guide to `main`, `0603fb8de11ba5e83c0fb0ac7c9fd585fbb11cbc`, or earlier Charge/Fight continuation states are historical and do not override the current save point.

## Recently verified live workflow

The historical live test completed:

`Shooting → Exocrine → Lieutenant → 15" → LOS Yes → Bio-plasmic Cannon`

Verified path:

`Pre-Roll → physical dice entry → hits → wounds → saves → resolution review → damage → casualty → action log → repeat-action prevention`

The test exposed and fixed a model identity mismatch between persistent model-roster IDs and generic combat-snapshot IDs.

## Development focus / anti-rabbit-hole rule

This project should stay focused on product goals and usable gameplay. Do not let development sessions become dominated by audit minutia, implementation micro-steps, or historical task bookkeeping.

Use this priority order:

1. **Product objective / roadmap outcome**
2. **User-visible behavior and gameplay**
3. **Authoritative state, persistence, and rules correctness**
4. **Targeted regression coverage**
5. **Implementation details**

When a problem is understood well enough to act, act. Do not create additional audits, helper layers, or investigation steps unless they materially reduce risk or unblock the current roadmap objective.

Historical audits and diagnostics are evidence, not the product. Prefer one strong regression suite over many narrowly overlapping checks.

At the beginning of a substantial development session, re-read the current save point, project objectives/roadmap, and relevant architecture section before making changes. State the current objective and next bounded change. At natural checkpoints, compare the work completed against those objectives and stop or redirect work that is no longer advancing them.

## Where to start when making a future change

1. Read the newest save point on the authoritative development branch.
2. Read this guide.
3. Read `ARCHITECTURE_MAP.md`.
4. Read the relevant section of `ROADMAP.md`.
5. Inspect the smallest affected subsystem in `index.html` or an already-extracted repository module.
6. Check the existing audit(s) under `scripts/`.
7. Make the bounded change that preserves existing state and event contracts.
8. Run the relevant audit(s) locally when possible.
9. Let GitHub Actions remain the final integration/deployment gate.
10. Re-test the live workflow when the change affects tournament/gameplay behavior.

Prefer repository-native module changes over whole-file manual transfer of the monolithic `index.html`.

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

The deployment extraction also includes `deployment-state.js`, which is an active bounded state seam identified by the current save point and architecture work.

## Current QA / deployment flow

The active deployment workflow is:

`.github/workflows/deploy.yml`

It performs repository audits, syntax validation, runtime symbol validation, build preparation, and GitHub Pages deployment.

Avoid adding post-build hotfix workflows for application code. Source-of-truth application changes should live in the repository itself.

GitHub Actions may use Python on its Linux runner for build/injection scripts. This does **not** mean Python is installed on the user's Windows testing computer. `PROJECT_ENVIRONMENT_NOTES.md` is the permanent local-environment reference.

## Safe refactoring direction

The planned architecture migration is incremental:

1. Shared contracts and identity helpers
2. Deployment / reserves / battlefield map
3. Combat and physical-dice resolution
4. Missions / objectives / scoring
5. Tactical Advisor
6. UI shell

Do not perform an uncontrolled rewrite of `index.html`.

The current controlled-reset method permits a larger bounded extraction batch when that is safer and faster than repeated micro-patches. Preserve the known-good baseline and use the experimental branch for recovery.

### Non-negotiable boundaries

- Deployment plans are reference/planning state.
- Live battlefield positions are authoritative live state.
- Physical dice are authoritative for real-game resolution.
- Mathhammer simulation must remain separate from physical-dice resolution.
- Tactical Advisor recommendations remain read-only with respect to authoritative outcomes.
- Model/unit/weapon identity must remain stable across Deployment → Live Map → Movement → Shooting → Damage → Casualties.

## Deployment / map extraction status

The bounded `deployment-state.js` module owns deployment-plan and live-battlefield position state normalization and mutation without owning rendering, persistence, rules, reserves, or geometry.

The next implementation target is a compatibility bridge around this seam. The bridge should expose a stable deployment API to the existing application and delegate to `OnoForgeDeploymentState`, allowing the monolith to migrate call sites without immediately moving all rendering/UI logic.

The bridge must not create a second deployment state store.

## Development note

A future chat or developer should be able to start from this file plus `ARCHITECTURE_MAP.md` and understand where to continue without relying on conversation history. For current state, always start with the newest save point on the authoritative development branch.

## Historical continuity note

Older `CURRENT_SESSION_HANDOFF.md`, `NEXT_CHAT_HANDOFF.md`, and similar documents contain valuable historical gameplay information but may describe earlier branches and objectives. They are not current-state authority when they conflict with the newest save point or this guide.

The original project handoff document remains the product North Star in `ORIGINAL_PROJECT_HANDOFF.md`.
