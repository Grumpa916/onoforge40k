# OnoForge 40K — `index.html` Architecture Map

**Status:** Inventory baseline — no application code changes
**Source branch:** `feature/opponent-turn-history`
**Source file:** `index.html`
**Verified Git blob SHA:** `4941fcffc41072fd9f60dcf870a0227b4437b74c`
**Verified source size:** 1,066,805 bytes (UTF-8 text)
**Verified line count:** 11,634

## Purpose

This document is the architectural baseline for safely dismantling the `index.html` monolith. It is an inventory and dependency-boundary document, not an extraction change.

The authoritative GitHub copy was downloaded and independently verified against the Git blob SHA above before inventory work. No application code was modified as part of this inventory.

## Executive summary

`index.html` is a complete browser application containing the document shell, CSS, embedded catalogue/bootstrap data, application state, persistence, data normalization, roster construction, deployment, scoring, secondary missions, battle UI, event history, undo, tactical systems, physical-dice resolution, combat/math engines, cloud integration, rendering, and bootstrap.

A source-level scan identifies **728** named `function` declaration occurrences representing **724** unique named declarations, plus **31** arrow-function assignment matches representing **28** unique names.

## Architectural layers

1. **Presentation / CSS** — large inline stylesheet plus HTML templates and modal markup.
2. **Bootstrap / global runtime** — globals, embedded catalogue, source policy, state, event handlers, root renderer.
3. **Data / catalogue** — canonical/bootstrap selection, BSData normalization, weapon/ability/wargear parsing, runtime database refresh.
4. **Deployment / battlefield** — layouts, reserves, transports, plans, positions, validation.
5. **Scoring / missions** — primary/secondary scoring, score snapshots, detachments, stratagems, tournament result.
6. **Roster / army builder** — lists, units, composition, leaders/bodyguards, support, wargear, model rosters.
7. **Core state / persistence** — state, save/load, timers, backup import/export, local reset.
8. **Event / Action Log / Undo** — events, action log, undo snapshots, scoring logs, Combat History.
9. **Battle state / canonical roster** — battle UI, model/unit mutations, roster synchronization, wounds, destroyed state, turn state, objective history.
10. **Tactical Advisor** — tactical state, weapon legality, ranges, target legality, objective advice, render cache, V1/V2 advisor.
11. **Physical-dice resolver** — pool identity, allocations, saves, rerolls, FNP, variable damage, Devastating Wounds, Precision, resolution/application.
12. **Combat / Mathhammer** — attack resolution, distributions, allocation, damage, Monte Carlo.
13. **Cloud integration** — Supabase/authentication/cloud list and battle synchronization.
14. **Rendering / bootstrap** — `renderBattleOnly`, `render`, page dispatch, root DOM updates, startup.

## Major source regions

| Lines | Functions | Region |
|---:|---:|---|
| 501–1000 | 53 | Deployment / battlefield |
| 1001–1500 | 40 | Data / catalogue / saved lists / primary scoring |
| 1501–2000 | 35 | Primary scoring / missions |
| 2001–2500 | 30 | Detachments / stratagems / Game Assistant |
| 2501–3000 | 47 | Secondary missions / scoring |
| 3001–3500 | 26 | Secondary totals / utility / wargear start |
| 3501–4000 | 39 | Wargear / leaders / bodyguards |
| 4001–4500 | 47 | Model roster / validation / builder |
| 4501–5000 | 39 | Builder / setup / timer / battle start |
| 5001–5500 | 31 | Tournament state / deployment validation / events / undo |
| 5501–6000 | 29 | Combat History / battle UI / canonical model state |
| 6001–6500 | 42 | Objective metadata / geometry / battlefield objectives |
| 6501–7000 | 34 | Phase/CP / combat engine foundations |
| 7001–7500 | 52 | Tactical state / weapon-use state |
| 7501–8000 | 24 | Tactical legality / combat context |
| 8001–8500 | 33 | Physical-dice pre-roll resolver |
| 8501–9000 | 15 | Physical-dice resolution continuation |
| 9001–9500 | 21 | Opponent-turn capture / Tactical Advisor |
| 9501–10000 | 7 | Tactical Advisor V1/V2 |
| 10001–10500 | 31 | Mathhammer / attack engine |
| 10501–11000 | 20 | Combat engine / cloud start |
| 11001–11634 | 33 | Cloud / data management / logs / rendering tail |

## Protected anchors

- Canonical `state` object.
- Canonical model-roster mutation.
- Event creation/history and Combat History derivation.
- Physical-dice resolver.
- Opponent-turn capture adapter.
- Tactical Advisor state context.
- Persistence and undo semantics.

The critical combat path remains:

```text
physical action
  -> resolver
  -> canonical model/state mutation
  -> event
  -> Action Log
  -> Combat History
```

Early refactoring must preserve this path and must not create a second authoritative state model.

## Extraction risk

| Area | Risk | Early extraction? |
|---|---|---|
| CSS | Low | Yes |
| Pure utilities | Low | Yes, after dependency scan |
| Cloud integration | Low/Medium | Candidate |
| Data/normalization | Medium | Candidate after interface definition |
| Deployment | Medium | Candidate after state interface |
| Wargear/roster support | Medium | Later |
| Builder/UI | Medium | Later |
| Scoring | Medium/High | Later |
| Battle state | High | No |
| Events/undo | Very High | No |
| Tactical Advisor | Very High | No |
| Combat engine | High | No |
| Physical-dice resolver | Critical | No |
| Bootstrap/render | High | No |

## Candidate target architecture

```text
index.html
  ├── application shell
  ├── root DOM
  └── bootstrap

css/styles.css

js/
  core/       state, events, persistence, utilities
  data/       catalogue, normalization, sources
  roster/     builder, leaders, wargear
  deployment/ deployment
  battle/     phases, scoring, objectives
  combat/     attack engine, resolver, allocation
  tactical/   advisor
  cloud/      cloud integration
  ui/         builder, battle, rendering
```

This is a destination, not an instruction to create all modules at once.

## Next mapping pass

For each proposed extraction, trace:

1. callers and callees;
2. reads/writes of `state`;
3. DOM access;
4. event emission/consumption;
5. persistence calls;
6. dependencies on globals and embedded data;
7. required public interface after extraction;
8. regression tests required before extraction.

No application extraction should occur until the selected subsystem has a completed dependency map.
