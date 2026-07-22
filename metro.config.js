const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Deep-import lucide icons without tripping the package `exports` map, which
// only exposes the `.` and `./icons` barrels. This lets src/components/icons.ts
// pull only the icons we use instead of the whole ~3,390-icon barrel (which
// Metro cannot tree-shake in dev). The `./icons` subpath IS exported, so we
// resolve it and reuse its directory — each icon lives alongside the barrel
// index as `<name>.js`.
const LUCIDE_ICONS_DIR = path.dirname(
  require.resolve('lucide-react-native/icons'),
);

const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith('lucide-react-native/icons/')) {
    const iconName = moduleName.slice('lucide-react-native/icons/'.length);
    return {
      type: 'sourceFile',
      filePath: path.join(LUCIDE_ICONS_DIR, `${iconName}.js`),
    };
  }
  return (defaultResolveRequest ?? context.resolveRequest)(
    context,
    moduleName,
    platform,
  );
};

module.exports = withNativeWind(config, { input: './global.css' });
