# OnoForge 40K — dice utility boundary

## Chosen boundary
Pure dice-value parsing extracted from `index.html` into `js/core/dice-utils.js`.

## Included
- `parseNum(v)` — preserves the existing parser for values such as `D6`, `2D6`, `D6+2`, and numeric values.

The existing browser-global `parseNum` name is preserved so the math engine remains unchanged at the call sites.

## Why this boundary
- Pure input normalization with no DOM, battle state, network, cloud, event, or rendering dependencies.
- Only three math-engine call sites use it.
- Independently regression-testable with a small reversible surface.

## Explicit non-goals
This extraction does not move `expected()`, combat math, weapon rules, math state, Tactical Advisor, battle state, events/undo, or rendering logic.
