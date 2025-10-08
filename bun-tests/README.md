# Bun Tests Configuration

## Test Structure

```text
bun-tests/
├── utils/           # Pure utility function tests
│   ├── validation.test.ts
│   └── core-validation.test.ts
├── performance/     # Performance-critical operations
│   └── bulk-operations.test.ts
└── README.md
```

## Running Tests

### Development (Fast Feedback)

```bash
# Run all Bun tests (lightning fast)
npm run test:fast

# Watch mode for active development
npm run test:logic:watch

# Specific test directory
bun test bun-tests/utils/
bun test bun-tests/performance/
```

### Integration Testing

```bash
# Run React Native integration tests
npm run test:integration

# Watch mode for integration tests
npm run test:integration:watch
```

### Complete Testing

```bash
# Run both fast logic tests and full integration tests
npm run test:all

# Alternative command
npm run test:full
```

## What Goes Where?

### ✅ Bun Tests (bun-tests/) - Ultra Fast

- Pure JavaScript/TypeScript functions
- Mathematical calculations
- Data processing algorithms
- String manipulation
- Array operations
- JSON parsing/serialization
- Business logic validation
- Performance-critical operations

**Benefits:**

- ⚡ 60x faster execution
- 🔄 Instant feedback in watch mode
- 🎯 Perfect for TDD/rapid iteration

### ✅ Jest Tests (**tests**/) - Comprehensive  

- React Native components
- AsyncStorage integration
- Platform-specific code
- Mocked APIs and services
- Navigation testing
- Camera/Location permissions
- Complex integration scenarios

**Benefits:**

- 🛡️ Full ecosystem compatibility
- 🔧 Rich mocking capabilities
- 📱 React Native specific features

## Best Practices

1. **Start with Bun tests** for new utility functions
2. **Use Jest tests** for anything requiring React Native mocks
3. **Run `npm run test:fast`** during active development
4. **Run `npm run test:all`** before committing
5. **Use watch mode** for continuous testing during development

## Performance Expectations

| Test Suite | Execution Time | Use Case |
|------------|----------------|----------|
| Bun Logic Tests | ~0.3s | Development iteration |
| Jest Integration | ~15s | Pre-commit validation |
| Combined | ~15.3s | CI/CD pipeline |

## Commands Quick Reference

```bash
# Fast development cycle
npm run test:fast           # Bun tests only
npm run test:logic:watch    # Bun tests in watch mode

# Full testing
npm run test:integration    # Jest tests only  
npm run test:all           # Everything
npm run test:full          # Same as test:all

# Legacy (still works)
npm test                   # Original Jest command
```
