# Android Device Connection Troubleshooting

**Current Status:** Device not recognized by ADB  
**Goal:** Connect device for `npx expo run:android` build

---

## Quick Fix Steps (Try These First!)

### 1. Enable USB Debugging on Your Phone

**On your Android device:**
1. Go to **Settings** → **About phone**
2. Tap **Build number** 7 times (you'll see "You are now a developer!")
3. Go back to **Settings** → **System** → **Developer options**
4. Enable **USB debugging**
5. **Important:** Also enable **USB debugging (Security settings)** if available

### 2. Restart ADB Server

```bash
adb kill-server
adb start-server
adb devices
```

### 3. Check USB Connection

- **Unplug and replug** your USB cable
- Try a **different USB cable** (some cables are charge-only!)
- Try a **different USB port** on your computer
- **Unlock your phone** - keep screen awake

### 4. Authorize Your Computer

When you plug in your device with USB debugging enabled, you should see a popup on your phone:

**"Allow USB debugging?"**
- ✅ Check "Always allow from this computer"
- Tap **OK**

If you don't see this popup:
```bash
adb kill-server
adb start-server
# Then unplug and replug your device
```

---

## Verification Steps

### Step 1: Check ADB sees your device
```bash
adb devices
```

**Expected output:**
```
List of devices attached
ABC123456789    device
```

**If you see "unauthorized":**
- Check your phone for the authorization popup
- Tap "Always allow" and OK

**If you see "no permissions":**
```bash
sudo adb kill-server
sudo adb start-server
adb devices
```

### Step 2: Once device shows as "device", try building
```bash
npx expo run:android
```

---

## Alternative: Use Android Emulator (If Device Won't Connect)

### Option A: Quick Emulator Setup via Android Studio

1. **Install Android Studio** (if not installed):
   ```bash
   # Download from: https://developer.android.com/studio
   ```

2. **Create an emulator:**
   - Open Android Studio
   - Go to **Tools** → **Device Manager**
   - Click **Create Device**
   - Select a device (e.g., Pixel 5)
   - Download a system image (API 33 recommended)
   - Click **Finish**

3. **Start emulator:**
   ```bash
   # List available emulators
   emulator -list-avds
   
   # Start an emulator
   emulator -avd Pixel_5_API_33 &
   ```

### Option B: Use Expo Dev Client (Easiest for Testing)

Since you're on the dev server already, you can use the Expo Go app temporarily:

1. **Install Expo Go** on your Android phone from Play Store
2. **Make sure phone and computer are on same WiFi**
3. **Scan the QR code** shown in your terminal

**Note:** Expo Go won't support native modules (MapLibre, MMKV), but you can test navigation!

---

## Building for Production (Later)

Once device is connected, you can build:

### Development Build (for testing native modules)
```bash
npx expo run:android
```

This creates a dev build with native modules that you can test immediately.

### Production Build via EAS (requires setup)
```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS
eas build:configure

# Build development profile
eas build --profile development --platform android
```

---

## Common Issues & Solutions

### Issue: "adb: command not found"
**Solution:** Add ADB to PATH
```bash
echo 'export PATH=$PATH:$HOME/Android/Sdk/platform-tools' >> ~/.bashrc
source ~/.bashrc
```

### Issue: Device shows as "unauthorized"
**Solution:** 
1. Revoke USB debugging authorizations on phone:
   - Settings → Developer options → Revoke USB debugging authorizations
2. Unplug device
3. Replug device
4. Authorize popup should appear

### Issue: "No Android connected device found"
**Solution:**
1. Check `adb devices` shows device as "device" (not "unauthorized")
2. Ensure USB debugging is enabled
3. Try different USB cable/port
4. Restart ADB server: `adb kill-server && adb start-server`

### Issue: Device connected but build fails
**Solution:**
```bash
# Clear caches
rm -rf android/.gradle
rm -rf android/app/build

# Rebuild
npx expo run:android
```

---

## Why Native Build is Important

Building with `npx expo run:android` will:
- ✅ **Fix the navigation context error** (native React Navigation setup)
- ✅ **Enable MapLibre** (native mapping library)
- ✅ **Enable MMKV** (native storage with TurboModules)
- ✅ **Test in production-like environment**

---

## Current Dev Server Status

Your Metro bundler is running on port 8082. Once you get your device connected or emulator running, the build will automatically connect to it!

```
Server: http://192.168.1.19:8082
```

---

## Next Steps

1. **Try the Quick Fix Steps above** (USB debugging, ADB restart, cable check)
2. **Run `adb devices`** - you should see your device listed
3. **Run `npx expo run:android`** - this will build and install the app
4. **Test navigation** - the "prevent remove context" error should be gone!

If device connection continues to fail after trying everything:
- Use Android Emulator (Option A above)
- Or test with Expo Go temporarily (won't solve native issues but tests navigation)
- Or let me know and we can explore other options!

---

## Debug Commands

```bash
# Check ADB version
adb --version

# Check if device is connected via USB
lsusb

# Check ADB server status
adb devices -l

# Kill and restart ADB (fixes most issues)
adb kill-server
adb start-server

# Check Android SDK location
echo $ANDROID_HOME
echo $ANDROID_SDK_ROOT

# Test ADB connection
adb shell echo "Connection successful!"
```

**Status:** ⚠️ Waiting for device connection

Run through the steps above and let me know what you see when you run `adb devices` after each step!
