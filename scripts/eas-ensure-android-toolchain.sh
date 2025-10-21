#!/usr/bin/env bash
set -euo pipefail

# Ensure Android SDK related environment variables
ANDROID_SDK_ROOT=${ANDROID_SDK_ROOT:-${ANDROID_HOME:-$HOME/Android/Sdk}}

echo "[eas-setup] Using ANDROID_SDK_ROOT=$ANDROID_SDK_ROOT"

if [ ! -d "$ANDROID_SDK_ROOT" ]; then
  echo "[eas-setup] Android SDK root not found at $ANDROID_SDK_ROOT. Creating directory."
  mkdir -p "$ANDROID_SDK_ROOT"
fi

# Ensure cmdline-tools exists under cmdline-tools/latest
CMDLINE_TOOLS_SRC="$ANDROID_SDK_ROOT/cmdline-tools"
CMDLINE_TOOLS_LATEST="$CMDLINE_TOOLS_SRC/latest"

if [ -d "$CMDLINE_TOOLS_LATEST" ]; then
  echo "[eas-setup] cmdline-tools already installed at $CMDLINE_TOOLS_LATEST"
else
  # If there's exactly one subdir that looks like latest-* or latest-2, use it
  fallback=$(ls -1 "$CMDLINE_TOOLS_SRC" 2>/dev/null | grep -E '^latest' || true)
  if [ -n "$fallback" ] && [ -d "$CMDLINE_TOOLS_SRC/$fallback" ]; then
    echo "[eas-setup] Found cmdline-tools directory $fallback — creating canonical 'latest' symlink"
    mkdir -p "$CMDLINE_TOOLS_SRC"
    ln -sfn "$CMDLINE_TOOLS_SRC/$fallback" "$CMDLINE_TOOLS_LATEST"
    echo "[eas-setup] Created symlink $CMDLINE_TOOLS_LATEST -> $CMDLINE_TOOLS_SRC/$fallback"
  else
    echo "[eas-setup] No cmdline-tools 'latest' found. Attempting to install using sdkmanager."
    if [ -x "${ANDROID_SDK_ROOT}/cmdline-tools/latest/bin/sdkmanager" ]; then
      sdkmanager_cmd="${ANDROID_SDK_ROOT}/cmdline-tools/latest/bin/sdkmanager"
    elif command -v sdkmanager >/dev/null 2>&1; then
      sdkmanager_cmd="$(command -v sdkmanager)"
    else
      echo "[eas-setup] sdkmanager not found. Attempting to download commandlinetools using curl/wget."
      TMPDIR=$(mktemp -d)
      pushd "$TMPDIR" >/dev/null
      # Try official Google archive URL for commandlinetools (Linux x86_64)
      CLI_ZIP_URL="https://dl.google.com/android/repository/commandlinetools-linux-9123336_latest.zip"
      echo "[eas-setup] Downloading commandlinetools from $CLI_ZIP_URL"
      if command -v curl >/dev/null 2>&1; then
        curl -fSL "$CLI_ZIP_URL" -o commandlinetools.zip
      else
        wget -O commandlinetools.zip "$CLI_ZIP_URL"
      fi
      mkdir -p "$CMDLINE_TOOLS_SRC"
      unzip -q commandlinetools.zip -d "$CMDLINE_TOOLS_SRC"
      # The zip contains a 'cmdline-tools' dir with subdir 'bin' etc. Move to latest
      if [ -d "$CMDLINE_TOOLS_SRC/cmdline-tools" ]; then
        mv "$CMDLINE_TOOLS_SRC/cmdline-tools"/* "$CMDLINE_TOOLS_SRC/"
        rmdir "$CMDLINE_TOOLS_SRC/cmdline-tools" || true
      fi
      ln -sfn "$CMDLINE_TOOLS_SRC/latest" "$CMDLINE_TOOLS_LATEST" || true
      popd >/dev/null
      rm -rf "$TMPDIR"
      if [ -x "$CMDLINE_TOOLS_LATEST/bin/sdkmanager" ]; then
        sdkmanager_cmd="$CMDLINE_TOOLS_LATEST/bin/sdkmanager"
      fi
    fi
    if [ -n "${sdkmanager_cmd:-}" ]; then
      echo "[eas-setup] Installing cmdline-tools and platform tools via sdkmanager"
      yes | "$sdkmanager_cmd" --sdk_root="$ANDROID_SDK_ROOT" "cmdline-tools;latest" "platform-tools" || true
      ln -sfn "$CMDLINE_TOOLS_SRC/latest" "$CMDLINE_TOOLS_LATEST" || true
    else
      echo "[eas-setup] Could not determine sdkmanager command; continuing but builds may fail." >&2
    fi
  fi
fi

# Ensure CMake 4.1.2 is installed
CMAKE_PKG="cmake;4.1.2"
if [ -d "$ANDROID_SDK_ROOT/cmake/4.1.2/bin" ] || [ -d "$ANDROID_SDK_ROOT/cmake/4.1.2" ]; then
  echo "[eas-setup] CMake 4.1.2 already present"
else
  echo "[eas-setup] Installing $CMAKE_PKG via sdkmanager"
  if [ -n "${sdkmanager_cmd:-}" ]; then
    yes | "$sdkmanager_cmd" --sdk_root="$ANDROID_SDK_ROOT" "$CMAKE_PKG" || true
  elif command -v sdkmanager >/dev/null 2>&1; then
    yes | sdkmanager --sdk_root="$ANDROID_SDK_ROOT" "$CMAKE_PKG" || true
  else
    echo "[eas-setup] sdkmanager not available; cannot install CMake. Please ensure CMake 4.1.2 is available in the Android SDK." >&2
  fi
fi

echo "[eas-setup] Toolchain ensured. Listing relevant SDK dirs:"
ls -1 "$ANDROID_SDK_ROOT" | sed -n '1,200p' || true

echo "[eas-setup] sdkmanager binary: ${sdkmanager_cmd:-not-set}"
echo "[eas-setup] Done"
