Resume OnoForge 40K from the verified Primary Scoring Utilities extraction save point.

Repository: Grumpa916/onoforge40k
Authoritative branch: feature/opponent-turn-history
Latest save point: 0da5ac01c2502ef34cf2f41598d246211531efe9
Verified application code before savepoint: 85fcb8c35925eb40af563cf1a55db4e7def7d3c1

READ FIRST:
CHAT_SAVEPOINT_2026-10-04_PRIMARY_SCORING_EXTRACTION_VERIFIED.md

Verified browser state:
- Timer works for both sides.
- Pause/resume works.
- Save Battle saves locally.
- Battlefield map distance works after geometry extraction.
- Primary Mission → Show Scoring renders normally after primary-scoring utility extraction.
- Primary scoring projections/rows display correctly.

Current extracted modules:
- js/data/bsdata-parser.js
- js/ui/game-timer.js
- js/core/geometry.js
- js/battle/primary-scoring-utils.js

Do not re-extract these.

Important lesson from the previous regression:
- State-dependent scoring helpers must remain in index.html. Only pure helpers were extracted.

Next job:
1. Perform a read-only dependency audit for the next narrow candidate.
2. Compare remaining cloud utility/config and saved-list utility candidates.
3. Prefer the smallest coherent boundary with an explicit interface.
4. Document the boundary before editing.
5. Make one small reversible extraction.
6. Run GitHub Actions.
7. Browser-test only the affected workflow.
8. Create the next save point after verification.

Branch safety:
- Keep work on feature/opponent-turn-history.
- main remains untouched.
- Do not merge/rebase feature/opponent-turn-history-clean-reset.
- User does not have Python installed locally.
