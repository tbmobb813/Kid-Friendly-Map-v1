# MapLibre React Native — setup, builds, and options

This document explains how to enable and ship the native MapLibre React Native module in this project, common troubleshooting steps, and the deployment/build options available (EAS dev builds, production EAS builds, and bare React Native).

Purpose
- Make MapLibre the primary mobile map implementation for better on-device performance and native feature parity.
- Explain the minimal steps to include the native module in an Expo-managed project using EAS, and for bare React Native projects.

Quick summary
- Preferred development flow (recommended): Create an EAS development build that includes `@maplibre/maplibre-react-native`.
- Production: Build with EAS (production profile) or use a bare RN build pipeline.
- In Expo Go the native module is not available — the app falls back to a JS/OpenStreetMap implementation. Use EAS dev builds when testing the native experience.

Prerequisites
- Node, npm (or yarn/bun) and project dependencies installed.
- EAS CLI installed for EAS builds: `npm install -g eas-cli` or use `npx eas`.
- For iOS builds: Apple credentials (App Store / private signing) when running EAS builds for iOS.

Minimal installation (already present in this repo)

1. Install the package (this project already includes it in `package.json`):

```bash
npm install @maplibre/maplibre-react-native
```

2. (Optional) If you're using a bare React Native project locally:

```bash
cd ios
pod install
```

EAS dev build (recommended for development)

1. Login to EAS if not already:

```bash
npx eas login
```

2. Create a development build (includes native modules):

```bash
# Android dev build
npx eas build --profile development --platform android

# iOS dev build (requires credentials)
npx eas build --profile development --platform ios
```

Notes:
- An EAS dev build gives you an installable APK / AAB or iOS build you can run on device and contains the native MapLibre modules.
- Dev builds are faster to iterate than production builds and are intended for local testing of native modules.

Production EAS build

```bash
npx eas build --profile production --platform all
```

Bare React Native workflow

If you're not using EAS or need full native control, convert to a bare RN workflow (or eject) and follow the usual native install steps:

- Android: Gradle autolinking should pick up the module; ensure Gradle repo settings include mavenCentral and the required MapLibre artifacts.
- iOS: run `cd ios && pod install` and open workspace in Xcode.

Environment and configuration

- This project reads map style and tokens from `Config`/environment variables. Set these in your environment or `.env` as needed:

  - EXPO_PUBLIC_MAP_STYLE_URL (style.json URL)
  - EXPO_PUBLIC_MAPBOX_TOKEN (only if your style requires a Mapbox token)

- Example (local .env or CI environment):

```bash
EXPO_PUBLIC_MAP_STYLE_URL=https://demotiles.maplibre.org/style.json
EXPO_PUBLIC_MAP_DEFAULT_LAT=40.7128
EXPO_PUBLIC_MAP_DEFAULT_LNG=-74.006
EXPO_PUBLIC_MAP_DEFAULT_ZOOM=13
```

Hiding debug UI

- The map screen includes a small debug badge that displays which map implementation is active. To hide it in production, wrap the badge with a `__DEV__` check or an environment flag. Example:

```tsx
{__DEV__ && (
  <View style={...} pointerEvents="none">
    <Text>{`Map: ${mapImplementation}`}</Text>
  </View>
)}
```

Troubleshooting

- Map not showing on device:
  - Ensure you're running an EAS dev build or a bare native build. MapLibre is not available in Expo Go.
  - Confirm the `MapLibre` native module is autolinked (Android) and pods installed (iOS).
  - Verify style URL is accessible and CORS-enabled where necessary.

- Build failures (native):
  - For Android, check Gradle logs: missing dependencies usually indicate repository configuration (add mavenCentral).
  - For iOS, run `pod repo update` and `pod install` in `ios/`.

- Runtime errors in app about missing view managers:
  - Check `UIManager.getViewManagerConfig` for `MapLibreGLMapView` or `RCTMGLMapView`. If absent, the native module wasn't linked or the build doesn't include it.

Options comparison (short)

- EAS dev builds (recommended for Expo projects):
  - Pros: Easy to create a development binary with native modules, minimal native config, works with existing Expo-managed project.
  - Cons: Requires EAS account and dev build time.

- Production EAS builds:
  - Pros: Full production binaries with MapLibre included.
  - Cons: Longer build times and need credentials.

- Bare React Native builds:
  - Pros: Full control, faster incremental builds locally for some setups.
  - Cons: Requires migrating/ejecting from Expo-managed workflow; more native maintenance.

Next steps & recommendations

- If you want MapLibre as the default in development and production, use EAS dev builds for development testing and EAS production builds for release. Keep the JS fallback for Expo Go and web.
- Add CI steps (GitHub Actions) to run `npx eas build --profile development --platform android` in a dedicated job if you want to run smoke tests against a dev build (optional, heavier).
- If you'd like I can:
  - Add a `MAPLIBRE.md` link from `README.md` (I can add a link or short pointer).
  - Add a `__DEV__` guard to hide the debug badge in production builds.

DevChecks: runtime/native validation helper

This repo includes a small runtime debug screen you can open on a device to assert that native view managers are present:

- Component: `components/DevChecks/NativeViewManagerCheck.tsx`
  - It runs `UIManager.getViewManagerConfig` for common map view manager names (`MapLibreGLMapView`, `RCTMGLMapView`, `AIRMap`) and displays availability.
  - It also logs results to console with the tag `NativeCheck` so you can filter adb logcat easily.

How to use:

1. Install and run an EAS dev build (or use a bare build) that includes the MapLibre native module.
2. Open the app and navigate to the DevChecks screen. (If you don't have it reachable via navigation yet, temporarily import and render the component in a debug route or within the map screen.)
3. The screen will display availability and the log is printed to console.

Alternatively, monitor logs from your machine with the included npm script (Android device):

```bash
npm run check:native-view-managers
```

This runs `adb logcat -s NativeCheck:I *:S` to show only the NativeCheck logs.


If you want me to make any of these next steps (add CI job, hide debug badge, link the doc), tell me which and I'll implement them.
