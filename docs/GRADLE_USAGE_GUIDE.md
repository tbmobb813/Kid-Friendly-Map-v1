# Gradle Usage Guide

This guide explains how to use Gradle in the Kid-Friendly Map project for dependency management and Android builds.

## Quick Start

### Running Gradle Commands

The project includes Gradle wrapper scripts in the root directory that automatically delegate to the Android build system:

```bash
# On Linux/macOS
./gradlew <task>

# On Windows (PowerShell)
.\gradlew.bat <task>

# Or use npm scripts (works on all platforms)
npm run gradle -- <task>
```

## Common Gradle Tasks

### Check Gradle Version

```bash
./gradlew --version
# or
npm run gradle -- --version
```

### List All Available Tasks

```bash
./gradlew tasks
# or
npm run gradle:tasks
```

### View Project Dependencies

```bash
./gradlew dependencies
# or
npm run gradle:dependencies
```

### Clean Build Artifacts

```bash
./gradlew clean
# or
npm run gradle:clean
```

### Build the Android App

```bash
./gradlew build
# or
npm run gradle:build
```

## Checking for Outdated Dependencies

To check for outdated or deprecated dependencies, you need to add the Gradle Versions Plugin to your project.

### Option 1: Add the Versions Plugin (Recommended)

1. Add the plugin to `android/build.gradle`:

```gradle
buildscript {
  repositories {
    google()
    mavenCentral()
  }
  dependencies {
    classpath('com.android.tools.build:gradle:8.1.2')
    classpath('com.facebook.react:react-native-gradle-plugin')
    classpath('org.jetbrains.kotlin:kotlin-gradle-plugin')
    classpath('com.github.ben-manes:gradle-versions-plugin:0.51.0')  // Add this line
  }
}
```

2. Apply the plugin in the same file after the other plugins:

```gradle
apply plugin: "expo-root-project"
apply plugin: "com.facebook.react.rootproject"
apply plugin: "com.github.ben-manes.versions"  // Add this line
```

3. Run the dependency update check:

```bash
./gradlew dependencyUpdates
# or
npm run gradle:dependencyUpdates
```

This will generate a report of all outdated dependencies in `android/build/dependencyUpdates/report.txt`.

### Option 2: Use Expo/React Native Tools

For checking JavaScript/TypeScript dependencies (which are most of your dependencies), use npm instead:

```bash
# Check for outdated npm packages
npm outdated

# Update npm packages
npm update

# Check for security vulnerabilities
npm audit

# Automatically fix vulnerabilities
npm audit fix
```

## Known Issues

### Gradle Build Error During Settings Evaluation

If you see this error:

```
A problem occurred evaluating settings 'android'.
> Process 'command 'node'' finished with non-zero exit value 1
```

**This is a known issue** with React Native autolinking. You have several workarounds:

1. **Test in Expo Go** (recommended for development):
   ```bash
   npm start
   # Then scan QR code with Expo Go app
   ```

2. **Use Expo CLI to build**:
   ```bash
   npx expo run:android
   # Requires a connected Android device or emulator
   ```

3. **Use EAS Build** (cloud build):
   ```bash
   npm run build:android:dev
   ```

## Wrapper Script Details

The `gradlew` and `gradlew.bat` wrapper scripts in the root directory:

- Automatically detect the `android/` directory
- Run the actual Gradle wrapper from `android/gradlew`
- Pass all arguments through to Gradle
- Provide helpful error messages if the Android directory doesn't exist

If you see an error about missing Android directory, run:

```bash
npx expo prebuild
```

This will regenerate the `android/` and `ios/` directories with all the native build files.

## NPM Script Reference

The following npm scripts are available for Gradle tasks:

| Script | Command | Description |
|--------|---------|-------------|
| `gradle` | `./gradlew` | Run any Gradle command |
| `gradle:tasks` | `./gradlew tasks` | List all available Gradle tasks |
| `gradle:dependencies` | `./gradlew dependencies` | Show dependency tree |
| `gradle:dependencyUpdates` | `./gradlew dependencyUpdates` | Check for outdated dependencies (requires plugin) |
| `gradle:clean` | `./gradlew clean` | Clean build artifacts |
| `gradle:build` | `./gradlew build` | Build the Android app |

## Additional Resources

- [Gradle User Guide](https://docs.gradle.org/current/userguide/userguide.html)
- [Android Gradle Plugin Documentation](https://developer.android.com/studio/build)
- [Expo Prebuild Documentation](https://docs.expo.dev/workflow/prebuild/)
- [Gradle Versions Plugin](https://github.com/ben-manes/gradle-versions-plugin)

## Troubleshooting

### Command Not Recognized

If you get "command not recognized" errors:

- **On Windows PowerShell**: Make sure you're using `.\gradlew.bat` (with backslash and .bat extension)
- **On Linux/macOS**: Make sure the script is executable: `chmod +x gradlew`
- **Alternative**: Use the npm scripts which work on all platforms

### Permission Denied

On Linux/macOS, if you get "Permission denied":

```bash
chmod +x ./gradlew
chmod +x ./android/gradlew
```

### Gradle Daemon Issues

If builds are slow or hanging:

```bash
# Stop all Gradle daemons
./gradlew --stop

# Check Gradle daemon status
./gradlew --status
```

## See Also

- [BUILD_APK_GUIDE.md](./BUILD_APK_GUIDE.md) - Complete guide for building APKs
- [CURRENT_STATUS.md](./CURRENT_STATUS.md) - Project status and known issues
- [RUNNING_THE_APP.md](../RUNNING_THE_APP.md) - General app running guide
