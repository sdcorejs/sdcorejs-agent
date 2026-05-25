#!/usr/bin/env bash
# Enforce: every .md file under skills/ MUST have YAML frontmatter
# (name + description) except files under _refs/, shared/templates/,
# and shared/specs/ which are reference data / placeholders, not
# dispatch-able skills.
#
# Without frontmatter the agent cannot dispatch the skill — the
# sync-skills.sh script would silently drop it from the mirror.
#
# Called by lefthook pre-commit hook (see lefthook.yml). Pass each
# staged .md file as an argument; the check filters by path.
#
# Exit codes:
#   0 = clean (all required files have frontmatter)
#   1 = at least one skill file missing frontmatter; commit blocked

set -euo pipefail

if [ "$#" -eq 0 ]; then
  exit 0
fi

# Exclusion patterns — must mirror sync-skills.sh's find filters.
# Files whose basename starts with `_` (e.g. `_README.md`) are track-local
# docs, not dispatch-able skills; sync-skills.sh skips them with a WARN
# because they have no `name:` frontmatter.
is_excluded() {
  case "$1" in
    */_refs/*|*/shared/templates/*|*/shared/specs/*) return 0 ;;
  esac
  case "$(basename "$1")" in
    _*) return 0 ;;
  esac
  return 1
}

failed=0
missing_files=()

for file in "$@"; do
  # Only enforce on .md files inside skills/.
  case "$file" in
    skills/*.md|skills/*) ;;
    *) continue ;;
  esac
  [ "${file##*.}" = "md" ] || continue
  [ -f "$file" ] || continue

  if is_excluded "$file"; then
    continue
  fi

  # Frontmatter requires:
  #   line 1: ---
  #   then at least one `name:` line before the closing ---
  #   then at least one `description:` line before the closing ---
  first_line=$(head -1 "$file")
  if [ "$first_line" != "---" ]; then
    missing_files+=("$file: first line is not '---' (missing frontmatter block)")
    failed=1
    continue
  fi

  # Extract the frontmatter block (between first two `---` lines).
  fm_block=$(awk '
    /^---[[:space:]]*$/ {
      count++;
      if (count == 1) next;
      if (count == 2) exit;
    }
    count == 1 { print }
  ' "$file")

  if ! echo "$fm_block" | grep -qE "^name:[[:space:]]*\S"; then
    missing_files+=("$file: frontmatter missing 'name:' field")
    failed=1
  fi
  if ! echo "$fm_block" | grep -qE "^description:[[:space:]]*\S"; then
    missing_files+=("$file: frontmatter missing 'description:' field")
    failed=1
  fi
done

if [ "$failed" -ne 0 ]; then
  echo "" >&2
  echo "✗ Skill frontmatter check failed:" >&2
  for m in "${missing_files[@]}"; do
    echo "  - $m" >&2
  done
  echo "" >&2
  echo "  Every .md under skills/ (except _refs/, shared/templates/, shared/specs/)" >&2
  echo "  must start with YAML frontmatter:" >&2
  echo "" >&2
  echo "    ---" >&2
  echo "    name: <kebab-case-name>" >&2
  echo "    description: Use when ... (the dispatch trigger)" >&2
  echo "    allowed-tools: Read, Write, ..." >&2
  echo "    ---" >&2
  echo "" >&2
  echo "  Without it, sync-skills.sh silently drops the file from .claude/skills/ mirror" >&2
  echo "  and the agent cannot dispatch it." >&2
  exit 1
fi

exit 0
