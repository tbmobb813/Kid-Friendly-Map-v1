# Quick Start Guide

## 🚀 Start the App

```bash
npm start              # Start dev server (recommended)
npm start -- --web     # Start and open in browser
npm start -- --android # Start and open in Android
npm start -- --ios     # Start and open in iOS
```

## ✅ Run Tests

```bash
# Routing tests (all passing! 19/19)
npm run test:routing

# All integration tests
npm run test:integration

# All logic tests (fast with Bun)
npm run test:logic

# Everything
npm run test:all
```

## ❌ Common Mistakes

**DON'T DO THIS:**

```bash
npm expo start        # ❌ Wrong! This causes TypeScript errors
bun test __tests__/   # ❌ Wrong! Bun can't handle React Native
```

**DO THIS INSTEAD:**

```bash
npm start             # ✅ Correct way to start Expo
npm run test:routing  # ✅ Use Jest for React Native tests
```

## 📝 Remember

- **Starting app**: `npm start` ✅

- **React Native tests**: Use Jest (npm run test:integration) ✅

- **Pure logic tests**: Use Bun (npm run test:logic) ✅

- **Demo scripts**: `npm run demo:integration` ✅

---

See `RUNNING_THE_APP.md` for detailed documentation.
