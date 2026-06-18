#!/usr/bin/env bash
# Cross-platform sync implementation lives in scripts/sync-skills.mjs.
# Keep this wrapper for existing Git Bash / CI invocations.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

node "$REPO_ROOT/scripts/sync-skills.mjs" "$@"
