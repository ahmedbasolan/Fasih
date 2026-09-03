import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { User, Mail, Lock, Eye, EyeOff, Check, ChevronLeft, Shield } from '../src/components/icons';
import { router } from 'expo-router';
import { useSignUp, useClerk } from '@clerk/expo';
import { FONT_LATIN, FONT_LATIN_BOLD, FONT_LATIN_MEDIUM, FONT_HEADING_SEMI } from '../src/components/design/tokens';
import { useTheme } from '../src/hooks/useTheme';
import { GhostLetters } from '../src/components/ui';
import { STRINGS } from '../src/constants/strings';
import { getClerkErrorMessage } from '../src/lib/clerkErrors';
import { isLegalUrlSet, openLegal, type LegalDoc } from '../src/constants/legal';

const PASSWORD_RULES = [
  { id: 'length', label: STRINGS.auth.signUp.passwordRuleLength, test: (p: string) => p.length >= 6 },
  { id: 'upper', label: STRINGS.auth.signUp.passwordRuleUpper, test: (p: string) => /[A-Z]/.test(p) },
  { id: 'number', label: STRINGS.auth.signUp.passwordRuleNumber, test: (p: string) => /\d/.test(p) },
];

/**
 * Inline link to a legal document. Renders as plain text (not a dead control)
 * while LEGAL_URLS hasn't been configured yet — see src/constants/legal.ts.
 */
function LegalLink({ doc, label }: { doc: LegalDoc; label: string }) {
  const { C } = useTheme();
  if (!isLegalUrlSet(doc)) return <Text>{label}</Text>;
  return (
    <Text
      onPress={() => openLegal(doc)}
      accessibilityRole="link"
      style={{ color: C.JADE_ACCENT, textDecorationLine: 'underline' }}
    >
      {label}
    </Text>
  );
}

export default function SignUpScreen() {
  const { C } = useTheme();
  const insets = useSafeAreaInsets();
  const { signUp } = useSignUp();
  const { setActive } = useClerk();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<'name' | 'email' | 'password' | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  const passedRules = PASSWORD_RULES.filter(r => r.test(password));
  const passwordStrong = passedRules.length === PASSWORD_RULES.length;
  const canSubmit = fullName.trim().length >= 2 && email.trim().includes('@') && passwordStrong && agreed;

  const handleSignUp = async () => {
    if (!canSubmit) return;
    setError('');
    setLoading(true);
    try {
      const nameParts = fullName.trim().split(' ');
      const { error: createErr } = await signUp.create({
        emailAddress: email.trim(),
        password,
        firstName: nameParts[0],
        lastName: nameParts.slice(1).join(' ') || undefined,
      });
      if (createErr) { setError(getClerkErrorMessage(createErr, STRINGS.auth.signUp.signUpFailed)); return; }

      const { error: sendErr } = await signUp.verifications.sendEmailCode();
      if (sendErr) { setError(getClerkErrorMessage(sendErr, STRINGS.auth.signUp.signUpFailed)); return; }

      setPendingVerification(true);
    } catch (err: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      setError(getClerkErrorMessage(err.errors?.[0], err.message ?? STRINGS.auth.signUp.signUpFailed));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (verificationCode.length < 6) return;
    setLoading(true);
    setError('');
    try {
      const { error: verifyErr } = await signUp.verifications.verifyEmailCode({ code: verificationCode.trim() });
      if (verifyErr) { setError(getClerkErrorMessage(verifyErr, STRINGS.auth.signUp.verificationFailed)); return; }

      if (signUp.status === 'complete') {
        const { error: finalErr } = await signUp.finalize();
        if (finalErr) { setError(getClerkErrorMessage(finalErr, STRINGS.auth.signUp.verificationFailed)); return; }
        await setActive({ session: signUp.createdSessionId! });
        router.replace('/onboarding');
      }
    } catch (err: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      setError(getClerkErrorMessage(err.errors?.[0], err.message ?? STRINGS.auth.signUp.verificationFailed));
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
        <ChevronLeft size={28} color={C.TEXT3} />
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
              {pendingVerification ? STRINGS.auth.signUp.verifyEmailTitle : STRINGS.auth.signUp.createAccountTitle}
            </Text>
            {!pendingVerification && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT2 }}>{STRINGS.auth.signUp.alreadyHaveAccount}</Text>
                <Pressable
                  onPress={() => router.back()}
                  hitSlop={8}
                  accessibilityRole="link"
                  accessibilityLabel={STRINGS.auth.signUp.signInLink}
                >
                  <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 14, color: C.JADE_ACCENT }}>{STRINGS.auth.signUp.signInLink}</Text>
                </Pressable>
              </View>
            )}
            {pendingVerification && (
              <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT2, textAlign: 'center' }}>
                {STRINGS.auth.signUp.codeSentTo(email.trim())}
              </Text>
            )}
          </MotiView>

          {pendingVerification ? (
            /* ── Email verification step ── */
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 25 }}
              style={{ gap: 16 }}
            >
              <View style={{
                backgroundColor: C.SURFACE, borderRadius: 20, padding: 20,
                borderWidth: 1, borderColor: C.BORDER,
              }}>
                <TextInput
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  placeholder={STRINGS.auth.signUp.verificationCodePlaceholder}
                  placeholderTextColor={C.TEXT3}
                  accessibilityLabel={STRINGS.auth.signUp.verificationCodePlaceholder}
                  keyboardType="number-pad"
                  maxLength={6}
                  style={{
                    fontFamily: FONT_LATIN_MEDIUM, fontSize: 22, color: C.TEXT,
                    textAlign: 'center', paddingVertical: 16, letterSpacing: 8,
                  }}
                />
              </View>

              {error ? (
                <View style={{ borderRadius: 12, padding: 12, backgroundColor: C.ERROR_SURFACE, borderWidth: 1, borderColor: C.ERROR_BORDER }}>
                  <Text style={{ fontFamily: FONT_LATIN, fontSize: 13, color: C.ERROR, textAlign: 'center' }}>{error}</Text>
                </View>
              ) : null}

              <Pressable
                onPress={handleVerify}
                disabled={verificationCode.length < 6 || loading}
                accessibilityRole="button"
                accessibilityLabel={STRINGS.auth.signUp.verifyEmail}
                accessibilityState={{ disabled: verificationCode.length < 6 || loading }}
                style={{
                  backgroundColor: C.JADE_ACCENT, borderRadius: 14, paddingVertical: 16,
                  alignItems: 'center',
                  opacity: verificationCode.length >= 6 && !loading ? 1 : 0.5,
                }}
              >
                <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 16, color: C.BG }}>
                  {loading ? STRINGS.auth.signUp.verifying : STRINGS.auth.signUp.verifyEmail}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => { setPendingVerification(false); setError(''); }}
                style={{ alignItems: 'center', paddingVertical: 8 }}
                accessibilityRole="button"
                accessibilityLabel={STRINGS.auth.signUp.backToSignUp}
              >
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 13, color: C.TEXT2 }}>{STRINGS.auth.signUp.backToSignUp}</Text>
              </Pressable>
            </MotiView>
          ) : (
            /* ── Registration form ── */
            <>
              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 25, delay: 100 }}
                style={{
                  backgroundColor: C.SURFACE, borderRadius: 20, padding: 20,
                  gap: 12, borderWidth: 1, borderColor: C.BORDER, marginBottom: 16,
                }}
              >
                {/* Full Name */}
                <View style={{
                  flexDirection: 'row', alignItems: 'center', gap: 12,
                  borderRadius: 12, paddingHorizontal: 14, paddingVertical: 4,
                  backgroundColor: C.BG, borderWidth: 1,
                  borderColor: focused === 'name' ? C.JADE_ACCENT : C.BORDER2,
                }}>
                  <User size={18} color={focused === 'name' ? C.JADE_ACCENT : C.TEXT3} />
                  <TextInput
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder={STRINGS.auth.signUp.fullNamePlaceholder}
                    placeholderTextColor={C.TEXT3}
                    accessibilityLabel={STRINGS.auth.signUp.fullNamePlaceholder}
                    autoCapitalize="words"
                    autoComplete="name"
                    onFocus={() => setFocused('name')}
                    onBlur={() => setFocused(null)}
                    style={{ flex: 1, fontFamily: FONT_LATIN_MEDIUM, fontSize: 15, color: C.TEXT, paddingVertical: 12 }}
                  />
                </View>

                {/* Email */}
                <View style={{
                  flexDirection: 'row', alignItems: 'center', gap: 12,
                  borderRadius: 12, paddingHorizontal: 14, paddingVertical: 4,
                  backgroundColor: C.BG, borderWidth: 1,
                  borderColor: focused === 'email' ? C.JADE_ACCENT : C.BORDER2,
                }}>
                  <Mail size={18} color={focused === 'email' ? C.JADE_ACCENT : C.TEXT3} />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder={STRINGS.auth.signUp.emailPlaceholder}
                    placeholderTextColor={C.TEXT3}
                    accessibilityLabel={STRINGS.auth.signUp.emailPlaceholder}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused(null)}
                    style={{ flex: 1, fontFamily: FONT_LATIN_MEDIUM, fontSize: 15, color: C.TEXT, paddingVertical: 12 }}
                  />
                </View>

                {/* Password */}
                <View style={{
                  flexDirection: 'row', alignItems: 'center', gap: 12,
                  borderRadius: 12, paddingHorizontal: 14, paddingVertical: 4,
                  backgroundColor: C.BG, borderWidth: 1,
                  borderColor: focused === 'password' ? C.JADE_ACCENT : C.BORDER2,
                }}>
                  <Lock size={18} color={focused === 'password' ? C.JADE_ACCENT : C.TEXT3} />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder={STRINGS.auth.signUp.passwordPlaceholder}
                    placeholderTextColor={C.TEXT3}
                    accessibilityLabel={STRINGS.auth.signUp.passwordPlaceholder}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    onFocus={() => setFocused('password')}
                    onBlur={() => setFocused(null)}
                    style={{ flex: 1, fontFamily: FONT_LATIN_MEDIUM, fontSize: 15, color: C.TEXT, paddingVertical: 12 }}
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={12}
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? STRINGS.auth.signIn.hidePassword : STRINGS.auth.signIn.showPassword}
                  >
                    {showPassword ? <EyeOff size={18} color={C.TEXT3} /> : <Eye size={18} color={C.TEXT3} />}
                  </Pressable>
                </View>

                {/* Password strength */}
                {password.length > 0 && (
                  <MotiView
                    from={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 4 }}
                  >
                    {PASSWORD_RULES.map(rule => {
                      const passed = rule.test(password);
                      return (
                        <View key={rule.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: passed ? C.JADE2 : C.SURFACE2, alignItems: 'center', justifyContent: 'center' }}>
                            {passed && <Check size={8} color={C.BG} />}
                          </View>
                          <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: passed ? C.JADE2 : C.TEXT3 }}>{rule.label}</Text>
                        </View>
                      );
                    })}
                  </MotiView>
                )}
              </MotiView>

              {/* Terms checkbox */}
              <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ type: 'spring', stiffness: 280, damping: 25, delay: 200 }}
                style={{ marginBottom: 24 }}
              >
                {/* Checkbox and label are separate touch targets so tapping a
                    legal link opens that document instead of toggling consent. */}
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 4 }}>
                  <Pressable
                    onPress={() => setAgreed(!agreed)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: agreed }}
                    accessibilityLabel={STRINGS.auth.signUp.agreeTermsAccessible}
                    hitSlop={12}
                    style={{
                      width: 22, height: 22, borderRadius: 6, marginTop: 1,
                      backgroundColor: agreed ? C.JADE_ACCENT : 'transparent',
                      borderWidth: 2, borderColor: agreed ? C.JADE_ACCENT : C.BORDER2,
                      alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {agreed && <Check size={12} color={C.BG} />}
                  </Pressable>
                  <Text style={{ flex: 1, fontFamily: FONT_LATIN, fontSize: 13, color: C.TEXT2, lineHeight: 20 }}>
                    {STRINGS.auth.signUp.agreeTermsPrefix}{' '}
                    <LegalLink doc="terms" label={STRINGS.legal.termsOfService} />
                    {' '}{STRINGS.auth.signUp.agreeTermsConjunction}{' '}
                    <LegalLink doc="privacy" label={STRINGS.legal.privacyPolicy} />
                  </Text>
                </View>
              </MotiView>

              {/* Error */}
              {error ? (
                <MotiView
                  from={{ opacity: 0, translateY: -10 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  style={{ marginBottom: 16 }}
                >
                  <View style={{ borderRadius: 12, padding: 12, backgroundColor: C.ERROR_SURFACE, borderWidth: 1, borderColor: C.ERROR_BORDER }}>
                    <Text style={{ fontFamily: FONT_LATIN, fontSize: 13, color: C.ERROR, textAlign: 'center' }}>{error}</Text>
                  </View>
                </MotiView>
              ) : null}

              {/* Create Account Button */}
              <MotiView
                from={{ opacity: 0, translateY: 16 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 25, delay: 250 }}
              >
                <Pressable
                  onPress={handleSignUp}
                  disabled={!canSubmit || loading}
                  accessibilityRole="button"
                  accessibilityLabel={STRINGS.auth.signUp.createAccount}
                  accessibilityState={{ disabled: !canSubmit || loading }}
                  style={{
                    backgroundColor: C.JADE_ACCENT, borderRadius: 14,
                    paddingVertical: 16, alignItems: 'center',
                    opacity: canSubmit && !loading ? 1 : 0.5,
                  }}
                >
                  <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 16, color: C.BG }}>
                    {loading ? STRINGS.auth.signUp.creatingAccount : STRINGS.auth.signUp.createAccount}
                  </Text>
                </Pressable>
              </MotiView>

              {__DEV__ && (
                <Pressable
                  onPress={() => router.replace('/onboarding')}
                  style={{ marginTop: 24, paddingVertical: 10, alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: C.BORDER, borderStyle: 'dashed' }}
                >
                  <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT3 }}>{STRINGS.auth.signUp.skipDevOnly}</Text>
                </Pressable>
              )}
            </>
          )}

          <View style={{ flex: 1 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
