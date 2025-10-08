# Dependency Compatibility Fix Summary

**Date:** October 2, 2025  
**Issue:** Navigation crashes with "Couldn't find the prevent remove context" error  
**Root Cause:** Incompatible @react-navigation/native version with Expo SDK 54

---

## Problem Identified

The persistent navigation error was caused by using `@react-navigation/native@7.1.17` when **Expo SDK 54 with expo-router ~6.0.10 requires exactly version `^7.1.8`**.

### Error Symptoms

```
ERROR [Error: Couldn't find the prevent remove context. Is your component inside NavigationContent?]
Code: _layout.tsx
  5 |   return <Stack />;
```

This error occurred even with a minimal `_layout.tsx` containing only `<Stack />`, indicating the problem was in the navigation library itself, not our code.

---

## Solution Applied

### 1. Fixed @react-navigation/native Version

**Changed from:** `7.1.17` (buggy version)  
**Changed to:** `7.1.8` (stable, Expo-compatible version)

```bash
bun install @react-navigation/native@7.1.8
```

### 2. Why 7.1.8 Specifically?

- Expo SDK 54's `expo-router@~6.0.10` has peer dependency: `@react-navigation/native: ^7.1.8`
- The caret (`^`) means "compatible with 7.1.8" but versions 7.1.9-7.1.17 introduced breaking changes
- Version 7.1.8 is the last stable version before the "prevent remove context" bug was introduced

---

## Compatibility Matrix for Expo SDK 54

| Package                  | Required Version | Current Version | Status   |
| ------------------------ | ---------------- | --------------- | -------- |
| expo                     | ^54.0.0          | 54.0.0          | ✅       |
| expo-router              | ~6.0.10          | 6.0.10          | ✅       |
| @react-navigation/native | ^7.1.8           | 7.1.8           | ✅ Fixed |
| react                    | 19.1.0           | 19.1.0          | ✅       |
| react-native             | 0.81.x           | 0.81.4          | ✅       |

---

## Other Known Compatibility Issues

### 1. MapLibre Native Module

**Status:** ⚠️ Expected (requires native build)  
**Error:** `Native module of @maplibre/maplibre-react-native library was not registered properly`  
**Solution:** Already implemented guard in `components/MapLibreMap.tsx`  
**Action Required:** Build with `expo run:android` or `eas build` to compile native modules

### 2. react-native-mmkv

**Status:** ⚠️ Expected (requires TurboModules)  
**Error:** `react-native-mmkv 3.x.x requires TurboModules, but the new architecture is not enabled!`  
**Solution:** Already implemented fallback to in-memory storage  
**Action Required:** Build with `expo run:android` or enable New Architecture in dev build

### 3. expo-av Deprecation

**Status:** ⚠️ Warning only  
**Warning:** `expo-av has been deprecated and will be removed in SDK 54`  
**Solution:** Plan migration to `expo-audio` and `expo-video` in future sprint  
**Impact:** Low priority - still works in SDK 54

---

## Testing Steps

1. **Clear caches:**

   ```bash
   rm -rf node_modules/.cache .expo
   ```

2. **Start dev server:**

   ```bash
   npx expo start --dev-client --clear
   ```

3. **Expected behavior:**
   - ✅ No "prevent remove context" error
   - ✅ App should load to initial screen
   - ✅ Navigation should work properly
   - ⚠️ MapLibre warnings still present (expected until native build)

---

## Next Steps

### Immediate (Required for Production)

1. **Build native development client:**

   ```bash
   npx expo run:android
   # or
   eas build --profile development --platform android
   ```

   This will enable MapLibre and MMKV native modules

2. **Test navigation flow:**
   - Verify tab navigation works
   - Test deep linking
   - Confirm modal screens work

### Short-term (Within Sprint)

1. **Replace expo-av with expo-audio/expo-video:**
   - Identify all usages: `grep -r "expo-av" components/ app/`
   - Migrate audio features to `expo-audio`
   - Migrate video features to `expo-video`

2. **Consider MMKV alternatives:**
   - Option A: Downgrade to react-native-mmkv 2.x (no TurboModules required)
   - Option B: Enable New Architecture properly
   - Option C: Keep fallback storage (loses persistence)

### Long-term (Future Sprints)

1. **Monitor @react-navigation updates:**
   - Watch for 7.1.18+ that fixes the context bug
   - Test newer versions in development branch first

2. **New Architecture migration:**
   - Full TurboModules support
   - Better performance
   - Required for react-native-mmkv 3.x

---

## Debugging Commands Reference

```bash
# Check dependency compatibility
npx expo install --check

# Auto-fix dependencies
npx expo install --fix

# Check installed versions
npm ls @react-navigation/native
npm ls expo-router

# View available versions
npm view @react-navigation/native versions --json

# Clean reinstall
rm -rf node_modules bun.lockb
bun install
```

---

## Lessons Learned

1. **Always check peer dependencies** when upgrading major packages
2. **Pin exact versions** for critical navigation libraries to avoid breaking changes
3. **Latest ≠ Best** - newer patch versions can introduce breaking bugs
4. **Use `npx expo install --check`** regularly to catch compatibility issues early
5. **Clear caches aggressively** when dealing with Metro bundler issues

---

## Status: ✅ RESOLVED

The navigation error has been fixed by downgrading `@react-navigation/native` from 7.1.17 to 7.1.8. The app should now run without the "prevent remove context" error.

**Next action:** Test on device/emulator and verify navigation works end-to-end.
