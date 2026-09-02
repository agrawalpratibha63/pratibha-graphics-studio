import React from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Tabs, useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useStudioExperience } from '@/contexts/StudioExperienceContext';
import { brand, colors, fonts, spacing } from '@/constants/theme';

function FilmStripNav() {
  const { user, isOwner, signOut } = useAuth();
  const { isUnlocking, enterChamber } = useStudioExperience();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const compact = width < 720;

  if (isUnlocking) return null;

  const links = [
    { href: '/', label: 'Home', match: ['/', '/index'] },
    { href: '/library', label: 'Work', match: ['/library'] },
    ...(isOwner
      ? [
          { href: '/dashboard', label: 'Studio', match: ['/dashboard'] },
          { href: '/visitors', label: 'Visitors', match: ['/visitors'] },
        ]
      : []),
  ];

  function active(match: string[]) {
    return match.some((m) => pathname === m || pathname.endsWith(m));
  }

  return (
    <View style={[styles.nav, { paddingTop: Math.max(insets.top, 8) }]}>
      <Pressable onPress={() => router.push('/')} style={styles.brandWrap}>
        <View style={styles.sprocketRow}>
          <View style={styles.sprocket} />
          <View style={styles.sprocket} />
          <View style={styles.sprocket} />
        </View>
        <Text style={styles.brand} numberOfLines={1}>
          {compact ? 'PG Studio' : brand.name}
        </Text>
      </Pressable>
      <View style={styles.links}>
        {links.map((link) => {
          const isActive = active(link.match);
          return (
            <Pressable
              key={link.href}
              onPress={() => {
                if (link.href === '/') {
                  router.push('/');
                  return;
                }
                enterChamber(link.href, link.label);
              }}
              style={[styles.link, isActive && styles.linkActive]}
            >
              <Text style={[styles.linkText, isActive && styles.linkTextActive]}>
                {link.label}
              </Text>
            </Pressable>
          );
        })}
        {user ? (
          <Pressable onPress={() => signOut()} style={styles.link}>
            <Text style={styles.linkText}>Sign out</Text>
          </Pressable>
        ) : (
          <Pressable onPress={() => router.push('/login')} style={styles.accessLink}>
            <Text style={styles.accessText}>Studio access</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <View style={styles.root}>
      <FilmStripNav />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Home' }} />
        <Tabs.Screen name="library" options={{ title: 'Work' }} />
        <Tabs.Screen name="dashboard" options={{ title: 'Studio' }} />
        <Tabs.Screen name="visitors" options={{ title: 'Visitors' }} />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: 10,
    backgroundColor: 'rgba(12,10,9,0.94)',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
    gap: 12,
  },
  brandWrap: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sprocketRow: {
    flexDirection: 'row',
    gap: 3,
  },
  sprocket: {
    width: 5,
    height: 5,
    borderRadius: 1,
    backgroundColor: colors.accentDim,
    opacity: 0.7,
  },
  brand: {
    fontFamily: fonts.displayExtra,
    fontSize: 14,
    color: colors.text,
    letterSpacing: 0.2,
  },
  links: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 4,
  },
  link: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  linkActive: {
    borderColor: colors.glassBorder,
    backgroundColor: colors.accentSoft,
  },
  linkText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    letterSpacing: 0.6,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  linkTextActive: {
    color: colors.accent,
  },
  accessLink: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.accentDim,
    backgroundColor: colors.accentSoft,
  },
  accessText: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 0.7,
    color: colors.accent,
    textTransform: 'uppercase',
  },
});
