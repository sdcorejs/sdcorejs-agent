#!/usr/bin/env bash
# Mirror source-of-truth skills (skills/angular-portal/*.md + skills/_shared/*.md)
# into Claude Code's native .claude/skills/<name>/SKILL.md format.
#
# Source of truth: skills/<track>/*.md
# Generated:       .claude/skills/<name>/SKILL.md
#
# Folder name comes from each source file's `name:` YAML frontmatter field.
#
# Modes:
#   bash .claude/sync-skills.sh           # regenerate the mirror (default)
#   bash .claude/sync-skills.sh --check   # exit 1 if the mirror is out of sync
#                                         # (used by pre-commit hook + CI)
#   bash .claude/sync-skills.sh --clean   # remove stale mirror entries
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

SRC_DIRS=(
  "$REPO_ROOT/skills/angular-portal"
  "$REPO_ROOT/skills/_shared"
  "$REPO_ROOT/skills/nextjs/build-website"
)
DEST_ROOT="$REPO_ROOT/.claude/skills"

# In check mode, write into a temp dir and diff against the committed mirror.
if [ "$MODE" = "check" ]; then
  WORK_ROOT="$(mktemp -d)"
  trap 'rm -rf "$WORK_ROOT"' EXIT
else
  WORK_ROOT="$DEST_ROOT"
  mkdir -p "$WORK_ROOT"
fi

count=0
declare -A KEPT
for src_dir in "${SRC_DIRS[@]}"; do
  [ -d "$src_dir" ] || continue
  for src_file in "$src_dir"/*.md; do
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

    dest_dir="$WORK_ROOT/$name"
    dest_file="$dest_dir/SKILL.md"
    mkdir -p "$dest_dir"
    cp "$src_file" "$dest_file"
    KEPT["$name"]=1
    count=$((count + 1))
    [ "$MODE" = "sync" ] && echo "  $src_file -> .claude/skills/$name/SKILL.md"
  done
done

if [ "$MODE" = "check" ]; then
  # Compare temp tree against the committed mirror.
  if diff -rq "$WORK_ROOT" "$DEST_ROOT" >/dev/null 2>&1; then
    echo "✓ .claude/skills/ is in sync ($count source files)"
    exit 0
  fi
  echo "✗ .claude/skills/ is OUT OF SYNC with skills/" >&2
  echo "  Run: bash .claude/sync-skills.sh" >&2
  echo "" >&2
  diff -rq "$WORK_ROOT" "$DEST_ROOT" >&2 || true
  exit 1
fi

if [ "$MODE" = "clean" ]; then
  # Remove mirror entries with no matching source file.
  removed=0
  for entry in "$DEST_ROOT"/*; do
    [ -d "$entry" ] || continue
    base="$(basename "$entry")"
    if [ -z "${KEPT[$base]:-}" ]; then
      rm -rf "$entry"
      echo "  removed stale: .claude/skills/$base"
      removed=$((removed + 1))
    fi
  done
  echo "Cleaned $removed stale entry(ies). Mirror has $count active skill(s)."
  exit 0
fi

echo "Mirrored $count skill(s) into .claude/skills/"
