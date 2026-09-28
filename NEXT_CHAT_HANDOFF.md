# NEXT_CHAT_HANDOFF

## OnoForge 40K — Tactical Advisor / Charge / Fight Save Point
Date: 2026-09-27

### Current branch
`feature/tactical-impact-layer`

### Stable checkpoint
Latest tested code commit:
`6969ac31` — **Close Fight Tactical Context branch**

All three validation workflows for this commit passed:
- Tactical Advisor Preview Validation **#148**
- Tactical Advisor Tests **#158**
- Tactical Advisor Surface Fix Preview **#22**

This is the current **known-good UI testing checkpoint**.

### Major milestones verified by user

#### Tactical Advisor consolidation
The Battle UI now presents **one visible Tactical Advisor**. Tactical Impact is integrated into the canonical Advisor surface.

Do not revert to the old sibling/staging renderer architecture.

#### Charge workflow
Verified end-to-end with:
- Exocrine → Aggressor Squad
- Tactical Context measured distance = **5"**
- Tactical Impact reads **physical distance confirmed**
- Charge probability displayed as **83%**
- Charge execution controls visible
- **Charge Successful** records successfully
- Action Log contains a **CHARGE RESULT**
- Returning to the Advisor shows:
  - **Charge result recorded**
  - **Charge recorded: Successful**
  - **Charge complete**
- Tactical Context then correctly shows the attacker has completed its Charge action.

Important bugs already fixed:
- Charge workflow phase validation was reading stale/wrong state.
- Charge legality lookup was also reading stale/wrong state.
- Canonical app-state bridge was changed to remain synchronized when the application replaces the state object.

#### Fight setup and execution
Verified in Fight phase:
- Exocrine remains the active attacker
- Aggressor Squad remains the engaged target
- Fight step can be set to **Remaining Combats**
- Pile-in status can be set to **Yes**
- Consolidation status can be set to **Yes**
- The unresolved pile-in warning clears after selecting Yes

Verified Fight Execution UI:
- **Friendly Fight → Aggressor Squad**
- Friendly projection displayed (or gracefully reports projection unavailable)
- **Mark Friendly Fight Resolved** changes to **Fight Resolved**
- **Enemy Fight Back** panel appears
- Enemy return projection displayed; example showed **2.7W expected return**
- **Record Enemy Fight Back** changes to **Enemy Fight Back Recorded**
- No error occurred

Verified Action Log:
- `Unit fightDone changed`
- `Unit enemyFightBackDone changed`
- Both logged under Fight / Round 1 / Game

#### Full turn / round transition
Verified:
- My turn: Command → Movement → Shooting → Charge → Fight
- End Turn → Opponent works
- Opponent turn: Command → Movement → Shooting → Charge → Fight
- No Tactical Advisor is incorrectly shown during opponent turn
- Opponent Fight ends with **End Turn → Next**
- Next transition correctly produces:
  - **Round 2**
  - **Command**
  - **My turn / Triple norm list**

This confirms the phase and player-turn transition path through the tested cycle.

### Current known limitation / next development target

The Fight Execution UI currently records **resolution state**, but it does not yet perform a complete actual melee dice/wound transaction for both sides.

Current Fight Execution behavior:
- Displays projected friendly melee damage
- Displays projected enemy return damage
- Allows the user to mark friendly Fight resolved
- Allows the user to record enemy Fight Back
- Existing model/wound controls remain the authoritative place for actual damage application

### Next major task
Build the **actual melee resolution workflow** into Fight Execution, using the existing shared combat / model-level damage system.

Desired complete exchange:
1. Select the enemy unit actually fought.
2. Resolve friendly melee attacks with the existing attack/wound/save/damage engine.
3. Apply actual damage to the affected enemy models.
4. Record friendly Fight completion.
5. Resolve the enemy Fight Back using the same authoritative combat engine in the opposite direction.
6. Apply actual damage to friendly models.
7. Record enemy Fight Back completion.
8. Close the combat exchange only when both sides are resolved.
9. Preserve Action Log, undo, and tactical state consistency.
10. Continue to Consolidation/next combat/next phase according to the existing battle flow.

Important design goal:
**Do not create a separate parallel melee engine.** Reuse the existing shared combat and model-level resolution machinery already used elsewhere in OnoForge.

### Current UI architecture
Canonical Tactical Advisor owns the main Advisor surface.

Tactical Context provides explicit battlefield facts and fight-state facts; unknowns are never guessed.

Fight-state tracking currently includes:
- `fightPhase.step`
- `fightPhase.nextSide`
- `fightPhase.units[uid].engagedAtFightStart`
- `fightPhase.units[uid].becameEngagedDuringFight`
- `fightPhase.units[uid].pileInDone`
- `fightPhase.units[uid].consolidationDone`

Tactical action state includes:
- `fightDone`
- `enemyFightBackDone`
- `chargeDone`
- `chargeMade`

### Important recent commits
- `6969ac31` — Close Fight Tactical Context branch (**current known-good checkpoint**)
- `05729e7b` — Close Tactical Advisor preview renderer script
- `f45420e6` — Expose Fight pile-in and consolidation state controls
- `afdd4295` — Add complete Fight execution and enemy fight-back workflow
- `95881789` — Show recorded Charge result in canonical Advisor
- `b1b04b83` — Keep canonical app state bridge synchronized across state replacement
- `7e4624ea` — Use live canonical state for Charge target legality
- `9ff95980` — Use canonical app state for Charge result validation
- `0300c7fb` — Honor canonical measured charge distance in Tactical Impact
- `55a394e3` — Add Charge execution controls to canonical Advisor
- `3c33c239` — Harden Tactical Impact against incomplete combat profiles

### Known non-blocking issue
For some candidates, Tactical Impact may report incomplete projected Fight output because the required combat profile information is incomplete. The application now handles this gracefully rather than crashing the Battle screen.

### Validation history relevant to current checkpoint
- Preview Validation #148: **passed**
- Tactical Advisor Tests #158: **passed**
- Surface Fix Preview #22: **passed**

The earlier Preview Validation #146 and #147 failures were build/syntax issues and should not be used as test artifacts.

### Do not do yet
Do not:
- merge `feature/tactical-impact-layer` to `main`
- deploy to production
- redesign the Tactical Advisor layout
- remove Tactical Context
- replace the existing shared combat engine
- treat projected damage as actual resolved damage

### Next-chat starting point
Resume from **`6969ac31`**.

The next development/testing task is:
**replace the current Fight Execution resolution markers with a real shared-engine melee resolution flow, including enemy Fight Back and actual model/wound state changes.**

Before modifying code, inspect the existing melee/model-level resolution functions and Action Log conventions so the new Fight workflow integrates with existing authoritative state rather than duplicating it.
