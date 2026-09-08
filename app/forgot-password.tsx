import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Mail, Lock, Eye, EyeOff, Shield, ChevronLeft } from '../src/components/icons';
import { router } from 'expo-router';
import { useSignIn, useClerk } from '@clerk/expo';
import { FONT_LATIN, FONT_LATIN_BOLD, FONT_LATIN_MEDIUM, FONT_HEADING_SEMI } from '../src/components/design/tokens';
import { useTheme } from '../src/hooks/useTheme';
import { GhostLetters } from '../src/components/ui';
import { STRINGS } from '../src/constants/strings';
import { getClerkErrorMessage } from '../src/lib/clerkErrors';
import { useAppStore } from '../src/store/useAppStore';

export default function ForgotPasswordScreen() {
  const { C } = useTheme();
  const insets = useSafeAreaInsets();
  const { signIn } = useSignIn();
  const { setActive } = useClerk();
  const hasOnboarded = useAppStore((s) => s.hasOnboarded);

  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<'email' | 'code' | 'password' | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmitEmail = email.trim().length > 3 && email.includes('@');
  const canSubmitReset = code.trim().length === 6 && newPassword.length >= 6;

  const handleRequestCode = async () => {
    if (!canSubmitEmail) return;
    setError('');
    setLoading(true);
    try {
      const { error: createErr } = await signIn.create({ identifier: email.trim() });
      if (createErr) { setError(getClerkErrorMessage(createErr, STRINGS.auth.forgotPassword.requestCodeFailed)); return; }

      const { error: sendErr } = await signIn.resetPasswordEmailCode.sendCode();
      if (sendErr) { setError(getClerkErrorMessage(sendErr, STRINGS.auth.forgotPassword.requestCodeFailed)); return; }

      setStep('reset');
    } catch (err: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      setError(getClerkErrorMessage(err.errors?.[0], STRINGS.auth.forgotPassword.requestCodeFailed));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!canSubmitReset) return;
    setLoading(true);
    setError('');
    try {
      const { error: verifyErr } = await signIn.resetPasswordEmailCode.verifyCode({ code: code.trim() });
      if (verifyErr) { setError(getClerkErrorMessage(verifyErr, STRINGS.auth.forgotPassword.resetFailed)); return; }

      const { error: submitErr } = await signIn.resetPasswordEmailCode.submitPassword({ password: newPassword });
      if (submitErr) { setError(getClerkErrorMessage(submitErr, STRINGS.auth.forgotPassword.resetFailed)); return; }

      if (signIn.status === 'complete') {
        const { error: finalErr } = await signIn.finalize();
        if (finalErr) { setError(getClerkErrorMessage(finalErr, STRINGS.auth.forgotPassword.resetFailed)); return; }
        await setActive({ session: signIn.createdSessionId! });
        router.replace(hasOnboarded ? '/(tabs)' : '/onboarding');
      }
    } catch (err: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      setError(getClerkErrorMessage(err.errors?.[0], STRINGS.auth.forgotPassword.resetFailed));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: C.BG }}>
      <GhostLetters glyphs={['م', 'ر', 'ح']} />

      <Pressable
        onPress={() => router.back()}
        style={{ position: 'absolute', top: insets.top + 24, left: 20, zIndex: 30 }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <ChevronLeft size={28} strokeWidth={1.5} color={C.TEXT3} />
      </Pressable>

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: insets.top + 80, paddingBottom: insets.bottom + 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <MotiView
            from={{ opacity: 0, translateY: -16 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            style={{ alignItems: 'center', marginBottom: 32 }}
          >
            <View style={{
              width: 64, height: 64, borderRadius: 20,
              backgroundColor: C.JADE_ACCENT_DIM,
              alignItems: 'center', justifyContent: 'center', marginBottom: 24,
            }}>
              <Shield size={32} color={C.JADE_ACCENT} strokeWidth={2} />
            </View>
            <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 28, color: C.TEXT, textAlign: 'center', marginBottom: 8 }}>
              {step === 'email' ? STRINGS.auth.forgotPassword.title : STRINGS.auth.forgotPassword.setNewPasswordTitle}
            </Text>
            <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT2, textAlign: 'center' }}>
              {step === 'email'
                ? STRINGS.auth.forgotPassword.sendCodeSub
                : STRINGS.auth.forgotPassword.resetCodeSub(email.trim())}
            </Text>
          </MotiView>

          {step === 'email' ? (
            /* ── Step 1: Email ── */
            <>
              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 25, delay: 100 }}
                style={{
                  backgroundColor: C.SURFACE, borderRadius: 20, padding: 20,
                  borderWidth: 1, borderColor: C.BORDER, marginBottom: 24,
                }}
              >
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT2, marginBottom: 16 }}>
                  {STRINGS.auth.forgotPassword.emailInstructions}
                </Text>
                <View style={{
                  flexDirection: 'row', alignItems: 'center', gap: 12,
                  borderRadius: 12, paddingHorizontal: 14, paddingVertical: 4,
                  backgroundColor: C.BG, borderWidth: 1,
                  borderColor: focused === 'email' ? C.JADE_ACCENT : C.BORDER2,
                }}>
                  <Mail size={18} strokeWidth={1.5} color={focused === 'email' ? C.JADE_ACCENT : C.TEXT3} />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder={STRINGS.auth.forgotPassword.emailPlaceholder}
                    placeholderTextColor={C.TEXT3}
                    accessibilityLabel={STRINGS.auth.forgotPassword.emailPlaceholder}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused(null)}
                    style={{ flex: 1, fontFamily: FONT_LATIN_MEDIUM, fontSize: 16, color: C.TEXT, paddingVertical: 12 }}
                  />
                </View>

                {error ? (
                  <MotiView from={{ opacity: 0, translateY: -10 }} animate={{ opacity: 1, translateY: 0 }} style={{ marginTop: 12 }}>
                    <View style={{ borderRadius: 12, padding: 12, backgroundColor: C.ERROR_SURFACE, borderWidth: 1, borderColor: C.ERROR_BORDER }}>
                      <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.ERROR, textAlign: 'center' }}>{error}</Text>
                    </View>
                  </MotiView>
                ) : null}
              </MotiView>

              <MotiView
                from={{ opacity: 0, translateY: 16 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 25, delay: 150 }}
              >
                <Pressable
                  onPress={handleRequestCode}
                  disabled={!canSubmitEmail || loading}
                  accessibilityRole="button"
                  accessibilityLabel={STRINGS.auth.forgotPassword.sendResetCode}
                  accessibilityState={{ disabled: !canSubmitEmail || loading }}
                  style={{
                    backgroundColor: C.JADE_ACCENT, borderRadius: 14, paddingVertical: 16,
                    alignItems: 'center', opacity: canSubmitEmail && !loading ? 1 : 0.5,
                  }}
                >
                  <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 16, color: C.BG }}>
                    {loading ? STRINGS.auth.forgotPassword.sending : STRINGS.auth.forgotPassword.sendResetCode}
                  </Text>
                </Pressable>
              </MotiView>
            </>
          ) : (
            /* ── Step 2: Code + new password ── */
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 25 }}
              style={{ gap: 16 }}
            >
              <View style={{
                backgroundColor: C.SURFACE, borderRadius: 20, padding: 20,
                borderWidth: 1, borderColor: C.BORDER, gap: 12,
              }}>
                <View style={{
                  flexDirection: 'row', alignItems: 'center', gap: 12,
                  borderRadius: 12, paddingHorizontal: 14, paddingVertical: 4,
                  backgroundColor: C.BG, borderWidth: 1,
                  borderColor: focused === 'code' ? C.JADE_ACCENT : C.BORDER2,
                }}>
                  <Mail size={18} strokeWidth={1.5} color={focused === 'code' ? C.JADE_ACCENT : C.TEXT3} />
                  <TextInput
                    value={code}
                    onChangeText={setCode}
                    placeholder={STRINGS.auth.forgotPassword.codePlaceholder}
                    placeholderTextColor={C.TEXT3}
                    accessibilityLabel={STRINGS.auth.forgotPassword.codePlaceholder}
                    keyboardType="number-pad"
                    maxLength={6}
                    onFocus={() => setFocused('code')}
                    onBlur={() => setFocused(null)}
                    style={{ flex: 1, fontFamily: FONT_LATIN_MEDIUM, fontSize: 16, color: C.TEXT, paddingVertical: 12, letterSpacing: 4 }}
                  />
                </View>

                <View style={{
                  flexDirection: 'row', alignItems: 'center', gap: 12,
                  borderRadius: 12, paddingHorizontal: 14, paddingVertical: 4,
                  backgroundColor: C.BG, borderWidth: 1,
                  borderColor: focused === 'password' ? C.JADE_ACCENT : C.BORDER2,
                }}>
                  <Lock size={18} strokeWidth={1.5} color={focused === 'password' ? C.JADE_ACCENT : C.TEXT3} />
                  <TextInput
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder={STRINGS.auth.forgotPassword.newPasswordPlaceholder}
                    placeholderTextColor={C.TEXT3}
                    accessibilityLabel={STRINGS.auth.forgotPassword.newPasswordPlaceholder}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    onFocus={() => setFocused('password')}
                    onBlur={() => setFocused(null)}
                    style={{ flex: 1, fontFamily: FONT_LATIN_MEDIUM, fontSize: 16, color: C.TEXT, paddingVertical: 12 }}
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={12}
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? STRINGS.auth.signIn.hidePassword : STRINGS.auth.signIn.showPassword}
                  >
                    {showPassword ? <EyeOff size={18} strokeWidth={1.5} color={C.TEXT3} /> : <Eye size={18} strokeWidth={1.5} color={C.TEXT3} />}
                  </Pressable>
                </View>
              </View>

              {error ? (
                <View style={{ borderRadius: 12, padding: 12, backgroundColor: C.ERROR_SURFACE, borderWidth: 1, borderColor: C.ERROR_BORDER }}>
                  <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.ERROR, textAlign: 'center' }}>{error}</Text>
                </View>
              ) : null}

              <Pressable
                onPress={handleReset}
                disabled={!canSubmitReset || loading}
                accessibilityRole="button"
                accessibilityLabel={STRINGS.auth.forgotPassword.resetPassword}
                accessibilityState={{ disabled: !canSubmitReset || loading }}
                style={{
                  backgroundColor: C.JADE_ACCENT, borderRadius: 14, paddingVertical: 16,
                  alignItems: 'center', opacity: canSubmitReset && !loading ? 1 : 0.5,
                }}
              >
                <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 16, color: C.BG }}>
                  {loading ? STRINGS.auth.forgotPassword.resetting : STRINGS.auth.forgotPassword.resetPassword}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => { setStep('email'); setCode(''); setNewPassword(''); setError(''); }}
                style={{ alignItems: 'center', paddingVertical: 8 }}
                accessibilityRole="button"
                accessibilityLabel={STRINGS.auth.forgotPassword.back}
              >
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT2 }}>{STRINGS.auth.forgotPassword.back}</Text>
              </Pressable>
            </MotiView>
          )}

          <View style={{ flex: 1 }} />

          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 25, delay: 200 }}
            style={{ alignItems: 'center' }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT2 }}>{STRINGS.auth.forgotPassword.rememberPassword}</Text>
              <Pressable onPress={() => router.back()} accessibilityRole="link" accessibilityLabel={STRINGS.auth.forgotPassword.signInLink}>
                <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 14, color: C.JADE_ACCENT }}>{STRINGS.auth.forgotPassword.signInLink}</Text>
              </Pressable>
            </View>
          </MotiView>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
