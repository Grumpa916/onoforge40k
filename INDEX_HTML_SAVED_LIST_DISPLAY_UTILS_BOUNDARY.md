# Saved-list display utility boundary

## Chosen extraction
Extract the pure saved-roster display helpers from `index.html` into `js/data/saved-list-utils.js`:

- `rosterCreatedLabel(value)`
- `savedRosterDisplayName(x)`

## Why this boundary
- Pure input/output behavior.
- No `state`, DOM, persistence, Supabase, or network dependency.
- Directly adjacent to the existing saved-list utilities:
  - `isPermanentSampleArmy()`
  - `formatSavedListDate()`
- Small enough to reverse independently.
- Existing global names are preserved, so current callers do not need a broad rewrite.

## Deliberately not included
- `activeArmyDisplayName()`: reads application state.
- `saveCurrentArmyList()`, `loadSavedList()`, and cloud/auth functions: persistence or cloud dependent.
- Unit roster display/sorting helpers: broader army-builder dependency surface.
- Terrain/deployment helpers: separate geometry boundary.
- Combat, Tactical Advisor, event/undo, renderer/bootstrap: explicitly out of scope.

## Verification contract
- Existing saved-list utility tests remain green.
- New tests cover valid, empty, and invalid roster timestamps plus fallback roster naming.
- Browser verification target: saved-list/army-list display, including active roster labels.
