import React, { Component, ErrorInfo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { FONT_ARABIC_BLACK, FONT_LATIN, FONT_LATIN_BOLD, FONT_LATIN_SEMI, ThemeColors } from '../design/tokens';
import { useTheme } from '../../hooks/useTheme';
import { STRINGS } from '../../constants/strings';

interface Props {
  children: React.ReactNode;
  fallbackTitle?: string;
  fallbackSubtitle?: string;
  C: ThemeColors;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundaryInner extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Error reporting should go to crash analytics service in production
    if (__DEV__) {
      console.error('[ErrorBoundary]', error, info.componentStack);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    const styles = getStyles(this.props.C);
    if (this.state.hasError) {
      return (
        <View style={[styles.root, { backgroundColor: this.props.C.BG }]}>
          <Text style={styles.arabic}>عفواً</Text>
          <Text style={[styles.title, { color: this.props.C.TEXT }]}>{this.props.fallbackTitle || STRINGS.ui.errorBoundary.title}</Text>
          <Text style={[styles.subtitle, { color: this.props.C.TEXT3 }]}>
            {this.state.error?.message || this.props.fallbackSubtitle || STRINGS.ui.errorBoundary.subtitle}
          </Text>
          <Pressable
            onPress={this.handleReset}
            accessibilityRole="button"
            accessibilityLabel={STRINGS.ui.errorBoundary.button}
            style={[styles.button, { backgroundColor: this.props.C.SURFACE, borderColor: this.props.C.BORDER }]}
          >
            <Text style={[styles.buttonText, { color: this.props.C.TEXT2 }]}>{STRINGS.ui.errorBoundary.button}</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

export function ErrorBoundary(props: Omit<Props, 'C'>) {
  const { C } = useTheme();
  return <ErrorBoundaryInner {...props} C={C} />;
}

const getStyles = (C: ThemeColors) => StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  arabic: { fontFamily: FONT_ARABIC_BLACK, fontSize: 48, color: C.ERROR, opacity: 0.7 },
  title: { fontFamily: FONT_LATIN_BOLD, fontSize: 18, textAlign: 'center' },
  subtitle: { fontFamily: FONT_LATIN, fontSize: 13, textAlign: 'center', maxWidth: 280, lineHeight: 20 },
  button: {
    marginTop: 16,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderWidth: 1,
  },
  buttonText: { fontFamily: FONT_LATIN_SEMI, fontSize: 14 },
});
