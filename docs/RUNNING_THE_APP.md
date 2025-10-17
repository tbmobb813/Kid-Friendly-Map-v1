# Running the Kid-Friendly Map App

## 🚀 Starting the App

### Development Server

```bash
# Start Expo development server (choose platform)
npm start

# Or start for specific platform
npm run start:web      # Web browser
npm run start:ios      # iOS Simulator (Mac only)
npm run start:android  # Android Emulator
```

### With Dev Client

```bash
npm run demo:routing   # Start with dev client
```

## ✅ Running Tests

### Integration Tests (React Native - Use Jest)

```bash
# All integration tests
npm run test:integration

# Specific test files
npm run test:routing    # Routing integration tests ✅
npm run test:offline    # Offline validation tests
npm run test:monitoring # Monitoring tests

# Watch mode
npm run test:integration:watch
```

### Logic Tests (Pure TypeScript - Use Jest)

```bash
# All logic tests (fast)
npm run test:logic

# Watch mode
npm run test:logic:watch
```

### Run All Tests

```bash
npm run test:all   # Both Jest and Bun tests
npm run test:full  # Same as test:all
```

## 🎯 Demo Scripts

### Run Demo Scripts (Node.js)

```bash
# Test integration features
npm run demo:integration

# Test offline monitoring
npm run demo:offline
```

## ⚠️ Common Issues & Solutions

### Issue: `Unknown file extension ".ts"` error

**Problem**: You're trying to run TypeScript files directly with Node.js

**Solutions**:

1. **For Expo app**: Use `npm start` NOT `npm expo start` ❌

1. **For tests**:
   - React Native tests: Use Jest → `npm run test:integration` ✅

   - Pure logic tests: Use Bun → `npm run test:logic` ✅

1. **For demo scripts**: They're already `.js` files → `npm run demo:integration` ✅

### Issue: Bun can't run routing tests

**Problem**: Bun doesn't support React Native's Flow type syntax

**Solution**: Use Jest for React Native tests:

```bash
npm run test:routing  # ✅ Works with Jest
```

## 📁 Test Directory Structure

```text
__tests__/          → React Native integration tests (use Jest)
  ├── routing-integration.test.ts  ✅ 19/19 passing
  ├── offline-validation.test.ts
  └── monitoring.test.ts

__tests__/          → Pure logic tests and integration tests (use Jest)
  ├── performance/
  └── utils/
```

## 🔧 Development Workflow

### 1. Make code changes

### 2. Run relevant tests

```bash
npm run test:routing  # If you changed routing code
npm run test:logic    # If you changed utility functions
```

### 3. Start the app

```bash
npm start
```

### 4. Press keys to interact

- `w` - Open in web browser

- `i` - Open in iOS simulator

- `a` - Open in Android emulator

- `r` - Reload app

- `m` - Toggle menu

## 📊 Test Results Summary

### ✅ Routing Integration Tests - ALL PASSING

- ORS Service: ✅ 6/6 tests

- OTP2 Service: ✅ 5/5 tests

- Unified Routing: ✅ 6/6 tests

- Caching/Performance: ✅ 2/2 tests

**Total: 19/19 tests passing** 🎉

## 🛠️ Troubleshooting

### Clear caches if things break

```bash
# Clear Expo cache
npx expo start --clear

# Clear npm cache
npm cache clean --force

# Clear watchman (if on Mac)
watchman watch-del-all

# Reinstall dependencies
rm -rf node_modules
npm install
```

### Check Node/npm versions

```bash
node --version   # Should be >= 18
npm --version    # Should be >= 9
```

## 📝 Quick Reference

| Command                    | Purpose               | Test Runner |
| -------------------------- | --------------------- | ----------- |
| `npm start`                | Start Expo dev server | -           |
| `npm run test:routing`     | Test routing features | Jest        |
| `npm run test:logic`       | Test pure logic       | Bun         |
| `npm run test:all`         | Run all tests         | Both        |
| `npm run demo:integration` | Demo script           | Node.js     |

---

**Remember**:

- Use **Jest** for React Native/Expo tests ✅

- Use **Bun** for pure TypeScript logic tests ✅

- Use **npm start** (not `npm expo start`) ✅
