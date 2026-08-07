import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Field, Muted } from '@/components/ui';
import { CinematicGalleryBg } from '@/components/CinematicGalleryBg';
import { brand, colors, fonts, radii, spacing } from '@/constants/theme';
import { api } from '@/lib/api';

export default function LoginScreen() {
  const { signIn, signUp, signInWithGoogle, isDemoMode } = useAuth();
  const { width } = useWindowDimensions();
  const wide = width >= 960;
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState(isDemoMode ? api.demoOwnerHint().email : '');
  const [password, setPassword] = useState(isDemoMode ? api.demoOwnerHint().password : '');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function submit() {
    setError(null);
    setLoading(true);
    try {
      if (mode === 'signin') {
        await signIn(email.trim(), password);
      } else {
        await signUp(email.trim(), password, fullName.trim());
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    setError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Google sign-in failed');
      setGoogleLoading(false);
    }
  }

  return (
    <View style={styles.root}>
      <CinematicGalleryBg />

      <View style={styles.osBar}>
        <Text style={styles.osDot}>●</Text>
        <Text style={styles.osName}>{brand.osName}</Text>
        <Text style={styles.osSep}>/</Text>
        <Text style={styles.osBrand}>{brand.name}</Text>
        <View style={{ flex: 1 }} />
        <Text style={styles.osChip}>CINEMATIC STUDIO</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.container, wide && styles.containerWide]}
          keyboardShouldPersistTaps="handled"
        >
          {wide && (
            <View style={styles.heroCopy}>
              <Text style={styles.eyebrow}>Enter the atelier</Text>
              <Text style={styles.heroTitle}>
                Craft that{'\n'}moves,{'\n'}vault that{'\n'}breathes.
              </Text>
              <Text style={styles.heroBody}>
                Watch the walls drift. Sign in to unlock logos, thumbnails, invites, and reels —
                curated the way a designer thinks.
              </Text>
              <View style={styles.statRow}>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>01</Text>
                  <Text style={styles.statLabel}>Vault login</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>02</Text>
                  <Text style={styles.statLabel}>Browse work</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>03</Text>
                  <Text style={styles.statLabel}>Feel the craft</Text>
                </View>
              </View>
            </View>
          )}

          <View style={styles.panel}>
            <LinearGradient
              colors={[colors.accentSoft, 'transparent']}
              style={styles.panelGlow}
            />
            <Text style={styles.kicker}>{brand.ownerName}</Text>
            <Text style={styles.title}>
              {mode === 'signin' ? 'Unlock studio' : 'Create access'}
            </Text>
            <Text style={styles.sub}>
              {wide
                ? 'Email, password, or Google — then the gallery opens.'
                : 'Sign in to explore Pratibha Graphics Studio.'}
            </Text>

            {isDemoMode && (
              <View style={styles.demoBox}>
                <Muted>
                  Demo mode. Owner: {api.demoOwnerHint().email} / {api.demoOwnerHint().password}
                </Muted>
              </View>
            )}

            <View style={styles.form}>
              {mode === 'signup' && (
                <Field
                  label="Full name"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                  placeholder="Your name"
                />
              )}
              <Field
                label="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="you@email.com"
              />
              <Field
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="••••••••"
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Button
                label={mode === 'signin' ? 'Enter studio' : 'Create account'}
                onPress={submit}
                loading={loading}
              />
              <View style={styles.orRow}>
                <View style={styles.orLine} />
                <Text style={styles.orText}>or</Text>
                <View style={styles.orLine} />
              </View>
              <Button
                label="Continue with Google"
                onPress={onGoogle}
                loading={googleLoading}
                variant="outline"
              />
              <Pressable onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
                <Text style={styles.switchText}>
                  {mode === 'signin' ? 'Need an account? Sign up' : 'Have an account? Sign in'}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  osBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
    backgroundColor: colors.glass,
    zIndex: 5,
  },
  osDot: {
    color: colors.accent,
    fontSize: 10,
  },
  osName: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 2,
    color: colors.accent,
  },
  osSep: {
    color: colors.textDim,
  },
  osBrand: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.textMuted,
  },
  osChip: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.textDim,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.xl,
  },
  containerWide: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: 1100,
    width: '100%',
    alignSelf: 'center',
  },
  heroCopy: {
    flex: 1,
    maxWidth: 480,
    gap: 14,
    paddingRight: spacing.lg,
  },
  eyebrow: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: colors.accent,
  },
  heroTitle: {
    fontFamily: fonts.displayExtra,
    fontSize: 56,
    lineHeight: 58,
    color: colors.text,
    letterSpacing: -1.5,
  },
  heroBody: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 26,
    color: colors.textMuted,
    maxWidth: 420,
  },
  statRow: {
    flexDirection: 'row',
    gap: 18,
    marginTop: 10,
  },
  stat: {
    gap: 2,
  },
  statValue: {
    fontFamily: fonts.displayExtra,
    fontSize: 22,
    color: colors.accent,
  },
  statLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textDim,
  },
  panel: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    gap: spacing.md,
    backgroundColor: colors.glass,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    padding: spacing.lg,
    overflow: 'hidden',
  },
  panelGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  kicker: {
    fontFamily: fonts.bodyMedium,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.accent,
    fontSize: 11,
  },
  title: {
    fontFamily: fonts.displayExtra,
    fontSize: 34,
    lineHeight: 38,
    color: colors.text,
    letterSpacing: -0.8,
  },
  sub: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 22,
    color: colors.textMuted,
    marginTop: -4,
  },
  form: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  demoBox: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.accentSoft,
    borderRadius: 12,
    padding: spacing.md,
  },
  error: {
    fontFamily: fonts.bodyMedium,
    color: colors.danger,
    fontSize: 14,
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  orText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textDim,
  },
  switchText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.accent,
    textAlign: 'center',
    paddingVertical: 6,
  },
});
