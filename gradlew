#!/usr/bin/env bash
# Gradle wrapper script for the root directory
# This delegates to the actual gradlew in the android/ directory

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ANDROID_DIR="$SCRIPT_DIR/android"

# Check if android directory exists
if [ ! -d "$ANDROID_DIR" ]; then
    echo "Error: android directory not found at $ANDROID_DIR"
    echo "Run 'npx expo prebuild' to generate the android directory"
    exit 1
fi

# Check if gradlew exists in android directory
if [ ! -f "$ANDROID_DIR/gradlew" ]; then
    echo "Error: gradlew not found in android directory"
    echo "Run 'npx expo prebuild' to generate the android directory with gradle wrapper"
    exit 1
fi

# Change to android directory and run gradlew with all arguments
cd "$ANDROID_DIR"
exec ./gradlew "$@"
