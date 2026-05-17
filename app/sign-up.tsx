import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { User, Mail, Lock, Eye, EyeOff, Check, ChevronLeft, Shield } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAppStore } from '../src/store/useAppStore';
import { FONT_LATIN, FONT_LATIN_BOLD, FONT_LATIN_MEDIUM, FONT_HEADING_SEMI } from '../src/components/design/tokens';
import { useTheme } from '../src/hooks/useTheme';
import { GhostLetters } from '../src/components/ui';

const PASSWORD_RULES = [
  { id: 'length', label: '6+ characters', test: (p: string) => p.length >= 6 },
  { id: 'upper', label: 'One uppercase', test: (p: string) => /[A-Z]/.test(p) },
  { id: 'number', label: 'One number', test: (p: string) => /\d/.test(p) },
];

export default function SignUpScreen() {
  const { C } = useTheme();
  const insets = useSafeAreaInsets();
  const signUp = useAppStore((s) => s.signUp);
  const hasOnboarded = useAppStore((s) => s.hasOnboarded);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<'name' | 'email' | 'password' | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const passedRules = PASSWORD_RULES.filter(r => r.test(password));
  const passwordStrong = passedRules.length === PASSWORD_RULES.length;
  const canSubmit = fullName.trim().length >= 2 && email.trim().includes('@') && passwordStrong && agreed;

  const handleSignUp = async () => {
    if (!canSubmit) return;
    setError('');
    setLoading(true);
    const result = await signUp(email, password, fullName);
    setLoading(false);
    if (result.success) {
      router.replace('/onboarding');
    } else {
      setError(result.error || 'Sign up failed');
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
              Create Account
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT2 }}>
                Already have an account?
              </Text>
              <Pressable onPress={() => router.back()} hitSlop={8}>
                <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 14, color: C.GOLD }}>Sign In</Text>
              </Pressable>
            </View>
          </MotiView>

          {/* Input Card */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 25, delay: 100 }}
            style={{
              backgroundColor: C.SURFACE,
              borderRadius: 20,
              padding: 20,
              gap: 12,
              borderWidth: 1,
              borderColor: C.BORDER,
              marginBottom: 16,
            }}
          >
            {/* Full Name */}
            <View>
              <View style={{
                flexDirection: 'row', alignItems: 'center', gap: 12,
                borderRadius: 12, paddingHorizontal: 14, paddingVertical: 4,
                backgroundColor: C.BG,
                borderWidth: 1,
                borderColor: focused === 'name' ? C.GOLD : C.BORDER2,
              }}>
                <User size={18} color={focused === 'name' ? C.GOLD : C.TEXT3} />
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Full name"
                  placeholderTextColor={C.TEXT3}
                  autoCapitalize="words"
                  autoComplete="name"
                  onFocus={() => setFocused('name')}
                  onBlur={() => setFocused(null)}
                  style={{ flex: 1, fontFamily: FONT_LATIN_MEDIUM, fontSize: 15, color: C.TEXT, paddingVertical: 12 }}
                />
              </View>
            </View>

            {/* Email */}
            <View style={{
              flexDirection: 'row', alignItems: 'center', gap: 12,
              borderRadius: 12, paddingHorizontal: 14, paddingVertical: 4,
              backgroundColor: C.BG,
              borderWidth: 1,
              borderColor: focused === 'email' ? C.GOLD : C.BORDER2,
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
                style={{ flex: 1, fontFamily: FONT_LATIN_MEDIUM, fontSize: 15, color: C.TEXT, paddingVertical: 12 }}
              />
            </View>

            {/* Password */}
            <View style={{
              flexDirection: 'row', alignItems: 'center', gap: 12,
              borderRadius: 12, paddingHorizontal: 14, paddingVertical: 4,
              backgroundColor: C.BG,
              borderWidth: 1,
              borderColor: focused === 'password' ? C.GOLD : C.BORDER2,
            }}>
              <Lock size={18} color={focused === 'password' ? C.GOLD : C.TEXT3} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Create password"
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
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} color={C.TEXT3} /> : <Eye size={18} color={C.TEXT3} />}
              </Pressable>
            </View>

            {/* Password strength indicators */}
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
            <Pressable
              onPress={() => setAgreed(!agreed)}
              style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 4 }}
            >
              <View style={{
                width: 22, height: 22, borderRadius: 6, marginTop: 1,
                backgroundColor: agreed ? C.GOLD : 'transparent',
                borderWidth: 2, borderColor: agreed ? C.GOLD : C.BORDER2,
                alignItems: 'center', justifyContent: 'center',
              }}>
                {agreed && <Check size={12} color={C.BG} />}
              </View>
              <Text style={{ flex: 1, fontFamily: FONT_LATIN, fontSize: 13, color: C.TEXT2, lineHeight: 20 }}>
                I agree to sync my learning progress across devices
              </Text>
            </Pressable>
          </MotiView>

          {/* Error message */}
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
              style={{
                backgroundColor: C.GOLD,
                borderRadius: 14,
                paddingVertical: 16,
                alignItems: 'center',
                opacity: canSubmit && !loading ? 1 : 0.5,
              }}
            >
              <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 16, color: '#FFFFFF' }}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </Pressable>
          </MotiView>

          {__DEV__ && (
            <Pressable
              onPress={async () => {
                await signUp('dev@example.com', 'Dev123456', 'Dev User');
                router.replace(hasOnboarded ? '/(tabs)' : '/onboarding');
              }}
              style={{ marginTop: 24, paddingVertical: 10, alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: C.BORDER, borderStyle: 'dashed' }}
            >
              <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT3 }}>Skip (dev only)</Text>
            </Pressable>
          )}

          <View style={{ flex: 1 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
