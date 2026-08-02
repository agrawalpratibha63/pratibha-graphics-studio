import React, { useCallback, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Body, Button, LoadingBlock, Muted, Title } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import type { Work } from '@/lib/types';
import { colors, fonts, spacing } from '@/constants/theme';
import { formatBytes } from '@/lib/platform';

function WorkVideo({ uri, width }: { uri: string; width: number }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;
  });
  return (
    <VideoView
      player={player}
      style={{ width, height: Math.min(width * 0.6, 420), backgroundColor: '#000' }}
      nativeControls
      contentFit="contain"
    />
  );
}

export default function WorkDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isOwner } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [work, setWork] = useState<Work | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      api
        .getWork(id, isOwner)
        .then(setWork)
        .catch(console.error)
        .finally(() => setLoading(false));
    }, [id, isOwner])
  );

  if (loading) return <LoadingBlock />;
  if (!work) {
    return (
      <View style={styles.center}>
        <Muted>Work not found or not shared with visitors.</Muted>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: spacing.xxl }}>
      {work.media_type === 'image' && (
        <Image
          source={{ uri: work.storage_path }}
          style={{ width, height: Math.min(width * 0.85, 640), backgroundColor: colors.bgElevated }}
          resizeMode="contain"
        />
      )}
      {work.media_type === 'video' && <WorkVideo uri={work.storage_path} width={width} />}
      {work.media_type === 'document' && (
        <View style={[styles.doc, { width }]}>
          <Text style={styles.docLabel}>{work.mime_type || 'Document'}</Text>
          <Muted>View-only preview. Full file stored in your vault.</Muted>
        </View>
      )}
      <View style={styles.meta}>
        <Title style={{ fontSize: 32 }}>{work.title}</Title>
        <Body style={{ color: colors.textMuted }}>{work.description || 'No description.'}</Body>
        <Muted>
          {work.visibility} · {work.media_type} · {formatBytes(work.size_bytes)}
        </Muted>
        {!isOwner && (
          <Muted style={{ marginTop: 8 }}>
            View only — downloads are disabled for visitors.
          </Muted>
        )}
        {isOwner && (
          <Button
            label="Edit work"
            variant="outline"
            onPress={() => router.push(`/edit-work/${work.id}`)}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  meta: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  doc: {
    padding: spacing.xl,
    backgroundColor: colors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
    gap: 8,
  },
  docLabel: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.accent,
  },
});
