# OnoForge 40K — Tablet Test Artifact Pipeline

## Purpose
Create a browser-testable package directly from the exact committed source on the authoritative development branch, avoiding manual reconstruction or transfer of the >1 MB monolithic index.html.

## Authoritative branch
`feature/opponent-turn-history-clean-reset`

## Pipeline commit
`9f7c411957442041a17848a15ff85483539c786d`

## Workflow
`.github/workflows/tablet-test-artifact.yml`

The workflow checks out the exact GitHub commit, verifies the required application files, assembles a test directory, records the source commit, and uploads the package as a GitHub Actions artifact. GitHub Actions artifacts are intended for persisting and sharing files produced by workflow runs.

## Test package contents
- `index.html`
- `deployment-state.js`
- `deployment-bridge.js`
- `deployment-interaction.js`
- `data/warhammer-event-companion-v1.2.json`
- `SOURCE_COMMIT.txt`
- `ARTIFACT_SOURCE.txt`

## User testing rule
The user should only be asked to download the artifact after the workflow run is verified successful and the artifact is verified present. The artifact must be generated from the exact commit being tested.

## Environment constraint
Do not require Python on the user's Windows machine. The user has repeatedly verified that Python is not installed. The existing local HTTP serving setup should be reused once the artifact is downloaded.
