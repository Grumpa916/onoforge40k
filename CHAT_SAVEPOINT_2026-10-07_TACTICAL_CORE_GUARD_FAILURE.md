# OnoForge 40K Save Point — 2026-10-07 — Tactical Core Guard Failure

## Repository
- Repository: Grumpa916/onoforge40k
- Branch: refactor/clean-reset-monolith
- Main remains untouched.
- Continue incrementally; do not restart, redesign, undo, or re-extract completed work.
- Current strategy: use larger, tightly related extraction batches when safe to reduce elapsed time, but require the monolith-refactor GitHub Actions gate to be GREEN before advancing.

## Current exact checkpoint
Latest branch commit:
- SHA: 4469c4c12fb59a14221a6704da5c9519619e31c2
- Message: test: guard tactical core extraction
- Workflow run: #344
- Result: RED / failure

The preceding Tactical Core commits all passed:
- #340 — 2c9ce20 — refactor: extract tactical core state — GREEN
- #341 — 521b317 — refactor: fix tactical core state dependencies — GREEN
- #342 — b38075d — refactor: complete tactical core dependencies — GREEN
- #343 — 8697299 — refactor: wire tactical core state — GREEN
- #344 — 4469c4c — test: guard tactical core extraction — RED

Math engine checkpoint immediately before Tactical Core:
- #336 — ebd37a5 — refactor: extract math combat engine state — GREEN
- #337 — f9044fe — refactor: wire math combat engine state — GREEN
- #338 — ee33dde — test: guard math combat engine extraction — GREEN
- #339 — f9044fe — refactor: wire math combat engine state — GREEN as shown in GitHub history

## Failure diagnosis
GitHub Actions run #344:
- Run ID: 37674704643
- Workflow: OnoForge Monolith Refactor Tests
- Job: validate
- Job ID: 112975084565
- Failure occurs while loading js/state/tactical-core-state.js in tests/monolith-refactor.test.js.

Exact error:
SyntaxError: Identifier 'parseNum' has already been declared

The failing line in tactical-core-state.js is the destructuring declaration:
const {parseNum,roll,targetNeed,ruleContext,expected,mathRosterEntry,...}=mathCombatEngineStateController;

Cause:
The Tactical Core controller's dependency destructuring at the top of the module also declares several math-engine names, including:
- parseNum
- roll
- targetNeed
- ruleContext
- mathRosterEntry
- combatRootEntry
- attachedCombatEntries
- combatComponentRole
- combatModelSnapshot
- combatSnapshot
- combatTargetUnit
- combatTargetEntry
- combatUnit
- engineApplicableWeaponAbilities
- engineWeaponPoolKey
- engineWeaponVariantKey
- attachedCombatWeaponGroups
- mathUnit
- mathWeaponAlloc
- normalizeMathWeaponForUnit
- and related extracted math helpers

Then the Tactical Core module wires OnoForgeMathCombatEngineState and destructures those same names again. Because both are const declarations in the same module scope, Node's VM loader rejects the module before the test can complete.

This is a narrow guard/runtime syntax problem, not evidence that the extracted math engine itself is broken.

## Tactical Core extraction
The Tactical Core batch extracted a large contiguous cluster from index.html into:
- js/state/tactical-core-state.js

The module exposes:
- window.OnoForgeTacticalCoreState.createTacticalCoreStateController

The guard checks the module and the extracted function names.

Extracted functions include:
- ensureTacticalState
- tacticalDistanceLabel
- tacticalContextHtml
- tacticalCombatFightWeapons
- tacticalOpenFightResolution
- tacticalAdvisorAttackerEntry
- tacticalWeaponIsRanged
- tacticalAdvisorWeaponGroups
- weaponDataIntegrityScan
- weaponDataIntegrityAuditHtml
- tacticalAdvisorAttackerHasRangedWeapons
- setTacticalAdvisorAttacker
- tacticalAdvisorConfidenceLabel
- tacticalPreRollPoolIdentity
- tacticalPreRollNormalizePoolAllocations
- tacticalPreRollPoolAvailableModelIds
- tacticalPreRollPoolManifest
- setTacticalPreRollPoolTarget
- setTacticalPreRollPoolAllocation
- tacticalPreRollWeaponState
- setTacticalPreRollWeapon

## Important attempted fix
The next fix was identified but NOT successfully committed.

Current tactical-core-state.js blob SHA at commit 4469c4c:
- 3051dfa8ffddec0eafe55d67b590791b3c25bc6b

Intended fix:
Remove the duplicate math-engine names from the controller's incoming dependency destructuring, while retaining the actual math-engine controller wiring/destructuring later in the module.

The intended top dependency block should no longer destructure the extracted math functions. Keep only the underlying dependencies actually needed by Tactical Core, then let the existing:
const {createMathCombatEngineStateController}=window.OnoForgeMathCombatEngineState;
...
const {parseNum,roll,...}=mathCombatEngineStateController;
provide those functions.

The attempted GitHub update was blocked by the tool safety layer, so NO fix commit was created. The branch therefore still points to 4469c4c12fb59a14221a6704da5c9519619e31c2.

## Prior completed work
Tactical Advisor context extraction:
- a13b6f5 — extract tactical advisor context state
- 82ababd — wire tactical advisor context state
- 0057d74 — guard tactical advisor context extraction
- Run #335 GREEN

Tactical pre-roll resolution extraction:
- 0593f2e — extract tactical pre-roll resolution state
- 0d079b7 — wire tactical pre-roll resolution state
- 5f83f18 — guard tactical pre-roll resolution extraction
- Run #332 GREEN

Tactical Advisor render cluster:
- 83e17f1 — extract tactical advisor render state
- 605a183 — tighten tactical advisor render dependencies
- 5a4d421 — wire tactical advisor render state
- a8bbc05 — guard tactical advisor render extraction
- Run #329 GREEN

Opponent turn capture:
- a349f73 — extract opponent turn capture state
- 8faaa33 — wire opponent turn capture state
- 49a6203 — guard opponent turn capture extraction
- Run #324 GREEN

Tactical combat state:
- 0959131 — extract tactical combat state cluster
- 4cdbb66 — wire tactical combat state cluster
- afb7efa — guard tactical combat state extraction
- Run #321 GREEN

## Next action
1. Apply the narrow duplicate-dependency fix to js/state/tactical-core-state.js on refactor/clean-reset-monolith.
2. Let GitHub Actions run automatically.
3. Verify the new run is GREEN.
4. If GREEN, do not redo the Tactical Core extraction; continue to the next planned contiguous monolith cluster.
5. If RED, inspect the exact Actions job logs before changing anything else.
6. Preserve all browser-verified behavior and existing extracted modules.

## Working rules
- Do not touch main.
- Do not restart or redesign the refactor.
- Do not re-extract completed modules.
- Prefer grouped, tightly related extraction batches when safe.
- Use GitHub Actions as the authoritative gate.
- Avoid unnecessary user verification steps; inspect GitHub directly whenever possible.
- Browser behavior already verified must remain unchanged.

## New-chat continuation prompt
Resume the OnoForge 40K monolith-refactor project from this exact save point.

Repository: Grumpa916/onoforge40k
Branch: refactor/clean-reset-monolith
Current HEAD: 4469c4c12fb59a14221a6704da5c9519619e31c2
Current workflow: #344 RED

Do NOT restart, redesign, undo, or re-extract completed work.

Read this save point first:
CHAT_SAVEPOINT_2026-10-07_TACTICAL_CORE_GUARD_FAILURE.md

The immediate failure is diagnosed. GitHub Actions #344 fails while VM-loading js/state/tactical-core-state.js with:
SyntaxError: Identifier 'parseNum' has already been declared

Cause: Tactical Core destructures math-engine function names as controller dependencies near the top of the module, then destructures the same names again from OnoForgeMathCombatEngineState later in the module.

Immediate task:
- Remove the duplicate extracted math-function names from the top dependency destructuring in js/state/tactical-core-state.js.
- Keep the existing math-engine controller wiring and its destructuring.
- Commit the narrow fix on refactor/clean-reset-monolith.
- Verify the resulting GitHub Actions run.
- Continue only after GREEN.

The attempted fix was identified but not committed because the previous GitHub write was blocked by the tool safety layer. The branch is still exactly at 4469c4c.

Do not ask me to manually verify GitHub unless necessary. Inspect Actions directly and proceed.
