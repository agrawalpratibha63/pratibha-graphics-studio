import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { Body, Button, Field, Muted, Title } from '@/components/ui';
import { brand, colors, fonts, spacing } from '@/constants/theme';
import { api } from '@/lib/api';

export default function LoginScreen() {
  const { signIn, signUp, isDemoMode } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState(isDemoMode ? api.demoOwnerHint().email : '');
  const [password, setPassword] = useState(isDemoMode ? api.demoOwnerHint().password : '');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <LinearGradient
          colors={[colors.heroWash, colors.bg, '#FFF9F2']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.panel}>
          <Text style={styles.kicker}>{brand.name}</Text>
          <Title style={{ fontSize: 40 }}>Welcome in</Title>
          <Body style={{ color: colors.textMuted, marginTop: 8 }}>
            Sign in with email and password to explore the studio library.
          </Body>

          {isDemoMode && (
            <View style={styles.demoBox}>
              <Muted>
                Demo mode (Supabase not connected yet). Owner: {api.demoOwnerHint().email} /{' '}
                {api.demoOwnerHint().password}. Visitors: Sign up with any other email.
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
              label={mode === 'signin' ? 'Sign in' : 'Create account'}
              onPress={submit}
              loading={loading}
            />
            <Button
              label={mode === 'signin' ? 'Need an account? Sign up' : 'Have an account? Sign in'}
              onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              variant="ghost"
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  panel: {
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
    gap: spacing.md,
    backgroundColor: colors.bgElevated,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: spacing.lg,
  },
  kicker: {
    fontFamily: fonts.bodyMedium,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.accentDim,
    fontSize: 12,
  },
  form: {
    gap: spacing.md,
    marginTop: spacing.md,
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
});
