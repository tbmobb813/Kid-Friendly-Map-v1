const React = require('react');

// Minimal mock of react-native for Jest in a Node environment
const Platform = {
  OS: 'linux',
  Version: '1.0.0'
};

const View = ({ children, ...props }) => React.createElement('div', props, children);
const Text = ({ children, ...props }) => React.createElement('span', props, children);
const Pressable = ({ children, onPress, ...props }) => React.createElement('button', { onClick: onPress, ...props }, children);

module.exports = {
  Platform,
  View,
  Text,
  Pressable,
  // Provide defaults for other RN exports that may be referenced
  StyleSheet: {
    create: (styles) => styles,
    flatten: (style) => style
  }
};
