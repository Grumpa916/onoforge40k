# OnoForge 40K — Phase 1 Extraction Plan

Last updated: 2026-09-27

## Purpose

Define the first code-extraction boundary without changing gameplay behavior.

The current `index.html` remains the authoritative application. This phase is intentionally conservative because the live UI cannot currently be visually verified.

## Selected first boundary

### Battlefield geometry utilities

Initial candidates:

- `battlefieldDistanceBetween`
- `battlefieldTerrainPathIntersections`

These are preferred because the architecture inventory classifies them as pure geometry helpers: they should derive a result from explicit inputs without needing to mutate authoritative OnoForge state.

## Why this boundary comes first

These helpers sit below higher-level systems:

```text
Deployment / live map
        ↓
Battlefield geometry
        ↓
Charge / Tactical Advisor / objective logic
```

Moving pure geometry first gives the project an explicit module boundary without moving:

- global state
- rendering
- event handlers
- physical dice
- Shooting
- Charge resolution
- casualty state
- scoring

## Required compatibility contract

The extracted module must:

1. accept explicit geometry inputs;
2. return the same values as the current functions;
3. perform no state mutation;
4. access no browser globals unless required by the existing implementation;
5. contain no UI/rendering code;
6. expose a stable API that `index.html` can call;
7. preserve the existing function names through temporary compatibility wrappers when wiring it in.

## Migration pattern

Do **not** immediately delete the original functions.

Use this sequence:

```text
Current inline helper
        ↓
New module implementation
        ↓
Compatibility wrapper in index.html
        ↓
Existing callers continue unchanged
        ↓
Regression audit
        ↓
Only then remove duplicate implementation
```

This minimizes the blast radius and makes rollback straightforward.

## Verification requirements

Before wiring the module into the application, establish tests for at least:

### `battlefieldDistanceBetween`

- identical positions
- horizontal distance
- vertical distance
- diagonal distance
- minimum/edge coordinate values
- invalid/missing input behavior as currently defined

### `battlefieldTerrainPathIntersections`

- no terrain intersections
- one intersection
- multiple intersections
- path touching a terrain boundary
- path entirely inside terrain
- path entirely outside terrain
- degenerate/zero-length path
- malformed terrain input behavior as currently defined

The expected outputs must be captured from the current implementation before replacing it.

## Important limitation

Because the current inline JavaScript is compressed into one physical line, exact source offsets and the full function bodies have not yet been independently extracted into a machine-readable AST inventory.

Therefore **do not hand-copy or recreate the geometry algorithms from memory**.

The next implementation step must first obtain the exact current function bodies, then create the module from those bodies with behavior-preserving tests.

## Protected systems

The first extraction must not touch:

- Shooting
- physical dice resolution
- Charge resolution
- Fight
- model casualty application
- deployment/live battlefield state mutation
- Tactical Advisor calculations
- global `render()`
- undo/recovery

## Success condition

Phase 1 succeeds when the geometry functions execute from a dedicated module while all existing callers continue to work through compatibility wrappers, with no gameplay/UI behavior change.

Only after that green checkpoint should the next extraction boundary be selected.
