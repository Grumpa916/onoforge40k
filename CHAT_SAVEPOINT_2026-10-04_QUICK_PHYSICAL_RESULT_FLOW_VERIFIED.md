# CHAT SAVEPOINT — 2026-10-04 — QUICK PHYSICAL RESULT FLOW VERIFIED

## Authoritative state

- Repository: `Grumpa916/onoforge40k`
- Active branch: `feature/opponent-turn-history`
- Current HEAD: `ac63cfb88d9ef5adc721bb415872362394d91af7`
- Previous post-merge checkpoint: `e37c13a2ba5501ef1a47f722de6e7ad145e07d7d`

## BSData extraction status

PR #6 is merged at `10757225ea6fcaa1be5ba0b3d3c50cc9dd91fc8b`.

The first parser extraction remains landed in:
`js/data/bsdata-parser.js`

No further monolith extraction has been started after that boundary.

## Physical dice flow repair

The streamlined physical dice entry had a real transition bug on the Saves stage.

The UI correctly displayed the quick counter, but its buttons were sending the stage name `saves` to the resolver instead of the resolver field `failedSaves`. This caused the Saves screen to appear stuck.

The repair was completed in two steps, culminating in:

`ac63cfb88d9ef5adc721bb415872362394d91af7`

The quick counter now maps its UI stages to resolver fields, including:

- hits -> hits
- hitSpecial -> criticalHits
- lethalChoice -> lethalHits
- wounds -> wounds
- woundSpecial -> criticalWounds
- saves -> failedSaves
- damage -> damage

## Browser verification

User manually verified the repaired flow against the current build:

- Saves screen displayed correctly.
- Selecting the failed-save count successfully advanced beyond the Saves screen.
- The flow reached the Damage screen.
- Damage was appropriately applied.
- Action Log showed the completed attack resolution.

This is the first successful browser confirmation of the repaired quick physical-result path.

## CI verification

Fresh GitHub Actions for current HEAD `ac63cfb88d9ef5adc721bb415872362394d91af7` are green:

- Tactical Advisor Preview Validation — run 37168887033 — success
- Opponent Turn Event Capture Preview — run 37168887043 — success
- Opponent Turn Event Capture Preview — run 37168884693 — success

## Branch safety

Keep `main` untouched.

Do not casually merge or rebase `feature/opponent-turn-history-clean-reset` into this branch.

## Next controlled step

The quick physical-result regression is closed.

Before beginning another extraction from `index.html`:

1. Preserve this checkpoint.
2. Inspect the current `index.html` architecture and identify the next genuinely self-contained extraction boundary.
3. Prefer a small, low-risk boundary with explicit inputs/outputs.
4. Do not disturb verified opponent-turn workflows.
5. Validate CI and browser behavior before accepting the next extraction.

Python is not installed locally and should not be required.
