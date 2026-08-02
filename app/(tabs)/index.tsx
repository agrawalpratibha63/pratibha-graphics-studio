import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { HeroIntro } from '@/components/HeroIntro';
import { FeaturedTrain } from '@/components/FeaturedTrain';
import { Body, Button, LoadingBlock, Muted } from '@/components/ui';
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

  const load = useCallback(async () => {
    const [op, feat] = await Promise.all([api.getOwnerProfile(), api.getFeaturedWorks()]);
    setOwnerProfile(op);
    setFeatured(feat);
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load()
        .catch(console.error)
        .finally(() => setLoading(false));
    }, [load])
  );

  if (loading || !ownerProfile) return <LoadingBlock />;

  return (
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
      <View style={styles.cta}>
        <Text style={styles.sectionTitle}>Explore the library</Text>
        <Body style={{ color: colors.textMuted }}>
          Logos, thumbnails, social posts, and video — view only for visitors.
        </Body>
        <Button label="Open library" onPress={() => router.push('/library')} />
        {isOwner && (
          <Button
            label="Owner dashboard"
            variant="outline"
            onPress={() => router.push('/dashboard')}
          />
        )}
        <Muted style={{ marginTop: 8 }}>
          Signed in as {profile?.full_name}
        </Muted>
      </View>
    </ScrollView>
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
  cta: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.text,
  },
});
