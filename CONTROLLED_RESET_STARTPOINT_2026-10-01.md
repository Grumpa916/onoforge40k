# OnoForge 40K — Controlled Development Reset

Date: 2026-10-01
Repository: Grumpa916/onoforge40k

## Purpose

This branch is the clean development line for the next phase of OnoForge 40K work.

## Exact source checkpoint

Development starts from:

`132551b340bdff635eeb9b193470f2c1a8e46ccd`

This is the latest known-good playable checkpoint carried forward from the bidirectional combat work.

The existing `feature/opponent-turn-history` branch is preserved separately. No work in this reset branch should modify or depend on the deployment-redesign work that followed that checkpoint.

## Preservation

The previous development state is preserved at:

`archive/deployment-redesign-2026-10-01`

pointing to:

`aee09c197b70af523bfad59d14d117fd79c8303c`

Nothing in the archive branch is treated as disposable.

## Development rules for this reset

1. GitHub is the source of truth. Do not use manual index.html upload/re-upload as the normal development mechanism.
2. Each meaningful change is committed directly to this branch and tied to an exact commit.
3. Do not stack speculative patches. Diagnose first, make one bounded change, validate, then continue.
4. Do not alter unrelated gameplay systems while rebuilding deployment.
5. Deployment work is developed as a bounded subsystem before being reconnected to the full application.
6. A failed test is treated as evidence about the implementation, not as a reason to add another workaround.
7. Keep a known-good commit available at every milestone.

## First target

Rebuild the deployment subsystem boundary around the existing playable application.

The first deployment milestone must support:

- tournament deployment setup
- verified Event Companion battlefield geometry
- deployment planning for both armies
- live deployment tracking for both armies
- authoritative unit-position state
- selection and movement of units without collapsing the Live Deployment Tracking panel
- persistence of deployment state through normal renders
- undo and deployment event logging
- transition into battle without losing authoritative live positions

## Validation gate

Do not reconnect the rebuilt subsystem to broader feature work until the deployment milestone passes:

- source syntax validation
- isolated deployment/state tests
- launch over HTTP with required data assets
- manual tablet-style interaction test
- exact-commit verification of the tested source

## Anti-loop rule

A test package must be generated from the committed branch source. If the tested file does not match the intended commit, stop and fix the source/deployment process before changing application code.
