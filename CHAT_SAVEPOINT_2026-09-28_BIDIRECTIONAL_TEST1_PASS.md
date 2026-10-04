# OnoForge 40K — Chat Save Point: Bidirectional Test 1 PASS

Date: 2026-09-28 UTC
Repository: `Grumpa916/onoforge40k`
Development branch: `feature/opponent-turn-history`
Current tested commit: `3672a09327b4d6a20b4354db11497f8f3a0e9e48`
Known-good baseline: `6969ac316727c100c1092c1724f33a81a016dc18`
Draft PR: #2 — open, draft, unmerged
Merge/deploy: not authorized

## Resume instruction

Resume from this save point. Do not restart architecture planning and do not revisit the already-resolved roster-authority issue unless new evidence requires it.

## Important verified state

The bidirectional physical-dice combat architecture is implemented and the canonical model-roster persistence issue encountered during live testing has now been corrected and successfully demonstrated in the browser.

The current commit `3672a09` contains both relevant roster-authority changes:

1. `syncModelRosterBattleState()` prefers an existing `e.modelRoster` before calling `ensureModelRoster()`.
2. `ensureModelRoster()` prefers existing `e.modelRoster` before falling back to `e.game.modelRoster`.

These changes prevent a mutated canonical roster from being replaced by stale game-state roster data during later synchronization/rendering.

## Live Test 1 — PASS

### Scenario

Friendly/my shooting:
`Exocrine → Aggressor Squad`

The attack was resolved through the physical-dice workflow.

### Observed result

The Action Log recorded:
- `ATTACK RESOLUTION`
- attacker: Exocrine
- 3 hits
- 3 wounds
- 0 saves
- 9 damage

The opponent canonical roster changed from:
- 3/3 models
- 9/9 wounds
- Alive

to:
- 0/3 models
- 0/9 wounds
- Destroyed
- 3 dead models in the expanded roster view

The unit detail/modal independently showed:
- 0 models
- Destroyed
- 0 wounds remaining

Combat History continued to derive the attack from the Action Log.

### Conclusion

**PASS — My Shooting → opponent casualties**

This is the first successful live confirmation that the physical-dice attack resolution is propagating into the actual opponent model roster/battle state.

No manual `W-`, `W+`, or `Dead` controls were used to apply the casualty result.

## Do not repeat unnecessarily

Do not rerun Test 1 merely to reconfirm the same behavior.

Do not make additional roster-authority changes based on the previously observed failure; that failure is now resolved and live-verified.

The next required test is:

**Test 2 — Opponent Shooting → my casualties**

Use one controlled reverse-direction attack and verify the same state-flow contract:
- ATTACK_RESOLUTION
- actual friendly model/wound change
- Action Log
- Combat History
- no projection treated as actual damage

## Remaining ordered playtest

1. Opponent Shooting → my casualties
2. My Charge → opponent engagement
3. Opponent Charge → my engagement
4. My Fight → opponent casualties
5. Opponent Fight → my casualties
6. multiple weapon pools / exact model IDs
7. attached leaders and bodyguards
8. mixed saves / Precision / Devastating wounds
9. repeated Fight activations and weapon-use accounting
10. undo after ATTACK_RESOLUTION and CHARGE_RESOLUTION
11. opponent-turn → next player Command transition

For each failure:
- inspect the exact helper first
- determine whether it is shared execution code or a friendly-only compatibility wrapper
- make the smallest side-aware fix necessary
- preserve authoritative Action Log and canonical model-roster conventions
- rerun validation before repeating a live test

## Architecture constraints

- No second combat engine.
- No second Tactical Advisor.
- No duplicate combat-history store.
- Combat History remains derived from `state.events` / Action Log.
- Unknown tabletop facts remain unknown.
- Projected damage is not actual damage.
- Do not revert to the old Fight marker design.
- Do not merge PR #2.
- Do not deploy.

## Resume prompt

Resume OnoForge 40K from `CHAT_SAVEPOINT_2026-09-28_BIDIRECTIONAL_TEST1_PASS.md`.

Repository: `Grumpa916/onoforge40k`
Branch: `feature/opponent-turn-history`
Current tested commit: `3672a09327b4d6a20b4354db11497f8f3a0e9e48`
Known-good baseline: `6969ac316727c100c1092c1724f33a81a016dc18`
PR #2 remains open, draft, and unmerged.

Test 1 has been successfully live-verified:
Exocrine → Aggressor Squad through physical dice produced an ATTACK_RESOLUTION and changed the canonical opponent roster from 3/3 models, 9/9 wounds, Alive to 0/3 models, 0/9 wounds, Destroyed. Do not rerun Test 1 unless a new regression appears.

Continue directly with **Test 2: Opponent Shooting → my casualties**, then proceed through the remaining ordered bidirectional playtest and edge cases. Do not restart architecture planning, merge, or deploy.
