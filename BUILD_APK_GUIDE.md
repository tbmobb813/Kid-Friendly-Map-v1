# Building APK for Sideloading - Complete Guide

## Summary

Building an APK from your Expo project requires either:

1. **A connected Android device/emulator** (for `npx expo run:android`)
2. **EAS Build** (cloud or local) with proper authentication
3. **Manual Gradle build** (complex, has autolinking issues)

---

## Current Issue

- ❌ No Android device connected (USB not working)
- ❌ Emulator won't start (disk space: need 7.4GB, have 6.4GB)
- ❌ EAS login failed (wrong credentials or account issue)
- ❌ Direct Gradle build failing due to React Native autolinking

---

## RECOMMENDED SOLUTIONS

### Option 1: Fix USB Connection (BEST - 5 minutes)

**This is the fastest path to a working APK!**

1. **On your Android phone:**
   - Plug in USB cable
   - Pull down notification shade
   - Tap USB notification
   - Change to **"File Transfer"** or **"MTP"** mode

2. **Enable USB Debugging:**

   ```
   Settings → About phone → Tap "Build number" 7 times
   Settings → Developer options → Enable "USB debugging"
   ```

3. **Check connection:**

   ```bash
   adb devices
   # Should show your device
   ```

4. **Build APK:**

   ```bash
   cd /home/jason/Projects/Kid-Friendly-Map-v1
   npx expo run:android --variant release
   ```

5. **Find your APK:**
   ```bash
   find android/app/build/outputs/apk -name "*.apk"
   ```

The APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

---

### Option 2: Use Expo Go to Test (IMMEDIATE)

While fixing the USB/APK build issue, test your app NOW:

1. **Install "Expo Go"** from Play Store
2. **Connect phone and computer to same WiFi**
3. **Start Metro:**
   ```bash
   npx expo start
   ```
4. **Press `s`** to switch to Expo Go mode
5. **Scan QR code** with Expo Go app

**Limitations:**

- ❌ MapLibre won't work (needs native modules)
- ❌ MMKV won't work (needs native modules)
- ✅ CAN test navigation (the main fix!)
- ✅ CAN test UI/UX flow
- ✅ CAN verify @react-navigation/native@7.1.8 fix works

---

### Option 3: Free More Disk Space for Emulator

You need ~1-2GB more space.

**Quick cleanup:**

```bash
# Clean more caches
npm cache clean --force
rm -rf ~/.npm ~/.cache

# Clean Android SDK caches
rm -rf ~/.android/build-cache
rm -rf ~/.gradle/caches

# Remove old kernels (be careful!)
sudo apt autoremove --purge

# Check space
df -h /
```

**If you get to 8GB+ free:**

```bash
# Create smaller emulator
avdmanager create avd -n Dev_Small -k "system-images;android-36;google_apis_playstore;x86_64" -d pixel_5

# Edit config to use less disk
echo "disk.dataPartition.size=2048M" >> ~/.android/avd/Dev_Small.avd/config.ini

# Start emulator
emulator -avd Dev_Small &

# Wait 30-60 seconds
adb devices

# Build
npx expo run:android --variant release
```

---

### Option 4: Fix EAS Login and Build on Cloud

**Reset your Expo password:**

1. Go to https://expo.dev/
2. Click "Forgot password"
3. Reset using jsn.nix@gmail.com

**Then build in cloud:**

```bash
eas login
eas build --platform android --profile preview
```

**Advantages:**

- ✅ No local disk space needed
- ✅ Professional build setup
- ✅ Downloads ready APK

**Disadvantages:**

- ⏱️ Takes 10-15 minutes
- 🌐 Requires internet
- 💰 Free tier has build limits

---

### Option 5: Use GitHub Codespaces / Cloud Dev Environment

If local builds keep failing, build in the cloud:

1. **Push your code to GitHub**
2. **Open in Codespaces**
3. **Build there** (unlimited disk space!)
4. **Download APK**

---

## What I Recommend RIGHT NOW

**Do these in parallel:**

**TRACK A (Testing - 2 minutes):**

1. Install Expo Go on your phone
2. Run `npx expo start`
3. Scan QR code
4. Test that navigation works!
5. At least confirm the @react-navigation fix solved the main issue

**TRACK B (Building - 5 minutes):**

1. Try USB connection one more time
   - Change phone to "File Transfer" mode
   - Enable USB debugging
   - Run `adb devices`
2. If device appears → Run `npx expo run:android --variant release`
3. Done! APK is at `android/app/build/outputs/apk/release/app-release.apk`

**If USB still fails:**

- Consider Option 3 (free more space) or Option 4 (EAS cloud build)

---

## Alternative: Use Wireless ADB (If USB is Broken)

If your USB port or cable is truly broken:

1. **Connect phone and laptop to same WiFi**
2. **On phone:**
   ```
   Settings → Developer options → Wireless debugging → ON
   Tap "Pair device with pairing code"
   ```
3. **On laptop:**

   ```bash
   adb pair <IP>:<PORT>
   # Enter pairing code

   adb connect <IP>:<PORT>
   adb devices
   ```

4. **Then build:**
   ```bash
   npx expo run:android --variant release
   ```

---

## Summary of Build Methods

| Method       | Time   | Requirements            | Success Rate         |
|--------------|--------|-------------------------|----------------------|
| USB Device   | 5 min  | Working USB + Debugging | ⭐⭐⭐⭐⭐                |
| Wireless ADB | 10 min | Same WiFi + Android 11+ | ⭐⭐⭐⭐                 |
| Emulator     | 15 min | 8GB+ free disk space    | ⭐⭐⭐                  |
| EAS Cloud    | 15 min | Valid Expo account      | ⭐⭐⭐⭐                 |
| Expo Go      | 2 min  | WiFi only               | ⭐⭐⭐⭐⭐ (testing only) |

---

## Current Status

✅ **Navigation error FIXED** (@react-navigation/native@7.1.8)  
✅ **Project prebuild complete** (android/ directory exists)  
⚠️ **Disk space low** (6.4GB free, need 7.4GB+ for emulator)  
❌ **No device connected** (USB mode issue)  
❌ **EAS login failed** (credentials issue)

---

## Next Steps

1. **Try USB fix** (5 minutes max)
2. **If that fails, use Expo Go** to at least test the navigation fix works
3. **Then decide:** Free disk space for emulator OR fix EAS login for cloud build

Let me know which path you want to take! 🚀
