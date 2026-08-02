import React from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Tabs, useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { brand, colors, fonts, spacing } from '@/constants/theme';

function TopNav() {
  const { isOwner, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const compact = width < 720;

  const links = [
    { href: '/', label: 'Home', match: ['/', '/index'] },
    { href: '/library', label: 'Library', match: ['/library'] },
    ...(isOwner
      ? [
          { href: '/dashboard', label: 'Admin', match: ['/dashboard'] },
          { href: '/visitors', label: 'Visitors', match: ['/visitors'] },
        ]
      : []),
  ];

  function active(match: string[]) {
    return match.some((m) => pathname === m || pathname.endsWith(m));
  }

  return (
    <View style={[styles.nav, { paddingTop: Math.max(insets.top, 12) }]}>
      <Pressable onPress={() => router.push('/')} style={styles.brandWrap}>
        <Text style={styles.brand}>{brand.name}</Text>
        {!compact && <Text style={styles.tag}>{brand.tagline}</Text>}
      </Pressable>
      <View style={styles.links}>
        {links.map((link) => {
          const isActive = active(link.match);
          return (
            <Pressable
              key={link.href}
              onPress={() => router.push(link.href as '/')}
              style={[styles.link, isActive && styles.linkActive]}
            >
              <Text style={[styles.linkText, isActive && styles.linkTextActive]}>
                {link.label}
              </Text>
            </Pressable>
          );
        })}
        <Pressable onPress={() => signOut()} style={styles.link}>
          <Text style={styles.linkText}>Sign out</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <View style={styles.root}>
      <TopNav />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Home' }} />
        <Tabs.Screen name="library" options={{ title: 'Library' }} />
        <Tabs.Screen name="dashboard" options={{ title: 'Dashboard' }} />
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
    paddingBottom: 12,
    backgroundColor: colors.bgElevated,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
    gap: 12,
  },
  brandWrap: {
    flexShrink: 1,
    gap: 2,
  },
  brand: {
    fontFamily: fonts.displayExtra,
    fontSize: 20,
    color: colors.text,
    letterSpacing: -0.3,
  },
  tag: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  links: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 6,
  },
  link: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  linkActive: {
    backgroundColor: colors.accentSoft,
  },
  linkText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textMuted,
  },
  linkTextActive: {
    color: colors.text,
  },
});
