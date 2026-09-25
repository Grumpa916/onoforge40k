# ONOForge 40K — Master Feature Roadmap

Last updated: 2026-09-25
Repository: Grumpa916/onoforge40k
Branch: main

## Purpose

This is the persistent master roadmap for ONOForge 40K. It is the source of truth for feature-level development planning.

Use this document together with numbered implementation/regression tasks. Numbered tasks are execution steps; this roadmap tracks the larger product capabilities.

### Status key
- 🟢 Core implemented / operational
- 🟡 Partially implemented / needs additional feature work
- 🔵 Active development
- ⚪ Planned
- 🔴 Blocked or needs correction

## A. Army & List Management — 🟢 / 🟡
Goal: Build, inspect, save, and use tournament army lists reliably.
- 🟢 Army/list builder
- 🟢 Saved lists
- 🟢 Faction/list reset behavior
- 🟢 Unit detail inspection
- 🟡 Complete 11th-edition unit/weapon/options/points validation
- 🟡 Attached-character and mixed-profile handling audit
- 🟡 Tournament list validation and edge cases

## B. Battle Setup — 🟢 / 🟡
Goal: Establish a complete tournament game before Battle Mode begins.
- 🟢 Primary mission selection
- 🟢 Battlefield layout selection
- 🟢 Recommended battlefield layout in Battle Setup
- 🟢 Deployment/territory distinction
- 🟡 Complete setup validation
- 🟡 Mission-specific setup rules
- 🟡 Tournament-ready setup checklist

## C. Battlefield / Maps / Deployment — 🟢 / 🟡
Goal: Make the selected battlefield a functional game-state layer.
- 🟢 Three supported map layouts
- 🟢 Interactive objective/map layer
- 🟢 Deployment-zone awareness
- 🟢 Territory awareness
- 🟢 Objective placement/control foundation
- 🟡 Full map-state persistence
- 🟡 Edge-case objective/deployment interactions
- 🟡 Final tablet/touch optimization
- 🟡 Comprehensive map regression coverage

## D. Objectives & Objective Control — 🟢 / 🟡
Goal: Maintain objective control as authoritative battle state.
- 🟢 Objective control tracking by turn
- 🟢 Objective ownership/state tracking
- 🟢 Model/unit presence used for control
- 🟢 Objective state connected to battle state
- 🟢 Complete objective → scoring pipeline for implemented Primary scoring conditions
- 🟢 Primary scoring derived from objective state where appropriate
- 🟢 End-of-turn scoring automation — Track 1
- 🟡 Mission-specific objective rules
- 🟢 Objective history/audit presentation

## E. Mission & Scoring — 🟢
Goal: Make VP/CP and mission scoring tournament reliable.
- 🟢 Primary score tracking
- 🟢 VP increment/decrement controls
- 🟢 CP tracking
- 🟢 Scoring log foundation
- 🟡 Primary mission-specific scoring rules
- 🟢 Secondary mission workflow foundation
- 🟢 Secondary Fixed/Tactical selection, draw, discard, replace, and replenish states
- 🟢 Secondary scoring/progress tracking with round/game caps
- 🟢 End-game scoring summary
- 🟢 Track 3 mission-system regression gate
- 🟢 Mission-specific scoring completeness across all loaded mission cards

## F. Combat Resolution / Physical Dice — 🟢 / 🟡
Goal: Make physical-dice entry the authoritative battle-resolution workflow.
- 🟢 Count-first dice architecture
- 🟢 Physical dice authority
- 🟢 Hits/wounds/save entry
- 🟢 Precision resolution path
- 🟢 Mixed save groups
- 🟢 Model-level damage allocation
- 🟢 Feel No Pain integrity work — Task 32
- 🟢 Variable damage edge cases
- 🟢 Devastating Wounds edge cases
- 🟢 Attached-character/precision edge cases
- 🟡 Full 11th-edition weapon/ability resolution coverage — Track 6
- 🟢 Comprehensive physical combat regression suite
Architectural rule: the physical-dice path must never generate random dice. Mathhammer simulation remains a separate simulation system.

## G. Tactical Advisor — 🟢 / 🟡
Goal: Provide context-aware battlefield decisions without corrupting game state.
- 🟢 Tactical Advisor v1
- 🟢 Target/exchange analysis
- 🟢 Primary target impact
- 🟢 Objective context
- 🟢 Scope isolation/regression protection
- 🟢 Deeper objective-control integration
- 🟢 Mission/VP consequence integration
- 🟢 Current-turn/game-state awareness
- 🟢 Reserve and battlefield-position context
- 🟢 CP/stratagem consequence integration
- 🟢 Expanded recommendation explanations
- 🔵 Tactical Advisor v2 feature pass

## H. Stratagems / Command Points — 🟡
Goal: Track CP and stratagem usage as authoritative battle history.
- 🟢 CP tracking
- 🟢 Stratagem foundation
- 🟢 Action-log foundation
- 🟡 Full stratagem selection/use workflow
- 🟡 Detachment-specific stratagem coverage
- 🟡 CP legality checks
- 🟡 Phase/turn restrictions
- 🟡 Stratagem usage history
- 🟡 Integration with Tactical Advisor

## I. Turn / Phase / Game Management — 🟢 / 🟡
Goal: Make the app follow the tournament game state cleanly.
- 🟢 Player phase tracking
- 🟢 Opponent phase handling
- 🟢 Turn progression foundation
- 🟢 Scoring during appropriate phases
- 🟢 Unit damage/state tracking
- 🟢 Turn-transition safeguards
- 🟡 Game clock
- 🟡 Player-turn timing
- 🟡 Pause/resume timing
- 🟡 Tournament round/time management

## J. Battle Action Log / History — 🟢 / 🟡
Goal: Preserve an auditable history of the game.
- 🟢 Battle Action Log
- 🟢 Scoring events
- 🟢 Attack-resolution events
- 🟢 Stratagem/event foundation
- 🟢 Bounded log storage
- 🟢 More complete authoritative event coverage
- 🟢 Filtering/grouping by turn and phase
- 🟢 Undo/history safeguards
- 🟡 End-game battle report

## K. Tournament Mode / Tablet UX — 🟢 / 🟡
Goal: Optimize the app for actual tournament table use.
- 🟢 Tablet-first active-game interface
- 🟢 Condensed unit displays
- 🟢 Collapsible casualty/model views
- 🟢 Compact scoring controls
- 🟢 Battle Setup separation from Battle Mode
- 🟢 Browser/data status moved out of primary Battle Mode header
- 🟡 Final touch-target audit
- 🟡 Tournament workflow simplification
- 🟡 Game-at-a-glance dashboard
- 🟡 Final tablet usability pass

## L. 11th-Edition Rules Integrity — 🟡
Goal: Ensure the app does not silently mix obsolete or unsupported rules.
- 🟢 Rules-source/audit framework
- 🟢 Regression audits
- 🟢 Physical-dice architecture safeguards
- 🟡 Systematic 11th-edition rules audit
- 🟡 Remove/flag obsolete rules
- 🟡 Unit ability/weapon validation
- 🟡 Mission/secondary validation
- 🟡 Stratagem validation
- 🟡 Special-rule interaction audit

## M. Persistence / Sync / Recovery — 🟢 / 🟡
Goal: Protect tournament game state from refreshes, device changes, and errors.
- 🟢 Local battle-state persistence
- 🟢 Saved army lists
- 🟢 Cloud sync foundation
- 🟢 Login/password recovery workflow
- 🟢 Bounded battle-state storage
- 🟢 Snapshot/undo architecture
- 🟡 Stronger recovery/error handling
- 🟡 Tournament-safe state recovery
- 🟡 Sync conflict handling

## N. QA / Regression / Deployment — 🟢 / 🔵
Goal: Every major feature change must be verifiable before deployment.
- 🟢 Catalogue audit
- 🟢 Objective/scoring audit
- 🟢 Tournament regression audit
- 🟢 Tournament playtest audit
- 🟢 Map interaction audit
- 🟢 Deployment planning / live battlefield map separation
- 🟢 Live deployment tracking / drag-based battlefield movement
- 🟢 Reserve declaration / reserve tray / reserve-to-map deployment
- 🟢 Objective-control audit
- 🟢 Tactical Advisor integration audit
- 🟢 Tournament UI audit
- 🟢 Dice-entry architecture audit
- 🟢 Tactical Advisor scope audit
- 🟢 Model-level damage audit — Task 31
- 🔵 FNP resolution audit — Task 32
- 🟡 Continue feature-specific regression audits
- 🟡 Maintain JavaScript syntax validation
- 🟡 Maintain deployment-gate integrity

# Major Product Completion Tracks

### Track 1 — Authoritative Game State 🟢
Objective control → scoring → VP/CP → turn/phase → action log.

Completed: objective-state scoring linkage, end-of-turn scoring, VP/CP integrity, turn/phase safeguards, authoritative event coverage, action-log filtering, undo/history safeguards, and forward-transition CP preservation. Completion gate: `scripts/track1-completion-audit.js`.

### Track 2 — Complete Physical Combat Resolution 🟢
Dice → hits → wounds → saves → allocation → damage → FNP → casualties → logging.

Completed: physical-dice authority, mixed-save allocation, Precision, variable Damage, Devastating Wounds, FNP, model-level casualties, per-step resolution history, and combat regression gate. Completion gate: `scripts/track2-combat-regression-audit.js`.
Dice → hits → wounds → saves → allocation → damage → FNP → casualties → logging.

### Track 3 — Tournament Mission System 🟢
Primary missions + secondary missions + objective scoring + end-game scoring.

Completed: Tactical/Fixed secondary state machine, Command-phase replenishment, New Orders, end-of-turn Tactical discard-for-CP, secondary scoring caps, end-game report, mission-specific scoring integrity, and full primary/secondary catalogue validation. Completion gates: `scripts/track3-mission-system-audit.js` and `scripts/track3-mission-catalogue-audit.js`.

### Track 4 — Tactical Advisor v2 🔵
Battle state + objectives + mission + CP + combat state → contextual recommendations.

Current layers completed: explicit v2 battle-state context (round/phase, VP/CP, objectives, active secondaries, reserves, and known battlefield positions), CP/stratagem availability and recent-use context, read-only state integration, v2 decision-surface activation, and deployment regression gate `scripts/track4-tactical-advisor-v2-audit.js`.

Remaining Track 4 layers: deeper stratagem consequence analysis, recommendation prioritization refinement, and final v2 regression/deployment completion.

### Track 5 — Tournament Operations 🔵
Clock + player turns + game timing + setup + scoring + end-game report.

Parallel progress: 🟢 game/turn timing, pause/resume, persistence-safe timer snapshots, battle completion timing, and end-game report foundations are now covered by `scripts/track5-tournament-operations-audit.js`. Remaining work: tournament lifecycle/setup workflow, result verification/lock, export, and final tournament operations regression.

### Track 6 — Rules Completeness 🔵
Systematic 11th-edition validation across units, weapons, abilities, missions, secondaries, and stratagems.

Parallel progress: 🟢 rules-data provenance/version audit and tournament rules-data pinning foundation. Active battle state now carries a rules-data pin containing the 40k.app revision and Event Companion version used at battle start. Completion gate: `scripts/track6-rules-data-integrity-audit.js`. Remaining work: systematic unit/weapon/ability/stratagem coverage and rules interaction audit.

**Database Currency & Integrity initiative:** maintain versioned, provenance-backed rules data with automated completeness, reference, edition, and currency gates.

### Track 7 — Tournament UX
Tablet-first dashboard, touch optimization, minimal data entry, fast phase transitions, and at-a-glance game state.

# Development Rules

1. Always verify the repository identity before modifying code.
2. Work only on Grumpa916/onoforge40k unless explicitly directed otherwise.
3. Keep feature roadmap status separate from numbered implementation tasks.
4. Every major feature should have a regression audit before being considered complete.
5. A feature is not closed merely because its UI exists; state, persistence, rules, logging, and regression behavior must also be verified.
6. Historical failed GitHub Actions runs do not require correction when a later deployment for the same development path is green.
7. The latest green deployment on main is the operational deployment state.
8. Physical-dice entry is authoritative for real-game resolution; simulation/random Mathhammer code must remain isolated.
9. Prefer tablet/tournament usability over adding unnecessary UI density.
10. When a numbered task is completed, update this roadmap if the feature-level status changed.
11. Before starting a new numbered task, identify which roadmap feature/track it advances.
12. Do not invent a numbered task when the existing roadmap or feature work provides a more appropriate next action.
13. Database/rules-data changes must be versioned, provenance-backed, audited, and deployment-gated; active tournament state must remain pinned to its rules-data version.

# Current Execution State

- Task 31 — 🟢 Complete
- Task 32 — 🟢 FNP resolution integrity audit
- Track 1 — 🟢 Authoritative Game State complete
- Track 1 regression gates — 🟢 complete
- Track 2 — 🟢 Complete Physical Combat Resolution complete
- Track 2 regression gate — 🟢 complete
- Forward turn/round transitions preserve authoritative CP state — 🟢 complete
- Manual turn override preserves scoring and CP integrity — 🟢 complete
- Track 3 Tournament Mission System — 🟢 complete
- Track 3 mission catalogue/scoring integrity gate — 🟢 complete
- Current execution: Track 4 Tactical Advisor v2 🔵 (with Track 5/6 parallel integrity work active)v2 — 🔵 active
- Track 4 battle-state context layer — 🟢 complete
- Track 4 stratagem consequence analysis — 🟢 complete
- Track 4 v2 deployment regression gate — 🟢 added
- Track 3 audit: scripts/track3-mission-system-audit.js
- Track 1 audits: scripts/track1-end-turn-scoring-audit.js, scripts/track1-scoring-vp-cp-audit.js, scripts/track1-turn-phase-action-log-audit.js, scripts/track1-completion-audit.js
- Track 2 audits: scripts/model-level-damage-audit.js, scripts/fnp-resolution-audit.js, scripts/track2-combat-regression-audit.js
- Deployment workflow gates both completed tracks before GitHub Pages publication

Next planning checkpoint: begin Track 4 Tactical Advisor v2.
