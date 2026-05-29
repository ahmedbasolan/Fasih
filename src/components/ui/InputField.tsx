import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { FONT_LATIN_MEDIUM } from '../design/tokens';
import { useTheme } from '../../hooks/useTheme';

interface Props extends Omit<TextInputProps, 'style'> {
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  focused?: boolean;
  focusColor?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextInputProps['style'];
  /** Accessibility label for screen readers. Defaults to placeholder if not set. */
  accessibilityLabel?: string;
}

export function InputField({ icon, rightIcon, focused, focusColor, containerStyle, inputStyle, accessibilityLabel, ...rest }: Props) {
  const { C } = useTheme();
  const effectFocusColor = focusColor || C.GOLD_BORDER;

  return (
    <View style={[
      styles.root,
      { backgroundColor: C.SURFACE, borderColor: C.BORDER },
      focused && { backgroundColor: `${effectFocusColor}08`, borderColor: effectFocusColor },
      containerStyle,
    ]}>
      {icon}
      <TextInput
        placeholderTextColor={C.TEXT3}
        accessibilityLabel={accessibilityLabel ?? (typeof rest.placeholder === 'string' ? rest.placeholder : undefined)}
        {...rest}
        style={[styles.input, { color: C.TEXT }, inputStyle]}
      />
      {rightIcon}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  input: {
    flex: 1,
    fontFamily: FONT_LATIN_MEDIUM,
    fontSize: 15,
    paddingVertical: 14,
  },
});
