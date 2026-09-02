import React, { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { WorkCard } from '@/components/WorkCard';
import { WorkLightbox } from '@/components/WorkLightbox';
import { StageReveal } from '@/components/StageReveal';
import { Chip, LoadingBlock, Muted } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import type { Category, Work } from '@/lib/types';
import { colors, fonts, radii, spacing } from '@/constants/theme';

type Density = 'editorial' | 'gallery';

function columnsFor(width: number, density: Density) {
  if (density === 'gallery') {
    if (width >= 1180) return 4;
    if (width >= 760) return 3;
    return 2;
  }
  if (width >= 1120) return 3;
  if (width >= 720) return 2;
  return 1;
}

export default function LibraryScreen() {
  const { isOwner } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [categories, setCategories] = useState<Category[]>([]);
  const [works, setWorks] = useState<Work[]>([]);
  const [active, setActive] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [density, setDensity] = useState<Density>('editorial');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<Work | null>(null);
  const [focusTick, setFocusTick] = useState(0);

  const pad = width >= 900 ? spacing.xl : spacing.md;
  const gap = width >= 720 ? 16 : 10;
  const cols = columnsFor(width, density);
  const cardWidth = (width - pad * 2 - gap * (cols - 1)) / cols;

  const load = useCallback(async () => {
    setError(null);
    try {
      const [cats, items] = await Promise.all([
        api.getCategories(isOwner),
        api.getWorks(isOwner),
      ]);
      setCategories(cats);
      setWorks(items);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load portfolio');
      setWorks([]);
    }
  }, [isOwner]);

  useFocusEffect(
    useCallback(() => {
      setFocusTick((t) => t + 1);
      setLoading(true);
      load().finally(() => setLoading(false));
    }, [load])
  );

  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach((c) => {
      map[c.id] = c.name;
    });
    return map;
  }, [categories]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return works.filter((w) => {
      if (active !== 'all' && w.category_id !== active) return false;
      if (!q) return true;
      return (
        w.title.toLowerCase().includes(q) ||
        (w.description || '').toLowerCase().includes(q) ||
        (categoryMap[w.category_id] ?? '').toLowerCase().includes(q)
      );
    });
  }, [works, active, query, categoryMap]);

  if (loading) return <LoadingBlock />;

  return (
    <StageReveal triggerKey={`library-${focusTick}`}>
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }}>
          <View style={[styles.hero, { paddingHorizontal: pad }]}>
            <Text style={styles.eyebrow}>Selected portfolio</Text>
            <Text style={styles.heroTitle}>Design with a reason behind every visual.</Text>
            <Text style={styles.heroBody}>
              Explore identity, campaign, social and creator work. Every piece includes a short
              project introduction so the portfolio shows the thinking—not only the final image.
            </Text>
            <View style={styles.heroStats}>
              <View style={styles.stat}><Text style={styles.statValue}>{works.length}</Text><Text style={styles.statLabel}>Projects</Text></View>
              <View style={styles.stat}><Text style={styles.statValue}>{categories.length}</Text><Text style={styles.statLabel}>Disciplines</Text></View>
              <View style={styles.stat}><Text style={styles.statValue}>3D</Text><Text style={styles.statLabel}>Interactive viewing</Text></View>
            </View>
          </View>

          <View style={[styles.controls, { marginHorizontal: pad }]}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search projects, categories, ideas..."
              placeholderTextColor={colors.textDim}
              style={styles.search}
            />
            <View style={styles.viewRow}>
              <Text style={styles.viewLabel}>View</Text>
              {([
                ['editorial', 'Case studies'],
                ['gallery', 'Gallery'],
              ] as const).map(([key, label]) => (
                <Pressable
                  key={key}
                  onPress={() => setDensity(key)}
                  style={[styles.viewChip, density === key && styles.viewChipActive]}
                >
                  <Text style={[styles.viewText, density === key && styles.viewTextActive]}>{label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.chips, { paddingHorizontal: pad }]}
          >
            {[{ id: 'all', name: 'All work' } as Category, ...categories].map((item) => (
              <Chip
                key={item.id}
                label={item.name}
                active={active === item.id}
                onPress={() => setActive(item.id)}
              />
            ))}
          </ScrollView>

          {error ? <Muted style={{ padding: pad, color: colors.danger }}>{error}</Muted> : null}

          <View style={[styles.resultHeader, { paddingHorizontal: pad }]}>
            <Text style={styles.resultTitle}>{filtered.length} selected piece{filtered.length === 1 ? '' : 's'}</Text>
            <Text style={styles.resultHint}>Tap a card for preview · open project story for detail</Text>
          </View>

          <View style={[styles.wrap, { gap, paddingHorizontal: pad }]}>
            {filtered.length === 0 ? (
              <Muted style={{ paddingVertical: spacing.lg }}>
                {works.length === 0
                  ? isOwner ? 'No works yet. Open Studio → Import starter library.' : 'Portfolio pieces are being curated.'
                  : 'No projects match this filter.'}
              </Muted>
            ) : (
              filtered.map((item) => (
                <WorkCard
                  key={item.id}
                  work={item}
                  categoryName={categoryMap[item.category_id]}
                  width={cardWidth}
                  onPress={() => setPreview(item)}
                  onLongPress={() => router.push(`/work/${item.id}`)}
                />
              ))
            )}
          </View>
        </ScrollView>

        <WorkLightbox
          work={preview}
          categoryName={preview ? categoryMap[preview.category_id] : undefined}
          visible={Boolean(preview)}
          onClose={() => setPreview(null)}
          onOpenFull={() => {
            if (!preview) return;
            const id = preview.id;
            setPreview(null);
            router.push(`/work/${id}`);
          }}
        />
      </View>
    </StageReveal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  hero: { paddingTop: spacing.xl, paddingBottom: spacing.lg, gap: 12, maxWidth: 980 },
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 2.5, textTransform: 'uppercase', color: colors.accent },
  heroTitle: { fontFamily: fonts.displayExtra, fontSize: 38, lineHeight: 44, letterSpacing: -0.8, color: colors.text, maxWidth: 760 },
  heroBody: { fontFamily: fonts.body, fontSize: 15, lineHeight: 24, color: colors.textMuted, maxWidth: 720 },
  heroStats: { flexDirection: 'row', flexWrap: 'wrap', gap: 24, marginTop: 8 },
  stat: { minWidth: 92 },
  statValue: { fontFamily: fonts.displayExtra, fontSize: 22, color: colors.accent },
  statLabel: { fontFamily: fonts.body, fontSize: 11, color: colors.textDim, marginTop: 2 },
  controls: { padding: 12, gap: 10, borderWidth: 1, borderColor: colors.borderSoft, backgroundColor: colors.bgCard, borderRadius: radii.md },
  search: { backgroundColor: colors.bgElevated, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, paddingHorizontal: 14, paddingVertical: 11, color: colors.text, fontFamily: fonts.body, fontSize: 14 },
  viewRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  viewLabel: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.textMuted, marginRight: 4 },
  viewChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: radii.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgElevated },
  viewChipActive: { backgroundColor: colors.accentSoft, borderColor: colors.accent },
  viewText: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.textMuted },
  viewTextActive: { color: colors.text },
  chips: { paddingVertical: spacing.md, gap: 8, flexDirection: 'row', alignItems: 'center' },
  resultHeader: { paddingBottom: 12, gap: 3 },
  resultTitle: { fontFamily: fonts.display, fontSize: 17, color: colors.text },
  resultHint: { fontFamily: fonts.body, fontSize: 11, color: colors.textDim },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start' },
});
