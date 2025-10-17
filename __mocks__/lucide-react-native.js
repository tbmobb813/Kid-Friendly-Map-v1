// __mocks__/lucide-react-native.js
// Provide named component mocks for lucide-react-native so Jest's ESM/CJS interop
// and named imports work correctly in tests.
const nullComponent = () => null;

const icons = {
  Clock: nullComponent,
  MapPin: nullComponent,
  AlertCircle: nullComponent,
  Bell: nullComponent,
  Train: nullComponent,
  Bus: nullComponent,
  Navigation: nullComponent,
  Bike: nullComponent,
  Car: nullComponent,
  RefreshCw: nullComponent,
  // fallback that returns a null component for any other icon
};

// attach any additional property access to the fallback
module.exports = new Proxy(icons, {
  get(target, prop) {
    if (prop in target) return target[prop];
    return nullComponent;
  },
});

// also provide a default export for consumers using default import
module.exports.default = module.exports;
