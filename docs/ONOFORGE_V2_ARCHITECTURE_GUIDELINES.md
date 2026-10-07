# OnoForge 40K V2 — Architecture & Development Guidelines

## Purpose

This document is the design backbone for a future **OnoForge 40K V2** application.

V2 is a deliberate rebuild designed to preserve the capabilities and verified behavior of the existing OnoForge 40K application while providing a cleaner architecture, stronger automated testing, easier maintenance, and a safe path for future features.

The existing OnoForge 40K application remains the **behavioral reference and regression oracle**. V2 must not depend on memory or assumptions about how V1 behaves.

---

## 1. Core principles

1. **Do not throw away existing knowledge.**
   - The current OnoForge 40K application is the behavioral reference.
   - Existing verified features become requirements for V2.
   - Existing bugs should not automatically become V2 requirements; distinguish intended behavior from accidental behavior.

2. **Design before implementation.**
   - Establish module boundaries and contracts before building large features.
   - Avoid recreating the monolithic architecture in smaller files.

3. **Game logic must be independent of the UI.**
   - The game engine must not depend on HTML, DOM elements, rendering functions, or browser-specific UI behavior.
   - UI code should issue commands and display resulting state/events.

4. **Make important behavior deterministic and testable.**
   - Rules and state transitions should be executable without a browser.
   - Randomness should be controllable/replayable for tests.

5. **Prefer explicit state transitions over scattered mutation.**
   - Important actions should flow through defined commands/actions.
   - Resulting changes should be represented by well-defined state transitions and/or events.

6. **Every major subsystem must have a testing boundary.**

7. **Design for extension.**
   - New features should normally be added as new modules or feature areas rather than requiring changes to a giant central file.

8. **Preserve user-facing behavior unless a deliberate V2 change is documented.**

---

## 2. Target architecture

The intended high-level architecture is:

```
UI / Views
    ↓
Application Layer
Commands / Actions / Workflows / Validation
    ↓
Game Engine
Phase / Turn / Units / Combat / Objectives / Timers / Undo
    ↓
Game State
State transitions + history
    ↓
Rules / Data
BSData / Weapons / Units / Missions / Rules
```

The UI should sit above the engine rather than containing the engine.

---

## 3. Suggested V2 repository structure

The exact framework and filenames may change, but the architectural responsibilities should remain recognizable:

```
onoforge40k-v2/

├── src/
│   ├── app/
│   ├── engine/
│   ├── state/
│   ├── commands/
│   ├── events/
│   ├── rules/
│   ├── data/
│   ├── services/
│   ├── features/
│   │   ├── setup/
│   │   ├── deployment/
│   │   ├── movement/
│   │   ├── combat/
│   │   ├── objectives/
│   │   ├── missions/
│   │   ├── stratagems/
│   │   ├── reserves/
│   │   ├── tournament/
│   │   ├── battle-history/
│   │   └── tactical-advisor/
│   ├── components/
│   └── ui/
│
├── tests/
│   ├── unit/
│   ├── engine/
│   ├── scenarios/
│   ├── regression/
│   └── ui/
│
├── fixtures/
│   ├── armies/
│   ├── battles/
│   └── scenarios/
│
├── docs/
│   ├── architecture/
│   ├── game-model/
│   └── migration/
│
└── README.md
```

This is a target structure, not a requirement to create every directory immediately.

---

## 4. Command/action architecture

Important user actions should follow a predictable pipeline:

```
User action
    ↓
Command
    ↓
Validation
    ↓
Game engine
    ↓
State transition
    ↓
Events/history
    ↓
UI update
```

Example:

```
DECLARE_ATTACK
    ↓
VALIDATE_ATTACK
    ↓
ROLL_ATTACK
    ↓
ROLL_HIT
    ↓
ROLL_WOUND
    ↓
RESOLVE_SAVE
    ↓
APPLY_DAMAGE
    ↓
RECORD_COMBAT_EVENT
    ↓
UPDATE_STATE
```

The exact command/event vocabulary will be established during implementation.

---

## 5. Event/history model

Important game actions should produce explicit, inspectable records.

Examples include:

- unit movement
- attacks
- hits
- wounds
- saves
- damage
- objective scoring
- CP changes
- Stratagem use
- phase changes
- turn changes
- deployment changes
- reserve movement
- battle start/end

This supports:

- battle history
- undo
- debugging
- replay
- regression testing
- future analytics
- Tactical Advisor inputs

Events should contain enough information to explain what happened without requiring the UI to reconstruct the action from unrelated state.

---

## 6. Undo design

Undo should be an architectural capability rather than a collection of special-case UI functions.

The preferred model is:

```
State 0
  ↓ MOVE
State 1
  ↓ SHOOT
State 2
  ↓ STRATAGEM
State 3
```

Undo should be able to restore the appropriate previous logical state while preserving compound-action rules.

Existing V1 behavior such as paired Stratagem/CP undo must be treated as a regression requirement unless deliberately changed.

---

## 7. Deterministic randomness

Random dice behavior should be centralized.

The engine should support a controlled random source or seed so that a test can reproduce a battle sequence.

Example:

```
Seed: 123456
    ↓
same command sequence
    ↓
same dice results
    ↓
same resulting state
```

This will make combat bugs reproducible and significantly improve debugging.

---

## 8. Testing strategy

### Unit tests

Test individual rules and calculations independently.

Examples:

- Ballistic Skill
- Weapon Skill
- Strength vs Toughness
- armor saves
- invulnerable saves
- Feel No Pain
- modifiers
- damage

### State-transition tests

Given a known state and command, verify the resulting state.

Example:

```
Given:
  Unit has 10 wounds

When:
  APPLY_DAMAGE(3)

Expect:
  Unit has 7 wounds
```

### Scenario tests

Test complete game situations involving multiple rules.

Examples:

- movement followed by shooting
- objective control changes
- Stratagem plus CP
- reserves entering play
- phase transitions

### Regression tests

Compare selected V2 scenarios against V1's verified behavior.

### UI tests

Test that UI actions correctly issue commands and display engine results.

The UI should not be the only place where game rules are tested.

---

## 9. V1 as the behavioral oracle

Migration should use the existing OnoForge 40K application as a reference:

```
V1 scenario
    ↓
V1 result ─────┐
               ├── compare
V2 result ─────┘
```

For important behaviors, create fixtures describing:

- starting state
- commands/actions
- expected events
- expected final state

V2 should reproduce verified V1 behavior before the feature is considered migrated.

When V1 and V2 differ, determine whether the difference is:

1. a V2 defect,
2. an existing V1 defect,
3. an intentional V2 improvement.

Do not blindly reproduce known V1 bugs.

---

## 10. Feature migration inventory

V2 should ultimately preserve the major V1 capabilities, including:

- army/setup
- BSData parsing
- deployment
- deployment zones
- unit placement
- reserves
- movement
- shooting
- fight
- combat resolution
- objectives
- missions
- primary scoring
- secondary scoring
- Stratagems
- CP/resource tracking
- battle phases
- turns
- game timers
- friendly/opponent clocks
- undo
- battle history
- combat event recording
- opponent turn tracking
- Tactical Advisor
- tournament setup
- tournament lifecycle
- battle start/end
- results
- save/load
- game reference
- game assistant

The final migration inventory should be maintained as a living checklist.

---

## 11. Feature boundaries

Prefer feature modules such as:

- setup
- deployment
- movement
- shooting
- fight
- objectives
- missions
- Stratagems
- reserves
- characters
- enhancements
- tournament
- battle history
- Tactical Advisor

A feature should expose a clear interface rather than reaching arbitrarily into unrelated features.

---

## 12. UI architecture

The UI should primarily:

1. display state,
2. collect user input,
3. issue commands,
4. display events/results,
5. provide navigation.

The UI should not become the authoritative source of game rules.

Rendering components should consume engine/application state rather than directly implementing game logic.

---

## 13. Persistence

Save/load should operate on a defined application state format rather than serializing arbitrary UI/DOM state.

Saved data should have:

- an explicit schema/version,
- migration strategy,
- validation,
- clear separation between persistent game state and transient UI state.

---

## 14. Timers

Timers should have a defined ownership model.

V2 should avoid multiple independent timer owners modifying the same logical clock.

Timer behavior should be represented as a service/state concern that can be tested independently from the UI.

Required behavior includes:

- accumulated game time
- player clocks where applicable
- pause/resume
- phase/turn interaction
- save/load behavior
- undo behavior where appropriate

---

## 15. Error handling

Errors should be explicit and structured.

Prefer:

```
command → validation result
```

rather than silently failing or relying on UI side effects.

A rejected command should provide enough information for the UI to explain why the action is unavailable.

---

## 16. Extensibility goals

The architecture should make future additions practical, including:

- additional mission systems
- additional game modes
- expanded unit/rule support
- new tactical tools
- additional scoring systems
- richer battle reports
- replay
- analytics
- additional automation
- future 40K rule changes

New features should not require reopening a monolithic central file whenever possible.

---

## 17. Development phases

### Phase 1 — Architecture

Define:

- state model
- commands
- events
- rules
- persistence
- testing framework
- module boundaries

### Phase 2 — Core engine

Build:

- game state
- players
- units
- phases
- turns
- objectives
- resources
- history
- undo

### Phase 3 — Combat

Build:

- attacks
- hits
- wounds
- saves
- damage
- modifiers
- combat events

### Phase 4 — Deployment

Build:

- deployment zones
- unit placement
- reserves
- movement
- legality

### Phase 5 — Missions

Build:

- primary
- secondary
- scoring
- mission rules

### Phase 6 — UI

Build the user interface on top of the tested engine.

### Phase 7 — Advanced features

Add:

- Tactical Advisor
- opponent tracking
- tournament mode
- advanced history
- additional automation
- future rule support

Do not attempt the entire rebuild as one undifferentiated implementation.

---

## 18. Relationship to the current V1 refactor

The existing OnoForge 40K refactor must remain safe and independently usable while V2 is developed.

V2 should not require dismantling V1.

The current repository remains valuable as:

- behavioral reference,
- regression source,
- feature inventory,
- historical record,
- source of verified rules/requirements.

Do not remove V1 functionality merely because V2 is being planned.

---

## 19. V2 development gates

Every major V2 subsystem should have:

1. defined responsibility,
2. defined public interface,
3. unit tests,
4. state-transition tests where applicable,
5. scenario/regression tests where applicable,
6. documentation of dependencies,
7. UI tests where UI behavior is involved.

A feature is not considered complete merely because it works manually in a browser.

---

## 20. Non-negotiable architectural rules

- No return to a monolithic `index.html`.
- No game-rule logic hidden inside rendering functions.
- No arbitrary cross-feature state mutation.
- No duplicate ownership of critical state.
- No untestable global game logic when a module/service can own it.
- No uncontrolled randomness in engine logic.
- No UI-only implementation of core game rules.
- No large feature added without a testing boundary.
- Preserve verified V1 behavior unless an intentional change is documented.
- Prefer explicit contracts over implicit dependencies.
- Keep the engine usable without a browser.

---

## 21. Guiding objective

The goal of OnoForge 40K V2 is not simply to reproduce the current application.

The goal is to create a **maintainable, testable, extensible tabletop game engine and application** that can reproduce the trusted behavior of OnoForge 40K while making future development substantially safer and easier.

When choosing between two implementation approaches, prefer the one that:

1. keeps game logic independent of UI,
2. makes state transitions explicit,
3. is easier to test,
4. is easier to replay/debug,
5. creates a clean extension point for future features,
6. preserves verified behavior.

This document should evolve as V2 architecture decisions are made. Significant deviations from these guidelines should be documented rather than silently introduced.


---

## 22. GitHub and Supabase infrastructure guidelines

V2 should retain GitHub and Supabase rather than replacing them, but use them with deliberate V2 boundaries.

### GitHub

- Keep the existing `Grumpa916/onoforge40k` repository as the V1/reference application.
- Create a dedicated `Grumpa916/onoforge40k-v2` repository for the new application.
- Do not destabilize V1 merely to prepare V2.
- Use GitHub for V2 source control, documentation, issues, pull requests, releases, and CI/CD.
- Use GitHub Actions as the authoritative automated validation/deployment gate.
- Prefer development → staging → production environments with appropriate GitHub secrets/environment controls.
- Do not put production secrets in source code.

### Supabase

- Retain Supabase as the preferred V2 backend platform.
- Do not initially point V2 at the V1 production database unless an explicit migration decision is made.
- Prefer a dedicated V2 development Supabase project/environment while the data model is being designed.
- Establish deliberate V2 PostgreSQL schemas rather than inheriting V1 database assumptions.
- Use Supabase Auth where appropriate, but keep authentication/infrastructure outside the core game engine.
- Use PostgreSQL Row Level Security deliberately for user/game data.
- Never expose Supabase service-role or secret credentials to browser code.
- Keep database changes version-controlled as migration files in GitHub.
- Treat database migrations as part of the CI/CD process rather than relying on undocumented dashboard changes.

### Environment model

Preferred long-term structure:

```
GitHub
  ↓
GitHub Actions
  ↓
V2 Development → V2 Staging → V2 Production
                         ↓
                      Supabase
                         ↓
              PostgreSQL / Auth / Storage
```

The V2 game engine must remain infrastructure-independent. It should be possible to run the engine against test fixtures, local/in-memory state, replay data, or Supabase-backed application data without changing game-rule code.

### Infrastructure migration principle

Do not make infrastructure changes to V1 merely because V2 is being planned. V1 remains the behavioral reference and should remain independently usable while V2 is designed and built.
