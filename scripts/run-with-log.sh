#!/usr/bin/env bash
# Run a given command, save output to a log, and show live tail + spinner to indicate activity.
# Usage: ./scripts/run-with-log.sh -- <command...>

set -euo pipefail

if [ "$#" -lt 2 ]; then
  echo "Usage: $0 -- <command...>"
  exit 2
fi
if [ "$1" = "--" ]; then shift; fi

LOG="/tmp/run-$(date +%s)-$(basename "$1").log"
CMD=("$@")

echo "Running: ${CMD[*]}"
echo "Log: $LOG"

# Start the command in background, redirect stdout/stderr to log
( "${CMD[@]}" ) >"$LOG" 2>&1 &
PID=$!

# Start tailing the log in background
( tail -n +1 -F "$LOG" & ) &
TAIL_PID=$!

# Spinner
spinner() {
  local pid=$1
  local delay=1
  local spinstr='|/-\\'
  while kill -0 "$pid" 2>/dev/null; do
    for (( i=0; i<${#spinstr}; i++ )); do
      printf "\r[%c] Running (pid %d). Log: %s" "${spinstr:i:1}" "$pid" "$LOG"
      sleep 0.5
    done
  done
}

spinner "$PID"
WAIT_RC=0
wait "$PID" || WAIT_RC=$?
# Give tail a moment to flush
sleep 0.5
kill "$TAIL_PID" 2>/dev/null || true
printf "\n"

if [ "$WAIT_RC" -ne 0 ]; then
  echo "Command exited with code $WAIT_RC. See log: $LOG"
  exit $WAIT_RC
fi

echo "Command finished successfully. Log: $LOG"
exit 0
