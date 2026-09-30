# OnoForge 40K — UI/UX Redesign Specification

Date: 2026-09-29
Branch: `feature/opponent-turn-history`
Status: Design baseline

## Core principle
OnoForge should help the player play the tabletop game, not make the player play the app. The physical tabletop remains authoritative for exact measurements. Approximate map positions support awareness, tactical context, and historical reconstruction but must not silently be treated as precision measurements.

## Battle lifecycle
- `Start Battle` must transition Battle Setup into Battle Mode.
- Remove redundant `Begin Deployment`.
- Distinguish `New Battle`, `Reset/Restart Battle`, `End Battle`, and navigation.
- End Battle/New Battle must provide a complete live-state reset without deleting saved army/list data. Clear wounds, Battle Shock, action completion, objectives, opponent tracking, combat history, live positions, and appropriate deployment/terrain state.
- During development, Terrain Setup may be reopened/unlocked.

## Persistent battlefield model
All three map modes share one persistent battlefield model. GW reference maps are the authoritative visual source for battlefield layout, deployment zones, terrain arrangement, and objectives. Terrain is not user-created in Terrain Setup. Preserve the GW image as a reference layer and use a derived clean display layer for later phases where useful.

The structured battlefield definition should represent battlefield dimensions, deployment zones, objective locations/control areas, terrain regions/footprints and relevant metadata, and map/reference identity. The image is not the sole source of truth.

Unit positions support explicit confidence states: `approximate` (default drag/drop), `measured` (optional deliberate precision), and `unknown` (intentionally not tracked). Approximate positions must not be displayed as 0.1-inch precision or used as authoritative rule measurements. When exact distance matters, instruct the player to verify the physical tabletop.

## Map modes
### Terrain Setup
Full-screen or near-full-screen on iPad. Purpose is to inspect/confirm the GW battlefield reference. No terrain move/rotate/place tools. Show readable terrain, deployment zones, objectives, and reference markings. `Terrain Setup Complete` exits the phase; development builds may reopen it.

### Deployment
Large map occupying most of the screen. Same battlefield model as Terrain Setup, preferably using a cleaner derived presentation. Units are placed approximately where they are physically deployed. Show deployment/reserve status in a compact panel. Keep deployment plans separate from live battlefield positions.

### Active Game
Large but not dominant. Track approximate live unit positions, objectives, and relevant spatial context. Future overlays may include movement range, weapon range, charge context, threat areas, and tactical-engine information. Preserve position history for post-game reconstruction. Never imply precision the player did not provide.

## My List vs Army State
### My List
Large, readable tabletop reference: unit name/size, core stats, weapons/profiles, abilities/keywords, attached characters, detachment/enhancement information, and notes. It is reference data and should not change merely because a unit takes damage.

### Army State
Live battle state: wounds, surviving/destroyed models, Battle Shock, temporary effects/status, phase/action completion, and gameplay notes. Battle Shock should become increasingly automated through Command Phase workflows. Relevant Army State notes remain visible during gameplay.

## Play-space optimization
- Army Reserves: three columns where practical.
- Opponent Turn tracking: collapsible, with concise collapsed status and detailed attacker/target/weapon/resolver/history when expanded.
- Objectives: compact objective strip with expandable details.
- Detachments: expandable/collapsible details.
- Saved lists: delete with confirmation; do not delete canonical army/rules data.

## Data/development UI
Reduce persistent diagnostic clutter. Use compact normal verification, concise warnings, and an expandable Developer/Data Diagnostics section for development information.

## Touch-first UI
Primary controls must be comfortably tappable on iPad/iPhone. Use consistent Primary (Start/Continue/Complete), Secondary (Back/Edit), and Destructive (Reset/Delete/End) roles. Avoid tiny critical controls and ambiguous enabled/disabled states.

When a unit has completed a phase action, do not show an empty weapon selector that looks like missing data. Prefer wording such as `Shooting completed — no weapon selection available`. This is UI clarification only and must not weaken action-completion gating.

## Implementation order
1. Battle lifecycle/navigation: Start Battle, remove Begin Deployment, End/New Battle reset, development Terrain reopen.
2. Map framework: persistent battlefield model/view separation; full-screen Terrain Setup; large Deployment map; large-but-not-dominant Active Game map; approximate/measured/unknown semantics.
3. Play-space optimization: reserves, opponent tracking, objectives, detachments.
4. Reference/state separation: My List, Army State, notes, Battle Shock automation boundary.
5. Development/data UI cleanup.
6. iPad touch/layout polish.

## Architectural constraints
- No second combat engine, Tactical Advisor, or authoritative combat-history store.
- Combat History remains derived from `state.events` / Action Log.
- Physical dice remain authoritative for actual resolution.
- Preserve canonical model/roster identity conventions.
- Preserve separation between deployment plans and live battlefield positions.
- Approximate map positions are never precision rule measurements.
- Do not merge or deploy until the UI pass and existing combat regressions are clean.
