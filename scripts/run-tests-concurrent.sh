#!/usr/bin/env bash
# Run frontend, server, and bun tests in parallel and produce a simple consolidated summary.
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT_DIR"

# By default run sequentially on local machines to avoid CPU contention causing
# performance-test flakiness. To force parallel runs set FORCE_CONCURRENT=1 or
# run in CI where the CI job runs are isolated (CI=true or GITHUB_ACTIONS present).
FORCE_CONCURRENT=${FORCE_CONCURRENT:-0}
CI_DETECTED=0
if [ "${CI:-}" = "true" ] || [ -n "${GITHUB_ACTIONS:-}" ]; then
  CI_DETECTED=1
fi

OUTDIR=$(mktemp -d)
echo "Writing logs to $OUTDIR"

run_and_log_bg() {
  local name=$1
  local cmd=$2
  local out="$OUTDIR/${name}.log"
  echo "Starting ${name} -> ${out}"
  bash -lc "$cmd" >"$out" 2>&1 &
  echo $! > "$OUTDIR/${name}.pid"
}

run_and_log_fg() {
  local name=$1
  local cmd=$2
  local out="$OUTDIR/${name}.log"
  echo "Running ${name} -> ${out}"
  bash -lc "$cmd" >"$out" 2>&1 || true
}

EXIT_SUM=0

if [ "$FORCE_CONCURRENT" = "1" ] || [ "$CI_DETECTED" = "1" ]; then
  # Run all in parallel
  run_and_log_bg frontend "npm test -- --colors"
  run_and_log_bg server "npm run test:server -- --colors"
  run_and_log_bg bun "npm run test:bun -- --colors"

  echo "Waiting for background jobs..."
  for f in frontend server bun; do
    if [ -f "$OUTDIR/${f}.pid" ]; then
      pid=$(cat "$OUTDIR/${f}.pid")
      wait $pid || EXIT_SUM=$((EXIT_SUM + 1))
      code=$?
      echo "Job ${f} exited with ${code}"
    else
      echo "No pid file for $f"
      EXIT_SUM=$((EXIT_SUM + 1))
    fi
  done
else
  # Run sequentially (safer for local dev machines)
  run_and_log_fg frontend "npm test -- --colors"
  code=$?
  if [ $code -ne 0 ]; then EXIT_SUM=$((EXIT_SUM + 1)); fi

  run_and_log_fg server "npm run test:server -- --colors"
  code=$?
  if [ $code -ne 0 ]; then EXIT_SUM=$((EXIT_SUM + 1)); fi

  run_and_log_fg bun "npm run test:bun -- --colors"
  code=$?
  if [ $code -ne 0 ]; then EXIT_SUM=$((EXIT_SUM + 1)); fi
fi

echo
echo "Consolidated test results:" 
for name in frontend server bun; do
  if grep -q "FAIL" "$OUTDIR/${name}.log" 2>/dev/null; then
    status="FAIL"
  else
    status="PASS"
  fi
  echo "- ${name}: ${status} (see $OUTDIR/${name}.log)"
done

echo
echo "Logs are available in: $OUTDIR"
echo "To inspect failures run e.g.: tail -n +1 $OUTDIR/server.log | sed -n '1,200p'"

if [ $EXIT_SUM -ne 0 ]; then
  exit 2
fi

exit 0
