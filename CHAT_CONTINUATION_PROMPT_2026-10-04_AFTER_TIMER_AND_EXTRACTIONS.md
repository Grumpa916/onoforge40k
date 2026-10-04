Resume OnoForge 40K from the verified timer/extraction save point.

Repository: Grumpa916/onoforge40k
Authoritative branch: feature/opponent-turn-history
Latest save point commit: 186808ffb6a987182c63a08a64c4d4531206efe1
Application code before savepoint: a2a9389673011ba30f76bda3c94d526dc81b481f

READ FIRST:
CHAT_SAVEPOINT_2026-10-04_TIMER_AND_EXTRACTIONS_VERIFIED.md

Current verified modules:
- js/data/bsdata-parser.js
- js/ui/game-timer.js
- js/core/geometry.js
- js/battle/primary-scoring-utils.js
- js/data/saved-list-utils.js

Timer browser verification:
- Overall Game Time runs.
- Friendly and opponent clocks run.
- Pause/resume works.
- Save Battle saves locally.
- Phase cycling works.
- Turn switching preserves each side's accumulated time.
- Opponent starts from zero rather than inheriting the prior player's time.
- Switching back preserves both cumulative clocks.

Timer architecture:
- gameTimer.turnSide is authoritative for active-side timing.
- switchTurnClock(next,outgoingSide) accepts the outgoing side explicitly.
- tests/game-timer.test.js covers the prior failure mode.

Primary scoring:
- Primary Mission → Show Scoring renders correctly.
- State-dependent scoring helpers remain in index.html.

Geometry:
- Battlefield map distance behavior verified.

Saved lists:
- Local saved-list behavior verified.
- Cloud Login showed Failed to fetch in standalone; park cloud auth until hosted HTTPS testing.

Branch safety:
- Keep work on feature/opponent-turn-history.
- main remains untouched.
- Do not merge/rebase feature/opponent-turn-history-clean-reset.
- User does not have Python locally; use GitHub Actions for Python-based checks.

Next task:
1. Perform a fresh read-only dependency audit of the remaining low-risk index.html candidates.
2. Prefer a coherent pure utility boundary.
3. Compare candidates before editing.
4. Document the chosen boundary.
5. Make one small reversible extraction.
6. Run CI.
7. Browser-test the affected feature.
8. Save the next milestone only after browser verification.

Avoid broad extraction of battle state, events/undo, Tactical Advisor, combat engine, physical-dice resolver, renderer/bootstrap, or cloud authentication.