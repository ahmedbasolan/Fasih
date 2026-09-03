import React, { Component, ErrorInfo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { FONT_ARABIC_BLACK, FONT_LATIN, FONT_LATIN_BOLD, FONT_LATIN_SEMI, ThemeColors } from '../design/tokens';
import { useTheme } from '../../hooks/useTheme';
import { STRINGS } from '../../constants/strings';
import { captureException } from '../../lib/analytics';

interface Props {
  children: React.ReactNode;
  fallbackTitle?: string;
  fallbackSubtitle?: string;
  /**
   * Change this to clear the error and remount the subtree — pass the current
   * route, for example. Without it "Try again" only clears the boundary's own
   * flag, so a deterministic error (a bad cloud payload, a malformed script)
   * re-throws on the very next render and the user is stuck on the error
   * screen until they force-quit.
   */
  resetKey?: string | number;
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
    if (__DEV__) {
      console.error('[ErrorBoundary]', error, info.componentStack);
    }
    captureException(error, {
      componentStack: info.componentStack ?? '',
      boundary: 'ErrorBoundary',
    });
  }

  componentDidUpdate(prevProps: Props) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, error: null });
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
          {/* The raw exception message used to come first here, so a user hitting
              a crash was shown text like "Cannot read property 'length' of
              undefined" as the app's entire explanation. The message goes to
              Sentry in componentDidCatch; the user gets the written copy. */}
          <Text style={[styles.subtitle, { color: this.props.C.TEXT3 }]}>
            {this.props.fallbackSubtitle || STRINGS.ui.errorBoundary.subtitle}
          </Text>
          {__DEV__ && this.state.error?.message ? (
            <Text style={[styles.subtitle, { color: this.props.C.ERROR }]}>
              {this.state.error.message}
            </Text>
          ) : null}
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
