Resume the OnoForge 40K project from the verified Game Timer save point.

Repository: `Grumpa916/onoforge40k`
Authoritative development branch: `feature/opponent-turn-history`
Latest save-point commit: `e41a254660b0c67e938a7d918eb0beb9618880c5`
Functional timer verification commit: `f57dd5ba57452371994fd4d16adb2cb975cf9b42`

READ FIRST:
`CHAT_SAVEPOINT_2026-10-04_GAME_TIMER_EXTRACTION_VERIFIED.md`

Verified browser state:
- Game Time runs.
- My turn clock runs.
- Opponent turn clock runs.
- Turn switching tracks the correct side.
- Pause Game stops both clocks.
- Resume Game restarts both clocks.
- Save Battle saves locally.
- Existing opponent-turn/combat functionality remains intact.

Important:
- Do not re-extract Game Timer; `js/ui/game-timer.js` is already the extracted module.
- Keep `main` untouched.
- Do not merge/rebase `feature/opponent-turn-history-clean-reset`.
- The user does not have Python installed locally; use GitHub Actions for Python-based checks.
- Work incrementally and do not repeat already-passed browser tests unless a new change affects them.

Next job:
1. Audit the remaining `index.html` monolith for the next narrow extraction candidate.
2. Map direct callers, shared state, persistence, render, cloud, and cross-module dependencies.
3. Choose a clean boundary.
4. Make the smallest reversible implementation.
5. Run GitHub Actions.
6. Browser-test the affected workflow.
7. Create a new save point after verification.
