import React, { useCallback, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Body, Button, LoadingBlock, Muted } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import type { Category, Work } from '@/lib/types';
import { colors, fonts, radii, spacing } from '@/constants/theme';

function WorkVideo({ uri, width }: { uri: string; width: number }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;
  });
  return (
    <VideoView
      player={player}
      style={{ width, height: Math.min(width * 0.62, 620), backgroundColor: '#000' }}
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
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      Promise.all([api.getWork(id, isOwner), api.getCategories(isOwner)])
        .then(([item, categories]) => {
          setWork(item);
          setCategory(item ? categories.find((c) => c.id === item.category_id) ?? null : null);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }, [id, isOwner])
  );

  if (loading) return <LoadingBlock />;
  if (!work) {
    return (
      <View style={styles.center}>
        <Muted>Project not found or not shared publicly.</Muted>
      </View>
    );
  }

  const mediaWidth = Math.min(width, 1280);
  const description = work.description?.trim() || 'A selected portfolio piece from Pratibha Graphics Studio.';

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.intro}>
        <Text style={styles.eyebrow}>{category?.name || 'Selected work'} · Pratibha Graphics Studio</Text>
        <Text style={styles.title}>{work.title}</Text>
        <Text style={styles.lede}>{description}</Text>
        <View style={styles.tags}>
          <Text style={styles.tag}>{work.media_type === 'video' ? 'Motion design' : work.media_type === 'document' ? 'Design document' : 'Visual design'}</Text>
          {work.visibility === 'featured' ? <Text style={styles.tag}>Featured project</Text> : null}
          {category?.name ? <Text style={styles.tag}>{category.name}</Text> : null}
        </View>
      </View>

      <View style={[styles.mediaStage, { width: mediaWidth }]}>
        {work.media_type === 'image' && (
          <Image
            source={{ uri: work.storage_path }}
            style={{ width: '100%', height: Math.min(mediaWidth * 0.78, 820), backgroundColor: colors.bgElevated }}
            resizeMode="contain"
          />
        )}
        {work.media_type === 'video' && <WorkVideo uri={work.storage_path} width={mediaWidth} />}
        {work.media_type === 'document' && (
          <View style={styles.doc}>
            <Text style={styles.docLabel}>DESIGN CASE FILE</Text>
            <Muted>{work.mime_type || 'Document preview'}</Muted>
          </View>
        )}
      </View>

      <View style={styles.storyGrid}>
        <View style={styles.storyMain}>
          <Text style={styles.sectionKicker}>Project story</Text>
          <Text style={styles.sectionTitle}>The visual idea</Text>
          <Body style={styles.storyCopy}>{description}</Body>
          <Body style={styles.storyCopy}>
            This portfolio view keeps the artwork central while giving visitors enough context to understand the design direction and the kind of visual problem the piece represents.
          </Body>
        </View>
        <View style={styles.sideCard}>
          <Text style={styles.sideKicker}>Project details</Text>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Discipline</Text><Text style={styles.detailValue}>{category?.name || 'Graphic design'}</Text></View>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Format</Text><Text style={styles.detailValue}>{work.media_type}</Text></View>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Presentation</Text><Text style={styles.detailValue}>{work.visibility === 'featured' ? 'Featured portfolio' : 'Portfolio archive'}</Text></View>
          {!isOwner ? <Text style={styles.viewOnly}>Portfolio preview · artwork remains view-only.</Text> : null}
          {isOwner ? <Button label="Edit project" variant="outline" onPress={() => router.push(`/edit-work/${work.id}`)} /> : null}
        </View>
      </View>

      <View style={styles.nextCard}>
        <Text style={styles.sectionKicker}>Continue exploring</Text>
        <Text style={styles.nextTitle}>See the full visual archive.</Text>
        <Button label="Back to selected work" variant="outline" onPress={() => router.push('/library')} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: spacing.xxl, alignItems: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  intro: { width: '100%', maxWidth: 1080, paddingHorizontal: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.lg, gap: 12 },
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 2.2, textTransform: 'uppercase', color: colors.accent },
  title: { fontFamily: fonts.displayExtra, fontSize: 44, lineHeight: 50, letterSpacing: -1, color: colors.text, maxWidth: 900 },
  lede: { fontFamily: fonts.body, fontSize: 17, lineHeight: 27, color: colors.textMuted, maxWidth: 780 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  tag: { fontFamily: fonts.bodyMedium, fontSize: 10, letterSpacing: 0.7, textTransform: 'uppercase', color: colors.text, borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: colors.bgCard },
  mediaStage: { maxWidth: 1280, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.borderSoft, backgroundColor: colors.bgElevated },
  doc: { minHeight: 360, alignItems: 'center', justifyContent: 'center', gap: 8, padding: spacing.xl },
  docLabel: { fontFamily: fonts.displayExtra, fontSize: 28, color: colors.accent },
  storyGrid: { width: '100%', maxWidth: 1080, padding: spacing.lg, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg, alignItems: 'flex-start' },
  storyMain: { flex: 2, minWidth: 280, gap: 10 },
  sectionKicker: { fontFamily: fonts.bodyBold, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: colors.accent },
  sectionTitle: { fontFamily: fonts.displayExtra, fontSize: 28, lineHeight: 34, color: colors.text },
  storyCopy: { color: colors.textMuted, fontSize: 15, lineHeight: 25 },
  sideCard: { flex: 1, minWidth: 250, gap: 12, padding: spacing.md, borderWidth: 1, borderColor: colors.borderSoft, borderRadius: radii.md, backgroundColor: colors.bgCard },
  sideKicker: { fontFamily: fonts.display, fontSize: 17, color: colors.text },
  detailRow: { gap: 3, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: colors.borderSoft },
  detailLabel: { fontFamily: fonts.bodyMedium, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: colors.textDim },
  detailValue: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.text },
  viewOnly: { fontFamily: fonts.body, fontSize: 11, lineHeight: 17, color: colors.textDim },
  nextCard: { width: '100%', maxWidth: 1080, marginTop: spacing.md, padding: spacing.lg, gap: 12, borderTopWidth: 1, borderTopColor: colors.borderSoft },
  nextTitle: { fontFamily: fonts.displayExtra, fontSize: 26, color: colors.text },
});
