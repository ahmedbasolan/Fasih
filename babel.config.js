module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: [
      // reanimated MUST be the last plugin
      'react-native-reanimated/plugin',
    ],
  };
};
