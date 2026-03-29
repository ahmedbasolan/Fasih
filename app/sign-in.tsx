import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Fingerprint } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAppStore } from '../src/store/useAppStore';
import { C, FONT_ARABIC_BLACK, FONT_ARABIC_SEMI, FONT_LATIN, FONT_LATIN_BOLD, FONT_LATIN_SEMI, FONT_LATIN_MEDIUM } from '../src/components/design/tokens';
import { GOLD_STOPS, JADE_STOPS, ANGLE_135 } from '../src/components/design/gradients';
import { KafMascot } from '../src/components/KafMascot';
import { GeoPattern } from '../src/components/design/GeoPattern';

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const signIn = useAppStore((s) => s.signIn);
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
    const result = await signIn(email, password);
    setLoading(false);
    if (result.success) {
      router.replace(hasOnboarded ? '/(tabs)' : '/onboarding');
    } else {
      setError(result.error || 'Sign in failed');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.BG }}>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.4 }}>
        <GeoPattern color={C.GOLD} opacity={0.03} size={28} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header with mascot */}
          <MotiView
            from={{ opacity: 0, translateY: -20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 600 }}
            style={{ alignItems: 'center', marginBottom: 32 }}
          >
            <KafMascot size="md" animate />

            <Text style={{ fontFamily: FONT_ARABIC_BLACK, fontSize: 38, color: C.GOLD, textAlign: 'center', marginTop: 16, marginBottom: 2 }}>
              أهلاً من جديد
            </Text>
            <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT2, textAlign: 'center' }}>
              Welcome back to Fasih
            </Text>
          </MotiView>

          {/* Form */}
          <MotiView
            from={{ opacity: 0, translateY: 16 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 500, delay: 150 }}
            style={{ gap: 14, marginBottom: 20 }}
          >
            {/* Email field */}
            <View style={{
              flexDirection: 'row', alignItems: 'center', gap: 12,
              borderRadius: 16, paddingHorizontal: 16, paddingVertical: 4,
              backgroundColor: focused === 'email' ? 'rgba(200,145,58,0.06)' : C.SURFACE,
              borderWidth: 1.5,
              borderColor: focused === 'email' ? C.GOLD_BORDER : C.BORDER,
            }}>
              <Mail size={18} color={focused === 'email' ? C.GOLD : C.TEXT3} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email address"
                placeholderTextColor={C.TEXT3}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                style={{ flex: 1, fontFamily: FONT_LATIN_MEDIUM, fontSize: 15, color: C.TEXT, paddingVertical: 14 }}
              />
            </View>

            {/* Password field */}
            <View style={{
              flexDirection: 'row', alignItems: 'center', gap: 12,
              borderRadius: 16, paddingHorizontal: 16, paddingVertical: 4,
              backgroundColor: focused === 'password' ? 'rgba(200,145,58,0.06)' : C.SURFACE,
              borderWidth: 1.5,
              borderColor: focused === 'password' ? C.GOLD_BORDER : C.BORDER,
            }}>
              <Lock size={18} color={focused === 'password' ? C.GOLD : C.TEXT3} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor={C.TEXT3}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
                style={{ flex: 1, fontFamily: FONT_LATIN_MEDIUM, fontSize: 15, color: C.TEXT, paddingVertical: 14 }}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={12}>
                {showPassword
                  ? <EyeOff size={18} color={C.TEXT3} />
                  : <Eye size={18} color={C.TEXT3} />
                }
              </Pressable>
            </View>

            {/* Forgot password */}
            <View style={{ alignSelf: 'flex-end', paddingVertical: 4 }}>
              <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 12, color: C.TEXT3 }}>Password reset is not part of this beta</Text>
            </View>

            {error ? (
              <View style={{ borderRadius: 12, padding: 12, backgroundColor: 'rgba(232,118,108,0.1)', borderWidth: 1, borderColor: 'rgba(232,118,108,0.25)' }}>
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 13, color: '#E8766C', textAlign: 'center' }}>{error}</Text>
              </View>
            ) : null}
          </MotiView>

          {/* Sign In button */}
          <MotiView
            from={{ opacity: 0, translateY: 16 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 500, delay: 300 }}
            style={{ gap: 12, marginBottom: 24 }}
          >
            <Pressable onPress={handleSignIn} disabled={!canSubmit || loading} style={{ borderRadius: 16, overflow: 'hidden', opacity: canSubmit && !loading ? 1 : 0.5 }}>
              <LinearGradient
                colors={canSubmit && !loading ? GOLD_STOPS : ['rgba(200,145,58,0.2)', 'rgba(200,145,58,0.2)']}
                start={ANGLE_135.start}
                end={ANGLE_135.end}
                style={{ paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 16, color: canSubmit && !loading ? '#05050E' : C.TEXT3 }}>
                  {loading ? 'Signing In...' : 'Sign In'}
                </Text>
                {!loading && <ArrowRight size={18} color={canSubmit ? '#05050E' : C.TEXT3} />}
              </LinearGradient>
            </Pressable>

            {/* Biometric option */}
            <View style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
              borderRadius: 16, paddingVertical: 14,
              backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER,
            }}>
              <Fingerprint size={18} color={C.JADE2} />
              <Text style={{ fontFamily: FONT_LATIN_SEMI, fontSize: 14, color: C.TEXT2 }}>Biometric sign-in is coming later</Text>
            </View>
          </MotiView>

          {/* Divider */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: C.BORDER }} />
            <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3 }}>beta preview</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: C.BORDER }} />
          </View>

          {/* Social sign-in buttons */}
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: 400, delay: 450 }}
            style={{ marginBottom: 32 }}
          >
            <View style={{ borderRadius: 16, padding: 14, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER }}>
              <Text style={{ fontFamily: FONT_LATIN, fontSize: 13, color: C.TEXT2, textAlign: 'center' }}>Email sign-in works in this beta. Google and Apple sign-in are coming later.</Text>
            </View>
          </MotiView>

          {/* Bottom section — Sign up link */}
          <View style={{ flex: 1 }} />
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: 400, delay: 550 }}
            style={{ alignItems: 'center', gap: 6 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT2 }}>New to Fasih?</Text>
              <Pressable onPress={() => router.push('/sign-up')}>
                <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 14, color: C.GOLD }}>Create Account</Text>
              </Pressable>
            </View>
            <Text style={{ fontFamily: FONT_ARABIC_SEMI, fontSize: 13, color: C.TEXT3 }}>ابدأ رحلتك اليوم</Text>
          </MotiView>

          {/* Dev skip button */}
          {__DEV__ && (
            <Pressable
              onPress={async () => {
                await signIn('dev@example.com', 'dev123456');
                router.replace(hasOnboarded ? '/(tabs)' : '/onboarding');
              }}
              style={{ marginTop: 20, paddingVertical: 10, alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderStyle: 'dashed' }}
            >
              <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT3 }}>Skip (dev only)</Text>
            </Pressable>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
