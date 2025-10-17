# ⚠️ URGENT: Your Android Device is NOT Detected by USB

## Current Status

Your phone is **NOT showing up in `lsusb`**, which means Linux doesn't even see it as a USB device.

---

## IMMEDIATE ACTIONS (Do These Now!)

### 1. ✅ Check Your Phone's USB Settings

**When you plug in your phone, pull down the notification shade:**

You'll see something like:

- "USB charging this device"
- "Charging only"
- "USB for charging"

**Tap on that notification and change it to:**

- **"File Transfer"** (or "MTP" - Media Transfer Protocol)
- OR **"USB tethering"**
- NOT "Charging only"!

**This is the #1 most common issue!**

### 2. 🔌 Physical Connection Checklist

- [ ] **Unlock your phone** (keep screen on)
- [ ] **Try a different USB cable** (many cables are charge-only!)
- [ ] **Try a different USB port** on your laptop
- [ ] **Wiggle/reseat the cable** in both phone and laptop
- [ ] **Clean USB ports** (lint/dust can block data connections)

### 3. 📱 Enable USB Debugging (Critical!)

1. On your Android phone:
   - Go to **Settings** → **About phone**
   - Tap **Build number** 7 times rapidly
   - You'll see "You are now a developer!"

2. Go back and find **Developer options**:
   - Usually in: Settings → System → Developer options
   - OR: Settings → Developer options

3. Enable these settings:
   - ✅ **USB debugging** (REQUIRED)
   - ✅ **Stay awake** (helpful)
   - ✅ **USB debugging (Security settings)** (if available)

---

## After Each Change, Run This Command:

```bash
# This will show if Linux sees your device
lsusb

# Then check ADB
adb devices
```

---

## Expected Results After Fix

### Step 1: `lsusb` should show your device

Before (what you have now):

```
Bus 001 Device 005: ID 0bda:b023 Realtek Semiconductor Corp.
Bus 001 Device 004: ID 05e3:0610 Genesys Logic, Inc. Hub
```

After (what you should see):

```
Bus 001 Device 006: ID 04e8:6860 Samsung Electronics Co., Ltd Galaxy (MTP)
                    ^^^^^^ This is a new device! (ID will vary)
```

### Step 2: `adb devices` should show your device

Before (what you have now):

```
List of devices attached
[empty]
```

After (what you should see):

```
List of devices attached
R58M4XXXXXX    unauthorized    ← First time, needs authorization
```

Then after tapping "Allow" on your phone:

```
List of devices attached
R58M4XXXXXX    device    ← Ready to use!
```

---

## Can't Get It Working? Use Emulator Instead!

If after trying everything your device won't connect, let's use an Android emulator:

### Quick Emulator Start

1. **Check if you have emulators installed:**

   ```bash
   emulator -list-avds
   ```

2. **If you have an emulator, start it:**

   ```bash
   # List available
   emulator -list-avds

   # Start one (replace with actual name)
   emulator -avd Pixel_5_API_33 &
   ```

3. **Check emulator shows up:**

   ```bash
   adb devices
   # Should show: emulator-5554    device
   ```

4. **Build to emulator:**
   ```bash
   npx expo run:android
   ```

### Don't Have an Emulator? Create One:

```bash
# Option 1: Via Android Studio GUI (easiest)
# 1. Open Android Studio
# 2. Tools → Device Manager → Create Device
# 3. Select Pixel 5 → Next
# 4. Download API 33 system image → Next
# 5. Finish → Click Play button

# Option 2: Via command line
sdkmanager "system-images;android-33;google_apis;x86_64"
avdmanager create avd -n Pixel_5_API_33 -k "system-images;android-33;google_apis;x86_64"
emulator -avd Pixel_5_API_33 &
```

---

## Alternative: Use Wireless Debugging (Android 11+)

If USB just won't work, you can use WiFi!

1. **Enable Wireless Debugging on phone:**
   - Settings → Developer options → Wireless debugging → ON
   - Tap "Pair device with pairing code"
   - Note the IP address, port, and pairing code

2. **On your computer:**

   ```bash
   adb pair <IP>:<PORT>
   # Enter the pairing code when prompted

   # Then connect
   adb connect <IP>:<PORT>

   # Verify
   adb devices
   ```

---

## Testing Without Physical Device (Temporary Solution)

You can test navigation with Expo Go to confirm the fix works:

1. **Install Expo Go** from Play Store on your phone
2. **Ensure phone and laptop are on same WiFi** (192.168.1.x)
3. **Scan QR code** from the terminal (port 8082)
4. **Test navigation** (MapLibre won't work, but navigation will!)

This won't solve the native module issues, but will confirm the navigation context error is fixed.

---

## Summary of Your Issue

**Problem:** USB cable/mode is not allowing data transfer  
**Evidence:** Phone not visible in `lsusb` output  
**Most Likely Cause:** Phone set to "Charging only" mode OR bad USB cable

**Next Steps:**

1. Change USB mode on phone to "File Transfer"
2. Try different USB cable
3. Enable USB debugging in Developer options
4. Run `lsusb` to verify device appears
5. Run `adb devices` to verify ADB connection

---

## Quick Reference

```bash
# Check USB hardware detection
lsusb | grep -E "Samsung|Google|Motorola|Xiaomi|OnePlus|Huawei|LG"

# Restart ADB
adb kill-server && adb start-server

# Check ADB connection
adb devices -l

# If device shows as "unauthorized"
# → Check your phone for "Allow USB debugging?" popup
# → Tap "Always allow from this computer" and OK

# Once connected, build!
npx expo run:android
```

---

**Current Status:** 🔴 Device not detected at hardware level  
**Action Required:** Check USB mode and cable, enable USB debugging  
**Goal:** See your device in `lsusb` output, then in `adb devices`

Let me know what you see after trying these steps! 📱
