# OnoForge 40K Save Point — 2026-10-07

## Repository / authoritative branch
- Repository: `Grumpa916/onoforge40k`
- Authoritative branch: `refactor/clean-reset-monolith`
- Main remains untouched.
- Continue from the live branch; do not revert to older save points or duplicate newer commits.
- Do not require local Python.
- Preserve browser-verified behavior.
- User prefers aggressive, incremental extraction rather than tiny renderer-by-renderer work.
- Do not repeat routine verification unless a new change affects it or a failure requires diagnosis.

## Current state at save point
- Last functional/refactor commit before this save-point commit: `95135f449094c5d27c950a79b1881c279291e17b`
- Commit message: `test: fix opponent turn tracking behavioral guard`
- Current `index.html` blob before this save-point commit: `593a1521ab7f59827459e8378a64e815f73ded3b`
- Current `index.html` size: approximately 1,006,711 bytes.
- The next save-point commit will only document state; it must not alter application behavior.

## Important CI failure and resolution
Two recent GitHub Actions runs appeared red:
- #297: `test: guard opponent turn tracking extraction`
- #298: `test: finalize opponent turn tracking guard`

The failure was diagnosed from the GitHub Actions log. The new opponent-turn behavioral test had an inverted assertion:
`opponentTurnTrackingHtml() !== ''` caused failure when the renderer correctly returned its Command-phase card.

The corrective commit is:
- `95135f449094c5d27c950a79b1881c279291e17b`
- `test: fix opponent turn tracking behavioral guard`

Correct assertion now checks that the output contains `Opponent Turn Tracking`.

Important:
- #297 and #298 remain historically red; they are not retroactively changed.
- The corrected commit is the verification point for resolving both failures.
- Do not proceed with further extraction if the corrected commit's Actions run is actually red; diagnose/fix first.
- Do not claim Actions are green unless the GitHub UI/run confirms it. The GitHub connector previously failed to expose push-triggered workflow runs reliably, so use visible Actions evidence when necessary.

## Completed monolith extractions relevant to this checkpoint

### Earlier completed modules
- `js/data/bsdata-parser.js`
- `js/utils/pure-utils.js`
- `js/state/reserve-state.js`
- terrain reference image extraction
- objective geometry/tracked identity
- objective canonical labels
- objective map entries
- `army-no-mans-land-tags-state.js`
- `objective-map-placement-panel-state.js`
- `reserve-tray-state.js`
- `deployment-plan-map-controls-state.js`
- `deployment-plan-position-editor-state.js`
- `deployment-status-state.js`
- `tournament-deployment-validation-state.js`
- `tournament-setup-checklist-state.js`
- other existing objective/deployment/transport/stratagem/game-timer/phase-CP/ledger/scoring modules already on the live branch.

Do NOT re-extract or duplicate completed modules.

### Tournament setup checklist
Module:
- `js/state/tournament-setup-checklist-state.js`

Relevant commits:
- `04f788562a821cc5ebcefd2020848fe7379b842` — create
- `ca91b125b04c3093a9f19e66b557cda9780dab47` — wiring
- `dde349783203c43dbec05103b5455622ff82bbc1` — test
- `418f1ae7fa35b486dd722c6a0567548462e03e13` — script marker guard
- `d24fb512b89bf2b8c8137166a846d0c6c73fb6a0` — inline removal

### Aggressive renderer pass
Extracted:
1. Battle end summary
2. Primary mission rules
3. Game reference editor
4. Game assistant

Modules:
- `js/state/battle-end-summary-state.js`
- `js/state/primary-mission-rules-state.js`
- `js/state/game-reference-editor-state.js`
- `js/state/game-assistant-state.js`

Create commits:
- `7841ea8fb1dd361ddb0ec146a3fb74603f09c686`
- `86763b92e53c725034c4f26c0218f428cb63c688`
- `79a3dd90fe2d9a3329f6ba0d0d7392759d8d227c`
- `ebc5f7b95287acbdf305a3da7b2b4d51375bec5e`

Wiring/removal:
- `ec02fcbf53667fbdfc67893300468cd9d64ce8b4`

Tests:
- `4364e28867ce6299b057b687e84bc0681307d4c5`

### Tactical pre-roll
Target was approximately 7.1 KB.

Module:
- `js/state/tactical-pre-roll-state.js`

Commits:
- `0992577307419fd61ecc620214ffc6b97e6996c1` — create
- `023aff7a339efa9be8d55d34273985733958cd57` — fixed extracted body using `state()` rather than an undefined direct `state`
- `c1ebad1e44384d8d71e1e880ad63aff8ff144f42` — index wiring/removal
- `90958eb3cae85a4097d7c4388b003a3f9aaf3319` — tests

Current module blob at that point:
- `8b0352ce474792dda17257fad95da75d919f93b0`

### Tactical advisor
Target was approximately 13.2 KB.

Module:
- `js/state/tactical-advisor-state.js`

Commits:
- `c9e80e084da882729e39b4f492f22b710d9b8c0b` — create
- `4f56daa5dcd92f586ca0204f13fcb9b5917a7841` — wiring/removal

Verified command-phase behavior and module exposure.

### Opponent turn tracking
Target was approximately 11.2 KB.

Module:
- `js/state/opponent-turn-tracking-state.js`

Create:
- `383590e786100a0e83b06bbd090bb010d5c4d078`

Wiring/removal:
- `c3d42198935a885c1e1de6118b2d6bdb2e254ef3`

Test correction:
- `c9acad21fedefb42ded5597ef461954040150b0f` — this was the flawed behavioral guard and is red.

Final correction:
- `95135f449094c5d27c950a79b1881c279291e17b` — corrected behavioral guard.

The opponent renderer preserves important live-game behavior:
- Command tracking
- Movement choices
- Opponent shooting: shooter → weapon → friendly target → actual damage
- Opponent charge: charging unit → declared friendly targets → observed/measured facts
- Opponent fight: enemy attacker → weapon → friendly target → actual damage plus pile-in/consolidation tracking
- Shared physical-dice resolver paths
- Friendly roster/casualty updates
- Tactical Advisor history support.

## Safeguard for index.html
The user explicitly requires:
- Never trust an empty `fetch_file` result.
- Before changing `index.html`, fetch current content and blob SHA.
- Preserve exact current blob SHA when updating.
- Current live `index.html` before this documentation commit was non-empty and blob `593a1521ab7f59827459e8378a64e815f73ded3b`.

## Next extraction target analysis
The first inspection after the corrected opponent-turn guard identified the largest remaining functions in `index.html`:
- `previousPhase` ~70.6 KB — very large/high coupling; do not blindly extract.
- `esc` ~39.6 KB — utility with very broad coupling; do not blindly extract.
- `secondaryPersonalPlanHtml` ~35.6 KB — large renderer candidate, but inspect dependencies before extraction.
- `useStratagemByName` ~28.8 KB — likely logic-heavy; inspect before extraction.
- `tacticalAdvisorV2` ~22.8 KB — logic-heavy.
- `tacticalPreRollResolutionSet` ~17.2 KB — logic-heavy.
- `tacticalPreRollResolutionModal` ~13.7 KB — possible renderer candidate.
- `tacticalContextHtmlBody` ~12.1 KB — promising renderer candidate.
- `resolveAttack` ~8.7 KB — logic-heavy.
- `tacticalTargetLegality` ~8.1 KB — logic-heavy.
- `startBattle` ~7.0 KB
- `battle` ~6.8 KB
- `load` ~6.7 KB
- `engineOneAttack` ~6.6 KB
- `weaponDataIntegrityScan` ~5.9 KB
- `scorePrimaryItem` ~5.7 KB
- `setup` ~5.6 KB
- `tacticalPreRollApplyResolution` ~5.6 KB
- `unitRow` ~5.5 KB

Recommended next approach:
1. Confirm corrected Actions status first.
2. Then inspect `secondaryPersonalPlanHtml`, `tacticalPreRollResolutionModal`, and `tacticalContextHtmlBody` for dependency density.
3. Prefer the largest renderer that has manageable dependencies.
4. Avoid extracting giant/high-coupling functions like `previousPhase` or `esc` without a dependency plan.
5. Continue aggressively once the next target is selected.
6. Do not re-extract anything already completed.

## Product / functional requirements to preserve
- Main untouched.
- Deployment-zone enforcement remains removed; units can be placed anywhere.
- Units can move in/out of reserves.
- Unit state persists through phases/turns.
- Objective control persists.
- Live deployment map remains open when army selection changes.
- Start Battle goes directly to Battle Mode.
- Unit name opens full reference; second tap closes.
- Objective Control buttons work.
- Battlefield objective identities remain corrected.
- Game timer, friendly/opponent clocks, pause/resume, turn switching, and accumulated time behavior remain intact.
- Opponent-turn events must feed authoritative history for Tactical Advisor.
- Live combat data entry should record combat events, not individual dice rolls:
  - Shooting: Shooter → Weapon → Target → Actual Damage
  - Fight: Attacker → Weapon → Target → Actual Damage
- Tactical advice should account for distance/eligibility and Tyranid-specific considerations such as Shadow in the Warp and command-phase scoring.
- Avoid forcing users to enter every modifier/dice roll during live play.

## Testing environment
- Primary browser verification: iPad Safari.
- GitHub HTML Preview has been used for live testing.
- User does not have Python installed locally; do not require it.

## New-chat continuation prompt

Resume the OnoForge 40K monolith-refactor project from this exact save point.

Repository: `Grumpa916/onoforge40k`
Authoritative branch: `refactor/clean-reset-monolith`

Read this save point first:
`CHAT_SAVEPOINT_2026-10-07_MONOLITH_REFACTOR.md`

The latest application/test correction commit before the save-point documentation commit is:
`95135f449094c5d27c950a79b1881c279291e17b`
Message: `test: fix opponent turn tracking behavioral guard`

Do NOT restart, redesign, undo, or re-extract completed work.
Do NOT duplicate newer commits.
Keep main untouched.
Do not require local Python.
Preserve browser-verified behavior.

Two recent Actions failures (#297 and #298) were diagnosed. The failure was an inverted opponent-turn command-phase assertion. Commit `95135f4` corrected it. Treat the corrected commit's Actions result as the CI gate before further extraction. Do not claim green unless confirmed.

Continue using the aggressive extraction strategy. The next inspection found these large remaining functions:
- previousPhase ~70.6 KB — too coupled to extract blindly
- esc ~39.6 KB — too coupled to extract blindly
- secondaryPersonalPlanHtml ~35.6 KB — inspect dependencies
- useStratagemByName ~28.8 KB — inspect dependencies
- tacticalAdvisorV2 ~22.8 KB — inspect dependencies
- tacticalPreRollResolutionSet ~17.2 KB — logic-heavy
- tacticalPreRollResolutionModal ~13.7 KB — promising renderer candidate
- tacticalContextHtmlBody ~12.1 KB — promising renderer candidate

Select the best large, self-contained renderer after dependency inspection and continue without unnecessary verification pauses. Before any `index.html` update, fetch its current non-empty content and exact blob SHA and preserve that SHA.

Remember that opponent-turn tracking is now extracted into:
`js/state/opponent-turn-tracking-state.js`

Preserve all existing Tactical Advisor/opponent-turn capture behavior and all previously verified UI/gameplay behavior.
