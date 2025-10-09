#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT_DIR"
mkdir -p test-logs

npm test -- --colors > test-logs/frontend.log 2>&1 &
PID_FRONT=$!
npm run test:server -- --colors > test-logs/server.log 2>&1 &
PID_SERVER=$!
npm run test:bun -- --colors > test-logs/bun.log 2>&1 || true
PID_BUN=$!

wait $PID_FRONT || true
wait $PID_SERVER || true
wait $PID_BUN || true

echo "Wrote logs to test-logs/"
