# NEXT_CHAT_HANDOFF

## OnoForge 40K — UI / Tactical Advisor Save Point
Date: 2026-09-27

### Current branch
`feature/tactical-impact-layer`

### Current purpose
Resume the Tactical Advisor / Charge workflow integration without losing the current debugging state.

### Major UI milestone reached
The duplicate Tactical Advisor problem is resolved in the latest tested preview.

The Battle UI now presents **one visible Tactical Advisor** rather than:
1. a separate top-level Tactical Impact/Tactical Advisor renderer, and
2. the authoritative Tactical Advisor card.

This was achieved by moving the Tactical Impact rendering into the canonical Advisor surface rather than trying to hide a duplicate renderer.

### Current integrated UI
Inside the single Tactical Advisor, the preview now shows:
- Objective priorities
- Recommended target
- Expected damage / models killed / confidence
- Tactical Impact Analysis
- Charge analysis
- 2D6 charge success probability
- Physical-distance confirmation
- Charge execution controls

### Verified by user
Using the preview generated from the earlier validated commits:
- Single Tactical Advisor display: **confirmed**
- Tactical Impact Analysis appears inside the Advisor: **confirmed**
- Charge-specific analysis appears inside the Advisor: **confirmed**
- 5" measured distance in Tactical Context feeds Tactical Impact correctly: **confirmed**
- Display changed to **“physical distance confirmed”**
- 2D6 success chance for the 5" example displayed as **83%**
- Charge execution buttons (**Charge Successful / Charge Failed**) are now visible

### Last observed failure
When the user clicked **Charge Successful**, the UI reported:

> Charge results can only be recorded during your Charge phase.

The user was visibly in the Charge phase.

### Root cause found
The Charge workflow was reading `global.state` directly while the application’s authoritative runtime state is `global.ONOFORGE_APP_STATE`.

The visible UI was in Charge, but the workflow gate could see the wrong/empty phase.

### Latest code fix
Commit:
`9ff959806f0f14aa0b1a4be4b890445ee6e96a18`

Message:
**Use canonical app state for Charge result validation**

This changed the Charge workflow to use:
`global.ONOFORGE_APP_STATE || global.state`

for:
- phase
- current turn
- tactical selected attacker
- target lookup
- current round

### Latest validation status
At save-point creation, the following workflows were queued for commit `9ff95980`:
- Tactical Advisor Preview Validation **#140**
- Tactical Advisor Tests **#150**
- Tactical Advisor Surface Fix Preview **#14**

Do NOT reuse an older preview artifact for Charge-result testing.

### Immediate next step
Wait for Preview Validation **#140** to complete successfully.

Then download that run’s `onoforge40k-tactical-advisor-preview` artifact and test:

1. Confirm Battle loads without an error.
2. Confirm one Tactical Advisor is visible.
3. Confirm Tactical Impact Analysis is inside it.
4. Confirm 5" still shows **physical distance confirmed**.
5. Confirm Charge execution controls appear.
6. Check **Aggressor Squad**.
7. Click **Charge Successful**.
8. STOP and inspect the resulting Advisor state before advancing to Fight.

### Expected result after Charge Successful
The Advisor should replace the unrecorded Charge execution controls with a recorded-state message equivalent to:

**Charge recorded: Successful — Aggressor Squad**

The unit’s tactical action state should reflect:
- `chargeDone: true`
- `chargeMade: true`
- selected target recorded
- engagement state updated for the selected target
- Fight-phase state initialized for the charged unit

### Do not do yet
Do not:
- merge the feature branch to `main`
- deploy to production
- redesign the Advisor layout again
- remove the Tactical Context section
- advance to Fight testing until Charge result recording is verified

### Known non-blocking issue
For the Aggressor Squad example, Tactical Impact currently reports incomplete projected Fight output / incomplete unit-profile information for that candidate. This is being handled as a graceful fallback rather than a page-breaking error.

Important distinction:
- Charge probability + measured-distance flow is working.
- Deep projected Fight damage/return-damage completeness is a separate issue.

### Important architecture lesson
The earlier duplicate-display attempts failed because a separate injected renderer host was repeatedly recreated by the Battle renderer. The stable solution is:

**canonical Tactical Advisor owns the surface; Tactical Impact augments that surface directly.**

Do not revert to sibling/staging-host architecture.

### Useful recent commits
- `0300c7fb` — Honor canonical measured charge distance in Tactical Impact
- `55a394e3` — Add Charge execution controls to canonical Advisor
- `3c33c239` — Harden Tactical Impact against incomplete combat profiles
- `2d30f028` — Integrate Tactical Impact analysis into authoritative Advisor
- `b6e2c716` — Disable legacy preview renderer when canonical Advisor is active
- `2358b54e` — Remove legacy Tactical Advisor surface remount bridge
- `9ff95980` — Use canonical app state for Charge result validation

### Repository / PR
Repository: `Grumpa916/onoforge40k`
PR: #1
Feature branch: `feature/tactical-impact-layer`

### Save-point rule
Resume from commit `9ff959806f0f14aa0b1a4be4b890445ee6e96a18` and use the next successful Preview Validation artifact for testing.
