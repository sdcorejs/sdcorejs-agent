#!/usr/bin/env bash
# Enforce: skills/tracks/angular-portal/{10-init-portal,11-init-module,12-init-entity}.md
# must use the <CORE_VERSION> and <CORE_UI_PACKAGE_NAME> placeholders — never a
# hardcoded literal like "19.0.0-beta.93" or "@sd-angular/core" in import paths.
#
# Source of truth: skills/tracks/angular-portal/_refs/core-version.md.
# The agent reads `packageName` + `currentVersion` from there and substitutes
# <CORE_UI_PACKAGE_NAME> / <CORE_VERSION> at generation time.
#
# Called by lefthook pre-commit hook (see lefthook.yml). Pass each
# changed file as an argument; the check filters for the canonical skill files.
#
# Exit codes:
#   0 = clean (no hardcoded versions or package names in templates)
#   1 = drift detected; commit blocked

set -euo pipefail

# Pattern: semver-with-beta-suffix used by @sd-angular/core, e.g. 19.0.0-beta.93.
VERSION_PATTERN='[0-9]+\.[0-9]+\.[0-9]+-beta\.[0-9]+'

# Pattern: literal Core UI package name in IMPORT statements only (the prose
# body of the skill may mention the package for documentation). We flag
# `from '@sdcorejs/angular...'` / `from '@sd-angular/core...'` (and `import`) —
# anything inside a TS code block that ships verbatim to the generated project.
# Both names are flagged: init skills must use <CORE_UI_PACKAGE_NAME>, so the
# project's actual package (new `@sdcorejs/angular` or legacy `@sd-angular/core`)
# resolves from core-version.md at generation time.
PKG_PATTERN="(from|import)[[:space:]]+['\"]@(sdcorejs/angular|sd-angular/core)"

TARGETS=(
  "skills/tracks/angular-portal/10-init-portal.md"
  "skills/tracks/angular-portal/11-init-module.md"
  "skills/tracks/angular-portal/12-init-entity.md"
)

# If lefthook passes no args (e.g. nothing matched the glob), nothing to do.
if [ "$#" -eq 0 ]; then
  exit 0
fi

is_target() {
  for t in "${TARGETS[@]}"; do
    [ "$1" = "$t" ] && return 0
    # Tolerate basename match — lefthook sometimes passes them differently.
    case "$1" in
      *"$(basename "$t")") return 0 ;;
    esac
  done
  return 1
}

failed=0
for file in "$@"; do
  is_target "$file" || continue
  [ -f "$file" ] || continue

  # Version drift — applies to all three files.
  if grep -nE "$VERSION_PATTERN" "$file" >/tmp/core-drift.log 2>/dev/null; then
    echo "" >&2
    echo "✗ Version drift in $file:" >&2
    cat /tmp/core-drift.log >&2
    echo "" >&2
    echo "  Replace literal versions with <CORE_VERSION>." >&2
    echo "  Source of truth: skills/tracks/angular-portal/_refs/core-version.md" >&2
    failed=1
  fi

  # Package-name drift — same files, applies to import statements only.
  if grep -nE "$PKG_PATTERN" "$file" >/tmp/core-drift.log 2>/dev/null; then
    echo "" >&2
    echo "✗ Package-name drift in $file (hardcoded import path):" >&2
    cat /tmp/core-drift.log >&2
    echo "" >&2
    echo "  Replace the Core UI package name in import statements with <CORE_UI_PACKAGE_NAME>." >&2
    echo "  Source of truth: skills/tracks/angular-portal/_refs/core-version.md (packageName field)" >&2
    echo "  Rationale: default is '@sdcorejs/angular'; legacy projects use '@sd-angular/core'. Agent resolves at generation time." >&2
    failed=1
  fi
done

rm -f /tmp/core-drift.log

[ "$failed" -eq 0 ] || exit 1
exit 0
