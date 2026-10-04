# CHAT SAVEPOINT — 2026-10-04 — PROJECT STATUS BEFORE NEW CHAT

## Repository / authoritative branch

- Repository: `Grumpa916/onoforge40k`
- Authoritative development branch: `feature/opponent-turn-history`
- Current HEAD: `ffa0940f1732826cb8e164377bbaf75c315c65fd`
- `main` must remain untouched unless explicitly approved.
- `feature/opponent-turn-history-clean-reset` is a separate/diverged branch. Do not casually merge or rebase it into the authoritative development branch.
- Python is not installed on the user's computer. Do not require local Python.

## Project objective

OnoForge 40K is being developed as a 40K battle/list-building application with a strong emphasis on:
- accurate 40K data and rules support;
- opponent-turn tracking;
- shared physical-dice combat resolution;
- Tactical Advisor guidance;
- reliable state/history handling;
- incremental extraction of the very large `index.html` monolith;
- browser verification plus GitHub Actions validation;
- small, reversible changes and durable cross-chat save points.

## Major completed architectural milestone: BSData parser extraction

The first monolith extraction has been completed and merged through PR #6.

Merged PR:
- #6 — Candidate: extract BSData parser from index.html
- Merge commit: `10757225ea6fcaa1be5ba0b3d3c50cc9dd91fc8b`

Extracted file:
- `js/data/bsdata-parser.js`

Functions moved across the parser boundary:
- `collectBSDataObjects`
- `bsProfile`
- `bsCharacteristics`
- `normalize11eWeaponAbilities`
- `bsAbilities`
- `bsWeapons`
- `bsWargearOptions`
- `bsUnitFromEntry`

The application now passes `{objectMap}` into the unit parser. The old `window.__BS_OBJECT_MAP=map` compatibility assignment was removed.

Browser verification already completed for the extraction:
- List Builder rendered.
- Existing list/army state remained intact.
- BSData 11e cross-check succeeded.
- The UI explicitly confirmed verified runtime data was not overwritten.
- Unit search/add worked.
- Leader attachment worked.
- Leader configuration modal/save worked.
- Attached leader remained correctly attached.

## Opponent-turn / physical-dice work completed

### Shared physical dice resolver

The streamlined quick physical-result flow had a real Saves-stage transition bug.

Root cause:
- the quick counter UI used stage name `saves`;
- the resolver field is `failedSaves`;
- button handlers were therefore re-entering the Saves state instead of advancing.

Final repair:
- quick-counter mapping now sends `saves -> failedSaves`.

Verified browser flow:
- Saves screen appears.
- Failed-save count can be selected.
- Flow advances to Damage.
- Damage is appropriately applied.
- Action Log records the completed attack resolution.

Verified repair commit:
- `ac63cfb88d9ef5adc721bb415872362394d91af7`

### Action Log readability

The blue Action Log result text was being truncated with nowrap/ellipsis behavior.

It was changed to:
- wrap;
- remain visible;
- expand vertically as needed;
- avoid ellipsis truncation.

Commit:
- `6772bdac1222bc1fa57fbff3baa904711d750f55`

This change was browser-checked in context.

### Opponent Shooting weapon selection

A later browser test exposed two related issues.

1. Completed opponent shooters were misleadingly showing `Choose weapon…`.
   - UI now distinguishes this state as:
     `Shooting completed — choose another shooter…`

2. Shooting weapon eligibility was too permissive.
   - A melee-only profile such as Ballistus Dreadnought `Armoured feet` could appear in the Shooting selector.
   - Shooting eligibility now requires `tacticalWeaponIsRanged(w)`.

Verified browser behavior on current code:
- Aggressor Squad can show `Shooting completed — choose another shooter…`.
- A unit with no eligible ranged weapons can show `No eligible ranged weapons`.
- Ballistus Dreadnought shows ranged profiles.
- Ballistus `Armoured feet` is excluded from Shooting.
- Ballistus Lascannon, missile launcher (Frag), missile launcher (Krak), and Storm Bolters are available.

Verification commit:
- `5fb0fb7f39fc7ab375355415f13f9fb7fa4aaeea`

## Current architecture-inspection status

The project is now deliberately returning to the planned monolith-extraction program.

A full function inventory of the current `index.html` was performed. It contains approximately 716 top-level functions.

The next candidate identified for inspection is the **Game Timer block**, because it is:
- contiguous;
- conceptually self-contained;
- responsible for timer state/UI;
- relatively small compared with the rest of the monolith;
- a better extraction candidate than deeply coupled Tactical Advisor/combat code.

Game Timer functions:
1. `ensureGameTimer`
2. `gameTimerElapsed`
3. `turnElapsedMs`
4. `finalizeCurrentTurnTime`
5. `toggleTurnPause`
6. `switchTurnClock`
7. `formatGameTime`
8. `updateGameTimerDisplay`
9. `ensureLiveGameTimerDisplay`
10. `startGameTimer`
11. `toggleGameTimer`
12. `finishGameTimer`
13. `saveBattleFromTimer`
14. `gameTimerHtml`

There is also the module-level runtime variable:
- `let gameTimerInterval=null;`

Timer state fields observed:
- `startedAt`
- `turnStartedGameMs`
- `turnMyMs`
- `turnOppMs`
- `turnPaused`
- plus the broader timer fields `elapsedMs`, `running`, `paused`, `pausedAt`, `finishedAt`.

The timer block has external dependencies including:
- `save`
- `render`
- `battleMutationAllowed`
- `cloudSaveCurrentBattle`
- `esc`

External callers were inspected. Timer functions are called from battle setup/render/save/phase-transition code, so **do not extract blindly**. Before editing:
1. map all callers;
2. map all shared state access;
3. define the narrowest host interface;
4. determine whether timer UI and runtime interval should extract together;
5. preserve browser-global compatibility for the first extraction, following the successful BSData parser pattern.

No timer extraction has been made yet.

## Important current source facts

Current `index.html` contains exactly one external script:
- `js/data/bsdata-parser.js`

The rest remains inline in the monolith.

## Validation discipline

For future changes:
1. Inspect first.
2. Identify a narrow boundary.
3. Map dependencies/callers.
4. Make the smallest reversible change.
5. Run GitHub Actions.
6. Browser-test the affected workflow.
7. Only then create the next save point.
8. Do not combine unrelated gameplay fixes with architectural extraction unless required.

Do not repeat already-passed browser tests unless a new change affects them.

## Historical branch safety

Known branch divergence:
- `feature/opponent-turn-history` is the active development branch.
- `feature/opponent-turn-history-clean-reset` is divergent and must not be casually merged/rebased.
- `main` is the stable/reference branch and must not be modified casually.

## Latest verified checkpoint

The latest functional checkpoint is:
`5fb0fb7f39fc7ab375355415f13f9fb7fa4aaeea`

The current branch HEAD is the save-point documentation commit:
`ffa0940f1732826cb8e164377bbaf75c315c65fd`

No functional change occurred after the opponent-shooting verification; the current HEAD adds the checkpoint documentation.

## Immediate next task

Resume by reading this save point and then:
- inspect the Game Timer dependency graph in `index.html`;
- identify all direct callers and shared-state assumptions;
- design the extraction boundary;
- do NOT edit code until the boundary is documented and safe.

The goal is not simply to remove lines from `index.html`; the goal is to progressively create clean, explicit module boundaries without destabilizing the verified battle workflows.
