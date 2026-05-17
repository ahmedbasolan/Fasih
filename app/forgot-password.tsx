import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Mail, CheckCircle, Shield, ChevronLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAppStore } from '../src/store/useAppStore';
import { FONT_LATIN, FONT_LATIN_BOLD, FONT_LATIN_SEMI, FONT_LATIN_MEDIUM, FONT_HEADING_SEMI } from '../src/components/design/tokens';
import { useTheme } from '../src/hooks/useTheme';
import { GhostLetters } from '../src/components/ui';

export default function ForgotPasswordScreen() {
  const { C } = useTheme();
  const insets = useSafeAreaInsets();
  const resetPassword = useAppStore((s) => s.resetPassword);

  const [email, setEmail] = useState('');
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const canSubmit = email.trim().length > 3 && email.includes('@');

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setError('');
    setLoading(true);
    const result = await resetPassword(email);
    setLoading(false);
    if (result.success) {
      setSent(true);
    } else {
      setError(result.error || 'Could not send reset email');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.BG }}>
      <GhostLetters glyphs={['م', 'ر', 'ح']} />
      {/* Subtle grid background */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.03 }}>
        <View style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }} />
      </View>

      {/* Back button - simple arrow */}
      <Pressable
        onPress={() => router.back()}
        style={{ position: 'absolute', top: insets.top + 24, left: 20, zIndex: 30 }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <ChevronLeft size={28} color={C.TEXT3} />
      </Pressable>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: insets.top + 80, paddingBottom: insets.bottom + 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header with shield icon */}
          <MotiView
            from={{ opacity: 0, translateY: -16 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            style={{ alignItems: 'center', marginBottom: 32 }}
          >
            {/* Shield Icon Container */}
            <View style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              backgroundColor: C.GOLD_DIM,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
            }}>
              <Shield size={32} color={C.GOLD} strokeWidth={2} />
            </View>

            <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 28, color: C.TEXT, textAlign: 'center', marginBottom: 8 }}>
              Forgot Password?
            </Text>
            <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT2, textAlign: 'center' }}>
              No worries, we&apos;ll help you reset it
            </Text>
          </MotiView>

          {sent ? (
            <MotiView
              from={{ opacity: 0, translateY: 16 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 25 }}
              style={{ gap: 24 }}
            >
              <View style={{
                borderRadius: 16,
                padding: 20,
                backgroundColor: C.SURFACE,
                borderWidth: 1,
                borderColor: C.BORDER,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12
              }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: C.JADE_DIM,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <CheckCircle size={20} color={C.JADE2} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 15, color: C.TEXT }}>Check your email</Text>
                  <Text style={{ fontFamily: FONT_LATIN, fontSize: 13, color: C.TEXT2, marginTop: 2 }}>
                    We sent a reset link to {email.trim()}
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={() => router.replace('/sign-in')}
                style={{
                  backgroundColor: C.GOLD,
                  borderRadius: 14,
                  paddingVertical: 16,
                  alignItems: 'center',
                }}
                accessibilityRole="button"
                accessibilityLabel="Back to sign in"
              >
                <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 16, color: '#FFFFFF' }}>
                  Back to Sign In
                </Text>
              </Pressable>
            </MotiView>
          ) : (
            <>
              {/* Input Card */}
              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 25, delay: 100 }}
                style={{
                  backgroundColor: C.SURFACE,
                  borderRadius: 20,
                  padding: 20,
                  borderWidth: 1,
                  borderColor: C.BORDER,
                  marginBottom: 24,
                }}
              >
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT2, marginBottom: 16 }}>
                  Enter your email and we&apos;ll send you a reset link
                </Text>

                <View style={{
                  flexDirection: 'row', alignItems: 'center', gap: 12,
                  borderRadius: 12, paddingHorizontal: 14, paddingVertical: 4,
                  backgroundColor: C.BG,
                  borderWidth: 1,
                  borderColor: focused ? C.GOLD : C.BORDER2,
                }}>
                  <Mail size={18} color={focused ? C.GOLD : C.TEXT3} />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Email address"
                    placeholderTextColor={C.TEXT3}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    style={{ flex: 1, fontFamily: FONT_LATIN_MEDIUM, fontSize: 15, color: C.TEXT, paddingVertical: 12 }}
                  />
                </View>

                {error ? (
                  <MotiView
                    from={{ opacity: 0, translateY: -10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    style={{ marginTop: 12 }}
                  >
                    <View style={{ borderRadius: 12, padding: 12, backgroundColor: C.ERROR_SURFACE, borderWidth: 1, borderColor: C.ERROR_BORDER }}>
                      <Text style={{ fontFamily: FONT_LATIN, fontSize: 13, color: C.ERROR, textAlign: 'center' }}>{error}</Text>
                    </View>
                  </MotiView>
                ) : null}
              </MotiView>

              {/* Send Reset Link Button */}
              <MotiView
                from={{ opacity: 0, translateY: 16 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 25, delay: 150 }}
              >
                <Pressable
                  onPress={handleSubmit}
                  disabled={!canSubmit || loading}
                  style={{
                    backgroundColor: C.GOLD,
                    borderRadius: 14,
                    paddingVertical: 16,
                    alignItems: 'center',
                    opacity: canSubmit && !loading ? 1 : 0.5,
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Send reset link"
                >
                  <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 16, color: '#FFFFFF' }}>
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </Text>
                </Pressable>
              </MotiView>
            </>
          )}

          <View style={{ flex: 1 }} />

          {/* Bottom - Remember password link */}
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 25, delay: 200 }}
            style={{ alignItems: 'center', gap: 4 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT2 }}>Remember your password?</Text>
              <Pressable onPress={() => router.back()} accessibilityRole="link" accessibilityLabel="Back to sign in">
                <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 14, color: C.GOLD }}>Sign In</Text>
              </Pressable>
            </View>
          </MotiView>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
