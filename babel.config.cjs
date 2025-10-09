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
    ],
    plugins: ['react-native-reanimated/plugin'],
  };
};
<<<<<<< HEAD
module.exports = {
  presets: ['module:metro-react-native-babel-preset', '@babel/preset-typescript'],
};
=======
>>>>>>> feat/transit
