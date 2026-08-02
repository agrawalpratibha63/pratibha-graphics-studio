import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Profile } from '@/lib/types';

interface AuthContextValue {
  loading: boolean;
  user: { id: string; email: string } | null;
  profile: Profile | null;
  isOwner: boolean;
  isDemoMode: boolean;
  refresh: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const refresh = useCallback(async () => {
    const session = await api.getSession();
    setUser(session.user);
    setProfile(session.profile);
  }, []);

  useEffect(() => {
    let mounted = true;
    refresh()
      .catch(console.error)
      .finally(() => {
        if (mounted) setLoading(false);
      });

    if (!isSupabaseConfigured) {
      return () => {
        mounted = false;
      };
    }

    const supabase = getSupabase();
    if (!supabase) return;

    const { data: sub } = supabase.auth.onAuthStateChange(async (event) => {
      await refresh();
      if (event === 'SIGNED_IN') {
        const session = await api.getSession();
        if (session.profile?.role === 'visitor' && session.user) {
          try {
            await api.recordVisit(session.user.id);
          } catch (e) {
            console.warn(e);
          }
        }
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [refresh]);

  const value = useMemo<AuthContextValue>(
    () => ({
      loading,
      user,
      profile,
      isOwner: profile?.role === 'owner',
      isDemoMode: api.isDemoMode,
      refresh,
      async signIn(email, password) {
        const session = await api.signIn(email, password);
        setUser(session.user);
        setProfile(session.profile);
      },
      async signUp(email, password, fullName) {
        const session = await api.signUp(email, password, fullName);
        setUser(session.user);
        setProfile(session.profile);
      },
      async signInWithGoogle() {
        await api.signInWithGoogle();
        // Session arrives via onAuthStateChange after redirect
      },
      async signOut() {
        await api.signOut();
        setUser(null);
        setProfile(null);
      },
    }),
    [loading, user, profile, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
