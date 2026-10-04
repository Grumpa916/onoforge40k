# OnoForge 40K — Primary Scoring Utility Extraction Plan

## Candidate

Next narrow extraction candidate:
- `primaryScoringRoundRange(timing)`
- `primaryScoringVP(value)`
- `primaryScoringIsPer(row)`

Target module:
- `js/battle/primary-scoring-utils.js`

## Dependency audit

All three functions are pure helpers.

### primaryScoringRoundRange
- Reads only its `timing` argument.
- Uses `String`, regex matching, and `Number`.
- Returns a simple `{min,max}` object.
- No state, DOM, persistence, cloud, event, or embedded-data access.

Direct caller:
- `primaryScoringRowAvailable`

### primaryScoringVP
- Reads only its `value` argument.
- Uses string conversion, regex, and numeric normalization.
- Returns a non-negative number.
- No state, DOM, persistence, cloud, event, or data access.

Direct callers include:
- `objectivePrimaryScoringImpact`
- `primaryObjectiveCheckpointHtml`
- `primaryScoringEvidence`
- `primaryScoringRowsForRound`
- `scorePrimaryItem`
- additional primary-scoring summary/render paths.

### primaryScoringIsPer
- Reads only the supplied row.
- Inspects `row[2]`.
- Returns a boolean.
- No state, DOM, persistence, cloud, event, or data access.

Direct callers include:
- primary scoring evidence/eligibility;
- primary scoring mutation;
- primary scoring detail UI;
- primary scoring row/detail rendering.

## Boundary

The module will preserve the existing global function names for first-stage compatibility:
- `primaryScoringRoundRange`
- `primaryScoringVP`
- `primaryScoringIsPer`

It will also expose:
- `window.OnoForgePrimaryScoringUtils`

The existing application callers remain unchanged.

## Scope restriction

Do NOT extract:
- `primaryScoringRowAvailable`
- `primaryScoringRowsForRound`
- primary scoring mutation functions;
- objective-condition helpers;
- scoring UI.

Those functions either depend on application state/data or form part of a larger scoring state machine.

## Why this boundary

These three helpers form a coherent primary-scoring parsing/classification utility cluster. Extracting them together avoids scattering tiny files while keeping the application stateful scoring logic in `index.html`.

## Validation

Before browser verification:
1. Unit-test timing range parsing.
2. Unit-test VP parsing.
3. Unit-test per/for-each classification.
4. Run all existing opponent-turn/combat regressions.
5. Run index syntax validation and architecture audit.
6. Ensure standalone preview includes the new module.

Browser:
- verify Primary Mission / Show Scoring still renders;
- verify the displayed scoring rows for the current round are unchanged;
- verify a primary scoring action still calculates the same suggested VP and per-objective behavior.

No combat or timer retest is needed unless a regression appears.


## Implementation checkpoint

The planned extraction was implemented in commit `ade3fd52062158802c387430cc6c8b69d8682546`.
The module is loaded before the remaining inline scoring code, preserving the existing global helper names for compatibility.
