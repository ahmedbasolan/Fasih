const expoConfig = require('eslint-config-expo/flat');
const reactNativePlugin = require('eslint-plugin-react-native');

module.exports = [
  ...expoConfig,
  {
    // .worktrees/ holds full checkouts for isolated feature work (gitignored).
    // Each has its own eslint.config.js and is linted in its own context —
    // linting them from here just re-reports stale copies of every file.
    ignores: [
      'node_modules/**',
      '.expo/**',
      'dist/**',
      'coverage/**',
      '.worktrees/**',
      'babel.config.js',
      // Vendored skill bundles. They ship their own dependencies (ajv et al)
      // that this project does not install, so import/no-unresolved fires on
      // every one — 4 errors for code that is never bundled into the app.
      '.agents/**',
      '.claude/**',
    ],
  },
  {
    // Build/tooling scripts are Node CommonJS, not app code. Without this they
    // are linted with the app's browser globals and every __dirname is a
    // no-undef error, which kept `npm run lint` permanently red and trained
    // everyone to ignore it.
    files: ['scripts/**/*.js', 'generate-icons.js', '*.config.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'writable',
        require: 'readonly',
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
      },
    },
  },
  {
    // The lucide-react-native/icons/<name> subpath is resolved at bundle time by
    // a resolver shim in metro.config.js (lucide's `exports` map doesn't expose
    // it), so eslint-plugin-import cannot statically resolve it. Types come from
    // src/types/lucide-icons.d.ts.
    files: ['src/components/icons.ts'],
    rules: {
      'import/no-unresolved': ['error', { ignore: ['^lucide-react-native/icons/'] }],
    },
  },
  {
    // React Compiler readiness rules (shipped as errors by eslint-config-expo 56).
    // This project does not use React Compiler (no babel plugin), and these rules
    // fire on correct, idiomatic code — notably Reanimated `sharedValue.value = …`
    // assignments. Kept as warnings so they stay visible for an incremental
    // cleanup without failing lint on working code.
    //
    // react-hooks/purity is deliberately NOT in this list: it catches impure
    // render logic (Math.random()/Date.now() during render), which is a real bug
    // class here — it produced the WaveBars jitter and the ScenariosScreen
    // double-render. It stays an error.
    files: ['**/*.{ts,tsx}'],
    rules: {
      'react-hooks/immutability': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/static-components': 'warn',
    },
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
