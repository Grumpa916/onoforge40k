#!/usr/bin/env bash
set -euo pipefail

EXPECTED_REPOSITORY="Grumpa916/OnoForge-40K-Tactical-Advisor"
CURRENT_REPOSITORY="${GITHUB_REPOSITORY:-}"

if [[ -z "$CURRENT_REPOSITORY" ]]; then
  echo "Repository identity check: GITHUB_REPOSITORY is unavailable."
  exit 1
fi

if [[ "$CURRENT_REPOSITORY" != "$EXPECTED_REPOSITORY" ]]; then
  echo "Repository identity mismatch."
  echo "Expected: $EXPECTED_REPOSITORY"
  echo "Actual:   $CURRENT_REPOSITORY"
  echo "Stop: do not build, test, or deploy this project from the wrong repository."
  exit 1
fi

echo "Repository identity verified: $CURRENT_REPOSITORY"
