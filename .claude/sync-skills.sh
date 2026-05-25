#!/usr/bin/env bash
# Mirror source-of-truth skills into BOTH Claude Code's native skill format paths:
#   1. .claude/skills/<name>/SKILL.md   — project-local Claude Code skills
#   2. plugin/skills/<name>/SKILL.md    — Claude Code plugin distribution
#                                         (consumed via .claude-plugin/marketplace.json)
#
# Reference data (`_refs/<track>/...`) lives at REPO ROOT in a single tree and is
# mirrored ONCE per target into:
#   1. .claude/_refs/<track>/...
#   2. plugin/_refs/<track>/...
# Skill bodies reference reference docs via repo-anchored paths like
# `_refs/angular-portal/templates/entity-skeleton.md` so a single mirrored copy
# resolves regardless of which skill links to it.
#
# Source of truth tree:
#   skills/tracks/<stack>/**/*.md       — stack-specific (angular-portal, nextjs/build-website, nestjs)
#   skills/testing/**/*.md              — test discipline (cross-track principles + per-stack)
#   skills/review/**/*.md               — review discipline (architecture, security, perf, a11y, code)
#   skills/orchestration/*.md           — SDLC plumbing (dispatch, repair, summarize, plans, specs, …)
#   skills/shared/**/*.md               — cross-cutting utilities (conventions, workflow)
#   _refs/<track>/**                    — track-scoped reference data (no frontmatter, copied wholesale)
#
# Excluded from skill scan:
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
REFS_ROOT="$REPO_ROOT/_refs"

# Response Style block — auto-injected at the END of every mirrored SKILL.md so
# the agent answers terse during skill execution, cutting token usage. Source
# files stay clean; only mirrors carry the directive.
read -r -d '' RESPONSE_STYLE_BLOCK <<'STYLE_EOF' || true

<!-- response-style: auto-injected by sync-skills.sh; do not edit mirror by hand -->

**Response style (terse mode active for this skill — reduces token usage):**

While executing this skill:

- Drop articles (a/an/the), filler (just/really/basically/simply/actually), pleasantries (sure/of course/happy to), hedging.
- Fragments OK. Short synonyms (fix not "implement solution for", big not "extensive").
- Pattern: `[thing] [action] [reason]. [next step].`
- Technical terms exact. Error strings quoted verbatim. **Code, commits, PRs, file content: write normal — no caveman inside generated artifacts.**
- Auto-clarity: drop terse mode for security warnings, irreversible action confirmations, multi-step sequences where fragment order risks misread, or when user asks to clarify. Resume terse after the clear part is done.
- If user types "stop caveman" or "normal mode", revert to standard prose for the rest of the session.

STYLE_EOF

# Dual mirror targets — both kept in sync so project-local + plugin distribution agree.
DEST_SKILLS_ROOTS=(
  "$REPO_ROOT/.claude/skills"
  "$REPO_ROOT/plugin/skills"
)
DEST_REFS_ROOTS=(
  "$REPO_ROOT/.claude/_refs"
  "$REPO_ROOT/plugin/_refs"
)

# In check mode, write into temp dirs and diff against the committed mirrors.
declare -a WORK_SKILLS_ROOTS WORK_REFS_ROOTS
if [ "$MODE" = "check" ]; then
  WORK_BASE="$(mktemp -d)"
  trap 'rm -rf "$WORK_BASE"' EXIT
  for i in "${!DEST_SKILLS_ROOTS[@]}"; do
    WORK_SKILLS_ROOTS[$i]="$WORK_BASE/skills-$i"
    WORK_REFS_ROOTS[$i]="$WORK_BASE/refs-$i"
    mkdir -p "${WORK_SKILLS_ROOTS[$i]}" "${WORK_REFS_ROOTS[$i]}"
  done
else
  WORK_SKILLS_ROOTS=("${DEST_SKILLS_ROOTS[@]}")
  WORK_REFS_ROOTS=("${DEST_REFS_ROOTS[@]}")
  for dest in "${DEST_SKILLS_ROOTS[@]}" "${DEST_REFS_ROOTS[@]}"; do
    mkdir -p "$dest"
  done
fi

# ---------------------------------------------------------------------------
# 1. Mirror _refs/ tree once per target (single source → single copy).
# ---------------------------------------------------------------------------
if [ -d "$REFS_ROOT" ]; then
  for work_refs in "${WORK_REFS_ROOTS[@]}"; do
    # Clean target then recopy — keeps mirror exact, removes deleted files.
    rm -rf "$work_refs"
    mkdir -p "$work_refs"
    # cp -R copies into the dir (we want $REFS_ROOT/* to land directly under $work_refs).
    cp -R "$REFS_ROOT"/. "$work_refs"/
  done
fi

# ---------------------------------------------------------------------------
# 2. Mirror skill files. Exclude templates/specs convention docs.
# ---------------------------------------------------------------------------
mapfile -d '' -t SRC_FILES < <(
  find "$SKILLS_ROOT" -type f -name '*.md' \
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
  for work_root in "${WORK_SKILLS_ROOTS[@]}"; do
    dest_dir="$work_root/$name"
    dest_file="$dest_dir/SKILL.md"
    mkdir -p "$dest_dir"
    cp "$src_file" "$dest_file"
    printf '\n%s\n' "$RESPONSE_STYLE_BLOCK" >> "$dest_file"
  done
  KEPT["$name"]=1
  count=$((count + 1))
  if [ "$MODE" = "sync" ]; then
    echo "  ${src_file#$REPO_ROOT/} -> {.claude,plugin}/skills/$name/SKILL.md"
  fi
done

# ---------------------------------------------------------------------------
# 3. Mode-specific finalization.
# ---------------------------------------------------------------------------
if [ "$MODE" = "check" ]; then
  drift=0
  for i in "${!DEST_SKILLS_ROOTS[@]}"; do
    dest="${DEST_SKILLS_ROOTS[$i]}"
    work="${WORK_SKILLS_ROOTS[$i]}"
    rel="${dest#$REPO_ROOT/}"
    if diff -rq "$work" "$dest" >/dev/null 2>&1; then
      echo "✓ $rel/ is in sync ($count source files)"
    else
      echo "✗ $rel/ is OUT OF SYNC with skills/" >&2
      diff -rq "$work" "$dest" >&2 || true
      drift=1
    fi
  done
  for i in "${!DEST_REFS_ROOTS[@]}"; do
    dest="${DEST_REFS_ROOTS[$i]}"
    work="${WORK_REFS_ROOTS[$i]}"
    rel="${dest#$REPO_ROOT/}"
    if diff -rq "$work" "$dest" >/dev/null 2>&1; then
      echo "✓ $rel/ is in sync"
    else
      echo "✗ $rel/ is OUT OF SYNC with _refs/" >&2
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
  removed=0
  for dest_root in "${DEST_SKILLS_ROOTS[@]}"; do
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
for dest in "${DEST_SKILLS_ROOTS[@]}"; do
  echo "  - ${dest#$REPO_ROOT/}/"
done
echo "Mirrored _refs/ tree into:"
for dest in "${DEST_REFS_ROOTS[@]}"; do
  echo "  - ${dest#$REPO_ROOT/}/"
done
