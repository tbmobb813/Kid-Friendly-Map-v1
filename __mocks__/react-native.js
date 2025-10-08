// Simple mock of react-native for tests
const React = require('react');

// Create native host components that RNTL can detect
const createHostComponent = (name) => {
  const Component = ({ children, testID, ...props }) => {
    return React.createElement(name, { testID: testID || `rn-${name}`, ...props }, children);
  };
  Component.displayName = name;
  return Component;
};

// Export components as both named exports and on the default export
const components = {
  View: createHostComponent('View'),
  Text: createHostComponent('Text'),
  ScrollView: createHostComponent('ScrollView'),
  TouchableOpacity: createHostComponent('TouchableOpacity'),
  TextInput: createHostComponent('TextInput'),
  Image: createHostComponent('Image'),
  
  StyleSheet: {
    create: (styles) => styles,
    flatten: (style) => style,
  },
  Platform: {
    OS: 'test',
    select: (obj) => obj.test || obj.default || obj.android || obj.ios || {},
  },
  Dimensions: {
    get: () => ({ width: 375, height: 812 }),
  },
  Animated: {
    Value: class {
      constructor() {}
      interpolate() { return this; }
      setValue() {}
    },
    View: createHostComponent('AnimatedView'),
    Text: createHostComponent('AnimatedText'),
  },
};

// Export all components
module.exports = components;