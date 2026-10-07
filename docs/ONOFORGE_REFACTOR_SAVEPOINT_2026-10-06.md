# OnoForge 40K Refactor Savepoint — 2026-10-06

## Exact continuation point
- Repository: Grumpa916/onoforge40k
- Active refactor branch: `refactor/clean-reset-monolith`
- Current refactor HEAD: `4509f53421615712b1cf8d1e38d8d045f7b7ca89`
- Commit message: `Test secondary round ledger state`
- Parent: `b07325615e15f512e2fa95b36276b08b1912bd3a`
- Savepoint branch: `savepoint/refactor-2026-10-06-450-failure`
- Savepoint branch points exactly at `4509f534`; no refactor code has been changed after the failure.

## Immediate status
The latest target was **Secondary Round Ledger State**. The extraction/module was added before the test-only commit:
- Module: `js/state/secondary-round-ledger-state.js`
- Module function: `createSecondaryRoundLedgerStateController`
- Export: `window.OnoForgeSecondaryRoundLedgerState`
- Extracted function: `ensureSecondaryRoundLedger`

The failing commit `4509f534` changed only `tests/monolith-refactor.test.js` to add the module marker, syntax/VM loading, export assertion, and focused normalization tests.

GitHub Actions:
- Run: `37553588883`
- Workflow: OnoForge Monolith Refactor Tests
- Run number: 58
- Result: FAILURE
- Job: `validate`
- Job ID: `112574540431`

## Exact failure
The workflow failed at:
`tests/monolith-refactor.test.js:269`

Error:
`Error: Opponent secondary round ledger shape regression`

The failing assertion is:
`if(!secondaryRoundLedgerState.secondaryOppScoredRound||typeof secondaryRoundLedgerState.secondaryOppScoredRound!=='object'||Array.isArray(secondaryRoundLedgerState.secondaryOppScoredRound))throw new Error('Opponent secondary round ledger shape regression');`

The fixture intentionally/accidentally initialized:
`secondaryOppScoredRound: []`

The implementation currently checks only:
`if(!state[roundKey]||typeof state[roundKey]!=='object')state[roundKey]={};`

Because arrays satisfy `typeof value === 'object'`, an existing array is retained. Therefore the test expects stronger normalization than the current implementation provides.

## Important diagnosis / next action
Do NOT blindly change unrelated code.

Before repairing:
1. Inspect the original inline `ensureSecondaryRoundLedger` implementation at the parent/source checkpoint and its callers.
2. Determine whether arrays were historically accepted or whether the extraction must preserve the exact original contract.
3. Prefer the smallest correction:
   - If the original contract rejects arrays, update the extracted module to use an object-shape guard (matching the established state modules), then keep/adjust the test to validate that behavior.
   - If the original contract intentionally preserves arrays, correct only the test fixture/assertion.
4. Re-run the focused test locally if possible, then commit.
5. Verify GitHub Actions GREEN before starting another extraction.
6. Do not stack another target on top of a red commit.

## Current target candidates inspected after the previous GREEN
The previous confirmed GREEN refactor commit was:
- `9368a598f195f7bee9ce33be2c5135107da4a283`
- Target: Objective Control Sources State
- Module: `js/state/objective-control-sources-state.js`
- User confirmed GREEN.

After that checkpoint, the following inline candidates were inspected:
1. `ensureObjectiveTurnSnapshot` / `objectiveTurnStartOwner`
   - Coupled to objective control history/scoring; inspect carefully before extraction.
2. `ensureSecondaryRoundLedger`
   - Current target; now extracted but test is red as described above.
3. `ensurePersonalArmyNotes`
   - Coupled to saved-list/cloud update behavior; likely only extract if a bounded state helper is justified.
4. `ensureSecondaryPersonalPlans` plus backward-compatible `ensureSecondaryOrderPersonalPlans`
   - Potential small state cluster; inspect callers.
5. `ensureGameReferencePersonal` / `gameReferencePersonalForBattle`
   - Coupled to game-reference editor UI; inspect before extraction.
6. `ensureTacticalTurnDraw`
   - Calls `secState` and `drawTactical`; likely not a clean isolated target.
7. `ensureOpponentTurnCaptureState`
   - Calls Tactical state and is related to parked opponent-turn workflow; be conservative.
8. `ensureScoreLedger`
   - Scoring-coupled; explicitly avoid during this low-risk refactor pass.

## Completed / verified extraction history
1. BSData parser
   - `js/data/bsdata-parser.js`
   - Verified commit: `494002c4`

2. Pure utilities
   - `js/utils/pure-utils.js`
   - Functions: `battlefieldDistanceBetween`, `formatSavedListDate`, `unitListCategory`, `unitListCategoryName`, `sortUnitList`, `wargearCostLabel`, `secondaryRowInputId`, `secondaryRowNeedsAmount`
   - Commits: `c16907b9`, `ebf58ef2`, `a780952c`
   - Latest documented Actions run was successful.

3. Reserve state
   - `js/state/reserve-state.js`
   - Verified fix: `9bb8a5be906645ee7696f80e6055fd1ae97149b5`
   - GREEN.

4. Deployment-plan state
   - `js/state/deployment-plan-state.js`
   - Module creation: `536a923e2784d155748024d033ec9322b9cefb07`
   - Wiring: `b8bbd1b6a9cd3cefa9f492e19533e2113fbf7aca`
   - Key exposure: `dac4a99150b66559744b278110afb2416c53a570`
   - Key wiring: `6e37bd8fe304c4d1bcfd6ba6a9c4760f9162d8a4`
   - Cover extraction: `b2ea88baf9e28817c25a710138aa8d15d872d1dd`
   - GREEN confirmed.

5. Objective-map layout state
   - `js/state/objective-map-state.js`
   - Creation: `21722fff6af9511eedca6c2bb35f0e51fca4ccb9`
   - Wiring: `32c278da6e2e8b6e4bb4db5a1d5124b5c845f60b`
   - Harness: `b2e596fbac3bccd205f4278d85453877f01178b0`
   - CI: `1a8dca82fae73f35a357f8d607a5fc1f7e05490c`
   - GREEN confirmed.

6. Objective metadata state
   - `js/state/objective-metadata-state.js`
   - Creation: `2b722fe8e0166ecf0f5f1f87d5bc57d112072b1f`
   - Wiring: `7177965d226206f4b712477b09f7e61ffc4bb2e7`
   - Tests: `6cd2af436f7f9c2be2daf63064eb2df77a440ecd`
   - CI: `675c60c238a571e925d417709cf59fbb39e2fe33`
   - GREEN confirmed.
   - Deliberately left battlefield geometry/spatial classification inline.

7. Transport state
   - `js/state/transport-state.js`
   - Commits: `0498b24b89ba6a9c10d53209b4af94ca24bfe7a1`, `1ed740f08714c6bdbc3c0d210f5b85484433f1bd`, `168e14d4f3797ee6d0ce20575bac4d24ec46778a`, `d0372b1d5e320a159ff588a1526b32931d5d1edf`
   - GREEN confirmed.
   - Extracted embarkation/passenger state helpers.
   - `transportDeclarationSectionHtml` remained inline intentionally.

8. Stratagem state
   - `js/state/stratagem-state.js`
   - Initial: `9f57e54e29fa7507929b9928194e5fda5d3a7e0c`
   - Fixes: `699f38393b1288e4dd56c12c464599256171b040`, `02f0ddbe5adbd1462c06d00e2914d60b5ce1dadd`
   - Wiring: `611bc8a1dcf7df4856a0e889e53ac58047f85da8`
   - Tests: `1d61f2a0735052aaf8689660863f16ece50b86ec`
   - CI path: `4042251101597a03819219d49d84715ea2969353`
   - Test assertion repair: `b79c84df092190ad732a15b2cfce257a8bf45983`
   - B79 GREEN confirmed.
   - Left `loadStratagems` and `stratagemCP` inline.

9. Game Timer State
   - `js/state/game-timer-state.js`
   - Creation: `d8256b15050f36481e801d24cf127568054fbe80`
   - Wiring: `b9f730ae7a45d96ce7e48656ae24d205d26ab1ad`
   - CI: `7494567f824b98f7859974b7548eec775fcef307`
   - GREEN confirmed.
   - Extracted timer state calculations, leaving interval/DOM/UI behavior inline.

10. Phase CP State
   - `js/state/phase-cp-state.js`
   - Creation: `76f26c10fdd9c2ff5798e985ae3db7775bf17a1c`
   - Wiring: `9ae98c7664c3662d3aaf1679219e662f1bb86543`
   - CI: `4d293d7e6c1de41ff39857c54fee7572ce0efaee`
   - GREEN confirmed.
   - Functions: `ensurePhaseCPState`, `phaseCPKey`, `rememberPhaseCP`, `restorePhaseCP`.

11. Objective Control History State
   - `js/state/objective-control-history-state.js`
   - Creation: `8a2cf12e09a7b5607f14b193a4e6e68d73703f74`
   - Wiring: `759a8d60436c74814e28ca00b88c34548d1a0b63`
   - CI/head at completion: `e33a3490cd8bffe22531cadbf8e6d7ed6593d449`
   - GREEN confirmed.
   - Functions: `ensureObjectiveControlHistory`, `objectivePreviousTurnKey`, `objectivePreviousTurnOwner`.

12. Objective Control Sources State
   - `js/state/objective-control-sources-state.js`
   - Initial: `4d8ce7316c332365a5f1ba4f42262b67d9e72d27`
   - Implementation: `7df9d26a2a13c216bb38931f3e25ab992a396237`
   - Wiring: `e658ea0c59ee36371ab398fc2c06415f9b8eaa89`
   - Tests/current previous GREEN: `9368a598f195f7bee9ce33be2c5135107da4a283`
   - GREEN confirmed.
   - Functions: `ensureObjectiveControlSources`, `objectiveControlSourceIds`.

## Refactor discipline
- Exact source must be inspected before extraction.
- Preserve caller names/contracts.
- One bounded extraction at a time.
- Commit -> Actions -> diagnose failures -> GREEN before next target.
- Do not stack extractions on a red target.
- Do not redesign working gameplay.
- Do not touch `render()`, combat resolution, scoring, Tactical Advisor internals, or broad event handlers in this pass.
- `index.html` is about 1.09 MB; GitHub `fetch_file` may return empty content but provide a blob SHA. Use `fetch_blob` by SHA for exact source.
- Container network is unavailable; do not rely on git clone.
- Direct-push workflow status may not appear through the specialized workflow-run connector; direct GitHub Actions REST data was successfully used for run 58.

## Parked live-game work
- Branch: `feature/opponent-turn-history-clean-reset` (and related feature branches)
- Do not merge/redesign it during this refactor.
- Preserve direct battlefield unit distance when explicit unit positions exist.
- Preserve reserve handling.
- Normal combat entry remains Attacker -> Target -> Weapon -> Actual Damage.
- Physical dice resolution remains optional.

## Current next-chat instruction
Resume from commit `4509f53421615712b1cf8d1e38d8d045f7b7ca89` on `refactor/clean-reset-monolith`.
First repair/verify the **Secondary Round Ledger State** failure. Do not start another extraction until Actions is GREEN.
