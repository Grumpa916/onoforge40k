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
- Authoritative branch for current development: `feature/opponent-turn-history-clean-reset`
- Live deployment branch: `main` (operational deployment only; do not treat it as the current development source)
- Repository identity guardrail: `REPOSITORY_IDENTITY.md`
- Architecture map: `ARCHITECTURE_MAP.md`
- Feature roadmap: `ROADMAP.md`

Do not use `Grumpa916/ono40k` as the source of truth.

## Current baseline

The current controlled-reset line preserves the known-good gameplay checkpoint above while deployment work proceeds on the clean-reset branch. Older references to `main`, `0603fb8...`, or earlier Charge/Fight continuation states in historical sections of this guide are historical and do not override the current save point.

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
3. Read `ARCHITECTURE_MAP.md` and the relevant section of `ROADMAP.md`.
4. Inspect the smallest affected subsystem in the repository; avoid whole-file transfer of the monolithic `index.html` when a repository-native module change can accomplish the work.
5. Check the existing audit(s) under `scripts/`.
6. Make the bounded change that preserves existing state and event contracts.
7. Run the relevant audit(s) locally when possible.
8. Let GitHub Actions remain the final integration/deployment gate.
9. Re-test the live workflow when the change affects tournament/gameplay behavior.

## Current monolith facts

`index.html` currently contains the page shell, global application state, persistence, event history/undo, Army Builder, Deployment/reserves/battlefield map, Objectives/scoring, Tactical Advisor, combat eligibility/engine, physical-dice resolution, and tournament operations/timer. It is approximately 1 MB with one large inline JavaScript block.

The monolith is the reason the current extraction effort exists. Do not treat the size as a reason to abandon the project; progressively move subsystem behavior into small repository modules instead.

## Current supporting modules

Root-level JavaScript files include deployment/combat/advisor extraction and diagnostic scaffolding. Supporting modules should be treated as authoritative only when the current save point and integration state identify them as active production seams.

## Current QA / deployment flow

The active deployment workflow is `.github/workflows/deploy.yml`. It performs repository audits, syntax/runtime validation, build preparation, and GitHub Pages deployment. GitHub Actions may use Python on its Linux runner for build/injection scripts; this does **not** imply Python is installed on the user's Windows testing computer.

Avoid adding post-build hotfix workflows for application code. Source-of-truth application changes should live in the repository itself.

## Safe refactoring direction

The planned architecture migration remains incremental, but the current controlled-reset method permits larger bounded extraction batches when appropriate:

1. Shared contracts and identity helpers
2. Deployment / reserves / battlefield map
3. Combat and physical-dice resolution
4. Missions / objectives / scoring
5. Tactical Advisor
6. UI shell

The immediate active boundary is **Deployment / reserves / battlefield map**, followed by a **compatibility bridge** that lets the existing monolith call the extracted subsystem without changing gameplay semantics.

### Non-negotiable boundaries

- Deployment plans are reference/planning state.
- Live battlefield positions are authoritative live state.
- Physical dice are authoritative for real-game resolution.
- Mathhammer simulation must remain separate from physical-dice resolution.
- Tactical Advisor recommendations remain read-only with respect to authoritative outcomes.
- Model/unit/weapon identity must remain stable across Deployment → Live Map → Movement → Shooting → Damage → Casualties.

## Current deployment extraction status

The bounded `deployment-state.js` module is an established first seam. It owns deployment-plan and live-battlefield position state normalization and mutation without owning rendering, persistence, rules, reserves, or geometry.

The next implementation target is a compatibility bridge around this seam. The bridge should expose a stable deployment API to the existing application and delegate to `OnoForgeDeploymentState`, allowing the monolith to migrate call sites without immediately moving all rendering/UI logic.

The bridge must not create a second deployment state store.

## Historical continuity note

Older `CURRENT_SESSION_HANDOFF.md`, `NEXT_CHAT_HANDOFF.md`, and similar documents contain valuable historical gameplay information but may describe earlier branches and objectives. They are not current-state authority when they conflict with the newest save point or this guide.

The original project handoff remains the product North Star in `ORIGINAL_PROJECT_HANDOFF.md`.
