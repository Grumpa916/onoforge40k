<!-- LATEST CHAT TRANSFER NOTICE -->

## Latest authoritative chat-transition checkpoint

Use `CHAT_SAVEPOINT_2026-09-27_BIDIRECTIONAL_COMBAT.md` as the primary resume document.

Current development branch: `feature/opponent-turn-history`
Current HEAD: `132551b340bdff635eeb9b193470f2c1a8e46ccd`
Known-good baseline: `6969ac316727c100c1092c1724f33a81a016dc18`
Draft PR: #2, open/draft/unmerged
Latest three validation lanes for current HEAD: all successful.

Do not assume the older checkpoint described later in this document is the current code state.

# OnoForge 40K — Current Session Handoff

Updated: 2026-09-26
Repository: Grumpa916/onoforge40k
Branch: feature/tactical-impact-layer

## North Star

The original source for project intent is the conversation handoff document:
OnoForge_40K_Project_Handoff_Document.docx.

Its core product philosophy is:
- tablet-first tournament workflow
- fast data entry during live games
- reduce player bookkeeping
- surface phase-relevant information
- complete the actual game loop before expanding advanced systems
- make one complete game action work, test it live, then expand

Do not allow audit minutia, architecture work, or historical task bookkeeping to displace actual playable-app development.

## Current verified status

The live Shooting workflow was completed and tested:
Shooting → Exocrine → Lieutenant → 15" → LOS Yes → Bio-plasmic Cannon
→ Pre-Roll → physical dice → hits → wounds → saves → resolution review → damage → casualty → Action Log.

The shooting test also exposed and fixed model identity mismatch between generic combat-snapshot model IDs (<uid>-model-N) and persistent model roster IDs (<uid>-mN).

Recent Charge-phase improvements verified live:
- Charge phase opens normally.
- Tactical Advisor attacker can be changed without getting stuck.
- Tactical Context enemy target can be changed independently.
- Moving units on the authoritative battlefield map updates distance/eligibility immediately.
- Tactical Advisor cache now invalidates when battlefieldUnitPositions changes.
- Charge context defaults “Already engaged with this target?” to No.
- When no legal charge target exists, the Advisor still exposes the attacker selector instead of trapping the user.

Most recent gameplay fix:
93c7ec998e3ca25e0bc984540021be2fdddd0926
“Refresh Tactical Advisor cache when map positions move”

## Current Charge-phase understanding

The Charge phase needs to become a real gameplay workflow, not just a calculator.

Important rules/workflow clarification:
- The app should not create a pre-roll locked list of charge declarations.
- Before rolling, the Tactical Advisor should show potential targets worth considering.
- The player physically measures the actual tabletop distance to potential targets.
- The physical measurement should be the authoritative charge-distance input for the calculator.
- The map position is useful for rough positioning and automatic context, but it is not the exact tabletop measurement.
- A 2D6 charge roll has a fixed success probability for a given required result; repeated dice simulation is unnecessary in the live workflow.
- The live workflow should not require entering individual physical dice results unless later found useful.
- Preferred live recording is:
  1. Declare/attempt charge
  2. Physically roll 2D6
  3. Tap “Charge Successful” or “Charge Failed”
  4. If successful, select the actual charge target(s) after the roll
  5. Confirm and carry the charge state into Fight
- Failed charges should be recorded as events for later post-game statistics, but deliberate non-charges should be distinguishable from actual failed rolls/failed charge attempts.

## Tactical Advisor intent

The Tactical Advisor is not intended to answer only “What can I kill?”

Its original product intent is to identify actions/targets that are tactically significant and impactful in the context of the current game state.

For Charge specifically, the Advisor should answer:
“Which enemy units are worth considering for engagement, given my current unit, the target’s current state, the mission/objectives, and the likely outcome of the ensuing Fight phase?”

Charge recommendations should therefore consider:
- current charging-unit state
- current target state
- actual measured charge distance
- charge eligibility
- projected Fight-phase output from the charging unit
- projected melee return from the target
- expected casualties/survival on both sides
- objective control and mission consequences
- primary/secondary scoring impact where determinable
- broader game-state consequences such as CP/stratagem context where relevant

### Important current implementation gap

The current Charge recommendation code does include:
- charge legality
- measured/map-derived distance
- required charge distance
- fixed 2D6 success probability
- target durability
- target objective value when explicit objective context is recorded
- a counter-attack potential indicator

However, it does NOT yet fully expose the desired projected Fight exchange (expected damage/models lost both ways), and it does not yet fully incorporate the broader primary-scoring impact logic into the Charge recommendation score.

Existing code already contains broader tactical objective/mission impact helpers, so the next Charge work should reuse them rather than inventing a separate tactical scoring system.

## Immediate product objective

Complete Charge as a usable tournament phase:

Tactical Advisor:
measured distances → tactically meaningful potential targets → projected Fight exchange → mission/objective consequence

Then:
attempt charge → physical 2D6 → record Success/Failed → select actual target(s) after successful roll → save authoritative charge state

Then Fight:
use the recorded successful charge/target state automatically, including Fights First and the relevant enemy targets.

## Map UX direction

The current battlefield map is too small/hard to read on the active Battle Mode screen.

Agreed direction:
- make the battlefield map the primary visual workspace
- give it substantially more width/height on tablet/landscape layouts
- enlarge unit markers and marker text
- use compact readable labels rather than squeezing full unit names into tokens
- emphasize the selected unit
- maintain strong visual distinction between units and objectives
- consider an optional Expand Map/fullscreen mode
- do not globally enlarge every UI element; keep tactical/scoring panels compact

This should be a focused UX batch, not a broad redesign.

## Next development sequence

1. Finish Charge Advisor decision surface:
   - replace misleading 0.0W / 0.0 models in Charge cards
   - show projected Fight damage both directions
   - include target survivability/casualties
   - surface tactical/mission significance clearly
2. Add exact measured charge-distance entry as the authoritative charge-distance value.
3. Build lightweight Charge result recording:
   - Charge Successful
   - Charge Failed
   - successful-charge target selection after the roll
4. Carry successful charge state into Fight.
5. Live-test the complete Charge workflow.
6. Then move directly to Fight.

## Session behavior

When a new chat starts:
- read this file
- read DEVELOPMENT_GUIDE.md
- read the relevant ROADMAP.md section
- use the original handoff document as the product North Star
- state the immediate product objective before making changes

Do not restart planning from scratch and do not turn the session into an audit project.


## Tactical Advisor Engagement Layer — Current Session Update

### Completed in this session
- Added `tactical-advisor-engine.js` as an isolated pure engagement evaluator.
- Added `tactical-advisor-adapter.js` to translate existing Advisor recommendations into evaluator inputs.
- Added evaluator and adapter regression tests.
- Added explicit separation between approximate map geometry and authoritative physical measurement.
- Added context-derived turn urgency; no manual urgency input is required by the integration layer.
- Added non-mutating comparison mode: the existing Advisor recommendation order remains authoritative while the new Tactical Impact Layer evaluates the same candidate set separately.
- Added deployment-pipeline injection so the evaluator and adapter are available to the battle-page comparison surface without modifying the 1 MB `index.html` source directly.
- Added a deployment-preview validation workflow.
- CI validation for the evaluator and adapter passes.
- Deployment-preview static validation passed on the latest completed preview run.
- Corrected a renderer variable regression during integration before release.

### Current comparison behavior
The battle-page comparison surface is designed to show:
1. Existing Tactical Advisor leader and score.
2. Tactical Impact Layer leader and tactical-impact score/type.
3. Tactical-layer reasons.
4. A clear notice when the new layer would change the leading candidate.
5. A physical-measurement warning when execution geometry is not authoritative.

The comparison layer does NOT replace the existing Advisor ranking yet.

### Important constraint
Charge legality and charge-distance logic remain authoritative in the existing Advisor. The Tactical Impact Layer is still comparison-only for Charge until live validation is complete.

### Charge engagement adapter status
The Charge engagement adapter is now implemented in `tactical-advisor-adapter.js`.
It:
- projects the charging unit's Fight output through the existing `calculateMathMixed` engine,
- projects the target's reciprocal melee output separately without inheriting Charge/Lance state,
- preserves current model/wound state, including attached-unit target state where the shared engine exposes it,
- derives mission/objective impact from the existing Tactical Advisor objective helpers,
- keeps map geometry non-authoritative and carries physical measurement as the execution gate,
- attaches the projected exchange to each Charge candidate for comparison and UI testing.

The deploy-time Tactical Advisor surface now shows the projected Charge → Fight exchange, including outgoing damage, expected return damage, projected casualties, charge probability, and whether the distance is physically confirmed.

The existing Advisor ordering remains authoritative; the tactical layer is not yet allowed to replace it.

## Session Pause Checkpoint — 2026-09-27

### Repository checkpoint
- Repository: `Grumpa916/onoforge40k`
- Active branch: `feature/tactical-impact-layer`
- Latest checkpoint commit: `2427d96088052d9b5144f3adfd78de2412f9dd26`
- Draft PR remains open; nothing has been merged to `main`.
- Latest Tactical Advisor Tests: PASS.
- Latest Tactical Advisor Preview Validation: PASS.

### Data-source correction completed
- Removed the unrelated `data/40kapp-source.json` manifest from the feature branch.
- Removed the app's runtime dependency on that manifest.
- Updated OnoForge source labels/policy to treat BSData 11e as the structured community source and the embedded catalogue as local bootstrap data.
- Kept `data/warhammer-event-companion-v1.2.json` as a separate official reference/data source.
- Preview packaging now includes the Event Companion JSON so the local preview can load its reference/geometry data.
- Important follow-up: the app currently has live BSData refresh feeds configured for Tyranids and Ultramarines; Space Marines is not yet included as a live refresh feed and should be reconciled against current official Games Workshop material before being treated as canonical.

### Tactical Impact / Charge preview debugging completed
The following integration issues were found and fixed during live preview testing:
1. Preview script-injection newline bug.
2. Renderer incorrectly referenced `window.state` instead of OnoForge's shared `state`.
3. Charge phase detection incorrectly read `r.phase` instead of `r.decisionContext.phase`.
4. Charge adapter incorrectly relied on direct global state access; a read-only `ONOFORGE_APP_STATE` runtime bridge was added.
5. Charge execution renderer referenced out-of-scope `isCharge`; removed.
6. Preview diagnostic path was added temporarily to surface runtime exceptions.

Current exact live-test state:
- The Tactical Impact Layer is visible at the top of Battle Mode.
- Existing Tactical Advisor remains below it.
- Existing Advisor target selection works.
- Latest diagnostic build exposed this runtime error before the last scope fix: `isCharge is not defined`.
- The `isCharge` scope fix is now committed and both CI checks pass.
- The newest preview artifact was produced by run `36304860113` / artifact `10927021617`.
- Recommended next live test is to re-run the same scenario with the newest preview:
  `Battle Mode → Charge → Exocrine → Aggressor Squad → Select`
- Do not make a Charge success/failure entry until the projected Fight exchange panel is confirmed.
- If the projected Fight exchange still does not appear, the next diagnostic step is to inspect the new panel's explicit error text rather than making another blind UI change.

### Current local test scenario
The user's local test battle is:
- Round 1
- Charge phase
- Friendly attacker: Exocrine
- Existing Advisor target: Aggressor Squad
- Target selected in the existing Advisor
- Tactical Context: distance band Under 6", exact distance currently shown as 4, LOS Unknown, already engaged = No
- New Tactical Impact Layer is visible at the top of the Battle page.
- User's last reported state showed the new layer at the top with "Decision analysis unavailable for this state"; the diagnostic build then showed `isCharge is not defined`.

### Resume instruction
When resuming, do not restart architecture/planning. Start from the latest feature branch checkpoint above, read `DEVELOPMENT_GUIDE.md`, this handoff, and the relevant roadmap section, then continue the Charge live validation.

The immediate product goal remains:
`Tactical Advisor → physical distance → projected Charge/Fight consequence → Charge result → successful target state → Fight`

No merge to `main` is authorized unless the user explicitly requests it.

### User pause state
The user is stopping for now because the repeated preview/debug cycle is tiring. Preserve the current branch and checkpoint; do not collapse or rewrite the Tactical Impact work. Resume from this checkpoint later.


## New Chat Transfer — 2026-09-27
The authoritative cross-chat transfer is now captured in NEXT_CHAT_HANDOFF.md. Read that file together with the project handoff documents before continuing.
Current feature branch: feature/tactical-impact-layer @ 8f9495ec55a109e3556f1c04e55253d94231134c
Current main: 664e515850ed05a896e92a60aea0e29453f782f8
PR #1 remains open/draft/unmerged.
Main has newer architecture/data-source governance than the feature branch. Reconcile before major further feature work.
