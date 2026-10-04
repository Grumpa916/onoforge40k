# OnoForge 40K — index.html HTML Utility Boundary

## Chosen boundary
Pure HTML escaping utility extracted from `index.html` into `js/ui/html-utils.js`.

## Included
- `esc(s)` — converts a value to a string and HTML-escapes ampersands, angle brackets, double quotes, and apostrophes.
- Existing browser-global name `esc` is preserved for compatibility.
- `OnoForgeHtmlUtils` namespace exposes the same pure helper for regression testing and future module use.

## Why this boundary
- No `state`, DOM, network, cloud, battle-state, event, combat, or renderer dependencies.
- Very small and heavily reused by existing UI renderers.
- Easy to regression-test in isolation.
- Reversible: one function and one script tag are moved; callers remain unchanged.

## Explicit non-goals
This extraction does not move any caller, renderer, battle logic, scoring logic, event handling, or application state.
