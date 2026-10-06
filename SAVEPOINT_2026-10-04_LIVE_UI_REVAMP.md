# OnoForge 40K Save Point — 2026-10-04 / Live UI Revamp

## Authoritative repository state

- Repository: `Grumpa916/onoforge40k`
- Authoritative development branch: `feature/opponent-turn-history-clean-reset`
- Current HEAD: `a4916e2d99cdd448eccada954d9f504dbefaf5cc`
- Latest commit: `fix: strengthen map labels and complete unit reference data`
- Parent: `b71140e438b03256408ea51e7757b90c3a6d006a`
- Draft PR: #7 — `Live game UI revamp — controlled test slice`
- PR is OPEN, DRAFT, and NOT to be merged yet.
- Base branch: `feature/tactical-impact-layer`

## Current iPad testing route

Use the GitHub HTML Preview route so Safari can test the feature branch directly without downloading/unzipping files:

https://html-preview.github.io/?url=https%3A%2F%2Fgithub.com%2FGrumpa916%2Fonoforge40k%2Fblob%2Ffeature%2Fopponent-turn-history-clean-reset%2Findex.html

The latest branch commit was validated by both relevant GitHub Actions workflows:

- Tactical Advisor Preview Validation — run `37268549769` — SUCCESS
- Opponent Turn Event Capture Preview — run `37268549787` — SUCCESS

## Major architecture decisions still in force

- `MY LIST` is the reference manual.
- `ARMY STATE` is live battle state.
- Unit reference UX: compact unit row; tapping/opening the unit exposes full reference data. Do not build automatic context-sensitive unit-info automation yet.
- Battlefield geometry is approximate for visualization; physical tabletop measurement remains authoritative.
- Physical-dice combat resolution is authoritative; do not add random dice generation to real-game resolution.
- Opponent-turn capture uses the same shared bidirectional combat/state model as the player's turn.
- Combat History is derived from authoritative `state.events`; do not create a parallel combat-history state store.
- Live map positions are authoritative state only when actually recorded/dragged; visual staging markers must not be treated as tabletop positions.
- Saved deployment-plan data already belongs with the saved army-list record. The long-term requirement remains that deployment-map changes travel with the linked army list across games/devices when saved-list access/persistence is available.

## What has been implemented and tested successfully

### Deployment / Setup workflow

- Live deployment map stays open; the previous collapsible live deployment panel was removed from the tested branch.
- Non-reserve units can be shown in staging positions.
- Direct drag interaction is intended to move a staged unit to its actual tabletop position without first selecting it from a dropdown.
- Army selector changes do not collapse the live deployment map.
- `Begin Deployment` was removed from the player-facing Setup workflow.
- `Start Battle` works directly and transitions into Battle Mode.
- Tournament setup/deployment status was moved toward the bottom of Setup near Start Battle.
- Reserve units remain separated in the reserve tray.
- Existing deployment-plan positions are preserved rather than blindly clearing live battlefield positions.

### Deployment staging

The current implementation uses deterministic staging slots inside the verified deployment zone instead of placing all units at one shared placeholder point.

Important rule: staging is visual only. A unit is not considered deployed until its actual tabletop position is recorded.

### Terrain / map

- Terrain setup completion flow works.
- Event Companion map can be opened.
- Live map orientation follows attacker side.
- Player-facing manual coordinate editors were removed from the primary workflow.
- Movement/map interactions use touch-friendly dragging.

### Army State

- Full stat-line reference UI exists as an expandable `Full stat line & weapons` section on unit rows.
- Earlier implementation showed missing reference data for some units such as Exocrine.
- Latest HEAD `a4916e2d...` already adds a supplemental-data fallback for missing unit profiles/weapons, and also adds the missing Leadership fallback.
- This latest fix has passed both automated validation workflows but has NOT yet been re-tested by the user on iPad.
- Manual per-unit wound +/- controls were removed from the newly simplified model-status presentation.
- Battleshock / Dead / Reserve controls remain important live unit state controls.

### Objectives

- Objective geometry is sourced from verified Event Companion geometry.
- Latest HEAD `a4916e2d...` strengthens map objective rendering so labels are explicitly shown as `O1 • role`, `O2 • role`, etc.
- Example role labels include My Home / Opponent Home / Central / Expansion.
- This latest objective-label fix has passed CI but still needs fresh iPad visual verification.

### Action Log

The Action Log was changed toward human-readable entries:

- use unit names where available rather than opaque internal IDs
- include action/result information
- deployment/position events now include a human-readable `unitName` and position information

The user specifically said the Action Log needs to be deciphered; readability improvements are in place but should be re-tested during the next live-play workflow.

### Timer

Game timer extraction/audit was completed previously.

Important verified behavior from the prior test:
- player timer no longer gets cleared when transitioning to the opponent turn
- player/opponent turn clocks persist correctly through phase/turn cycling

## Most recent iPad test results

The user tested the previous build on iPad and reported:

1. Live map stays open — PASS.
2. Live map was already populated with units; user believes those placements may have been persisted from the last test rather than freshly auto-created — this needs explicit verification against saved/local state.
3. No objective labels were visible on the map — this was identified as a defect.
4. Changing army selection does not collapse the live map — PASS.
5. Start Battle works as expected — PASS.
6. Some units were missing the full stat reference, specifically Exocrine — defect identified.
7. Model-status accordion looked redundant because the unit header already shows the useful high-level state — user requested simplification.

The latest HEAD `a4916e2d...` was subsequently updated to address the first two known display defects:
- stronger objective map labels
- supplemental fallback data for incomplete unit reference data such as Exocrine

These fixes still require direct iPad confirmation.

## Immediate next work

Do NOT redo the parts that already passed.

Next chat should begin by testing HEAD `a4916e2d...` on iPad and then make only the remaining targeted UX changes:

### 1. Re-test objective labels

Confirm the live map visibly shows labels such as:
- O1 • My Home
- O2 • Expansion
- O3 • Central
- etc.

Ensure the labels are positioned at the correct objective markers and remain readable when the map is rotated for the opposite attacker side.

### 2. Re-test full unit reference

Open several units on both armies, especially:
- Exocrine
- Tyrannofex
- Hormagaunts
- Intercessor Squad
- Aggressor Squad

Confirm every unit gets:
- M
- T
- Sv
- W
- Ld
- OC
- active ranged weapons
- active melee weapons
- weapon abilities

Do not invent missing data. If the authoritative/supplemental source still lacks a characteristic, show a clear data-gap indicator rather than a fabricated value.

### 3. Simplify model-state display

The current separate `Model status: ...` accordion is redundant for normal units.

Preferred target:
- keep the compact unit header showing live state
- keep Battleshock / Dead / Reserve where applicable
- show wounded-model details ONLY when a unit actually has wounded models
- avoid a redundant always-visible/always-present model-status panel
- retain underlying model-roster state because the combat engine may still need exact model wounds/casualties

### 4. Verify staging behavior

Start from a genuinely fresh battle/setup state.

Confirm:
- non-reserve units receive visual staging slots automatically
- existing saved/live positions are preserved when appropriate
- staging markers are not counted as valid deployed positions
- dragging a unit to the tabletop position converts it into a recorded position
- reserve units do not receive staging markers
- switching army selection does not close/reset the map

### 5. Objective-control display

After objective labels work, re-test the earlier issue where the user could potentially control three objectives but the UI showed a red/failed state.

The scoring logic must be based on the authoritative objective-control state, not merely the visual marker color.

### 6. Action Log

During one or two deployment/movement actions, verify the log reads like:
- player/army
- phase
- round
- unit name
- action
- result/position

rather than exposing internal event IDs.

## Other project items already established

- Battle live map was moved forward in Battle Mode.
- Live map orientation rotates 180 degrees when the opponent is the attacker.
- Reserve tray is below the map.
- Dead unit map markers are subdued.
- Movement tracker ignores destroyed, reserved, embarked, and attached units where appropriate.
- Return-to-reserves is implemented.
- Primary mission +/- handling was fixed so row clicks do not swallow the amount controls.
- Secondary yes/no missions no longer ask for meaningless numeric VP entry; variable/max conditions still retain amount entry.
- Deployment staging and reserve behavior were added.
- Player-facing coordinate editors were removed from the main map workflow.
- Stratagem full-rules support was intentionally NOT expanded because the runtime catalog does not yet contain authoritative full rules text.
- Do not claim full stratagem rules until authoritative data is connected.

## Saved-list persistence requirement / reminder

The user wants deployment-map changes linked to the army list so that the deployment map can travel from game to game.

A conditional reminder was created to check when saved-list access/persistence is actually available, and then remind the project to ensure deployment-map changes persist with the linked army list.

## Important caution

The preview branch is still a controlled test branch. Do NOT merge PR #7 yet.

Do not switch testing to `main`/production.

Do not replace the current live state model with a second map-state model.

Do not infer tabletop positions or objective control from visuals alone where the authoritative state is required.

---

# READY-TO-PASTE RESTART PROMPT

Resume the OnoForge 40K project from the 2026-10-04 live UI save point.

Repository: `Grumpa916/onoforge40k`

Authoritative development branch:
`feature/opponent-turn-history-clean-reset`

Current HEAD:
`a4916e2d99cdd448eccada954d9f504dbefaf5cc`

Latest commit:
`fix: strengthen map labels and complete unit reference data`

Draft PR #7 is still OPEN/DRAFT and must NOT be merged.

READ THIS FILE FIRST:
`SAVEPOINT_2026-10-04_LIVE_UI_REVAMP.md`

Current iPad test route:
https://html-preview.github.io/?url=https%3A%2F%2Fgithub.com%2FGrumpa916%2Fonoforge40k%2Fblob%2Ffeature%2Fopponent-turn-history-clean-reset%2Findex.html

Where we left off:
- Live deployment map staying open: PASS
- Army selector does not collapse map: PASS
- Start Battle directly enters Battle Mode: PASS
- Non-reserve staging workflow is implemented
- Objective labels were missing in the previous iPad test, but HEAD now contains a fix that should render labels like O1 • My Home / O2 • Central / O3 • Expansion
- Some units such as Exocrine were missing full stat references in the previous iPad test, but HEAD now contains supplemental-data fallbacks for unit profiles/weapons and Leadership
- The user found the separate Model Status accordion redundant because the unit header already shows the important high-level state

Next step:
1. Open the current branch preview on iPad.
2. Verify objective labels.
3. Verify full stat reference for Exocrine and several other units.
4. Simplify/remove the redundant model-status accordion; retain exact underlying model state and only surface wounded-model detail when actually relevant.
5. Re-test staging from a fresh state so we can distinguish saved/persisted positions from automatic staging.
6. Re-test Objective Control with multiple objectives, especially the previous “could control 3 objectives but UI was red” case.
7. Re-test Action Log readability.
8. Continue implementation only after preserving the deployment workflow elements that already passed.

Do not redo already-passed deployment/start-battle work.
Do not merge PR #7.
Do not invent rules/data.
Continue uninterrupted unless a real ambiguity blocks implementation.
