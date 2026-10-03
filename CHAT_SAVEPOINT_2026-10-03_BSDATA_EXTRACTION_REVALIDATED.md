# OnoForge 40K — Chat Save Point
## 2026-10-03 — BSData Extraction Candidate Revalidated

This document is the authoritative handoff for resuming the current OnoForge 40K work after the controlled-reset / BSData parser extraction work completed in the current chat.

## Repository

- Repository: `Grumpa916/onoforge40k`
- Current candidate branch for this work: `refactor/bsdata-extraction-candidate`
- Candidate HEAD at the time of this save point: `f8ac11571c9015720f0b3039dc7558e911088470`
- Development branch targeted by the current PR: `feature/opponent-turn-history`
- PR base SHA at creation: `aee09c197b70af523bfad59d14d117fd79c8303c`
- Current PR: **#6 — Candidate: extract BSData parser from index.html — revalidated**
- PR URL: https://github.com/Grumpa916/onoforge40k/pull/6
- PR state: open, not merged

## Important branch history / controlled-reset context

There are currently two related development lines that must NOT be silently conflated:

1. `feature/opponent-turn-history` is the base targeted by PR #6 and is the immediate continuation point for the BSData parser extraction candidate.
2. `feature/opponent-turn-history-clean-reset` is a separate, diverged development line containing the earlier controlled-reset/deployment work. It currently has a different HEAD and is not the base of PR #6.

At the time of this save point:

- `feature/opponent-turn-history` HEAD = `aee09c197b70af523bfad59d14d117fd79c8303c`
- `feature/opponent-turn-history-clean-reset` HEAD = `0cf3528ef4d8e39f1816d78755633329b606c7ca`
- The branches are diverged; do not merge or rebase them casually.
- The common merge base reported by GitHub is `132551b340bdff635eeb9b193470f2c1a8e46ccd`.

The earlier controlled-reset artifacts remain important historical context, especially:

- `CHAT_SAVEPOINT_2026-10-01_CONTROLLED_RESET.md`
- `CONTROLLED_RESET_STARTPOINT_2026-10-01.md`
- `NEXT_CHAT_PROMPT_2026-10-01_CONTROLLED_RESET.txt`
- `CHAT_SAVEPOINT_2026-10-02_COMPATIBILITY_BRIDGE_INTEGRATED.md`
- `CHAT_SAVEPOINT_2026-10-02_DEPLOYMENT_DIAGNOSTIC_PAUSE.md`
- `CHAT_SAVEPOINT_2026-10-02_DEPLOYMENT_INTERACTION_SEAM.md`
- `CHAT_SAVEPOINT_2026-10-02_DEPLOYMENT_MAP_LIVE_VERIFIED.md`
- `CHAT_SAVEPOINT_2026-10-02_DEPLOYMENT_PANEL_STATE_TEST_READY.md`
- `CHAT_SAVEPOINT_2026-10-02_DEPLOYMENT_STATE_SEAM_INTEGRATED.md`
- `CHAT_SAVEPOINT_2026-10-02_DEPLOYMENT_WORKFLOW_ALL_TESTS_PASS.md`
- `CHAT_SAVEPOINT_2026-10-02_TABLET_ARTIFACT_PIPELINE.md`

## What was completed in this session

The immediate goal was to validate the BSData parser extraction candidate without disturbing the verified runtime data.

### Browser smoke test — PASSED

The candidate rendered successfully in the browser and the following workflow was manually tested:

- List Builder loaded correctly.
- Existing army/list state remained intact.
- BSData 11e unit cross-check completed successfully.
- The cross-check explicitly reported that verified runtime data was **not overwritten**.
- Unit search/add workflow worked.
- Leader attachment workflow worked.
- Leader configuration modal opened correctly.
- Leader configuration/save behavior worked.
- Attached leader remained correctly attached to the battlefield unit after configuration/save.
- The tested list state remained intact after these operations.

The successful test used the candidate branch served through jsDelivr/raw GitHub content. Python was NOT used on the user's computer and must not be assumed to be installed there.

### UI/data behavior observed

The candidate currently displays:

- `Browser app loaded locally • Source: BSData 11e • current`
- `Opponent List passes current prototype validation`
- BSData cross-check control: `Refresh BSData Cross-Check`
- Successful alert: `Refreshed 3 BSData 11e units for cross-checking. Verified runtime data was not overwritten.`

Leader attachment was tested using Broodlord + Genestealers. The UI correctly showed the attached leader as part of the Genestealers battlefield unit, and `Configure Leader` opened a configuration modal with the Broodlord's wargear and active weapon profile.

## GitHub / CI status at save point

A fresh PR was created because the earlier PR #3 had been closed after its candidate branch was recreated/updated and could not simply be reopened.

Current PR:

- #6
- Title: `Candidate: extract BSData parser from index.html — revalidated`
- Base: `feature/opponent-turn-history`
- Head: `refactor/bsdata-extraction-candidate`
- Head SHA: `f8ac11571c9015720f0b3039dc7558e911088470`
- Open and not merged.

The previously inspected candidate workflow run was green and the browser smoke test passed. The GitHub Actions page also showed warnings about:

- Node.js 20 deprecation for `actions/upload-artifact@v4` being forced onto Node.js 24.
- `ubuntu-latest` migration to Ubuntu 26 beginning October 19, 2026.

These are warnings, not current functional failures, but they should be addressed deliberately rather than mixed into the BSData extraction task.

## Immediate next step

Do NOT begin a new refactor yet.

First:

1. Open PR #6 and inspect its current GitHub Actions checks.
2. Wait for / trigger the appropriate validation if GitHub has not yet run it for the current PR HEAD.
3. Confirm the current PR HEAD is still `f8ac11571c9015720f0b3039dc7558e911088470` or record the newer SHA if a validation-only commit has been added.
4. Require the relevant validation workflow(s) to be green.
5. Review the PR diff before merging.
6. If validation remains green and the diff is consistent with the intended BSData parser extraction, merge PR #6 into `feature/opponent-turn-history`.
7. After merge, verify the resulting `feature/opponent-turn-history` HEAD and run a browser smoke test against the merged branch before starting the next functional task.

Do not merge PR #6 merely because the browser test passed; the final gate is the GitHub Actions validation plus diff review.

## What NOT to do

- Do not use Python on the user's computer. The user explicitly stated Python is not installed there.
- Do not ask the user to install Python just to perform this project workflow.
- Do not overwrite verified runtime BSData merely to prove that the parser works.
- Do not reintroduce a dependency on `40K.app` without first inspecting the current architecture and documenting the reason.
- Do not casually merge `feature/opponent-turn-history-clean-reset` with `feature/opponent-turn-history`; they are diverged development lines.
- Do not reset to an older checkpoint simply because it appears in an earlier chat handoff.
- Do not declare the BSData extraction complete until PR #6's current validation and diff have been checked.

## Project operating principles carried forward

- Preserve the working game application while extracting/refactoring dependencies incrementally.
- Prefer small, reversible changes with explicit save points.
- Browser smoke tests are important because this project is ultimately a browser application and several prior failures only became obvious in the live UI.
- GitHub Actions should be used as a structural/automated gate, but passing CI does not replace manual browser verification for interaction behavior.
- Preserve verified runtime data when adding BSData cross-checking/parsing functionality.
- Keep extracted modules dependency-aware; do not remove inline code until all consumers and initialization order are understood.
- Treat deployment and `index.html` extraction as separate concerns from the functional opponent-turn workflow unless a dependency requires otherwise.

## Known user workflow constraint

The user is testing primarily through a desktop browser and sometimes an iPad. They are new to iPadOS and may need explicit, simple testing instructions. When a test URL is needed, provide a directly usable link and state exactly what should be clicked and what result should be observed.

## Next-chat prompt

Copy/paste the following into the next chat:

> Resume the OnoForge 40K project from the latest save point.
>
> Repository: `Grumpa916/onoforge40k`
> Save point: `CHAT_SAVEPOINT_2026-10-03_BSDATA_EXTRACTION_REVALIDATED.md`
> Current BSData candidate branch: `refactor/bsdata-extraction-candidate`
> Candidate HEAD at save point: `f8ac11571c9015720f0b3039dc7558e911088470`
> Current PR: **#6 — Candidate: extract BSData parser from index.html — revalidated**
> PR base: `feature/opponent-turn-history`
> PR URL: https://github.com/Grumpa916/onoforge40k/pull/6
>
> READ THE SAVEPOINT FIRST.
>
> The browser smoke test has already passed. Confirmed: List Builder rendering, BSData 11e cross-check, unit search/add, leader attachment, leader configuration/save, and preservation of existing list state. The BSData refresh explicitly reported that verified runtime data was not overwritten.
>
> Do not start new development yet. First inspect PR #6, verify the current HEAD and GitHub Actions status, review the diff, and only merge after the current validation is green and the diff is consistent with the intended extraction.
>
> Important: `feature/opponent-turn-history-clean-reset` and `feature/opponent-turn-history` are diverged branches. Do not merge/rebase them casually. The immediate continuation point for this task is PR #6 targeting `feature/opponent-turn-history`.
>
> Python is not installed on my computer. Do not give me workflows that require Python locally. Use GitHub Actions, browser testing, GitHub files, or other available project tooling instead.
>
> Continue from the saved state without repeating already-passed browser tests unless a new change invalidates them.
