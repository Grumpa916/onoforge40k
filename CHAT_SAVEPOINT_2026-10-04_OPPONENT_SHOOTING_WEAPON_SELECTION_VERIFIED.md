# CHAT SAVEPOINT — 2026-10-04 — OPPONENT SHOOTING WEAPON SELECTION VERIFIED

## Authoritative state

- Repository: `Grumpa916/onoforge40k`
- Branch: `feature/opponent-turn-history`
- HEAD: `5fb0fb7f39fc7ab375355415f13f9fb7fa4aaeea`

## Verified fixes

### Opponent Shooting quick-result flow
The physical Saves -> Damage transition is fixed and browser-verified. Failed-save count now advances correctly to Damage, and damage is appropriately applied.

### Action Log
The blue Action Log result text was changed to wrap rather than truncate with ellipsis.

### Opponent Shooting weapon selection
The opponent Shooting selector was corrected in two ways:

1. A unit that has already completed its Shooting action now presents a clear state:
   `Shooting completed — choose another shooter…`
   rather than misleadingly appearing to have no weapon.

2. Shooting weapon eligibility now requires `tacticalWeaponIsRanged(w)`, preventing melee-only profiles from appearing in the Shooting selector.

Browser verification by the user confirms:

- Aggressor Squad correctly shows Shooting completed after it has resolved shooting.
- Interceptor Squad correctly reports no eligible ranged weapons when appropriate.
- Ballistus Dreadnought correctly presents ranged profiles.
- `Armoured feet` is absent from the Ballistus Shooting weapon list.
- Ballistus Lascannon, missile launcher (Frag), missile launcher (Krak), and Storm Bolters are available.

## CI

Current HEAD passed:
- Tactical Advisor Preview Validation
- Opponent Turn Event Capture Preview

## Next step

Do not make another functional change from this checkpoint without first inspecting the next intended boundary.

The next development task should be architectural inspection of `index.html` for a small, self-contained extraction candidate, while preserving the verified opponent-turn workflows.

Keep `main` untouched. Do not casually merge/rebase `feature/opponent-turn-history-clean-reset`.

Python is not installed locally and should not be required.
