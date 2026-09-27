# OnoForge 40K — Complete Project Handoff Document

## Project Overview

Project: OnoForge 40K
Repository: Grumpa916/onoforge40k
Original handoff application version: v337
Primary file at handoff: index.html
Purpose:
A Warhammer 40,000 tournament companion application designed to manage setup, deployment, objectives, turns, scoring, tactical information, and eventually complete game resolution.

## Development Philosophy

Primary goals:
- Tablet-first tournament workflow
- Fast data entry during live games
- Reduce player bookkeeping
- Surface phase-relevant information
- Complete the actual game loop before expanding advanced systems

Design priority:
Make one complete game action work, test it live, then expand.

## Current Architecture at Handoff

Current structure:
- Single-page web application
- HTML/CSS/JavaScript bundled in index.html
- GitHub repository main branch

Verified GitHub status:
- Repository access working
- Read/write permissions working
- Push capability confirmed

## Completed and Tested Features at Handoff

PASS:
- App launch
- Mission setup
- Objective setup
- Deployment workflow
- Command phase
- CP management
- Primary objective scoring
- Secondary mission display
- Movement phase and movement tracking

## Live Test Findings at Handoff

Completed observations:
- Deployment works after initial loading delay
- Movement tracking correctly detects missing movement actions
- Distance displays need rounding to tenths of an inch
- Phase-specific dashboard priorities should be improved
- Map unit labels need better readability

## Logged Improvements at Handoff

Priority items:
1. Move reserve selection above deployment map.
2. Remove Begin Deployment button because it is redundant and can clear deployment.
3. Add secondary mission Auto Pick / Manual Selection toggle.
4. Add Return to Deck button for secondary missions.
5. Standardize objective labels using numbered objectives.
6. Improve map readability with compact unit markers and expanded details.
7. Move phase-relevant controls higher in the interface.

## Current Development Blocker at Handoff

CRITICAL:
Shooting resolution workflow.

Current:
- Select attacker
- Select target
- Select weapon
- View range/LOS/mathhammer

Missing:
- Resolve Attack button
- Dice entry
- Damage application
- Casualty updates
- Battle log entry

## Shooting Resolution v1 Plan at Handoff

Goal:
Complete one full attack cycle.

Flow:
Weapon Selected
→ Resolve Attack
→ Enter Hits/Wounds/Saves/Damage
→ Apply Results
→ Update Unit State
→ Record Action Log

First test case:
Exocrine
→ Bio-plasmic Cannon
→ Lieutenant

## Persistence Strategy

Decision:
Avoid live Supabase writes during gameplay.

Preferred approach:
Battle State
→ Local save/checkpoint
→ End-game synchronization
→ Supabase

Reason:
Lower latency and better gameplay performance.

## Future Roadmap at Handoff

Phase 1:
- Shooting resolution
- Casualty removal
- Charge phase
- Fight phase
- Complete playable turn

Phase 2:
- Tournament UI optimization
- Better tablet layouts
- Faster dice entry
- Action log improvements

Phase 3:
- Advanced rules
- Weapon abilities
- Stratagem support

Phase 4:
- Robust saves
- Cloud synchronization
- Recovery checkpoints

## Recommended Next Session at Handoff

Do not restart planning.

Next actions:
1. Inspect current shooting functions in index.html.
2. Implement Resolve Attack workflow.
3. Commit changes to GitHub.
4. Run live Exocrine shooting test.
5. Continue through Charge and Fight phases.
