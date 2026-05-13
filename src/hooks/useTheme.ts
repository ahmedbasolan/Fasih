import { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { lightTheme, darkTheme, ThemeColors } from '../components/design/tokens';
import { lightGradients, darkGradients, ThemeGradients } from '../components/design/gradients';

export function useTheme() {
  const themePreference = useAppStore((state) => state.themePreference);
  const setTheme = useAppStore((state) => state.setTheme);
  const systemColorScheme = useColorScheme();

  const isDark =
    themePreference === 'dark' ||
    (themePreference === 'system' && systemColorScheme === 'dark');

  return useMemo(() => {
    const C: ThemeColors = isDark ? darkTheme : lightTheme;
    const G: ThemeGradients = isDark ? darkGradients : lightGradients;
    return { C, G, isDark, themePreference, setTheme };
  }, [isDark, themePreference, setTheme]);
}
