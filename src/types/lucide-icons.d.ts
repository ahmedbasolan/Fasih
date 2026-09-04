// Type declarations for lucide-react-native deep icon imports.
// The package `exports` map only declares the `.` and `./icons` barrels, so
// TypeScript cannot resolve `lucide-react-native/icons/<name>` on its own.
// Runtime resolution is handled by a resolver shim in metro.config.js.
declare module 'lucide-react-native/icons/*' {
  import type { LucideIcon } from 'lucide-react-native';
  const icon: LucideIcon;
  export default icon;
}
