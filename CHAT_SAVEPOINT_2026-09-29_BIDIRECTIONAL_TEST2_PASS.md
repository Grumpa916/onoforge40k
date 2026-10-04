# OnoForge 40K — Chat Save Point: Bidirectional Test 2 PASS

Date: 2026-09-29 UTC
Repository: `Grumpa916/onoforge40k`
Development branch: `feature/opponent-turn-history`
Tested code commit: `69c8e8d2b37a88e7de93515c5eefb783ac00193b`
Known-good baseline: `6969ac316727c100c1092c1724f33a81a016dc18`
Draft PR #2: open, draft, unmerged
Merge/deploy: not authorized

## Test 2 — PASS

Scenario:
`Opponent turn → Shooting → Hellblaster Squad → Tyrannofex → Bolt Pistol`

The tested verified artifact was built from code commit `69c8e8d2` by Opponent Turn Event Capture Preview #111.

### Entry checkpoint
The shared physical-dice resolver visibly opened during the opponent Shooting flow.

The resolver displayed:
- PHYSICAL DICE ENTRY • Shooting
- Target: Tyrannofex
- Weapon: Bolt Pistol
- HITS • COUNT

### Physical resolution
The controlled physical result entered was:
- Hits: 1
- Wounds: 1
- Failed Saves: 1
- Damage: 1

The resolver reached REVIEW and then Apply Result.

### Actual battlefield mutation
After Apply Result, the friendly Tyrannofex changed from 16/16 wounds to:
- 15/16 wounds
- Damaged
- Alive

No manual wound/model control was used.

### Authoritative event/history verification
The Action Log showed:
- blue boys
- Shooting
- Hellblaster Squad
- ATTACK RESOLUTION
- 1 hit
- 1 wound
- 0 saves
- 1 damage

Combat History showed 2 entries and derived the new opponent attack from the Action Log:
- blue boys — Shooting — Hellblaster Squad → Tyrannofex — 1 hit • 1 wound • 0 saves • 1 dmg
- prior Triple norn list — Shooting — Exocrine → Aggressor Squad — 3 hits • 3 wounds • 0 saves • 9 dmg

This confirms the reverse-direction physical-dice attack propagated through:
shared resolver → ATTACK_RESOLUTION → canonical friendly roster/model state → Action Log → derived Combat History.

## What this establishes

Test 2 confirms the opponent Shooting path is operational end-to-end.

The earlier resolver-entry/render failure is resolved.

The bidirectional shooting playtest is now confirmed in both directions:
1. My Shooting → opponent casualties — PASS
2. Opponent Shooting → my casualties — PASS

Do not repeat either shooting test unless a later regression requires it.

## Remaining ordered playtest

Continue directly with:
1. My Charge → opponent engagement
2. Opponent Charge → my engagement
3. My Fight → opponent casualties
4. Opponent Fight → my casualties
5. multiple weapon pools / exact model IDs
6. attached leaders and bodyguards
7. mixed saves / Precision / Devastating wounds
8. repeated Fight activations and weapon-use accounting
9. undo after ATTACK_RESOLUTION and CHARGE_RESOLUTION
10. opponent-turn → next player Command transition

For every failure:
- inspect the exact helper first
- determine whether it is shared execution code or a friendly-only compatibility wrapper
- make the smallest side-aware fix necessary
- preserve Action Log and canonical model-roster conventions
- rerun validation before another live test

## Architecture constraints

- No second combat engine.
- No second Tactical Advisor.
- No duplicate authoritative combat-history store.
- Combat History remains derived from `state.events` / Action Log.
- Physical dice remain authoritative for actual resolution.
- Projected damage is not actual damage.
- Unknown tabletop facts remain unknown.
- Do not merge PR #2.
- Do not deploy.

## Resume prompt

Resume OnoForge 40K from `CHAT_SAVEPOINT_2026-09-29_BIDIRECTIONAL_TEST2_PASS.md`.

Repository: `Grumpa916/onoforge40k`
Branch: `feature/opponent-turn-history`
Last tested code: `69c8e8d2b37a88e7de93515c5eefb783ac00193b`
Known-good baseline: `6969ac316727c100c1092c1724f33a81a016dc18`
PR #2 remains open, draft, and unmerged.

Test 1 and Test 2 are both confirmed live passes. Do not repeat them unnecessarily.

Continue with the ordered bidirectional playtest starting at:
**My Charge → opponent engagement**

Do not restart architecture planning. Do not merge or deploy.
