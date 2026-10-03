# OnoForge 40K — Chat Transition Save Point

Date: 2026-09-27 / 2026-09-28 UTC
Repository: Grumpa916/onoforge40k
Development branch: feature/opponent-turn-history
Base branch: feature/tactical-impact-layer
Known-good baseline: 6969ac316727c100c1092c1724f33a81a016dc18
Current branch HEAD: 132551b340bdff635eeb9b193470f2c1a8e46ccd
Current branch delta from baseline: 34 commits ahead, 0 behind
Draft PR: #2 — feature/opponent-turn-history → feature/tactical-impact-layer
PR state: open, draft, unmerged
Merge/deploy: not authorized without explicit user instruction

## Current status

The branch contains the completed bidirectional combat continuation. The current HEAD is a documentation checkpoint for the work already present on the branch.

Latest three GitHub validation lanes for the current HEAD are green:
- validate: success
- validate: success
- validate: success

## Completed work

### Shared physical-dice combat resolver
- The authoritative physical-dice resolution session is side-aware.
- attackerSide and targetSide are stored on the session.
- The same resolver supports my → opponent and opponent → my attacks.
- Session keys include both sides to prevent directional collisions.
- Save groups, snapshots, model allocation, mixed-save handling, Precision, variable damage, Devastating resolution, and weapon pools were generalized where required.
- ATTACK_RESOLUTION carries resolutionId and authoritative attack side.
- Physical dice remain authoritative; actual gameplay resolution does not use random simulation.

### Fight Execution
- The old Friendly Fight / Enemy Fight Back marker-button flow has been replaced.
- Friendly melee uses the shared physical-dice resolver.
- Enemy melee uses the same resolver in the opposite direction.
- Actual casualties update the canonical model roster / battle state.
- Fight completion is tied to actual ATTACK_RESOLUTION events.
- Pile-in and consolidation remain explicit observed state; they are not inferred.

### Opponent-turn capture
- Opponent Shooting: select enemy shooter, friendly target, and weapon profile, then enter physical dice through the shared resolver.
- Opponent Charge: record enemy charging unit, friendly target(s), explicit Successful/Failed result, optional required roll/rolled total, optional measured distance, engagement state, and movement-observed state.
- Opponent Charge never infers exact movement distance from the 2D6 roll.
- Opponent Fight: select enemy fighter, friendly target, and melee weapon, then enter physical dice through the same resolver.
- Pile-in and consolidation can be recorded explicitly for both sides.
- Only one Tactical Advisor surface exists.

### Combat History
- Authoritative history source is state.events / Action Log.
- Combat History is a read-only derived view.
- No persistent duplicate state.combatHistory store is used.
- opponent-turn-event-layer.js is a read-only normalization adapter; it does not replace or wrap the event logger and does not resolve combat.
- opponent-turn-capture.js is retained as a compatibility shim; production opponent capture UI is in index.html.

### Bidirectional history now supported
- my shooting → enemy casualties
- enemy shooting → my casualties
- my charge → enemy engagement
- enemy charge → my engagement
- my melee → enemy casualties
- enemy melee → my casualties

## Canonical state primitives

Continue using the existing authoritative functions:
- ensureModelRoster
- syncModelRosterBattleState
- setModelDestroyed
- restoreModel
- changeModelWounds
- setUnitDestroyed

Do not create parallel wound/casualty state.

## Important shared resolver functions

- combatSnapshot
- combatTargetUnit
- attachedCombatWeaponGroups
- tacticalWeaponPhaseEligible
- tacticalPreRollCheck
- tacticalPreRollResolutionPlan
- tacticalPreRollOpenResolutionForSides
- tacticalPreRollResolutionCurrent
- tacticalPreRollResolutionSet
- tacticalPreRollResolutionBack
- tacticalPreRollApplyResolution

## Important event contracts

ATTACK_RESOLUTION:
- authoritative actual attack resolution
- explicit attacker / target identity
- explicit side
- damage/results
- before/after context
- resolutionId

CHARGE_RESOLUTION:
- authoritative charge result
- explicit attacker / target identity
- explicit Successful/Failed result
- optional measured distance
- explicit engagement state
- opponent capture preserves chargeMoveInferred:false

## Known constraints

- Unknown tabletop facts must remain unknown.
- Approximate map geometry is not the same as exact physical tabletop measurement.
- Projected damage is never actual resolved damage.
- Friendly-only Tactical Advisor presentation wrappers may retain my → opponent compatibility behavior.
- Any helper reachable from shared opponent execution must be side-aware.
- Do not create a second combat engine or second Tactical Advisor.

## Immediate next task

Stop adding architecture unless a real failing scenario requires it. Run a real playtest and edge-case pass against the new bidirectional execution.

Required test sequence:
1. My Shooting → enemy casualties; verify model roster, ATTACK_RESOLUTION, Action Log, Combat History, undo.
2. Opponent Shooting → my casualties; verify the same in reverse direction.
3. My Charge → enemy engagement; verify successful target state and Fight eligibility.
4. Opponent Charge → my engagement; verify selected targets, engagement state, and no inferred distance.
5. My Fight → enemy casualties; verify physical dice, actual state change, and weapon-use accounting.
6. Opponent Fight → my casualties; verify the same in reverse direction.
7. Multiple weapon pools and exact model IDs.
8. Attached leaders/bodyguards and target allocation.
9. Mixed saves, Precision, and Devastating resolution.
10. Repeated Fight activations and directional weapon-use accounting.
11. Undo after ATTACK_RESOLUTION and CHARGE_RESOLUTION.
12. Finish opponent turn and verify return to the player's next Command phase without state drift.

## Current live-test priority

Use a controlled test battle and verify actual model/wound changes, not projections only.
Start with the simplest my → opponent melee case, then repeat the exact case opponent → my.

## Branch protection / merge discipline

- Do not merge PR #2.
- Do not merge to main.
- Do not deploy.
- Do not collapse the feature branch back into the old Fight marker design.
- Keep feature/opponent-turn-history isolated until live validation is complete.

## Next-chat start prompt

Resume OnoForge 40K from CHAT_SAVEPOINT_2026-09-27_BIDIRECTIONAL_COMBAT.md.
Read this save point, NEXT_CHAT_HANDOFF.md, DEVELOPMENT_GUIDE.md, the relevant ROADMAP section, and the original project handoff.
Verify repository Grumpa916/onoforge40k, branch feature/opponent-turn-history, HEAD 132551b340bdff635eeb9b193470f2c1a8e46ccd, and baseline 6969ac316727c100c1092c1724f33a81a016dc18.
Verify that the latest three GitHub validation lanes for the current HEAD are green.
Do not restart architecture planning.
Do not create another Tactical Advisor or another combat engine.
Continue directly with the bidirectional combat live/edge-case playtest:
my Shooting → enemy casualties; opponent Shooting → my casualties; my Charge → enemy engagement; opponent Charge → my engagement; my Fight → enemy casualties; opponent Fight → my casualties; then multiple pools, attached leaders/bodyguards, mixed saves/Precision/Devastating, repeated Fight activations, undo, and turn transition.
When a test fails, inspect the exact helper and make the smallest side-aware fix necessary.
Do not merge or deploy.