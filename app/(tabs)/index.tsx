import React, { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { HeroIntro } from '@/components/HeroIntro';
import { FeaturedTrain } from '@/components/FeaturedTrain';
import { VaultPortals } from '@/components/VaultPortals';
import { StageReveal } from '@/components/StageReveal';
import { Body, LoadingBlock, Muted } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import type { OwnerProfile, Work } from '@/lib/types';
import { colors, fonts, spacing } from '@/constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { isOwner, profile } = useAuth();
  const [ownerProfile, setOwnerProfile] = useState<OwnerProfile | null>(null);
  const [featured, setFeatured] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [focusTick, setFocusTick] = useState(0);

  const load = useCallback(async () => {
    const [op, feat] = await Promise.all([api.getOwnerProfile(), api.getFeaturedWorks()]);
    setOwnerProfile(op);
    setFeatured(feat);
  }, []);

  useFocusEffect(
    useCallback(() => {
      setFocusTick((t) => t + 1);
      setLoading(true);
      load()
        .catch(console.error)
        .finally(() => setLoading(false));
    }, [load])
  );

  const portals = useMemo(() => {
    const base = [
      {
        key: 'library',
        label: 'Library',
        subtitle: 'Logos, thumbnails, invites, reels — the full vault.',
        href: '/library',
      },
    ];
    if (isOwner) {
      base.push(
        {
          key: 'admin',
          label: 'Admin',
          subtitle: 'Upload, edit visibility, import starter work.',
          href: '/dashboard',
        },
        {
          key: 'visitors',
          label: 'Visitors',
          subtitle: 'Who stepped in — silent, tracked, yours to review.',
          href: '/visitors',
        }
      );
    }
    return base;
  }, [isOwner]);

  if (loading || !ownerProfile) return <LoadingBlock />;

  return (
    <StageReveal triggerKey={`home-${focusTick}`}>
      <ScrollView
        style={styles.screen}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={colors.accent}
            onRefresh={async () => {
              setRefreshing(true);
              await load();
              setRefreshing(false);
            }}
          />
        }
      >
        <HeroIntro profile={ownerProfile} />
        <View style={styles.trainBlock}>
          <FeaturedTrain
            works={featured}
            onPressWork={(work) => router.push(`/work/${work.id}`)}
          />
        </View>

        <VaultPortals
          portals={portals}
          onOpen={(href) => router.push(href as '/library')}
        />

        <View style={styles.footer}>
          <Text style={styles.sectionTitle}>Same rooms. New doors.</Text>
          <Body style={{ color: colors.textMuted }}>
            Library, Admin, and Visitors stay — but each chamber opens with a reveal, not a dull tab switch.
          </Body>
          <Muted style={{ marginTop: 8 }}>Signed in as {profile?.full_name}</Muted>
        </View>
      </ScrollView>
    </StageReveal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  trainBlock: {
    paddingVertical: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  footer: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.text,
  },
});
