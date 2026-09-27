# OnoForge 40K — Next Chat Handoff
Date: 2026-09-27

## 1. Resume point
Project: OnoForge 40K
Repository: Grumpa916/onoforge40k
Active development branch: feature/tactical-impact-layer
Active branch HEAD: 8f9495ec55a109e3556f1c04e55253d94231134c
Main HEAD: 664e515850ed05a896e92a60aea0e29453f782f8
PR: #1 "Add Tactical Advisor engagement decision layer"
PR status: OPEN, DRAFT, UNMERGED
No merge to main is authorized without explicit user instruction.

## 2. Important branch relationship
main and feature/tactical-impact-layer are intentionally diverged.
- feature branch is 65 commits ahead of main and 9 commits behind main.
- main contains newer architecture/data-source governance work:
  DATA_SOURCE_POLICY.md
  DATA_SOURCE_MANIFEST.json
  ARCHITECTURE_INDEX.json
  ARCHITECTURE_MAP.md
  ARCHITECTURE_NEXT_STEPS.md
  INDEX_HTML_FUNCTION_INVENTORY.md
  INDEX_HTML_STRUCTURE.md
  PHASE1_EXTRACTION_PLAN.md
  REFACTOR_QA_GATES.md
  rules-coverage-matrix.json
- Before further substantial Tactical Impact work, reconcile the feature branch with the newer main architecture/data policy carefully. Do not blindly merge or overwrite either side.

## 3. North Star
- Tablet-first tournament workflow.
- Fast live-game data entry.
- Reduce player bookkeeping.
- Surface phase-relevant information.
- Complete actual game loop before advanced systems.
- Build one complete action, test it live, then expand.
- Avoid letting architecture/audit work displace playable-app development.
Read:
1. ORIGINAL_PROJECT_HANDOFF.md
2. DEVELOPMENT_GUIDE.md
3. ROADMAP.md
4. CURRENT_SESSION_HANDOFF.md
5. DATA_SOURCE_POLICY.md (from main)
6. ARCHITECTURE_INDEX.json (from main)

## 4. Data-source policy — CURRENT authoritative project direction
main's DATA_SOURCE_POLICY.md is now the project-level policy:
Tier 1: Games Workshop official sources = authoritative.
Tier 2: BSData 11e = structured/cross-check source; must not silently override official data.
Tier 3: Warhammer Event Companion = event/reference data, versioned and isolated.
Tier 4: other community/secondary sources = discovery/cross-check only unless independently verified.
40k.app / 40kapp-source.json = legacy, not authoritative, and should not be a canonical runtime dependency.

Required provenance should include source type/name/url/version/revision/date/retrievedAt/verification status/notes.
Do not silently mix publication states.
Conflicts must be recorded, not silently resolved.
Points should come from current official Munitorum Field Manual.
The current repository main branch still contains data/40kapp-source.json as a historical legacy file because main's policy says to remove it only after runtime loader references are verified.
The feature branch already removed the runtime dependency and deleted its copy.

## 5. Tactical Advisor doctrine
Tactical Advisor is NOT "what can I kill best?"
It should identify tactically significant engagements in the context of winning the game.
Factors:
- mission impact
- enemy threat removed/suppressed
- board/control impact
- survivability/exchange
- opportunity cost
- future-turn impact
- risk/reliability
- combat value, but combat must not dominate

Conceptual model:
Current Game State -> Candidate Engagement -> Resulting Game State -> Tactical Consequence

Engagement types:
Kill, Deny, Contest, Secure, Disrupt, Trade, Protect, Position, Score.

Explanations must be causal/human-readable.
Context-sensitive weighting is desired.
Approximate geometry can identify candidates/context but is never authoritative for exact legality, charge range, or precision outcomes.
Physical tabletop measurement is authoritative.

## 6. Tactical Impact implementation on feature branch
Files added/modified:
- tactical-advisor-engine.js
- tactical-advisor-adapter.js
- tactical-charge-workflow.js
- tests/tactical-advisor-engine.test.js
- tests/tactical-advisor-adapter.test.js
- tests/tactical-charge-workflow.test.js
- .github/workflows/tactical-advisor-tests.yml
- .github/workflows/tactical-advisor-preview.yml
- .github/workflows/deploy.yml
- CURRENT_SESSION_HANDOFF.md

Existing Advisor v2 already uses shared combat/rules engine and includes mission/scoring/threat/exchange/future-value signals.
Existing Advisor remains authoritative; Tactical Impact is comparison-only for Charge until live validation succeeds.

## 7. Charge workflow status
Intended live flow:
Tactical Advisor target assessment
-> physical distance
-> projected Charge/Fight consequence
-> roll 2D6 physically
-> record Charge Successful or Charge Failed
-> successful target state
-> Fight

Physical dice entry is intentionally not required for Charge.
A successful Charge requires explicit target selection plus authoritative physical measurement.
Failed Charge must not create Fight eligibility.
Fight state architecture already consumes chargeMade/charge targets conceptually.

Deploy-time controls currently provide:
- target checklist
- Charge Successful
- Charge Failed
- Continue to Fight after a result is recorded

## 8. Live testing history / exact bugs found and fixed
The preview-debugging sequence found and fixed:
1. Script injection newline bug.
2. Tactical Impact renderer used window.state instead of the app's shared state.
3. Charge phase was read from r.phase instead of r.decisionContext.phase.
4. Adapter state access was not using the runtime state bridge.
5. Charge execution renderer referenced out-of-scope isCharge.
6. Entry resolution was hardened.
7. WS-only weapon profiles were not recognized as melee.
8. BSData Range characteristic was not normalized to OnoForge rng.
9. Refreshed BSData was incorrectly treated as merely supplemental unless canonical data already existed; refresh path was changed to overlay the embedded catalogue for the factions actually refreshed.

Most recent live error before the melee fix:
Outgoing: no-melee-profiles-resolved
Return: no-melee-profiles-resolved

Root cause:
BSData raw data identifies melee profiles using a Range characteristic of Melee and WS.
OnoForge's normalization dropped the Range semantic into an unrecognized shape, and the internal Fight eligibility filter required literal MELEE.
A fix now maps raw Range -> internal rng and also recognizes WS-without-BS as melee.

Important interpretation:
This was primarily an OnoForge normalization/adapter bug, not evidence that BSData lacked the melee profile.
Example source fact observed in BSData: Exocrine has "Powerful limbs" as a melee profile.
The project should still treat BSData as a cross-check source, not canonical authority.

## 9. Current live test scenario
User's browser battle setup:
- Round 1
- Charge phase
- friendly attacker: Exocrine
- enemy target: Aggressor Squad
- target selected in existing Tactical Advisor
- exact distance currently 5 inches in Tactical Context
- distance band Under 6"
- line of sight Unknown
- already engaged: No
- Tactical Impact Layer appears at top of Battle Mode.
The user has a browser copy of the preview and may keep it open.

Do not click Charge Successful or Charge Failed until Projected Fight appears and is understood.

## 10. Latest validated preview
Latest feature-branch head 8f9495ec has a green PR-triggered Tactical Advisor Preview Validation run:
run 36339733564
artifact 10937888558
The preview at that head includes the BSData normalization and refresh-overlay changes plus the Tactical Impact/Charge code.

## 11. Current feature-branch source policy code
Feature branch currently contains an inline policy that says:
canonical = BSData 11e
bootstrap = embedded catalogue
This CONFLICTS with the newer main DATA_SOURCE_POLICY.md, which says official GW data is Tier 1 authoritative and BSData is Tier 2 structured cross-check.
This must be reconciled before further major data-pipeline work.

## 12. Current main architecture direction
main's ARCHITECTURE_INDEX says:
- index.html remains ~1 MB / ~708 named functions.
- supporting checkpoint/audit modules are diagnostic only and not runtime-imported.
- proposed extraction order:
  shared identity/state contracts
  deployment/reserves/battlefield
  combat/physical dice
  missions/objectives/scoring
  tactical advisor
  UI shell
- no gameplay changes during structural extraction batches.
- one subsystem at a time.
- preserve public behavior first.
- do not reintroduce post-build hotfixes for application code.
- architecture extraction was paused pending exact source retrieval.

## 13. Uploaded index.html from this chat
User uploaded an index.html file for inspection.
It is an older build and should NOT be assumed to represent the feature preview.
It still reflected the old 40k.app source pipeline and did not contain the injected Tactical Impact code.
It was useful only as a snapshot of the old state.

## 14. Automation created
A recurring condition-watch automation was created:
Title: 40K Data Change Watch
Schedule: daily at 9 AM
Purpose: compare current Games Workshop official 40K rules/data sources and BSData 11e for meaningful changes relevant to OnoForge, especially datasheets, points, army rules, FAQs/errata, and faction updates.
Notify only when meaningful new changes are found.

## 15. Immediate next engineering action
Do NOT restart planning.
First reconcile the feature branch with main's newer data-source/architecture policy.
Then continue from the normalized BSData pipeline.
The next gameplay validation target is:
Exocrine -> Aggressor Squad -> projected Fight exchange -> Charge result -> Fight.

If Projected Fight still fails after the normalization build, inspect the exact runtime diagnostic rather than adding another blind UI workaround.

## 16. Safety / workflow
- Preserve existing working functionality.
- Keep feature branch and draft PR separate from main.
- No automatic merge.
- Keep changes isolated and testable.
- Verify CI before treating a build as valid.
- Prefer fixing root causes at the source/normalization boundary over UI-specific patches.
