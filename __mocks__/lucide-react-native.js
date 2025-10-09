// __mocks__/lucide-react-native.js
module.exports = new Proxy(
  {},
  {
    get: (target, prop) => () => null,
  },
);
