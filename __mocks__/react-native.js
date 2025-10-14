// Comprehensive mock of react-native for Jest in Node.
// Provides host components as string-based elements so react-native-testing-library
// can detect them as host components and includes minimal Animated implementation.
const React = require('react');

const Platform = {
  OS: 'linux',
  Version: '1.0.0',
  select: (obj) => (obj.linux ?? obj.default ?? obj),
};

// Export host component tags as strings so the test renderer treats them as host nodes
// Use React Native-like host tags so testing utilities can query by component names
const View = 'View';
const Text = 'Text';
const Pressable = 'Pressable';
const TextInput = 'TextInput';
const Image = 'Image';
const Switch = 'Switch';
const ScrollView = 'ScrollView';
const Modal = 'Modal';

const StyleSheet = {
  create: (styles) => styles,
  flatten: (style) => (Array.isArray(style) ? Object.assign({}, ...style) : style),
};

const Dimensions = {
  get: () => ({ width: 1024, height: 768 }),
};

const NativeModules = {};

const Animated = {
  View: 'View',
  createAnimatedComponent: (c) => c,
  // Minimal Value implementation
  Value: function (initialValue) {
    this._value = typeof initialValue === 'number' ? initialValue : 0;
    this._listeners = {};
    this.setValue = (v) => {
      this._value = v;
      Object.values(this._listeners).forEach((cb) => cb({ value: this._value }));
    };
    this.addListener = (cb) => {
      const id = `L${Math.random().toString(36).slice(2)}`;
      this._listeners[id] = cb;
      return id;
    };
    this.removeListener = (id) => {
      delete this._listeners[id];
    };
    this.removeAllListeners = () => {
      this._listeners = {};
    };
    this.interpolate = (config) => ({ __isInterpolated: true, config });
    this.__getValue = () => this._value;
  },
  timing: (value, config) => ({
    start: (cb) => {
      // apply end value synchronously to keep tests deterministic
      try {
        if (value && typeof value.setValue === 'function') {
          value.setValue(config.toValue);
        }
        if (cb) cb();
      } catch (e) {
        if (cb) cb(e);
      }
    },
  }),
};

const Easing = {
  quad: (t) => t * t,
  out: (fn) => fn,
};

function findNodeHandle() {
  return null;
}

module.exports = {
  Platform,
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  NativeModules,
  Animated,
  TextInput,
  Image,
  Switch,
  ScrollView,
  Modal,
  Easing,
  findNodeHandle,
};
