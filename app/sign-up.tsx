import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Check, ChevronLeft, BookOpen, Mic, Globe } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAppStore } from '../src/store/useAppStore';
import { C, FONT_ARABIC_BLACK, FONT_ARABIC_SEMI, FONT_LATIN, FONT_LATIN_BOLD, FONT_LATIN_SEMI, FONT_LATIN_MEDIUM } from '../src/components/design/tokens';
import { GOLD_STOPS, JADE_STOPS, ANGLE_135 } from '../src/components/design/gradients';
import { KafMascot } from '../src/components/KafMascot';
import { GeoPattern } from '../src/components/design/GeoPattern';

const PASSWORD_RULES = [
  { id: 'length', label: '6+ characters', test: (p: string) => p.length >= 6 },
  { id: 'upper', label: 'One uppercase', test: (p: string) => /[A-Z]/.test(p) },
  { id: 'number', label: 'One number', test: (p: string) => /\d/.test(p) },
];

export default function SignUpScreen() {
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

  const arabicPreview = fullName.length > 2 ? `مرحباً ${fullName.split(' ')[0]}` : '';

  return (
    <View style={{ flex: 1, backgroundColor: C.BG }}>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.4 }}>
        <GeoPattern color={C.JADE2} opacity={0.025} size={28} />
      </View>

      {/* Back button */}
      <Pressable
        onPress={() => router.back()}
        style={{ position: 'absolute', top: insets.top + 12, left: 16, zIndex: 30, width: 36, height: 36, borderRadius: 18, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER, alignItems: 'center', justifyContent: 'center' }}
      >
        <ChevronLeft size={18} color={C.TEXT2} />
      </Pressable>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: insets.top + 56, paddingBottom: insets.bottom + 24 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <MotiView
            from={{ opacity: 0, translateY: -16 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 500 }}
            style={{ marginBottom: 28 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 12 }}>
              <KafMascot size="sm" animate />
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONT_ARABIC_BLACK, fontSize: 28, color: C.JADE2, marginBottom: -2 }}>انضم إلينا</Text>
                <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT2 }}>Join the Fasih community</Text>
              </View>
            </View>

            {/* Feature pills */}
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              {[
                { Icon: BookOpen, label: '4 Live Scenarios', color: C.GOLD },
                { Icon: Mic, label: 'Listen & Learn', color: C.VIOLET2 },
                { Icon: Globe, label: 'Cultural Notes', color: C.JADE2 },
              ].map(({ Icon, label, color }) => (
                <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, backgroundColor: `${color}10`, borderWidth: 1, borderColor: `${color}25` }}>
                  <Icon size={11} color={color} />
                  <Text style={{ fontFamily: FONT_LATIN, fontSize: 10, color }}>{label}</Text>
                </View>
              ))}
            </View>
          </MotiView>

          {/* Form */}
          <MotiView
            from={{ opacity: 0, translateY: 16 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 500, delay: 120 }}
            style={{ gap: 12, marginBottom: 16 }}
          >
            {/* Full Name */}
            <View>
              <View style={{
                flexDirection: 'row', alignItems: 'center', gap: 12,
                borderRadius: 16, paddingHorizontal: 16, paddingVertical: 4,
                backgroundColor: focused === 'name' ? 'rgba(34,181,140,0.06)' : C.SURFACE,
                borderWidth: 1.5,
                borderColor: focused === 'name' ? C.JADE_BORDER : C.BORDER,
              }}>
                <User size={18} color={focused === 'name' ? C.JADE2 : C.TEXT3} />
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Full name"
                  placeholderTextColor={C.TEXT3}
                  autoCapitalize="words"
                  autoComplete="name"
                  onFocus={() => setFocused('name')}
                  onBlur={() => setFocused(null)}
                  style={{ flex: 1, fontFamily: FONT_LATIN_MEDIUM, fontSize: 15, color: C.TEXT, paddingVertical: 14 }}
                />
              </View>
              {arabicPreview ? (
                <MotiView from={{ opacity: 0, translateY: -4 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 300 }}>
                  <Text style={{ fontFamily: FONT_ARABIC_SEMI, fontSize: 14, color: C.JADE2, marginTop: 6, marginLeft: 4 }}>{arabicPreview} 👋</Text>
                </MotiView>
              ) : null}
            </View>

            {/* Email */}
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

            {/* Password */}
            <View style={{
              flexDirection: 'row', alignItems: 'center', gap: 12,
              borderRadius: 16, paddingHorizontal: 16, paddingVertical: 4,
              backgroundColor: focused === 'password' ? 'rgba(91,70,200,0.06)' : C.SURFACE,
              borderWidth: 1.5,
              borderColor: focused === 'password' ? C.VIOLET_BORDER : C.BORDER,
            }}>
              <Lock size={18} color={focused === 'password' ? C.VIOLET2 : C.TEXT3} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Create password"
                placeholderTextColor={C.TEXT3}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
                style={{ flex: 1, fontFamily: FONT_LATIN_MEDIUM, fontSize: 15, color: C.TEXT, paddingVertical: 14 }}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={12}>
                {showPassword ? <EyeOff size={18} color={C.TEXT3} /> : <Eye size={18} color={C.TEXT3} />}
              </Pressable>
            </View>

            {/* Password strength indicators */}
            {password.length > 0 && (
              <MotiView
                from={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ type: 'timing', duration: 250 }}
                style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 4 }}
              >
                {PASSWORD_RULES.map(rule => {
                  const passed = rule.test(password);
                  return (
                    <View key={rule.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: passed ? C.JADE2 : 'rgba(255,255,255,0.07)', alignItems: 'center', justifyContent: 'center' }}>
                        {passed && <Check size={8} color="#05050E" />}
                      </View>
                      <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: passed ? C.JADE2 : C.TEXT3 }}>{rule.label}</Text>
                    </View>
                  );
                })}
              </MotiView>
            )}
          </MotiView>

          {/* Terms checkbox */}
          <Pressable
            onPress={() => setAgreed(!agreed)}
            style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 20, paddingVertical: 4 }}
          >
            <View style={{
              width: 22, height: 22, borderRadius: 6, marginTop: 1,
              backgroundColor: agreed ? C.JADE2 : 'transparent',
              borderWidth: 2, borderColor: agreed ? C.JADE2 : 'rgba(255,255,255,0.18)',
              alignItems: 'center', justifyContent: 'center',
            }}>
              {agreed && <Check size={12} color="#05050E" />}
            </View>
            <Text style={{ flex: 1, fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT2, lineHeight: 18 }}>
              I understand this beta stores my learning progress locally on this device.
            </Text>
          </Pressable>

          {error ? (
            <View style={{ borderRadius: 12, padding: 12, backgroundColor: 'rgba(232,118,108,0.1)', borderWidth: 1, borderColor: 'rgba(232,118,108,0.25)', marginBottom: 16 }}>
              <Text style={{ fontFamily: FONT_LATIN, fontSize: 13, color: '#E8766C', textAlign: 'center' }}>{error}</Text>
            </View>
          ) : null}

          {/* Create Account button */}
          <MotiView
            from={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400, delay: 250 }}
            style={{ gap: 12, marginBottom: 24 }}
          >
            <Pressable onPress={handleSignUp} disabled={!canSubmit || loading} style={{ borderRadius: 16, overflow: 'hidden', opacity: canSubmit && !loading ? 1 : 0.45 }}>
              <LinearGradient
                colors={canSubmit && !loading ? JADE_STOPS : ['rgba(26,144,112,0.2)', 'rgba(26,144,112,0.2)']}
                start={ANGLE_135.start}
                end={ANGLE_135.end}
                style={{ paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 16, color: canSubmit && !loading ? '#05050E' : C.TEXT3 }}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Text>
                {!loading && <ArrowRight size={18} color={canSubmit ? '#05050E' : C.TEXT3} />}
              </LinearGradient>
            </Pressable>
          </MotiView>

          {/* Divider */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: C.BORDER }} />
            <Text style={{ fontFamily: FONT_LATIN, fontSize: 11, color: C.TEXT3 }}>beta preview</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: C.BORDER }} />
          </View>

          {/* Social sign-up buttons */}
          <View style={{ marginBottom: 24 }}>
            <View style={{ borderRadius: 16, padding: 14, backgroundColor: C.SURFACE, borderWidth: 1, borderColor: C.BORDER }}>
              <Text style={{ fontFamily: FONT_LATIN, fontSize: 13, color: C.TEXT2, textAlign: 'center' }}>This beta uses local email sign-up. Google and Apple sign-in are coming later.</Text>
            </View>
          </View>

          {__DEV__ && (
            <Pressable
              onPress={async () => {
                await signUp('dev@example.com', 'Dev123456', 'Dev User');
                router.replace(hasOnboarded ? '/(tabs)' : '/onboarding');
              }}
              style={{ marginBottom: 24, paddingVertical: 10, alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderStyle: 'dashed' }}
            >
              <Text style={{ fontFamily: FONT_LATIN, fontSize: 12, color: C.TEXT3 }}>Skip (dev only)</Text>
            </Pressable>
          )}

          {/* Bottom — Already have account */}
          <View style={{ flex: 1 }} />
          <View style={{ alignItems: 'center', gap: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ fontFamily: FONT_LATIN, fontSize: 14, color: C.TEXT2 }}>Already have an account?</Text>
              <Pressable onPress={() => router.back()}>
                <Text style={{ fontFamily: FONT_LATIN_BOLD, fontSize: 14, color: C.GOLD }}>Sign In</Text>
              </Pressable>
            </View>
            <Text style={{ fontFamily: FONT_ARABIC_SEMI, fontSize: 13, color: C.TEXT3 }}>الحساب جاهز؟ سجّل دخولك</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
