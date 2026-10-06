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


### New design requirement identified during opponent-turn playtest

The opponent-turn walkthrough revealed an important missing category of battlefield-state collection. The Tactical Advisor cannot rely only on actions performed by the current player's units; it also needs to capture relevant opponent-turn events that affect the player's units so that later recommendations have authoritative context.

Required opponent-turn event/state capture:

#### Opponent Shooting against my units
When the opponent resolves Shooting, record:
- which of my units/models were targeted
- relevant damage / casualties actually applied
- whether the target unit survived
- enough event/state information to identify that the unit was recently shot
- preserve this in Action Log and tactical state for later Advisor reasoning

#### Opponent Charge against my units
When the opponent declares/resolves a Charge, record:
- which of my units were charged
- which opponent unit charged them
- Charge success/failure
- resulting engagement state
- implied/derived movement information where rules and observed facts make it authoritative
- preserve the charge relationship for the next Fight phase
- do not infer exact movement distance when it cannot be established; unknown values remain unknown

This is especially important because an opponent Charge can change:
- whether my unit is engaged
- Fight eligibility/order
- tactical target relationships
- inferred battlefield positioning/movement context

#### Opponent Fight / melee exchange
During the opponent Fight phase, capture:
- which of my units participated in melee
- which opponent unit fought it
- friendly-side and enemy-side melee results
- actual wounds/casualties applied to each side
- pile-in/consolidation state where relevant
- completion of each side's combat action
- Action Log entries that preserve the exchange

#### Bidirectional combat history
The Advisor should eventually have a coherent bidirectional combat history:
my shooting → enemy casualties
enemy shooting → my casualties
my charge → enemy engagement
enemy charge → my engagement
my melee → enemy casualties
enemy melee → my casualties

This history should feed future Tactical Advisor analysis while remaining based on recorded/authoritative events rather than assumptions.

### Architectural implication

The current Fight implementation proved that a simple current-player UI can work, but the opponent-turn playtest showed that the application needs an event capture layer for actions initiated by the opponent.

Do not solve this by duplicating the Tactical Advisor UI for the opponent.

Instead, extend the existing battle-state / Action Log architecture so opponent actions write structured state/events that the canonical Tactical Advisor can consume on the player's next turn.

Recommended future structure:
- opponentShootingEvents
- opponentChargeEvents
- opponentFightEvents
- or, preferably, a unified typed event structure if the existing Action Log architecture can support it cleanly

### Prioritize data capture before advanced recommendations

When implementing these features, prioritize:
1. authoritative event capture
2. state persistence
3. Action Log visibility
4. correct engagement and action-state updates
5. Advisor consumption of the captured facts

Do not add speculative “implied movement” values unless the underlying game state or recorded event provides enough information to support them.

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

### Current continuation state — 2026-09-27

The isolated development branch is **feature/opponent-turn-history**.

Known-good baseline remains **6969ac316727c100c1092c1724f33a81a016dc18** on `feature/tactical-impact-layer`. The development branch is currently **31 commits ahead, 0 behind** that baseline. Do not merge it yet.

#### Completed in this continuation

**1. Shared physical-dice combat resolver is bidirectional**
- The authoritative physical-dice resolution session now carries `attackerSide` and `targetSide`.
- Existing my → opponent behavior remains through compatibility wrappers.
- The same resolver can now resolve opponent → my attacks.
- Resolution session keys include both sides to prevent directional collisions.
- Target-side save groups, model allocation, snapshots, weapon pools, and mixed/Precision handling were generalized where needed.
- `ATTACK_RESOLUTION` now carries a `resolutionId` and authoritative `side`.
- Fight completion is tied to an actual `ATTACK_RESOLUTION`, not a manual resolved marker.
- Weapon-use history prefers `payload.side` where present, so opponent Fight Back is counted in the correct direction.

**2. Fight Execution now uses the real resolver**
- Removed the old Friendly Fight / Enemy Fight Back marker-button flow.
- Friendly melee has an Enter Friendly Dice path.
- Enemy melee has an Enter Enemy Dice path.
- Actual damage/casualties update the existing model roster / battle state through the canonical application path.
- Pile-in and consolidation remain explicit state controls; they are not inferred.

**3. Opponent-turn capture is integrated into the existing battle screen**
- Opponent Shooting: choose enemy shooter, friendly target, weapon profile, then enter physical dice through the shared resolver.
- Opponent Charge: choose charging enemy unit, explicitly select friendly units actually charged, record Successful/Failed, optional required roll/rolled total, optional measured pre-charge distance, explicit engagement state, and movement observed/not observed.
- Successful Charge never infers movement distance from the 2D6 roll.
- Opponent Fight: choose enemy fighting unit, friendly target, weapon, then enter physical dice through the shared resolver; pile-in/consolidation are explicit for both sides.
- There is still only one Tactical Advisor surface.

**4. Combat History is derived from the authoritative Action Log**
- Added a read-only combatHistoryEvents()/combatHistoryHtml() view in Battle Mode.
- It shows both directions of shooting, charging, and melee.
- No persistent duplicate state.combatHistory store is used.

**5. Legacy preview layers were de-parallelized**
- opponent-turn-event-layer.js is now a read-only normalization adapter over state.events; it does not wrap event() or maintain a second event store.
- opponent-turn-capture.js is now a compatibility shim; production capture UI is in index.html.
- The audit/test files now validate the final architecture instead of the earlier experimental duplicate-history design.

#### Latest validation

The latest three GitHub Actions validation lanes for commit **6b14cc6a95f56ff328d52ff8b9e968648e9fbf2c** all completed **successfully**:
- tests: success
- architecture audit: success
- inline index.html JavaScript validation / preview validation: success

The earlier failures were diagnosed as stale test/audit assumptions and syntax in the experimental audit; those were corrected and the later three-lane validation passed.

Latest subsequent commit **7e79d44bf817afc1ca4f443567fe3d48c7e1b8f5** updates the invalid-identity test expectation to the intended bidirectional history count. The branch then received **6b14cc6a95f56ff328d52ff8b9e968648e9fbf2c**, which rewrote the final architecture audit. GitHub did not yet attach a new check-run to the latter commit at the time this handoff was updated, so treat the **6b14cc6a** three-lane success as the last verified Actions result, not as verification of any later code changes.

#### Important current architecture

Authoritative combat history source: state.events.

Authoritative attack event: ATTACK_RESOLUTION, with attacker/target IDs, side, damage/results, before/after snapshots, and resolutionId.

Authoritative charge event: CHARGE_RESOLUTION, with explicit attacker/target IDs, result, optional measured distance, engagement state, and chargeMoveInferred:false for opponent charges.

Authoritative model state remains the existing model-roster/battle-state functions:
- ensureModelRoster
- syncModelRosterBattleState
- setModelDestroyed
- restoreModel
- changeModelWounds
- setUnitDestroyed

#### Important next development/testing task

Do not redesign the Tactical Advisor or create another combat engine.

The next work should be a real playtest and edge-case pass against the new shared resolver, especially:
- my Shooting → opponent casualties
- opponent Shooting → my casualties
- my Charge → opponent engagement
- opponent Charge → my engagement
- my Fight → opponent casualties
- opponent Fight → my casualties
- multiple weapon pools / multiple model rosters
- attached leaders/bodyguards
- mixed-save / Precision / Devastating wounds
- repeated Fight activations and weapon-use accounting
- undo behavior around ATTACK_RESOLUTION and CHARGE_RESOLUTION
- opponent-turn transition back to the player's turn
- Action Log and Combat History consistency after undo / phase transitions

Also inspect whether any remaining helper still assumes my → opp in a path reachable from the opponent shared resolver. Legacy friendly-only Tactical Advisor UI is allowed to retain its my → opponent wrappers; shared execution code is not.

#### Branch / PR

Draft PR #2 exists from feature/opponent-turn-history into feature/tactical-impact-layer. It remains draft / unmerged.

Do not merge or deploy until the bidirectional live playtest is completed and the newest branch HEAD has a fresh successful validation run.
