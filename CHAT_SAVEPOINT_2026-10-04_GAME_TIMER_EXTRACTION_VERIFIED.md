# CHAT SAVEPOINT — 2026-10-04 — GAME TIMER EXTRACTION VERIFIED

## Repository / authoritative branch

- Repository: `Grumpa916/onoforge40k`
- Authoritative development branch: `feature/opponent-turn-history`
- Current verified HEAD: `f57dd5ba57452371994fd4d16adb2cb975cf9b42`
- `main` remains untouched. Verified current `main` HEAD: `4e2d47dbe7785abb371bb6b0f24ee35f60a26d32`
- `feature/opponent-turn-history-clean-reset` remains separate/diverged; do not casually merge or rebase it.
- User does not have Python installed locally. Never require local Python.

## Project objective

Continue the OnoForge 40K monolith-extraction program while preserving browser-verified gameplay:
- accurate 40K data and rules support;
- opponent-turn tracking;
- shared physical-dice combat resolution;
- Tactical Advisor;
- reliable state/history handling;
- incremental extraction from the large `index.html`;
- GitHub Actions validation;
- browser verification;
- small, reversible commits and durable save points.

## Previously completed architecture milestone

### BSData parser extraction

Extracted:
- `js/data/bsdata-parser.js`

The parser boundary follows a browser-global compatibility pattern:
- parser logic owned by the module;
- bootstrap remains in the application;
- `window.OnoForgeBSDataParser` provides the compatibility surface.

PR history:
- PR #6 merged the parser extraction.
- Merge commit: `10757225ea6fcaa1be5ba0b3d3c50cc9dd91fc8b`

## Previously verified opponent-turn / combat work

### Shared physical dice Saves → Damage

Root cause:
- quick-counter UI stage `saves` did not map to resolver field `failedSaves`.

Repair:
- `saves -> failedSaves`

Verified end-to-end:
- Saves stage;
- failed-save selection;
- Damage stage;
- damage application;
- Action Log completion.

Repair commit:
- `ac63cfb88d9ef5adc721bb415872362394d91af7`

### Action Log wrapping

Blue result text now wraps vertically instead of being clipped/ellipsized.

Commit:
- `6772bdac1222bc1fa57fbff3baa904711d750f55`

### Opponent Shooting eligibility

Verified:
- completed shooting state is clearly labeled;
- melee-only profiles are excluded from Shooting;
- ranged profiles remain selectable;
- Ballistus `Armoured feet` is excluded;
- Ballistus ranged weapons remain available.

Functional checkpoint:
- `5fb0fb7f39fc7ab375355415f13f9fb7fa4aaeea`

## Game Timer extraction

### Extraction status

The Game Timer was identified as the first narrow UI/runtime extraction candidate and is now extracted to:

- `js/ui/game-timer.js`

The module owns:
- timer state initialization;
- elapsed-time calculations;
- per-side turn clocks;
- pause/resume mechanics;
- timer display updates;
- runtime interval;
- timer HTML;
- local/cloud save entry point;
- finish behavior.

The application provides a narrow host bridge for:
- `getState()`
- `save()`
- `render()`
- `battleMutationAllowed()`
- `cloudSaveCurrentBattle()`
- `esc()`

Browser-global compatibility remains intentionally preserved for this first extraction.

### Important timer repairs made during verification

1. Live-battle migration:
   - An already-live, unfinished battle with a completely untouched timer now starts its timer automatically.
   - Intentionally paused and finished timers are not auto-started.

2. Standalone control interaction:
   - Timer controls were hardened for standalone/iPad/Safari testing.
   - Pause and Resume are explicit controls rather than relying on changing the same control label.

3. Pause/resume state consistency:
   - Pause and Resume now use the same `turnPaused` state.
   - Previous bug: Pause set `paused=true` while Resume checked `turnPaused`, preventing restart.

Current verified functional commit:
- `f57dd5ba57452371994fd4d16adb2cb975cf9b42`

## Browser verification — PASSED

User manually verified the CI-generated standalone build from the current timer-fix commit.

Verified:
- Game timer starts and increments.
- User-side turn clock increments.
- Opponent-side turn clock increments.
- Switching turns preserves the correct side clocks.
- Pause Game stops the clocks.
- Resume Game restarts the clocks.
- Save Battle saves locally.

The user explicitly confirmed:
> timer working for both sides.
> pause resume works for both sides.
> save battle saves locally

No browser regression was reported in the existing opponent-turn combat flow during this timer verification cycle.

## GitHub Actions verification

Current verified timer commit:
- `f57dd5ba57452371994fd4d16adb2cb975cf9b42`

Successful workflow runs include:
- Tactical Advisor Preview Validation — run `37181941102`
- Opponent Turn Event Capture Preview — run `37181941119`
- Opponent Turn Event Capture Preview — run `37181938440`

The successful Opponent Turn Event Capture Preview produced the CI standalone artifact:
- artifact id: `11295436543`
- name: `onoforge40k-opponent-turn-event-preview`
- digest: `sha256:7b00c51fcd6f656a5d9c6d9b64c8de9b7ecbc3edd9397a024a43d87584d7e12a`
- expires: 2026-10-18

## Current state

The timer extraction and its browser validation are complete.

The last testing cycle deliberately did NOT proceed into another extraction after the timer controls were fixed. The next work should therefore resume from this save point.

## Next task

Resume the monolith-extraction program with a fresh dependency audit.

Do not duplicate the Game Timer extraction.

Inspect the remaining `index.html` architecture and select the next narrow extraction candidate using the same discipline:
1. inventory the candidate functions;
2. identify all direct callers;
3. identify shared-state reads/writes;
4. identify persistence/render/cloud dependencies;
5. define the narrow host interface;
6. compare the proposed boundary with the successful BSData-parser and Game-Timer boundaries;
7. make the smallest reversible implementation;
8. run GitHub Actions;
9. browser-test only the affected workflow plus any regression directly caused by the extraction;
10. create a new save point only after verification.

Avoid deeply coupled Tactical Advisor/combat extraction until a clean boundary is established.

## Branch safety

- Keep development on `feature/opponent-turn-history`.
- Do not modify `main`.
- Do not merge/rebase `feature/opponent-turn-history-clean-reset` into the active branch without explicit approval.
