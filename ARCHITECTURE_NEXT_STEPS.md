# OnoForge 40K — Architecture Next Steps

## Current position

The architecture map, function inventory, refactor extraction plan, and QA gates are now documented.

The first code extraction (battlefield geometry) is paused because the exact monolithic `index.html` source cannot currently be retrieved safely through the available repository interface.

## Next safe workstream

While source-level extraction is paused, continue improving the architecture **without modifying gameplay code**.

### Priority 1 — Repository contract map

Document the role of each existing top-level artifact:

- `index.html`
- `data/`
- diagnostic/audit files
- GitHub Actions workflows
- architecture/refactor documents

The goal is to make it immediately clear which files are authoritative runtime code, which are source data, which are tests/audits, and which are documentation.

### Priority 2 — Data provenance contract

Document how OnoForge identifies:

- rules source
- datasheet source
- points/MFM version
- faction-pack/FAQ/errata version
- Event Companion version
- date captured

This is particularly important because upstream 40K data changes independently of application code.

### Priority 3 — Test/audit inventory

Map existing audits and diagnostic scripts into the QA gates defined in `REFACTOR_QA_GATES.md`.

Do not create duplicate tests until the existing coverage is understood.

### Priority 4 — Module destination map

Keep a proposed destination map for eventual extraction without moving code yet:

```text
src/
├── app/
├── rules/
├── state/
├── battlefield/
├── combat/
├── missions/
├── tactical/
├── ui/
└── data/
```

A destination map is planning documentation only until exact source and dependency boundaries are available.

## Guardrail

Do not use documentation work as a reason to modify `index.html`.

Do not reconstruct inaccessible functions from memory.

Do not bundle source refactoring with data updates or gameplay changes.

## Resume condition for geometry extraction

Resume the geometry extraction only when exact source access is available.

Required sequence:

1. capture exact implementations
2. capture callers/dependencies
3. create focused tests
4. extract with compatibility wrappers
5. run Actions
6. inspect result
7. proceed only after successful verification
