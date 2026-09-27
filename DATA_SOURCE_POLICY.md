# OnoForge 40K — Data Source Policy

## Purpose

Define how OnoForge obtains, identifies, validates, and records Warhammer 40,000 rules and game-data sources so future updates remain accurate, reproducible, and auditable.

This policy is intentionally separate from `index.html`. It defines the data contract before implementation changes are made.

## Source hierarchy

### Tier 1 — Games Workshop official sources

Use official Games Workshop material as the authoritative source for rules and official corrections whenever an official source is available.

Examples include:

- Core Rules
- faction rules / faction packs
- official datasheets
- Munitorum Field Manual / official points
- Balance Dataslate
- FAQs and errata
- official mission packs
- official Warhammer Community rules publications

**Authority:** authoritative for the official rules text or value being represented.

### Tier 2 — BSData 11e

Use the BSData Warhammer 40,000 11th Edition repositories as a structured-data and cross-check source.

BSData is not treated as an independent rules authority. It is useful for:

- structured datasheet representation
- unit/weapon identifiers
- wargear structure
- army construction structure
- cross-checking omissions or inconsistencies
- detecting changes between data snapshots

When BSData differs from an official source, OnoForge must not silently treat BSData as overriding the official source.

### Tier 3 — Event Companion / event-specific reference data

Event Companion material is treated as reference/event data rather than the core authoritative rules engine.

It may provide:

- tournament/event information
- event-specific missions or restrictions
- reference material
- companion presentation data

It must remain versioned and isolated from core rules authority.

### Tier 4 — Secondary/community sources

Community databases, discussion, guides, wikis, and similar material may be used for discovery or cross-checking but are not authoritative inputs to OnoForge rules data unless independently verified against an authoritative source.

## Required provenance

Every imported or materially updated rules/data package should record, where applicable:

```text
source_type
source_name
source_url
source_version
source_revision
source_date
retrieved_at
verification_status
notes
```

The example schema in the main policy remains the reference contract; placeholder values must not be committed as real source metadata.

## Version separation

OnoForge must not silently mix rules/data from different publication states. At minimum distinguish Core Rules, faction rules/faction pack, datasheet, points/Munitorum Field Manual, Balance Dataslate, FAQ/errata, mission-pack, BSData revision, and Event Companion versions.

If a battle or saved list depends on a specific data snapshot, that snapshot should remain identifiable after later updates are imported.

## Update procedure

1. Identify the official publication or correction.
2. Record publication/version/date information.
3. Identify affected factions, datasheets, points, abilities, or missions.
4. Compare the official change with current OnoForge data.
5. Cross-check BSData 11e where structured data is useful.
6. Record disagreements between official and BSData representations.
7. Update canonical data only after verification.
8. Preserve source/version metadata with the update.
9. Run applicable QA gates.
10. Commit the update separately from unrelated application refactoring.

## Conflict resolution

1. Current official Games Workshop material takes precedence for official rules values/text.
2. Official FAQ/errata takes precedence over an older official publication when it explicitly changes or corrects it.
3. Official points publications take precedence for points values.
4. BSData is used to identify and investigate discrepancies, not to override official material.
5. Community/secondary sources require independent verification.

Do not silently resolve an unresolved conflict. Record it for review.

## Data freshness

A dataset being present in the repository does not mean it is current. Each rules/data family should have a visible version/revision and verification state so an update process can distinguish current and verified, current but awaiting cross-check, superseded, historical/pinned, and unknown provenance.

## 40k.app dependency policy

The former `40k.app`/`40kapp-source.json` dependency is **not** an authoritative rules source for OnoForge.

OnoForge should not depend on a separate app's private/exported data as its canonical rules source.

Official Games Workshop publications and explicitly tracked structured datasets are the intended sources.

## BSData policy

BSData should be treated as a versioned external dataset, not as a permanent copy whose values are assumed to remain current.

When importing from BSData, record the repository, branch/release when applicable, commit/revision, retrieval date, and affected faction/data files. A later BSData update should be evaluated as a new data revision rather than silently overwriting provenance.

## Validation contract

Before accepting a data update, verify as applicable: faction identity, unit identity, datasheet identity, weapon identity, weapon profiles, abilities/rules text, points, wargear/options, leader/attachment relationships, keywords, unit composition, and source/version metadata.

Special attention should be paid to changes that can affect model identity, weapon eligibility, attachment handling, combat resolution, or scoring.

## Historical reproducibility

The application should eventually be able to answer:

> What rules/data versions were in effect for this list or battle?

Updating current data must not make historical saved state ambiguous.

## Implementation boundary

This policy does not itself modify the application data loader or `index.html`. Implementation changes should follow after existing data files/loaders have been inventoried and their current provenance is understood.

## Feature-branch reconciliation note

The feature branch has already removed the legacy `data/40kapp-source.json` runtime dependency. This policy therefore governs the feature branch going forward: Games Workshop official material is canonical; BSData 11e is structured cross-check data; Event Companion data remains isolated reference data; and no 40k.app data may be silently promoted to canonical status.
