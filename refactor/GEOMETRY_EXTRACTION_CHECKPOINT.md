# Geometry Extraction Checkpoint

Branch: `refactor/geometry-extraction`

## Purpose

This branch is reserved for the first low-risk structural extraction from `index.html`.

## Target

Pure battlefield geometry helpers only:

- `battlefieldDistanceBetween`
- `battlefieldTerrainPathIntersections`

## Current status

**Preparation only. No application behavior has been changed.**

The exact implementations must be copied from the current `index.html` before extraction. Because the application JavaScript is currently compressed into a single large inline block, no replacement implementation should be written from memory or inferred from partial source output.

## Required sequence

1. Capture exact current function implementations.
2. Record their current callers.
3. Create behavior-preserving tests for representative inputs and edge cases.
4. Create the dedicated geometry module.
5. Preserve compatibility with the existing callers.
6. Run GitHub Actions.
7. Review failures before any subsequent extraction.
8. Only after the extraction is green, remove or retire the original implementations.

## Protected systems

The following are not to be modified by this extraction:

- Shooting workflow
- physical dice workflow
- Charge workflow
- Fight workflow
- model identity/casualty handling
- deployment/live battlefield state
- mission/scoring logic
- Tactical Context
- Tactical Advisor
- Tactical Impact Layer
- main UI rendering

## Pace rule

One logical extraction per commit. Do not bundle unrelated cleanup, formatting, UI changes, or gameplay changes into the geometry extraction.

## Success condition

The geometry module is behaviorally equivalent to the existing implementation, GitHub Actions is green, and no protected subsystem has changed.
