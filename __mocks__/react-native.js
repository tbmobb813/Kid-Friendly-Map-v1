// Use actual react-native exports for Jest compatibility
const rn = require('react-native');
module.exports = {
  ...rn,
  StyleSheet: rn.StyleSheet,
  Platform: { ...rn.Platform, OS: 'android' },
};

// Ensure we export the merged React Native object (previous line mistakenly tried to
// export an undefined `components` variable).
// Export the prepared mock object created above.
// (This keeps real react-native exports and overrides Platform for tests.)
// eslint-disable-next-line no-undef
module.exports = {
  ...rn,
  StyleSheet: rn.StyleSheet,
  Platform: { ...rn.Platform, OS: 'android' },
};
