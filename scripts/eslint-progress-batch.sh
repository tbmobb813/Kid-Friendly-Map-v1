#!/usr/bin/env bash
# ESLint batch-progress wrapper
# Runs eslint in batches of files to reduce process spawn overhead and provides progress updates.
# Usage: ./scripts/eslint-progress-batch.sh [--batch-size N] -- [eslint-flags] -- [paths...]
# Example:
# ./scripts/eslint-progress-batch.sh --batch-size 50 -- --ext .ts,.tsx,.js --max-warnings=0 --fix -- .

set -euo pipefail

BATCH_SIZE=50

# Prefer local eslint binary if installed to avoid repeated npx startup overhead
if [ -x "./node_modules/.bin/eslint" ]; then
  ESLINT_BIN="./node_modules/.bin/eslint"
else
  ESLINT_BIN="npx eslint"
fi

# Parse optional --batch-size
while [[ $# -gt 0 ]]; do
  case "$1" in
    --batch-size)
      BATCH_SIZE="$2"
      shift 2
      ;;
    --)
      shift
      break
      ;;
    *)
      break
      ;;
  esac
done

# Remaining args: eslint flags up to next --, then paths
ESLINT_FLAGS=()
PATHS=()
SEEN=0
for a in "$@"; do
  if [ "$a" = "--" ]; then SEEN=1; continue; fi
  if [ $SEEN -eq 0 ]; then ESLINT_FLAGS+=("$a"); else PATHS+=("$a"); fi
done

if [ ${#PATHS[@]} -eq 0 ]; then PATHS=(.); fi

# Collect files
EXTENSIONS=(".js" ".ts" ".tsx")
for i in "${!ESLINT_FLAGS[@]}"; do
  if [[ "${ESLINT_FLAGS[$i]}" == --ext ]]; then
    val="${ESLINT_FLAGS[$i+1]:-}"
    if [ -n "$val" ]; then IFS=',' read -r -a exts <<< "$val"; EXTENSIONS=(); for e in "${exts[@]}"; do trimmed=$(echo "$e" | xargs); [[ "$trimmed" == .* ]] || trimmed=".$trimmed"; EXTENSIONS+=("$trimmed"); done; fi
  elif [[ "${ESLINT_FLAGS[$i]}" == --ext=* ]]; then
    val="${ESLINT_FLAGS[$i]#--ext=}"
    IFS=',' read -r -a exts <<< "$val"; EXTENSIONS=(); for e in "${exts[@]}"; do trimmed=$(echo "$e" | xargs); [[ "$trimmed" == .* ]] || trimmed=".$trimmed"; EXTENSIONS+=("$trimmed"); done
  fi
done

FILES=()
for p in "${PATHS[@]}"; do
  if [ -f "$p" ]; then FILES+=("$p");
  elif [ -d "$p" ]; then
    for ext in "${EXTENSIONS[@]}"; do
      while IFS= read -r -d '' f; do FILES+=("$f"); done < <(find "$p" -type f -name "*${ext}" -not -path "*/node_modules/*" -print0)
    done
  else
    # glob or pattern
    for ext in "${EXTENSIONS[@]}"; do
      while IFS= read -r -d '' f; do FILES+=("$f"); done < <(find . -path "./$p" -type f -name "*${ext}" -not -path "*/node_modules/*" -print0 2>/dev/null || true)
    done
  fi
done

# Dedup and sort
IFS=$'\n' read -r -d '' -a FILES < <(printf "%s\n" "${FILES[@]}" | awk '!seen[$0]++' | sort && printf '\0') || true
TOTAL=${#FILES[@]}
if [ "$TOTAL" -eq 0 ]; then echo "No files to lint."; exit 0; fi

LOG="/tmp/eslint-batch-$(date +%s).log"
START=$(date +%s)
COUNT=0
BATCH=0
FAILED=0

echo "Linting $TOTAL files in batches of $BATCH_SIZE. Log: $LOG"

# Run batches
while [ $COUNT -lt $TOTAL ]; do
  BATCH=$((BATCH+1))
  END=$((COUNT + BATCH_SIZE))
  if [ $END -gt $TOTAL ]; then END=$TOTAL; fi
  BATCH_FILES=("${FILES[@]:$COUNT:$((END-COUNT))}")
  NOW=$(date +%s)
  ELAPSED=$((NOW-START))
  PERCENT=$((COUNT*100/TOTAL))
  printf "\rElapsed: %ds | Files: %d/%d | %3d%% | Running batch %d (%d files)" "$ELAPSED" "$COUNT" "$TOTAL" "$PERCENT" "$BATCH" "${#BATCH_FILES[@]}"
  # Run eslint on batch using chosen binary, stream output to console and append to log
  echo "\n--- Batch $BATCH: linting ${#BATCH_FILES[@]} files ---" | tee -a "$LOG"
  # shellcheck disable=SC2086
  $ESLINT_BIN "${ESLINT_FLAGS[@]}" -- "${BATCH_FILES[@]}" 2>&1 | tee -a "$LOG" || rc=$?
  if [ "${rc:-0}" -ne 0 ]; then
    FAILED=$((FAILED+1))
    rc=0
  fi
  COUNT=$END
done
printf "\n"

echo "ESLint batches complete. Files processed: $TOTAL, batch failures: $FAILED"
echo "Log: $LOG"
if [ $FAILED -ne 0 ]; then exit 1; fi
exit 0
