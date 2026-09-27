# OnoForge 40K — Current Session Handoff

Updated: 2026-09-26
Repository: Grumpa916/onoforge40k
Branch: main

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
