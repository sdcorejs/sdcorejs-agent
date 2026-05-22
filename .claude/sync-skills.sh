#!/usr/bin/env bash
# Mirror source-of-truth skills into BOTH Claude Code's native skill format paths:
#   1. .claude/skills/<name>/SKILL.md  — project-local Claude Code skills
#   2. plugin/skills/<name>/SKILL.md   — Claude Code plugin distribution
#                                         (consumed via .claude-plugin/marketplace.json)
#
# Source of truth tree:
#   skills/tracks/<stack>/**/*.md       — stack-specific (angular-portal, nextjs/build-website, nestjs)
#   skills/testing/**/*.md              — test discipline (cross-track principles + per-stack)
#   skills/review/**/*.md               — review discipline (architecture, security, perf, a11y, code)
#   skills/orchestration/*.md           — SDLC plumbing (dispatch, repair, summarize, plans, specs, …)
#   skills/shared/**/*.md               — cross-cutting utilities (conventions, workflow)
#
# Excluded from scan:
#   **/_refs/**           — reference data (no frontmatter)
#   shared/templates/**   — frontmatter templates (no usable dispatch metadata)
#   shared/specs/**       — convention docs (no dispatch metadata)
#
# Folder name comes from each source file's `name:` YAML frontmatter field.
#
# Modes:
#   bash .claude/sync-skills.sh           # regenerate BOTH mirrors (default)
#   bash .claude/sync-skills.sh --check   # exit 1 if either mirror is out of sync
#                                         # (used by pre-commit hook + CI)
#   bash .claude/sync-skills.sh --clean   # remove stale mirror entries in BOTH targets
#                                         # whose source file no longer exists

set -euo pipefail

MODE="sync"
case "${1:-}" in
  --check) MODE="check" ;;
  --clean) MODE="clean" ;;
  "") ;;
  *) echo "Unknown flag: $1 (use --check, --clean, or no flag)" >&2; exit 2 ;;
esac

# Resolve repo root from this script's location: <repo>/.claude/sync-skills.sh
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

SKILLS_ROOT="$REPO_ROOT/skills"
# Dual mirror targets — both kept in sync so project-local + plugin distribution agree.
DEST_ROOTS=(
  "$REPO_ROOT/.claude/skills"
  "$REPO_ROOT/plugin/skills"
)

# In check mode, write into a temp dir per target and diff against the committed mirror.
declare -a WORK_ROOTS
if [ "$MODE" = "check" ]; then
  WORK_BASE="$(mktemp -d)"
  trap 'rm -rf "$WORK_BASE"' EXIT
  for i in "${!DEST_ROOTS[@]}"; do
    WORK_ROOTS[$i]="$WORK_BASE/dest-$i"
    mkdir -p "${WORK_ROOTS[$i]}"
  done
else
  WORK_ROOTS=("${DEST_ROOTS[@]}")
  for dest in "${DEST_ROOTS[@]}"; do
    mkdir -p "$dest"
  done
fi

# Find every .md skill, excluding reference data and template placeholders.
# NUL-delimited to handle any whitespace in paths.
mapfile -d '' -t SRC_FILES < <(
  find "$SKILLS_ROOT" -type f -name '*.md' \
    -not -path '*/_refs/*' \
    -not -path '*/shared/templates/*' \
    -not -path '*/shared/specs/*' \
    -print0 | sort -z
)

count=0
declare -A KEPT
for src_file in "${SRC_FILES[@]}"; do
  [ -f "$src_file" ] || continue

  # Extract the first `name:` field from frontmatter.
  name="$(awk '
    /^---[[:space:]]*$/ { fm++; next }
    fm == 1 && /^name:[[:space:]]*/ {
      sub(/^name:[[:space:]]*/, "")
      sub(/[[:space:]]+$/, "")
      print
      exit
    }
  ' "$src_file")"

  if [ -z "$name" ]; then
    echo "WARN: no 'name:' frontmatter in $src_file — skipping" >&2
    continue
  fi

  # Skip placeholder template names (e.g. `<kebab-slug>`).
  case "$name" in
    \<*\>) [ "$MODE" != "check" ] && echo "  skip template: $src_file (name=$name)"; continue ;;
  esac

  # Write to every configured target — keeps .claude/skills/ and plugin/skills/ identical.
  for work_root in "${WORK_ROOTS[@]}"; do
    dest_dir="$work_root/$name"
    dest_file="$dest_dir/SKILL.md"
    mkdir -p "$dest_dir"
    cp "$src_file" "$dest_file"
  done
  KEPT["$name"]=1
  count=$((count + 1))
  if [ "$MODE" = "sync" ]; then
    echo "  ${src_file#$REPO_ROOT/} -> {.claude,plugin}/skills/$name/SKILL.md"
  fi
done

if [ "$MODE" = "check" ]; then
  # Compare each temp tree against its committed mirror.
  drift=0
  for i in "${!DEST_ROOTS[@]}"; do
    dest="${DEST_ROOTS[$i]}"
    work="${WORK_ROOTS[$i]}"
    rel="${dest#$REPO_ROOT/}"
    if diff -rq "$work" "$dest" >/dev/null 2>&1; then
      echo "✓ $rel/ is in sync ($count source files)"
    else
      echo "✗ $rel/ is OUT OF SYNC with skills/" >&2
      echo "" >&2
      diff -rq "$work" "$dest" >&2 || true
      drift=1
    fi
  done
  if [ "$drift" -ne 0 ]; then
    echo "" >&2
    echo "  Run: bash .claude/sync-skills.sh" >&2
    exit 1
  fi
  exit 0
fi

if [ "$MODE" = "clean" ]; then
  # Remove mirror entries with no matching source file, in every target.
  removed=0
  for dest_root in "${DEST_ROOTS[@]}"; do
    [ -d "$dest_root" ] || continue
    rel="${dest_root#$REPO_ROOT/}"
    for entry in "$dest_root"/*; do
      [ -d "$entry" ] || continue
      base="$(basename "$entry")"
      if [ -z "${KEPT[$base]:-}" ]; then
        rm -rf "$entry"
        echo "  removed stale: $rel/$base"
        removed=$((removed + 1))
      fi
    done
  done
  echo "Cleaned $removed stale entry(ies). Each mirror has $count active skill(s)."
  exit 0
fi

echo "Mirrored $count skill(s) into:"
for dest in "${DEST_ROOTS[@]}"; do
  echo "  - ${dest#$REPO_ROOT/}/"
done
