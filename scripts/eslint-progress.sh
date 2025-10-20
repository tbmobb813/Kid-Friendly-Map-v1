#!/usr/bin/env bash
# ESLint progress wrapper
# Usage: ./scripts/eslint-progress.sh [eslint-args] -- [paths...]
# Examples:
#  ./scripts/eslint-progress.sh --ext .ts,.tsx,.js --max-warnings=0 --fix -- .
#  ./scripts/eslint-progress.sh --ext .ts,.tsx,.js --max-warnings=0 --fix -- app components hooks

set -euo pipefail

if [ "$#" -eq 0 ]; then
  echo "Usage: $0 [eslint-args] -- [paths...]"
  exit 2
fi

# Split args: everything before the first '--' are eslint flags, everything after are paths.
ESLINT_FLAGS=()
PATHS=()
SEEN_DASHDASH=0
for a in "$@"; do
  if [ "$a" = "--" ]; then
    SEEN_DASHDASH=1
    continue
  fi
  if [ $SEEN_DASHDASH -eq 0 ]; then
    ESLINT_FLAGS+=("$a")
  else
    PATHS+=("$a")
  fi
done

# If no paths specified, default to current directory
if [ ${#PATHS[@]} -eq 0 ]; then
  PATHS=(.)
fi

# Determine extensions from --ext flag if present, else default
EXTENSIONS=(".js" ".ts" ".tsx")
for i in "${!ESLINT_FLAGS[@]}"; do
  if [[ "${ESLINT_FLAGS[$i]}" == --ext ]]; then
    val="${ESLINT_FLAGS[$i+1]:-}"
    if [ -n "$val" ]; then
      IFS=',' read -r -a exts <<< "$val"
      EXTENSIONS=()
      for e in "${exts[@]}"; do
        trimmed=$(echo "$e" | xargs)
        if [[ "$trimmed" != .* ]]; then trimmed=".$trimmed"; fi
        EXTENSIONS+=("$trimmed")
      done
    fi
  elif [[ "${ESLINT_FLAGS[$i]}" == --ext=* ]]; then
    val="${ESLINT_FLAGS[$i]#--ext=}"
    IFS=',' read -r -a exts <<< "$val"
    EXTENSIONS=()
    for e in "${exts[@]}"; do
      trimmed=$(echo "$e" | xargs)
      if [[ "$trimmed" != .* ]]; then trimmed=".$trimmed"; fi
      EXTENSIONS+=("$trimmed")
    done
  fi
done

# Build file list
FILES=()
for p in "${PATHS[@]}"; do
  if [ -f "$p" ]; then
    FILES+=("$p")
  elif [ -d "$p" ]; then
    for ext in "${EXTENSIONS[@]}"; do
      while IFS= read -r -d '' f; do
        FILES+=("$f")
      done < <(find "$p" -type f -name "*${ext}" -not -path "*/node_modules/*" -print0)
    done
  else
    # treat as glob
    for ext in "${EXTENSIONS[@]}"; do
      while IFS= read -r -d '' f; do
        FILES+=("$f")
      done < <(find . -path "./$p" -type f -name "*${ext}" -not -path "*/node_modules/*" -print0 2>/dev/null || true)
    done
  fi
done

# Deduplicate
IFS=$'\n' read -r -d '' -a FILES < <(printf "%s\n" "${FILES[@]}" | awk '!seen[$0]++' | sort && printf '\0') || true

TOTAL=${#FILES[@]}
if [ "$TOTAL" -eq 0 ]; then
  echo "No files matched to lint (extensions: ${EXTENSIONS[*]})."
  exit 0
fi

LOG="/tmp/eslint-progress-$(date +%s).log"
echo "Found $TOTAL files to lint. Log: $LOG"

START=$(date +%s)
COUNT=0
FAILED=0
# Run eslint per-file to provide precise progress (a bit slower but accurate)
for f in "${FILES[@]}"; do
  COUNT=$((COUNT+1))
  NOW=$(date +%s)
  ELAPSED=$((NOW-START))
  PERCENT=$((COUNT*100/TOTAL))
  printf "\rElapsed: %ds | Files: %d/%d | %3d%% | Linting: %s" "$ELAPSED" "$COUNT" "$TOTAL" "$PERCENT" "${f}"
  # Run eslint on single file and append output
  npx eslint "${ESLINT_FLAGS[@]}" -- "${f}" >>"$LOG" 2>&1 || rc=$?
  if [ "${rc:-0}" -ne 0 ]; then
    FAILED=$((FAILED+1))
    rc=0
  fi
done
printf "\n"

echo "ESLint run complete. Files processed: $TOTAL, failures: $FAILED"
echo "Full log: $LOG"
if [ "$FAILED" -ne 0 ]; then
  exit 1
fi
exit 0
