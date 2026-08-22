import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

interface Props {
  /** Border radius of the panel's top corners. */
  radius: number;
  /** How far the panel is pulled up to overlap the hero above it (px, becomes a negative marginTop). */
  overlap: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

/**
 * The rounded-top panel that overlaps a hero header by `overlap` px — the
 * "sheet over hero" pattern used below full-bleed headers (Scenarios list,
 * Scenario detail). Only wraps the panel itself; each screen still renders
 * its own hero above it, since hero content differs too much to share.
 */
export function SheetPanel({ radius, overlap, style, children }: Props) {
  return (
    <View style={[{ borderTopLeftRadius: radius, borderTopRightRadius: radius, marginTop: -overlap }, style]}>
      {children}
    </View>
  );
}
