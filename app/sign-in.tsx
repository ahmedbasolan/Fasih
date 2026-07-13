import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Mail, Lock, Eye, EyeOff, Shield } from 'lucide-react-native';
import { router } from 'expo-router';
import { useSignIn, useClerk } from '@clerk/expo';
import { useAppStore } from '../src/store/useAppStore';
import { FONT_LATIN, FONT_LATIN_BOLD, FONT_LATIN_SEMI, FONT_LATIN_MEDIUM, FONT_HEADING_SEMI } from '../src/components/design/tokens';
import { useTheme } from '../src/hooks/useTheme';
import { GhostLetters } from '../src/components/ui';
import { STRINGS } from '../src/constants/strings';

export default function SignInScreen() {
  const { C } = useTheme();
  const insets = useSafeAreaInsets();
  const { signIn } = useSignIn();
  const { setActive } = useClerk();
  const hasOnboarded = useAppStore((s) => s.hasOnboarded);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<'email' | 'password' | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit = email.trim().length > 3 && password.length >= 6;

  const handleSignIn = async () => {
    if (!canSubmit) return;
    setError('');
    setLoading(true);
    try {
      const { error: createErr } = await signIn.create({ identifier: email.trim() });
      if (createErr) { setError(createErr.longMessage ?? createErr.message); return; }

      const { error: pwErr } = await signIn.password({ password });
      if (pwErr) { setError(pwErr.longMessage ?? pwErr.message); return; }

      if (signIn.status === 'complete') {
        const { error: finalErr } = await signIn.finalize();
        if (finalErr) { setError(finalErr.longMessage ?? finalErr.message); return; }
        await setActive({ session: signIn.createdSessionId! });
        router.replace(hasOnboarded ? '/(tabs)' : '/onboarding');
      }
    } catch (err: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      setError(err.errors?.[0]?.longMessage ?? err.errors?.[0]?.message ?? err.message ?? STRINGS.auth.signIn.signInFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: C.BG }}>
      <GhostLetters glyphs={['م', 'ر', 'ح']} />

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: insets.top + 60, paddingBottom: insets.bottom + 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <MotiView
            from={{ opacity: 0, translateY: -16 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            style={{ alignItems: 'center', marginBottom: 40 }}
          >
            <View style={{
              width: 64, height: 64, borderRadius: 20,
              backgroundColor: C.JADE_ACCENT_DIM,
              alignItems: 'center', justifyContent: 'center', marginBottom: 24,
            }}>
              <Shield size={32} color={C.JADE_ACCENT} strokeWidth={2} />
            </View>
            <Text style={{ fontFamily: FONT_HEADING_SEMI, fontSize: 28, color: C.TEXT, textAlign: 'center', marginBottom: 8 }}>
              {STRINGS.auth.signIn.title}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT2 }}>
                {STRINGS.auth.signIn.noAccount}
              </Text>
              <Pressable onPress={() => router.push('/sign-up')} hitSlop={8}>
                <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 14, color: C.JADE_ACCENT }}>{STRINGS.auth.signIn.signUpLink}</Text>
              </Pressable>
            </View>
          </MotiView>

          {/* Input Card */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 25, delay: 100 }}
            style={{
              backgroundColor: C.SURFACE, borderRadius: 20, padding: 20,
              gap: 16, borderWidth: 1, borderColor: C.BORDER, marginBottom: 16,
            }}
          >
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
                placeholder={STRINGS.auth.signIn.emailPlaceholder}
                placeholderTextColor={C.TEXT3}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                style={{ flex: 1, fontFamily: FONT_LATIN_MEDIUM, fontSize: 15, color: C.TEXT, paddingVertical: 12 }}
              />
            </View>

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
                placeholder={STRINGS.auth.signIn.passwordPlaceholder}
                placeholderTextColor={C.TEXT3}
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
          </MotiView>

          {/* Forgot password */}
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 25, delay: 200 }}
            style={{ alignSelf: 'center', marginBottom: 24 }}
          >
            <Pressable
              onPress={() => router.push('/forgot-password')}
              accessibilityRole="link"
            >
              <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 13, color: C.TEXT2, textDecorationLine: 'underline' }}>
                {STRINGS.auth.signIn.forgotPassword}
              </Text>
            </Pressable>
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

          {/* Sign In Button */}
          <MotiView
            from={{ opacity: 0, translateY: 16 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 25, delay: 250 }}
          >
            <Pressable
              onPress={handleSignIn}
              disabled={!canSubmit || loading}
              style={{
                backgroundColor: C.JADE_ACCENT, borderRadius: 14, paddingVertical: 16,
                alignItems: 'center', opacity: canSubmit && !loading ? 1 : 0.5,
              }}
            >
              <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 16, color: C.WHITE }}>
                {loading ? STRINGS.auth.signIn.signingIn : STRINGS.auth.signIn.logIn}
              </Text>
            </Pressable>
          </MotiView>

          {__DEV__ && (
            <Pressable
              onPress={() => router.replace(hasOnboarded ? '/(tabs)' : '/onboarding')}
              style={{ marginTop: 24, paddingVertical: 10, alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: C.BORDER, borderStyle: 'dashed' }}
            >
              <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT3 }}>{STRINGS.auth.signIn.skipDevOnly}</Text>
            </Pressable>
          )}

          <View style={{ flex: 1 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
