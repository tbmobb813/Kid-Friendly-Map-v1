#!/usr/bin/env bash
# Gradle progress wrapper
# Usage: scripts/gradle-progress.sh -- ./gradlew <gradle-args>
# It runs a dry-run to estimate task count, then runs the real build and prints a simple progress estimate.

set -euo pipefail

if [ "$#" -lt 2 ]; then
  echo "Usage: $0 -- ./gradlew <gradle-args>"
  exit 2
fi

# Skip the leading -- if provided
if [ "$1" = "--" ]; then
  shift
fi

GRADLE_CMD="$1"
shift

LOG_FILE="/tmp/gradle-progress-$(date +%s).log"
DRY_LOG="/tmp/gradle-dry-$(date +%s).log"

# Run dry-run to estimate tasks
echo "Estimating total tasks with dry-run..."
"$GRADLE_CMD" "$@" --dry-run --console=plain --no-daemon >"$DRY_LOG" 2>&1 || true
TOTAL_TASKS=$(grep -c "^[[:space:]]*:[^ ]" "$DRY_LOG" || true)
if [ -z "$TOTAL_TASKS" ] || [ "$TOTAL_TASKS" -le 0 ]; then
  TOTAL_TASKS=1
fi

echo "Estimated tasks: $TOTAL_TASKS"

# Run the real build and pipe output to log
START=$(date +%s)
( "$GRADLE_CMD" "$@" --no-daemon --console=plain 2>&1 ) | tee "$LOG_FILE" &
BUILD_PID=$!

# Monitor the log and estimate progress by counting task execution lines
LAST_COUNT=0
while kill -0 "$BUILD_PID" 2>/dev/null; do
  # Count lines that look like Gradle task start/execution markers (approximation)
  EXECUTED=$(grep -E "^> Task :|^\[exec\] |^\w.*\: (?:UP-TO-DATE|IS-FROM-CACHE|FROM-CACHE|CANCELED|STARTED|FAILED|UP-TO-DATE)" "$LOG_FILE" | wc -l || true)
  # Fallback: count lines with ':' prefix (project:task)
  if [ "$EXECUTED" -eq 0 ]; then
    EXECUTED=$(grep -c "^[[:space:]]*:[^ ]" "$LOG_FILE" || true)
  fi
  if [ -z "$EXECUTED" ]; then EXECUTED=0; fi

  PERCENT=$(( EXECUTED * 100 / TOTAL_TASKS ))
  NOW=$(date +%s)
  ELAPSED=$(( NOW - START ))
  printf "\rElapsed: %ds | Tasks: %d/%d | Est: %3d%%" "$ELAPSED" "$EXECUTED" "$TOTAL_TASKS" "$PERCENT"
  sleep 2
done

# Wait for process to finish and capture exit code
wait "$BUILD_PID" || true
EXIT=$?
printf "\n"

echo "Build log: $LOG_FILE"
if [ $EXIT -ne 0 ]; then
  echo "Gradle build failed with exit code $EXIT"
  exit $EXIT
fi

echo "Gradle build finished successfully"
exit 0
