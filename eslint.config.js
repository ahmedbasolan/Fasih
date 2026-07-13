const expoConfig = require('eslint-config-expo/flat');
const reactNativePlugin = require('eslint-plugin-react-native');

module.exports = [
  ...expoConfig,
  {
    ignores: ['node_modules/**', '.expo/**', 'dist/**', 'babel.config.js'],
  },
  {
    files: ['app/**/*.tsx', 'src/screens/**/*.tsx', 'src/components/**/*.tsx'],
    plugins: {
      'react-native': reactNativePlugin,
    },
    rules: {
      // Warn (not error) on raw hex/rgb color literals so hardcoded colors don't
      // regress without blocking the build — SVG illustration colors elsewhere
      // (e.g. OnboardingFlow.tsx gradients) still need case-by-case triage.
      'react-native/no-color-literals': 'warn',
    },
  },
];
