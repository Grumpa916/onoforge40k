# OnoForge 40K — Branch and Release Strategy

**Repository:** `Grumpa916/onoforge40k`
**Current working branch:** `feature/opponent-turn-history`
**Status:** Development policy / cross-chat continuity document

## 1. Purpose

This document defines how OnoForge 40K development branches, save points, validation checkpoints, and `main` are used.

The goal is to prevent cross-chat work from accidentally continuing from an older application copy, to keep known-good states recoverable, and to make eventual promotion to `main` deliberate rather than automatic.

## 2. Branch roles

### `main`

`main` is the stable/reference branch. It is not the default location for experimental architectural work.

It should represent a validated application state suitable for treating as the project's stable baseline.

### `feature/opponent-turn-history`

This is the current development branch for the active OnoForge work. It contains the recent opponent-turn/history, bidirectional combat, Tactical Advisor, data-source, and `index.html` architecture/refactoring work documented by the current save points.

Until an explicit promotion checkpoint is reached, this branch is the working source of truth for the current development effort.

### Other branches

Other feature, recovery, and save-point branches are historical or task-specific unless explicitly designated as the current working branch in a save point.

Do not switch the active source branch merely because another branch has a newer-looking name or version number. Establish its relationship to the current working branch first.

## 3. Current branch relationship

As of the strategy decision documented on 2026-09-29:

- `main` and `feature/opponent-turn-history` have diverged.
- GitHub reports `feature/opponent-turn-history` as 193 commits ahead of `main` and 12 commits behind `main`.
- Merge base: `9f964623cd4894728074d5bdb793ae98bd985b74`.

Therefore the branches must not be treated as interchangeable copies.

The existence of commits on `main` that are absent from the feature branch does not by itself mean those commits should be merged into the feature branch. Their content and relevance must be reviewed first.

## 4. Source-of-truth rule

For active development, the source of truth is:

1. the branch explicitly named by the latest project save point;
2. the exact commit recorded by that save point;
3. the files at that commit.

If a new chat cannot establish those three items, it must inspect the repository history and save-point documents before modifying application code.

Never infer the current source from `main` alone.

## 5. Save-point rule

A meaningful development checkpoint should record:

- branch;
- commit SHA;
- important file/blob identifiers when relevant;
- completed work;
- known-good behavior;
- known failures or limitations;
- next intended operation;
- rollback point.

Save points are repository artifacts, not merely conversation notes.

## 6. Monolith-refactor rule

The `index.html` refactor is performed on the current development branch.

Each extraction must follow:

```text
MAP
  ↓
DEPENDENCY AUDIT
  ↓
INTERFACE CONTRACT
  ↓
BASELINE
  ↓
EXTRACT
  ↓
VERIFY
  ↓
APPLICATION SMOKE TEST
  ↓
COMMIT
  ↓
SAVE POINT
```

Do not merge an incomplete extraction into `main` merely to preserve work.

## 7. Promotion to `main`

Promotion should occur only at a deliberate release/integration checkpoint.

Before promotion, verify at minimum:

- current combat workflows pass;
- opponent-turn/history workflows pass;
- Tactical Advisor workflows pass;
- data-source policy and catalogue behavior remain correct;
- BSData extraction and regression fixtures pass;
- deployment/build checks pass;
- GitHub Actions are green where applicable;
- no known blocker remains in the intended release scope;
- a final release save point identifies the exact commit being promoted.

Promotion should normally be performed through a reviewed merge/pull request rather than by manually copying files between branches.

## 8. Handling the 12 commits on `main`

Because `main` currently contains commits not present on the development branch, those commits must be reviewed before any integration.

For each relevant commit, determine whether it is:

- already represented by equivalent work on the feature branch;
- required for the release;
- obsolete;
- conflicting with current architecture;
- or unrelated to the current development line.

Do not merge the 12 commits as a batch solely because GitHub reports the feature branch as behind.

## 9. Handling conflicts

If integration with `main` produces conflicts:

1. stop the integration;
2. preserve the pre-integration feature-branch checkpoint;
3. identify the conflicting behavior, not merely the conflicting lines;
4. resolve one architectural area at a time;
5. rerun the affected validation suite;
6. create a new save point before continuing.

Never resolve a branch conflict by choosing the newest-looking `index.html` without validating which application state it represents.

## 10. Cross-chat continuation protocol

At the beginning of a new chat, establish:

```text
Repository
↓
Active branch
↓
Latest save-point document
↓
Save-point commit
↓
Known-good application state
↓
Current task
```

The latest save point takes precedence over remembered conversation context.

If the user identifies a different branch, compare it against the documented working branch before switching.

## 11. What `main` is not

`main` is not automatically:

- the newest code;
- the largest version number;
- the branch with the newest commit date;
- the correct source for ongoing development.

The current working branch is established by project history and explicit save points.

## 12. Current policy

For the current `index.html` architecture project:

**Continue on `feature/opponent-turn-history`.**

Do not promote to `main` until the monolith extraction work and the currently active gameplay changes have reached a deliberate validated integration checkpoint.

The next architectural changes should remain isolated and reversible on the feature branch.
