# OnoForge 40K — Chat Save Point: Roster Authority Playtest

Date: 2026-09-28 UTC
Repository: `Grumpa916/onoforge40k`
Development branch: `feature/opponent-turn-history`
Known-good baseline: `6969ac316727c100c1092c1724f33a81a016dc18`
Current tested branch commit: `11499fecbc502b303aa7004c820fe0a9b376c7fe`
Draft PR: #2 — open, draft, unmerged
Merge/deploy: not authorized

## Resume instruction

Resume from this save point. Do not restart architecture planning. Continue the real bidirectional combat playtest and fix the canonical model-roster state bug before moving to Test 2.

## Work completed before this save point

The branch already contains the bidirectional physical-dice combat continuation:
- shared physical-dice combat resolution supports both my → opponent and opponent → my attacks
- attackerSide and targetSide are explicit on resolution sessions
- Fight Execution uses the shared physical-dice resolver rather than the old manual Fight marker design
- actual casualties are intended to update the canonical model roster / battle state
- opponent Shooting, Charge, and Fight capture are integrated into the Battle screen
- opponent Charge records explicit observed facts and does not infer exact movement distance from a 2D6 roll
- Combat History is derived from `state.events` / Action Log
- there is no second Tactical Advisor, second combat engine, or duplicate authoritative combat-history store

## Live playtest progress

### Test 1 — My Shooting → opponent casualties

This test has been run twice using an Exocrine attacking Aggressor Squad through the physical-dice resolver.

The first run produced an `ATTACK_RESOLUTION` with actual-looking results but the opponent roster remained unchanged at 3/3 models and 9/9 wounds.

The Action Log showed the attack resolution and Combat History correctly derived the event, proving that resolution/history recording was functioning while canonical roster mutation was not persisting.

A regression guard was added, then the first attempted production fix was corrected after GitHub Actions exposed an incorrect edit. The valid production commit is now:

`11499fecbc502b303aa7004c820fe0a9b376c7fe`

Commit message: `fix: preserve mutated canonical model roster`

That commit changes `syncModelRosterBattleState()` from:

```js
const roster=ensureModelRoster(e,u);
```

to:

```js
const roster=Array.isArray(e.modelRoster)?e.modelRoster:ensureModelRoster(e,u);
```

GitHub Actions attached to that commit are successful:
- Tactical Advisor Preview Validation #180 — success
- Opponent Turn Event Capture Preview #73 — success

### Current finding: the bug remains

The fresh live test using the build from commit `11499fec...` still showed:
- `ATTACK_RESOLUTION` recorded
- damage/wound results recorded in the Action Log
- Opponent Army State: Aggressor Squad still `3/3 models · 9/9 wounds · Alive`
- unit roster modal still showed Aggressor Squad at 3 models / 9 wounds

Therefore the `syncModelRosterBattleState()` fix was necessary but insufficient.

## Exact next root-cause target

The next helper to inspect is `ensureModelRoster()`.

Current logic inside that helper prefers the stale `e.game.modelRoster` before `e.modelRoster`:

```js
const prior=Array.isArray(e.game?.modelRoster)?e.game.modelRoster:(Array.isArray(e.modelRoster)?e.modelRoster:[]);
```

This can overwrite/rebuild from stale state after the resolver has already mutated `e.modelRoster`.

The smallest intended side-neutral fix is:

```js
const prior=Array.isArray(e.modelRoster)?e.modelRoster:(Array.isArray(e.game?.modelRoster)?e.game.modelRoster:[]);
```

Do not blindly edit the file until the exact current helper is inspected in the current branch. Change only the stale-roster precedence if the source confirms this exact pattern.

## Required next actions

1. Inspect the exact current `ensureModelRoster()` helper in `index.html` on `feature/opponent-turn-history`.
2. Confirm whether it prefers `e.game.modelRoster` over the already-mutated `e.modelRoster`.
3. If confirmed, make the smallest side-neutral precedence fix described above.
4. Add/retain a regression test proving a mutated `e.modelRoster` survives synchronization and is not replaced by stale `e.game.modelRoster`.
5. Run the full relevant GitHub validation lanes.
6. Do NOT rerun the live battle test until validation passes.
7. Rerun Test 1 from a fresh controlled battle state.
8. Confirm that Exocrine → Aggressor Squad produces both the `ATTACK_RESOLUTION` and a persistent actual roster/wound change.
9. Only after Test 1 passes proceed to Test 2: Opponent Shooting → my casualties.

## Playtest sequence after Test 1 is fixed

1. My Shooting → opponent casualties
2. Opponent Shooting → my casualties
3. My Charge → opponent engagement
4. Opponent Charge → my engagement
5. My Fight → opponent casualties
6. Opponent Fight → my casualties
7. multiple weapon pools / exact model IDs
8. attached leaders and bodyguards
9. mixed saves / Precision / Devastating wounds
10. repeated Fight activations and weapon-use accounting
11. undo after ATTACK_RESOLUTION and CHARGE_RESOLUTION
12. opponent-turn → next player Command transition

For every failure:
- inspect the exact helper first
- determine whether it is shared execution code or a friendly-only compatibility wrapper
- make the smallest side-aware fix necessary
- preserve Action Log and canonical model-roster conventions
- rerun validation

## Important constraints

- Do not create another combat engine.
- Do not create another Tactical Advisor.
- Do not create a duplicate history store.
- Do not infer unknown tabletop facts.
- Do not treat projected damage as actual damage.
- Do not revert to the old Fight marker design.
- Do not merge PR #2.
- Do not deploy.

## Important canonical functions

Continue using the existing authoritative primitives:
- `ensureModelRoster`
- `syncModelRosterBattleState`
- `setModelDestroyed`
- `restoreModel`
- `changeModelWounds`
- `setUnitDestroyed`

## Resume prompt for the next chat

Resume OnoForge 40K from `CHAT_SAVEPOINT_2026-09-28_ROSTER_AUTHORITY_PLAYTEST.md` in repository `Grumpa916/onoforge40k`.

Branch: `feature/opponent-turn-history`.
Current tested commit: `11499fecbc502b303aa7004c820fe0a9b376c7fe`.
Known-good baseline: `6969ac316727c100c1092c1724f33a81a016dc18`.
Draft PR #2 remains open, draft, and unmerged.

The bidirectional combat architecture is already implemented. Do not restart architecture planning.

The live Test 1 failure is now narrowed to canonical model-roster authority. `syncModelRosterBattleState()` was changed to prefer `e.modelRoster`, but a fresh live test still left Aggressor Squad at 3/3 models and 9/9 wounds after an Exocrine physical-dice attack whose `ATTACK_RESOLUTION` was correctly recorded.

First inspect `ensureModelRoster()` and verify whether it still prefers stale `e.game.modelRoster` over `e.modelRoster`. If so, make the smallest side-neutral precedence fix so an already-mutated `e.modelRoster` cannot be replaced by stale game state. Validate before another live test.

Once Test 1 passes, continue the ordered bidirectional playtest: opponent Shooting, both Charge directions, both Fight directions, then edge cases, undo, and turn transition.

Never merge or deploy during this work.
