# OnoForge 40K — Chat Save Point: Test 2 Resolver Entry Fix

Date: 2026-09-29 UTC
Repository: `Grumpa916/onoforge40k`
Branch: `feature/opponent-turn-history`
Current HEAD: `acd653e97343f9dbaeaf273041f4ce7f8ee848ce`
Known-good baseline: `6969ac316727c100c1092c1724f33a81a016dc18`
Draft PR #2: open, draft, unmerged
Merge/deploy: not authorized

## Verified prior progress

Test 1 — My Shooting → opponent casualties — is a confirmed live PASS.

Exocrine → Aggressor Squad through the physical-dice resolver produced an ATTACK_RESOLUTION and changed the canonical opponent roster from 3/3 models, 9/9 wounds, Alive to 0/3 models, 0/9 wounds, Destroyed. This was recorded in:
`CHAT_SAVEPOINT_2026-09-28_BIDIRECTIONAL_TEST1_PASS.md`

Do not repeat Test 1.

## Test 2 discovery

During Test 2 setup, Opponent Shooting capture was able to select:
- Hellblaster Squad
- Tyrannofex
- Bolt Pistol

but the shared physical-dice resolver did not become visible.

Source inspection of the exact validated branch state identified the remaining issue:

`tacticalPreRollOpenResolutionForSides()` could create an opponent observed-resolution session, but `tacticalPreRollResolutionCurrent()` subsequently required the normal Tactical Advisor status `ready` / `ready-with-warnings`. An observed opponent capture can legitimately have unresolved advisory battlefield context, so the newly opened session was discarded by the render path.

This was a render/session-continuity bug, not a second combat engine issue.

## Fix applied

Production change:
- `tacticalPreRollOpenResolutionForSides(..., allowObservedContext=false)` now records `session.allowObservedContext`.
- `tacticalPreRollResolutionCurrent()` permits a session with `allowObservedContext=true` to remain renderable even when normal pre-roll status is not ready.
- Existing shared physical-dice resolution remains authoritative.
- Opponent Shooting capture invokes the shared resolver with explicit observed-capture mode.
- Genuine target legality remains governed by the existing resolver path; no duplicate opponent resolver was created.

Regression coverage was extended to verify:
- explicit observed-capture resolver mode exists
- opponent Shooting capture invokes that mode
- observed sessions remain renderable after opening

## Validation

For current HEAD `acd653e97343f9dbaeaf273041f4ce7f8ee848ce`:
- Tactical Advisor Preview Validation #191 — success
- Opponent Turn Event Capture Preview #95 — success

## Immediate next step

Do one live Test 2 entry check using the exact current HEAD build.

Scenario:
Opponent turn → Shooting → Hellblaster Squad → Tyrannofex → Bolt Pistol → Enter Opponent Shooting Dice

First checkpoint only:
**the shared physical-dice resolver must open and remain visible.**

Do not enter dice until the resolver is visibly open.

If it opens, proceed with one physical-dice result that causes at least 1 actual wound/damage to the Tyrannofex, then verify:
- ATTACK_RESOLUTION
- actual friendly roster/wound mutation
- model detail
- Action Log
- Combat History

Do not manually alter wounds/models.

## Constraints

- No second combat engine.
- No second Tactical Advisor.
- No duplicate history store.
- Do not treat projected damage as actual damage.
- Do not infer unknown tabletop facts.
- Do not merge PR #2.
- Do not deploy.

## Resume prompt

Resume OnoForge 40K from `CHAT_SAVEPOINT_2026-09-28_TEST2_RESOLVER_ENTRY_FIX.md`.

Current HEAD: `acd653e97343f9dbaeaf273041f4ce7f8ee848ce`.
Test 1 is already a confirmed live PASS and must not be repeated.
The Test 2 entry-path bug was isolated to the render path discarding an observed opponent resolver session because it required normal Tactical Advisor readiness. That was fixed and CI is green.

Perform one live Test 2 resolver-entry check, then one actual opponent Shooting → my casualties transaction if the resolver opens. Avoid unnecessary repeat testing or architecture changes.
