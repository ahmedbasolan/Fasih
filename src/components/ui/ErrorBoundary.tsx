import React, { Component, ErrorInfo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { C, FONT_ARABIC_BLACK, FONT_LATIN, FONT_LATIN_BOLD, FONT_LATIN_SEMI } from '../design/tokens';

interface Props {
  children: React.ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.root}>
          <Text style={styles.arabic}>عفواً</Text>
          <Text style={styles.title}>{this.props.fallbackTitle || 'Something went wrong'}</Text>
          <Text style={styles.subtitle}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          <Pressable onPress={this.handleReset} style={styles.button}>
            <Text style={styles.buttonText}>Try Again</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.BG,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  arabic: { fontFamily: FONT_ARABIC_BLACK, fontSize: 48, color: '#E07070', opacity: 0.7 },
  title: { fontFamily: FONT_LATIN_BOLD, fontSize: 18, color: C.TEXT, textAlign: 'center' },
  subtitle: { fontFamily: FONT_LATIN, fontSize: 13, color: C.TEXT3, textAlign: 'center', maxWidth: 280, lineHeight: 20 },
  button: {
    marginTop: 16,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 32,
    backgroundColor: C.SURFACE,
    borderWidth: 1,
    borderColor: C.BORDER,
  },
  buttonText: { fontFamily: FONT_LATIN_SEMI, fontSize: 14, color: C.TEXT2 },
});
