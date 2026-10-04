# OnoForge 40K — index.html Unit List Utility Boundary

## Chosen boundary
Pure unit-list categorization and sorting helpers extracted from `index.html` into `js/data/unit-list-utils.js`.

## Included
- `unitListCategory(u)`
- `sortUnitList(arr)`
- `unitListCategoryName(u)`

Existing browser-global names are preserved so current army/unit selection callers remain unchanged.

## Why this boundary
- Pure functions with no DOM, state, network, cloud, battle-state, event, or combat dependencies.
- The three helpers form one coherent concern: categorizing and ordering unit-selection entries.
- The sorting helper returns a copy, preserving the existing behavior and caller expectations.
- Small and independently regression-testable.

## Explicit non-goals
This extraction does not move unit-selection state handlers, rendering functions, army state, validation, battle logic, Tactical Advisor logic, or combat logic.
