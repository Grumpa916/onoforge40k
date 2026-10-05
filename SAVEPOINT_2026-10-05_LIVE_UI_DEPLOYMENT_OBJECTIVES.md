# OnoForge 40K Save Point — 2026-10-05

## Repository / branch
- Repository: Grumpa916/onoforge40k
- Authoritative branch: feature/opponent-turn-history-clean-reset
- PR #7 is OPEN / DRAFT / NOT MERGED. Never merge it.
- Main 2026-10-04 save point: 299b567815f765722afa127ad63d7eea2fa020c4
- Prior unit-reference UI: 3561790946c5a4ca5a16177bac2d214d52d7787a
- Prior deployment/data expansion: a54cea58d3ac6b5e7ac6c8d231e04d64d7f47b68
- Latest live UI refinement: 0f7b2e2
- Latest cleanup/validation head: 9065cbfaa19a684a4549374af22c5eda5405d062
- iPad preview: https://html-preview.github.io/?url=https%3A%2F%2Fgithub.com%2FGrumpa916%2Fonoforge40k%2Fblob%2Ffeature%2Fopponent%2Dturn%2Dhistory%2Dclean%2Dreset%2Findex.html

## User design decisions
1. 40k.app is supplemental only, never canonical.
2. Unit name itself is the details control; abilities have their own expandable section.
3. Duplicate units must expand independently; alpha/beta suffixes must not break supplemental lookup.
4. Norn Emissary abilities display is good and should be preserved.
5. Use normal readable unit labels. Do not use the pale/light staging labels.
6. During Deployment, unplaced units should appear as draggable readable army tags in No Man’s Land: one army on the left, the other on the right.
7. Deployment Status should track recorded, skipped, and still-unrecorded units.
8. REMOVE the Start Battle deployment-zone geometry validation. It incorrectly flags infiltrating units such as Lictors/Deathleaper and also flagged an Intercessor. The player is responsible for tabletop legality.
9. Objective labels on the map and Objective Control must match exactly. Current mapping is wrong.
10. All actual map objectives must be represented, including both home objectives. Current screenshots show map labels O7/O5/O4/O3/O2/O8 while Objective Control starts with O1 My Home, so the two systems are not using the same source/order.
11. There is visual text overlap/duplicate text on the map. Investigate rather than guessing.
12. Preserve verified Event Companion geometry. Never invent terrain/objective geometry or line of sight.

## Latest test observations
- Start Battle popup incorrectly reported: blue boys: Intercessor Squad — outside deployment zone.
- Another test reported Lictor alpha, Lictor beta, Deathleaper, and Intercessor Squad as outside deployment zone.
- Deployment Status simultaneously said Recorded 16/16, Skipped 0, Deployment complete. This confirms zone validation and deployment tracking are separate and the zone validation should be removed.
- Map currently visibly has O7 Expansion, O5 Expansion, O4 Central, O3 Central, O2 Expansion, O8 Expansion. No visible O1/O6 home labels.
- Objective Control currently shows O1 My Home and O2 Expansion etc., so its numbering/order does not match the map.
- User reported something appears to be written over the map, likely deployment-zone/territory text or a duplicate label layer.

## Current deployment implementation
- Deployment side rails are implemented via armyNoMansLandTagsHtml.
- Rails are intended to be left/right within No Man’s Land and contain eligible unplaced units.
- Tags use data-map-unit/data-map-side/data-map-uid and should be draggable to record actual live deployment positions.
- Skipped units render as non-draggable dashed tags.
- deploymentStatusHtml tracks recorded/skipped/missing and has Skip/Undo Skip controls.
- Reserved and embarked units are excluded.
- Preserve this design, but remove all enforcement that a recorded unit must be inside the standard deployment zone.

## Secondary missions
- Latest patch changed fixed yes/no-style secondary scoring to a single Record button with the rule VP.
- Variable VP conditions retain numeric input.
- User previously reported yes/no secondaries were asking for numerical input and no-attack secondaries were not selectable.
- Re-test after the next patch.

## Unit data
- Supplemental cross-check entries were expanded for Aggressor Squad, Ballistus Dreadnought, Norn Emissary, The Swarmlord, Intercessor Squad, Termagants, Hormagaunts, Lictor, Biovores, Exocrine, Tyrannofex, Captain, Assault Intercessor Squad, Infernus Squad, Heavy Intercessor Squad, Terminator Squad, Redemptor Dreadnought, plus previously researched Norn Assimilator, Tyranid Prime with Lash Whip, Captain in Terminator Armour, Librarian in Terminator Armour, and Ancient in Terminator Armour.
- Instance suffix normalization was added so Norn Emissary alpha/beta and similar names can use base-unit supplemental data.
- User wants all missing data in all stored armies updated. Hardcoded entries are not a guarantee for arbitrary custom stored units.
- Proper future solution: backfill/migrate every stored army entry (state.savedArmyLists/state.lists as applicable), resolve each unit through canonical data plus supplemental fallback, preserve canonical values first, and only fill missing fields.
- Do not invent missing unit stats or abilities.

## Norn Emissary reference
- User explicitly said the Emissary abilities look good.
- Desired reference presentation: full M/T/Sv/W/Ld/OC profile, weapons, and expandable Abilities section with Singular Purpose, Unnatural Resilience, and Damaged.

## Objective problem: next implementation priority
- Inspect objectiveMapModel, objectiveControlHtml, objectivePositionFor, objectiveRoleLabel, map objective rendering, and objective state normalization.
- Make one verified map objective object/source the single source of truth for both map labels and Objective Control.
- Do not guess O1/O6 positions or simply relabel by array index.
- Determine why the map renders six visible objectives while Objective Control appears to have eight entries.
- Use stable objective identity/position for scoring state if necessary; if current scoring state is keyed by names, add a mapping layer without corrupting saved scoring.
- Ensure every map objective has exactly one visible label and Objective Control displays the exact same O# and role.
- Investigate and eliminate the apparent text overlay/duplicate deployment-zone/territory text over objective labels.

## Next testing checklist
1. Restart Deployment.
2. Confirm normal readable unplaced unit tags appear on left/right No Man’s Land rails.
3. Drag units to actual tabletop positions and verify they disappear from rails and become recorded.
4. Test Skip/Undo Skip and Deployment Status.
5. Confirm Start Battle no longer blocks units for being outside the nominal deployment zone.
6. Confirm fixed yes/no secondaries use Record without numeric input.
7. Confirm map and Objective Control use identical objective labels and include both home objectives.
8. Confirm no duplicate/overlaid objective text.
9. Confirm Norn Emissary alpha/beta each show full reference data independently.
10. Continue auditing missing unit data across stored armies.

## Critical instruction for next chat
Read this save-point file first. Resume from the exact current state. Do not redo already-passed deployment workflow work. Do not merge PR #7. First remove Start Battle deployment-zone geometry validation; then fix Objective Control/map objective source-of-truth and label mismatch; then remove visual overlap; preserve side rails and skip tracking; then re-test secondary scoring and unit data coverage.