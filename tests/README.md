Canonical test utilities

This project provides a single canonical test helper located at `tests/test-utils.js` to avoid fragile relative imports from `__tests__` folders and to ensure hoisted jest mocks are available.

Guidance

- Import the helper from `tests/test-utils` in your tests (relative from `__tests__` files this is typically `../tests/test-utils`).
- The helper re-exports the legacy simple render helpers (simpleRender, getByTestId, queryByTestId, fireEvent, act) and exposes hoisted helpers defined in `__tests__/test-utils.tsx` (e.g., NetInfo mocks, TestMapHost, mock location helpers).
- The `jest.setup.js` file ensures `__tests__/test-utils.tsx` is required early so all `jest.mock` calls are hoisted.

Why this exists

Having a canonical helper avoids TypeScript/module-resolution issues when tests live inside `__tests__` folders and import `./test-utils`. It also centralizes fast helpers and prevents duplicate or out-of-order jest mock hoisting.

If you're migrating older tests, replace occurrences of `./test-utils` imports with `../tests/test-utils` (or adjust path depending on test file location).