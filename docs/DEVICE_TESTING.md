Device testing and geolocation checklist

This document collects the commands and steps to test geolocation on a physical device (Android/iOS) for this project.
It covers both quick checks using Expo Go and more accurate tests using a dev-client (prebuild/native) or EAS-built dev clients.

Package name used in examples:

app.rork.kid_friendly_map_transit_navigator

---

Quick checks (Expo Go)

Use this when you have not modified native code or you only need to test foreground location.

1. Start Metro (project root):

    npx expo start

2. Open Expo Go on your phone and scan the QR code (or use the tunnel option if devices are not on the same network):

    npx expo start --tunnel

3. Navigate to the screen that uses location (Map, WeatherWidget, etc.). Accept permission prompts.

4. Watch Metro for the hook log:

The code logs a line when location is acquired: "✅ Location acquired:"; check the terminal running Metro.

5. If using Android and USB, make Metro reachable over USB:

    adb reverse tcp:8081 tcp:8081

6. If you need device logs on Android:

    adb logcat -s ReactNativeJS *:S
    adb logcat | grep -i "Location acquired\|Location error\|expo-location"

Notes:
- Expo Go includes expo-location and handles most foreground location flows.
- Background location and custom native behavior usually require a dev-client or full build.

---

Accurate testing (Dev Client / Prebuild) — recommended for background location

Use this when you modified native config, need background location, or use plugins that require a custom binary.

Option A — EAS dev build (recommended)

1. Build a dev client (requires EAS credentials/config):

    eas build --profile development --platform android

2. Download and install the generated APK on Android or install via TestFlight/IPA for iOS.

3. Start Metro for dev-client:

    npx expo start --dev-client

4. Open the installed dev-client on the device and connect to the Metro session (QR code or from the dev-client UI).

5. Test the app and grant permissions if asked. For Android background permission use pm grant (below).

Option B — Local dev client (expo run)

If you prefer a local dev-client (requires native toolchain):

    npx expo run:android
    npx expo run:ios

This performs a prebuild and a native build; expect longer build times.

---

Granting permissions (Android, using adb)

For debug/dev builds you can grant permissions programmatically:

    adb shell pm grant app.rork.kid_friendly_map_transit_navigator android.permission.ACCESS_FINE_LOCATION
    adb shell pm grant app.rork.kid_friendly_map_transit_navigator android.permission.ACCESS_COARSE_LOCATION
    adb shell pm grant app.rork.kid_friendly_map_transit_navigator android.permission.ACCESS_BACKGROUND_LOCATION

To check permissions for the app:

    adb shell dumpsys package app.rork.kid_friendly_map_transit_navigator | grep -i permission -A 5

Notes:
- pm grant works for debuggable builds. For production builds, users must grant permissions through OS UI.

---

Inspecting logs

Android (adb):

    adb logcat | grep -i "Location acquired\|Location error\|expo-location|ReactNativeJS"

iOS (device or simulator):

- Use Xcode → Window → Devices and Simulators → select device → Open Console.
- For simulator, use Debug → Location to set a simulated location.

Simulating a location on Android Emulator:

    adb emu geo fix -74.006 40.7128

---

Background location notes

- Background location requires specific native manifest entries and a foreground service on Android. Expo Go does not provide this.
- Use a dev-client or a real build to test background location and foreground service behavior.

---

Troubleshooting

- If the app never requests permission, ensure expo-location is imported and Location.requestForegroundPermissionsAsync() is being called on a real device or dev-client.
- If location is null or stale, ensure device location/GPS is enabled and accuracy is set appropriately in the hook's locationOptions.
- If console logs from RN are not appearing, confirm Metro is connected and you have remote logging enabled in the dev menu.

---

Optional: add npm scripts for common adb steps or a CI step to build dev-client.
