module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          unstable_transformImportMeta: true,
        },
      ],
      'module:metro-react-native-babel-preset',
      '@babel/preset-typescript',
    ],
    plugins: ['react-native-reanimated/plugin'],
  };
};
