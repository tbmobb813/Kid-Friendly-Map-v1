const store = new Map();

export default {
  setItem: jest.fn(async (key, value) => {
    store.set(key, value);
  }),
  getItem: jest.fn(async (key) => {
    return store.has(key) ? store.get(key) : null;
  }),
  removeItem: jest.fn(async (key) => {
    store.delete(key);
  }),
  clear: jest.fn(async () => {
    store.clear();
  }),
  getAllKeys: jest.fn(async () => Array.from(store.keys())),
  multiSet: jest.fn(async (entries = []) => {
    entries.forEach(([key, value]) => store.set(key, value));
  }),
  multiGet: jest.fn(async (keys = []) => keys.map((key) => [key, store.get(key) ?? null])),
  multiRemove: jest.fn(async (keys = []) => {
    keys.forEach((key) => store.delete(key));
  }),
};
