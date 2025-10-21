#!/usr/bin/env bash
set -euo pipefail

# Local helper to package Android SDK pieces (cmdline-tools/latest, cmake/4.1.2, platform-tools)
# and optionally upload to S3. Intended to be run locally by a maintainer to create a cache
# archive that EAS workers can download.

ANDROID_SDK_ROOT=${ANDROID_SDK_ROOT:-${ANDROID_HOME:-$HOME/Android/Sdk}}
OUT_DIR=${OUT_DIR:-$(pwd)/android/toolchain-cache}
ARCHIVE_NAME=${ARCHIVE_NAME:-android-toolchain-$(date +%Y%m%dT%H%M%SZ).tar.gz}

mkdir -p "$OUT_DIR"
pushd "$ANDROID_SDK_ROOT" >/dev/null

echo "[publish-toolchain] Packaging cmdline-tools/latest, cmake/4.1.2, platform-tools into $OUT_DIR/$ARCHIVE_NAME"
tar -czf "$OUT_DIR/$ARCHIVE_NAME" \
  --transform "s|^|android-sdk/|S" \
  "cmdline-tools/latest" \
  "cmake/4.1.2" \
  "platform-tools" \
  || { echo "[publish-toolchain] tar failed"; exit 1; }

popd >/dev/null

echo "[publish-toolchain] Created archive: $OUT_DIR/$ARCHIVE_NAME"

if [ -n "${TOOLCHAIN_S3_BUCKET:-}" ]; then
  if ! command -v aws >/dev/null 2>&1; then
    echo "[publish-toolchain] aws CLI not found; cannot upload to S3." >&2
    exit 2
  fi
  S3_KEY=${TOOLCHAIN_S3_KEY:-toolchains/$ARCHIVE_NAME}
  echo "[publish-toolchain] Uploading to s3://$TOOLCHAIN_S3_BUCKET/$S3_KEY"
  aws s3 cp "$OUT_DIR/$ARCHIVE_NAME" "s3://$TOOLCHAIN_S3_BUCKET/$S3_KEY" --acl private
  echo "[publish-toolchain] Uploaded. Set TOOLCHAIN_URL to s3://$TOOLCHAIN_S3_BUCKET/$S3_KEY or to the HTTPS URL if you make it public"
fi

echo "[publish-toolchain] Done"
