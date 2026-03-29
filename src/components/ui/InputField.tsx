import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { C, FONT_LATIN_MEDIUM } from '../design/tokens';

interface Props extends Omit<TextInputProps, 'style'> {
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  focused?: boolean;
  focusColor?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextInputProps['style'];
}

export function InputField({ icon, rightIcon, focused, focusColor = C.GOLD_BORDER, containerStyle, inputStyle, ...rest }: Props) {
  return (
    <View style={[
      styles.root,
      focused && { backgroundColor: `${focusColor}08`, borderColor: focusColor },
      containerStyle,
    ]}>
      {icon}
      <TextInput
        placeholderTextColor={C.TEXT3}
        {...rest}
        style={[styles.input, inputStyle]}
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
    backgroundColor: C.SURFACE,
    borderWidth: 1.5,
    borderColor: C.BORDER,
  },
  input: {
    flex: 1,
    fontFamily: FONT_LATIN_MEDIUM,
    fontSize: 15,
    color: C.TEXT,
    paddingVertical: 14,
  },
});
