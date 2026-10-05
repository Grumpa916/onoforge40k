# OnoForge 40K — Live Game UI Revamp Checkpoint
Date: 2026-10-04

Repository: Grumpa916/onoforge40k
Branch: feature/opponent-turn-history-clean-reset

## Current implementation checkpoint
Latest UI/CI commit: eb3ae0c50b0564d1dbd944e1d3f477d0ba3cf142

Previous implementation commits:
- a686e25ee356654193cb384aa703993360fbc60d — first live-game UI slice
- 635b3b8a76c5b027e8da74f5aecc1cc2e13b07ff — secondary yes/no input simplification
- 55c80efbc2c552775d183454535b2cc04a2bb140 — deployment staging markers

Exact committed index.html blob at the latest implementation slice:
67784668a8dbee84ff7837c0bd258890d0ff36dd

The inline JavaScript in the latest index.html was syntax-validated with Node's Function parser.

## Implemented in this slice

### Live Battle UI
- Data Status moved out of the top area into a collapsible footer.
- Live battlefield map moved to the front of Battle Mode immediately after the phase/score controls.
- Live battle no longer exposes the map unit-selection placement panel.
- Battlefield remains an approximate visual representation; it is not a precision coordinate system.
- If the user is the defender, the battle map is rotated so the user's side is at the bottom. If the user is the attacker, normal orientation is retained.
- Map objective labels use the shared Home/Central/Expansion role vocabulary.
- Unit markers use compact labels and combine attached/transported unit identity into the parent/transport marker.
- Destroyed unit markers are visually subdued.
- Reserves and embarked units are excluded from the active live map.

### Movement
- Movement tracking lists only active battlefield units.
- Reserves, destroyed units, and embarked units are excluded.
- Existing approximate map positions remain the underlying battlefield context; no exact movement-path tracking was added.

### Reserves
- Active battlefield units can be returned to reserves during Battle Mode.
- Returning to reserves removes the unit from the live map and movement list while preserving battle state/history.
- Reserve tray remains below the map.

### Deployment
- During deployment, non-reserve units without an actual recorded position appear as temporary staging markers in their verified deployment zone.
- Staging markers become authoritative positions only when the player drags/places them.
- Reserve units do not appear on the live/deployment map until deployed.
- This supports the desired drag-to-position workflow rather than requiring unit-by-unit selection before every placement.

### Mission input
- Primary mission +/- controls now have a capture-phase event path so row-level click handling cannot swallow the stepper interaction.
- Yes/no secondary scoring conditions no longer display a numeric VP selector.
- Variable secondary conditions ("for each" / "max") retain quantity input.

### Stratagems
- Existing stratagem UI remains expandable, but the current runtime catalog still contains summary text rather than verified full rules text.
- Do not claim full-rules support until authoritative full rules data is available.
- Next stratagem task: connect the expandable UI to the appropriate authoritative rules text source without inventing or paraphrasing rules.

## Known deferred UI items from the 2026-10-04 playtest

- Right-hand Army State redesign remains deferred to the previously agreed Army State specification.
- Opponent-first Round 1 transition was already corrected in the controlled-reset source; it still needs manual live-game verification.
- Verify every Secondary Mission toggle during manual play; one had previously been reported broken.
- Verify primary +/- controls manually.
- Verify deployment staging markers and actual drag-to-position behavior.
- Verify map orientation when the user is the defender.
- Verify joined-unit and transport labels with actual attached/embarked examples.
- Verify dead units visually recede from the map.
- Verify returning an active unit to reserves and later redeploying it.
- Verify objective-control UI uses the same labeled objective identities as the map.
- Terrain setup reference is already implemented at a large readable size in the controlled-reset source; verify tablet readability manually.

## Architecture rule

Do not turn the UI revamp into another monolithic rewrite. The current index.html remains a legacy shell while bounded subsystem extraction continues.

Live-game UI should consume authoritative Army State and battlefield state rather than creating a parallel state model.

Established map rule:
- Unit locations are approximate.
- The map is not an exact-coordinate measurement tool.
- Physical tabletop measurement remains authoritative.

Established live-input rule:
- Record the event/outcome, not individual dice, wherever the existing state can provide the necessary rules context.

## Testing workflow

The existing Tactical Advisor preview workflow was updated in eb3ae0c5 to also run on:
feature/opponent-turn-history-clean-reset

It now validates the live UI markers and builds the existing downloadable preview artifact from the committed branch source.

Do not manually upload index.html as the normal test mechanism.
