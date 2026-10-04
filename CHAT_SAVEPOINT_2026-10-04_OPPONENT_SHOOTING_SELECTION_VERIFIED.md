# CHAT SAVEPOINT — 2026-10-04 — OPPONENT SHOOTING SELECTION VERIFIED / NEXT EXTRACTION INSPECTION

Repository: Grumpa916/onoforge40k

Active branch: feature/opponent-turn-history
Current verified functional HEAD: 5fb0fb7f39fc7ab375355415f13f9fb7fa4aaeea

Verified on current HEAD:
- Opponent Shooting completed-state messaging is clear.
- Units with no eligible ranged weapons are identified.
- Ballistus Dreadnought Shooting excludes Armoured feet.
- Ballistus ranged profiles are available.
- Earlier Saves -> Damage physical-dice flow remains verified.
- Action Log blue text wrapping remains verified.
- Current Tactical Advisor Preview Validation and Opponent Turn Event Capture Preview CI are green.

The BSData parser extraction remains landed in js/data/bsdata-parser.js from merged PR #6.

NEXT ARCHITECTURAL TASK:
Do not make another opportunistic gameplay change. Inspect index.html for the next small, self-contained extraction boundary.

Initial inspection identified the Game Timer block (ensureGameTimer through gameTimerHtml) as a plausible candidate:
- 14 contiguous functions
- approximately 4–5 external host dependencies (save, render, battleMutationAllowed, cloudSaveCurrentBattle, esc)
- clear UI/state responsibility
- no reason to combine it with combat or BSData logic

Before extracting, map every caller and shared state field for the timer block and design a narrow host interface. Prefer the smallest reversible extraction that preserves browser-global compatibility, following the BSData parser extraction pattern.

Do not modify main.
Do not casually merge/rebase feature/opponent-turn-history-clean-reset.
Python is not installed locally and must not be required.
