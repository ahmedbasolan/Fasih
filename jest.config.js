module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  // The desktop app keeps full repo checkouts under .claude/worktrees/ for its
  // own sessions. testMatch walks into them, so a plain `npx jest` was running
  // 91 suites when this tree has 28 — the other 63 were stale copies of old
  // branches. That is not just slow: a run could fail on code no longer in the
  // tree, or pass a suite this branch deleted.
  testPathIgnorePatterns: ['/node_modules/', '/.claude/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  transformIgnorePatterns: [
    '/node_modules/(?!(.pnpm|react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base|moti|@motify|@shopify/flash-list|react-native-purchases))',
    '/node_modules/react-native-reanimated/plugin/',
  ],
};
