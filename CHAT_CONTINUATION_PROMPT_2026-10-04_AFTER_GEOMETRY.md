Resume OnoForge 40K from the verified Geometry Extraction save point.

Repository: Grumpa916/onoforge40k
Authoritative branch: feature/opponent-turn-history
Latest save point: 082fba3b19faaeb2fcb316f252e843e4dd235f46
Verified geometry code: 831ea465d0322db937bf73cbbcd2d5e7e7214394

READ FIRST:
CHAT_SAVEPOINT_2026-10-04_GEOMETRY_EXTRACTION_VERIFIED.md

Verified browser state:
- Game timer works for both sides.
- Pause/resume works.
- Save Battle works locally.
- Battlefield map renders.
- Extracted battlefield distance calculation still works; changing unit position changes the displayed distance correctly.

Current extracted modules:
- js/data/bsdata-parser.js
- js/ui/game-timer.js
- js/core/geometry.js

Do not re-extract these.

Branch safety:
- Keep work on feature/opponent-turn-history.
- main is untouched.
- Do not merge/rebase feature/opponent-turn-history-clean-reset.
- User does not have Python installed locally.

Next job:
1. Perform a read-only dependency audit of the remaining small pure/coherent candidates.
2. Prefer a narrow, coherent boundary over scattered one-function files.
3. Candidate areas from the existing call graph:
   - primary scoring helper cluster;
   - cloud config/payload utility cluster;
   - saved-list policy/formatting helpers;
   - broader geometry only after dependency mapping.
4. Inspect direct callers, callees, state/DOM/persistence/cloud dependencies, declaration-order assumptions, and validation coverage.
5. Document the chosen boundary before editing.
6. Make one small reversible extraction.
7. Run GitHub Actions.
8. Browser-test only the affected workflow.
9. Create a new save point after browser verification.

Avoid extracting battle state, event/undo, Tactical Advisor, combat engine, physical-dice resolver, or broad renderer/bootstrap code at this stage.