#!/usr/bin/env bash
# Enforce: skills/tracks/angular-portal/10-init-portal.md must use the
# <CORE_VERSION> placeholder for @sd-angular/core version — never a
# hardcoded literal like "19.0.0-beta.93".
#
# Source of truth: skills/tracks/angular-portal/_refs/core-version.md.
# The agent reads `currentVersion` from there and substitutes
# <CORE_VERSION> at generation time.
#
# Called by lefthook pre-commit hook (see lefthook.yml). Pass each
# changed file as an argument; the check filters for 10-init-portal.md.
#
# Exit codes:
#   0 = clean (no hardcoded versions found)
#   1 = drift detected (literal version present); commit blocked

set -euo pipefail

# Pattern: semver-with-beta-suffix used by @sd-angular/core, e.g. 19.0.0-beta.93.
# Generic enough to catch any future major (20.x, 21.x, ...).
PATTERN='[0-9]+\.[0-9]+\.[0-9]+-beta\.[0-9]+'

TARGET="skills/tracks/angular-portal/10-init-portal.md"

# If lefthook passes no args (e.g. nothing matched the glob), nothing to do.
if [ "$#" -eq 0 ]; then
  exit 0
fi

failed=0
for file in "$@"; do
  # Only enforce on the canonical skill file, regardless of what lefthook
  # actually passes (defense-in-depth).
  case "$file" in
    *10-init-portal.md|$TARGET) ;;
    *) continue ;;
  esac

  [ -f "$file" ] || continue

  if grep -nE "$PATTERN" "$file" >/tmp/core-version-drift.log; then
    echo ""
    echo "✗ Drift detected in $file:" >&2
    cat /tmp/core-version-drift.log >&2
    echo "" >&2
    echo "  $file must use the <CORE_VERSION> placeholder, never a literal version." >&2
    echo "  Source of truth: skills/tracks/angular-portal/_refs/core-version.md" >&2
    echo "  Fix: replace each literal version with <CORE_VERSION> (the agent substitutes it at generation time)." >&2
    failed=1
  fi
done

rm -f /tmp/core-version-drift.log

if [ "$failed" -ne 0 ]; then
  exit 1
fi

# Silent success — lefthook output already shows the command name.
exit 0
