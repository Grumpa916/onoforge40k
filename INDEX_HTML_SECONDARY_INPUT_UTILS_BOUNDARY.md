# index.html — Secondary Input ID Utility Boundary

## Extracted helper
The pure `secondaryInputId(side,name)` helper was moved from `index.html` into:
- `js/ui/secondary-input-utils.js`

The existing browser-global `secondaryInputId` name remains unchanged so the current `scoreSecondaryFromInput()` caller requires no behavioral rewrite.

## Why this boundary is safe
The helper is a pure formatter. It:
- accepts only `side` and `name`
- performs deterministic string normalization
- has no DOM access
- has no battle/scoring state access
- does not mutate state
- does not save, render, emit events, fetch, or access cloud services

The extraction intentionally does **not** move `scoreSecondaryFromInput()` or any secondary scoring logic.

## Regression coverage
`tests/secondary-input-utils.test.js` covers:
- friendly and opponent IDs
- whitespace normalization
- punctuation/separator normalization
- underscore normalization
- empty names

## Workflow integration
The preview workflow must:
- run the utility regression
- syntax-check `js/ui/secondary-input-utils.js`
- copy the utility into the preview tree
- bundle it into the standalone preview

## Browser gate
After CI succeeds, manually verify the affected secondary scoring controls in the fresh standalone preview before creating the next save point.
