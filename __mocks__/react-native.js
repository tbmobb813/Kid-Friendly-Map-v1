// Use actual react-native exports for Jest compatibility
const rn = require('react-native');
module.exports = {
  ...rn,
  StyleSheet: rn.StyleSheet,
  Platform: { ...rn.Platform, OS: 'android' },
};
