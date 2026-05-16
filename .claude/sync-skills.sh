#!/usr/bin/env bash
# Mirror source-of-truth skills (skills/angular-portal/*.md + skills/_shared/*.md)
# into Claude Code's native .claude/skills/<name>/SKILL.md format.
#
# Source of truth: skills/<track>/*.md
# Generated:       .claude/skills/<name>/SKILL.md
#
# Folder name comes from each source file's `name:` YAML frontmatter field.
#
# Re-run after editing any source skill:
#   bash .claude/sync-skills.sh

set -euo pipefail

# Resolve repo root from this script's location: <repo>/.claude/sync-skills.sh
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

SRC_DIRS=(
  "$REPO_ROOT/skills/angular-portal"
  "$REPO_ROOT/skills/_shared"
)
DEST_ROOT="$REPO_ROOT/.claude/skills"

mkdir -p "$DEST_ROOT"

count=0
for src_dir in "${SRC_DIRS[@]}"; do
  [ -d "$src_dir" ] || continue
  for src_file in "$src_dir"/*.md; do
    [ -f "$src_file" ] || continue

    # Extract the first `name:` field from frontmatter.
    # Frontmatter is between leading `---` lines; we just take the first match.
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
      \<*\>) echo "  skip template: $src_file (name=$name)"; continue ;;
    esac

    dest_dir="$DEST_ROOT/$name"
    dest_file="$dest_dir/SKILL.md"
    mkdir -p "$dest_dir"
    cp "$src_file" "$dest_file"
    count=$((count + 1))
    echo "  $src_file -> .claude/skills/$name/SKILL.md"
  done
done

echo "Mirrored $count skill(s) into .claude/skills/"
