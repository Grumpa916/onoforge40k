# OnoForge 40K — unit display utility boundary

## Chosen boundary
Pure Greek-letter unit suffix formatting extracted from `index.html` into `js/ui/unit-display-utils.js`.

## Included
- `alphaLabel(n)` — produces the existing Greek-letter sequence used to distinguish repeated unit instances.

The existing browser-global `alphaLabel` name is preserved so `unitDisplayName()` remains unchanged.

## Why this boundary
- Pure formatting logic with no DOM, state, network, cloud, event, or battle dependencies.
- One direct caller and a very small reversible surface.
- Independently regression-testable.

## Explicit non-goals
This extraction does not move `unitDisplayName()`, unit state, List Builder rendering, army state, battle state, events/undo, Tactical Advisor, or combat logic.
