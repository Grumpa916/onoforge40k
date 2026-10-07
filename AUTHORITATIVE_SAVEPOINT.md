# OnoForge 40K — Authoritative Save Point

**Permanent authoritative continuity file:** `AUTHORITATIVE_SAVEPOINT.md`

This document is the current reusable save point for the OnoForge 40K monolith-refactor workstream. Update this file in place at future logical milestones. The dated save point `AUTHORITATIVE_SAVEPOINT.md` remains as a historical snapshot.

## 1. Authoritative project state

- Repository: `Grumpa916/onoforge40k`
- Active/authoritative branch: `refactor/clean-reset-monolith`
- Current branch HEAD: `fc9afbf0a242de93785a320816deb8b54f31aac5`
- Latest commit: `test: guard undo action extraction`
- Current `index.html` blob SHA: `01c965961c559ca557b83e709078b5e66d6f5fd2`
- Current `index.html` size: 722,479 characters
- Main branch: **must remain untouched**
- GitHub Actions workflow: **OnoForge Monolith Refactor Tests**
- GitHub Actions is the authoritative validation gate.

## 2. Latest verified extraction sequence

The current undo/timer cluster is fully extracted and GREEN:

- #378 — `45b7709f9d67ef6ab44b90a692cdc12660d3c3df` — extract undo snapshot state — GREEN
- #379 — `b7e3aabf40e56615b3b9c96c3505fa6cc85273c2` — wire undo snapshot state — GREEN
- #380 — `f8e4658a7cf09405aa6351b85235aa2dd7f8a4bb` — guard undo snapshot extraction — GREEN
- #381 — `ad6918356e1feb8b60381be606efd210ae41c3e6` — extract game timer runtime state — GREEN
- #382 — `02b456d7729317b7dd7b95fe95c3d636bc31e569` — wire game timer runtime state — GREEN
- #383 — `09a5b6c755deb009af39693ccf7bbf041c63aa68` — guard game timer runtime extraction — GREEN
- #384 — `3cab8679eac921d09bd78294da5e16799dcac5ef` — extract undo action state — GREEN
- #385 — `8e9762286a9efbf398a33dfdd1edd39ccf752c9d` — wire undo action state — GREEN
- #386 — `fc9afbf0a242de93785a320816deb8b54f31aac5` — guard undo action extraction — GREEN

## 3. Newly extracted modules

### Undo snapshot
`js/state/undo-snapshot-state.js`
- Owns `snapshotForUndo()`.
- Captures logical game/turn timer state at the action boundary.

### Game timer runtime
`js/state/game-timer-runtime-state.js`
- Owns `syncGameTimerRuntime()`.
- The shared `gameTimerInterval` remains owned by the existing timer logic.
- The extracted module accesses the shared interval through dependency callbacks; it does not create a second timer owner.

### Undo action
`js/state/undo-action-state.js`
- Owns `undoLastAction()`.
- Preserves the compound Stratagem behavior: `CP_CHANGED + STRATAGEM_USED` are undone together when paired.

## 4. Earlier completed work

Do not re-extract or duplicate completed modules.

The branch already contains numerous verified state/data/utility extractions, including:

- BSData parser
- pure utilities
- reserve state
- objective geometry/identity/labels/map state
- deployment plan/map controls/position/status
- tournament deployment validation
- tournament setup checklist
- tournament lifecycle
- battle start
- deployment start
- battle end
- battle end summary
- primary mission rules
- game reference editor
- game assistant
- tactical combat state
- opponent turn capture/tracking
- Tactical Advisor render/context
- tactical pre-roll state/resolution
- math combat engine/execution
- stratagem UI/state
- force disposition
- tactical core
- undo snapshot
- game timer runtime
- undo action

Exact historical details remain available in the older save-point documents in the repository. This file is the authoritative continuation point for the current workstream. The dated save point remains a historical snapshot.

## 5. Important historical failure safeguards

Earlier Tactical Core guard work produced a RED run caused by duplicate `const` declarations in the extracted module. That issue was diagnosed and resolved during subsequent work. Do not return to that historical RED checkpoint or re-extract Tactical Core.

Earlier opponent-turn tracking guard failures were also diagnosed and corrected. Preserve the corrected behavior.

Historical RED Actions runs are historical records; only the current/new run for the current commit should be treated as the current gate.

## 6. Current extraction strategy

The user has explicitly approved an **aggressive extraction approach**.

Rules:

1. Continue from the live branch HEAD.
2. Do not restart, redesign, undo, or re-extract completed work.
3. Prefer larger, tightly related extraction batches when dependencies are manageable.
4. Still require GREEN GitHub Actions validation before advancing past a completed batch.
5. Do not make speculative changes when Actions is RED; inspect the exact failure first.
6. Preserve browser-verified behavior.
7. Main remains untouched.
8. Do not require local Python.
9. Do not create no-op commits.
10. Before modifying `index.html`, fetch its current non-empty contents and exact blob SHA. Never assume an old SHA remains current.
11. Do not trust an empty `index.html` fetch as evidence that the file is empty or missing.
12. Do not blindly extract highly coupled functions merely because they are large.

## 7. Remaining large-function strategy

Earlier inspection identified these large remaining functions:

- `previousPhase()` — approximately 70.6 KB; highly coupled; do not blindly extract.
- `esc()` — approximately 39.6 KB; highly coupled; do not blindly extract.
- `secondaryPersonalPlanHtml()` — approximately 35.6 KB; inspect dependencies before extraction.
- `useStratagemByName()` — approximately 28.8 KB; logic-heavy; inspect before extraction.
- `tacticalAdvisorV2()` — approximately 22.8 KB; logic-heavy.
- `tacticalPreRollResolutionSet()` — approximately 17.2 KB; logic-heavy.
- `tacticalPreRollResolutionModal()` — approximately 13.7 KB; promising renderer candidate.
- `tacticalContextHtmlBody()` — approximately 12.1 KB; promising renderer candidate.

The immediate next target previously identified was:

**`actionText()` / `actionResultText()`**

However, because the user has now explicitly approved aggressive extraction, inspect the surrounding logging/rendering cluster and choose the best contiguous, low-risk target rather than mechanically extracting a tiny helper. Prefer a meaningful cluster when its dependencies are clean.

## 8. Preservation requirements

Do not regress:

- live deployment behavior
- reserve movement/persistence
- objective control/state
- battle phase/turn state
- game timers and accumulated time
- friendly/opponent clocks
- undo behavior
- Stratagem compound undo
- opponent-turn event capture
- Tactical Advisor history
- combat event recording
- shooting/fight actual-damage workflow
- browser-verified UI behavior
- existing module boundaries

The application should continue to record combat events rather than forcing unnecessary individual dice-roll entry during live play.

## 9. Standard continuation protocol

For every new chat:

1. Read this file first.
2. Inspect the current branch HEAD directly.
3. Confirm the latest Actions status.
4. Do not assume the saved HEAD is still current if another commit has been made.
5. Identify the next extraction from the live source.
6. Fetch exact source before editing.
7. Make the smallest safe aggressive extraction batch.
8. Run the existing monolith-refactor guard.
9. Verify GitHub Actions.
10. If GREEN, continue.
11. If RED, diagnose the exact failure before changing anything else.
12. Never touch main.
13. At a logical milestone, update this save point so the repository remains self-documenting.

## 10. Standard reusable new-chat prompt

Use this prompt at the start of every new chat:

> **Continue the OnoForge 40K monolith-refactor project from the repository's authoritative save point.**
>
> Repository: `Grumpa916/onoforge40k`
> Branch: `refactor/clean-reset-monolith`
>
> **First read:**
> `AUTHORITATIVE_SAVEPOINT_2026-10-07_MONOLITH_REFACTOR.md`
>
> Do NOT restart, redesign, undo, revert, or re-extract completed work.
> Do NOT touch main.
> Do NOT duplicate newer commits.
>
> Use the live branch HEAD as the source of truth. The save point is the continuity guide, not a reason to assume the branch has not advanced.
>
> The user has approved an **aggressive extraction strategy**: prefer meaningful, tightly related extraction batches when dependencies are manageable, rather than tiny renderer-by-renderer changes.
>
> GitHub Actions for `OnoForge Monolith Refactor Tests` is the authoritative validation gate.
>
> Before changing `index.html`, fetch its current non-empty contents and exact blob SHA. Do not use an old SHA or reconstruct large code from memory.
>
> First:
> 1. Read the authoritative save point.
> 2. Inspect the current branch HEAD.
> 3. Check the latest GitHub Actions result.
> 4. Inspect the next extraction target's exact source and dependencies.
>
> Then continue the next safe extraction **without asking for confirmation**.
>
> If Actions is GREEN, continue to the next target.
> If Actions is RED, inspect the exact failure and fix only what is necessary before proceeding.
>
> Preserve all previously verified application behavior and module boundaries.
>
> When a logical milestone is reached, update the authoritative save-point document so the repository remains a reliable continuity anchor.

## 11. Save-point policy

This document is the permanent authoritative save point for the current monolith-refactor workstream. It supersedes older continuation save points for active work.

Older save points remain historical references and should not be deleted.

When the project reaches another major milestone, update this document in place with:
- current HEAD
- latest verified Actions
- extracted modules
- current target
- known hazards
- preservation requirements
- updated continuation prompt.
