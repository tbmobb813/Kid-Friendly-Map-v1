#!/usr/bin/env bash
# Helper wrapper to run bun tests when Bun is installed.
# Usage: ./scripts/bun-test.sh --ci|--watch
set -euo pipefail
mode="$1"
if ! command -v bun >/dev/null 2>&1; then
  echo "bun is not installed. Install bun or run tests via npm/jest."
  exit 127
fi
case "$mode" in
  --ci)
    bun test bun-tests/ --silent || exit $?
    ;;
  --watch)
    bun test --watch bun-tests/ || exit $?
    ;;
  *)
    echo "Usage: $0 --ci|--watch"
    exit 2
    ;;
esac
