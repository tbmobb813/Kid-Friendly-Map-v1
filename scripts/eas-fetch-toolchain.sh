#!/usr/bin/env bash
set -euo pipefail

# Fetch a prebuilt Android toolchain archive and extract to ANDROID_SDK_ROOT.
# Use TOOLCHAIN_URL env var. Supports s3:// (requires aws CLI) and http/https.

ANDROID_SDK_ROOT=${ANDROID_SDK_ROOT:-${ANDROID_HOME:-$HOME/Android/Sdk}}
TOOLCHAIN_URL=${TOOLCHAIN_URL:-}
TMPDIR=$(mktemp -d)

if [ -z "$TOOLCHAIN_URL" ]; then
  echo "[fetch-toolchain] TOOLCHAIN_URL not set; falling back to local ensure script"
  bash ./scripts/eas-ensure-android-toolchain.sh
  exit 0
fi

echo "[fetch-toolchain] TOOLCHAIN_URL=$TOOLCHAIN_URL"
ARCHIVE="$TMPDIR/toolchain.tar.gz"

if [[ "$TOOLCHAIN_URL" == s3://* ]]; then
  if ! command -v aws >/dev/null 2>&1; then
    echo "[fetch-toolchain] aws CLI not available to fetch s3 URL" >&2
    exit 2
  fi
  echo "[fetch-toolchain] Downloading from S3"
  aws s3 cp "$TOOLCHAIN_URL" "$ARCHIVE"
else
  if command -v curl >/dev/null 2>&1; then
    echo "[fetch-toolchain] Downloading via curl"
    curl -fSL "$TOOLCHAIN_URL" -o "$ARCHIVE"
  elif command -v wget >/dev/null 2>&1; then
    echo "[fetch-toolchain] Downloading via wget"
    wget -O "$ARCHIVE" "$TOOLCHAIN_URL"
  else
    echo "[fetch-toolchain] No downloader available (curl/wget)" >&2
    exit 3
  fi
fi

echo "[fetch-toolchain] Extracting to $ANDROID_SDK_ROOT"
mkdir -p "$ANDROID_SDK_ROOT"
tar -xzf "$ARCHIVE" -C "$ANDROID_SDK_ROOT" || { echo "[fetch-toolchain] extract failed"; exit 4; }

echo "[fetch-toolchain] Extraction complete. Listing contents:"
ls -la "$ANDROID_SDK_ROOT"

rm -rf "$TMPDIR"
echo "[fetch-toolchain] Done"
