# BSData Extraction Plan

## Current state

The working branch remains `feature/opponent-turn-history`.

The current `index.html` is the verified pre-extraction source. The BSData parser module, adapter, seven baseline fixtures, and verification tooling are already committed.

## Planned first extraction

The extraction changes only the BSData parser boundary:

1. Remove the eight BSData parser implementations from `index.html`.
2. Load `js/data/bsdata-parser.js` before application code that consumes it.
3. Replace the collector call with `OnoForgeBSDataParser.collectBSDataObjects(...)`.
4. Replace the unit-parser call with `OnoForgeBSDataParser.bsUnitFromEntry(entry, { objectMap })`.
5. Preserve all unrelated application code byte-for-byte where practical.

## Explicitly unchanged areas

- combat resolver
- canonical combat state
- events / Action Log / Combat History
- undo / persistence semantics
- Tactical Advisor
- scoring
- roster mutation
- cloud synchronization
- rendering/bootstrap other than the parser script load and call-site substitutions

## Validation gate

After applying the extraction to `index.html`:

- JavaScript syntax must parse.
- The seven BSData baseline cases must pass.
- The extraction verifier must confirm the old parser implementations are absent and the new module boundary is present.
- The diff must be reviewed for unintended changes.
- Application smoke testing must pass before the extraction is considered complete.

## Safety rule

Do not overwrite the live branch `index.html` from a partial, stale, or reconstructed source. The replacement must be generated from the verified branch source and reviewed as a complete file change.
