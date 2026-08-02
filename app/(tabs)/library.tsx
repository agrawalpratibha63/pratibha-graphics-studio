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
import { Chip, LoadingBlock, Muted, Subtitle } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import type { Category, Work } from '@/lib/types';
import { colors, fonts, radii, spacing } from '@/constants/theme';

type Density = 'tiny' | 'cozy' | 'comfy';

function columnsFor(width: number, density: Density) {
  if (density === 'tiny') {
    if (width >= 1100) return 6;
    if (width >= 800) return 5;
    if (width >= 560) return 4;
    return 3;
  }
  if (density === 'cozy') {
    if (width >= 1000) return 5;
    if (width >= 720) return 4;
    if (width >= 480) return 3;
    return 2;
  }
  if (width >= 900) return 4;
  if (width >= 600) return 3;
  return 2;
}

export default function LibraryScreen() {
  const { isOwner } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [categories, setCategories] = useState<Category[]>([]);
  const [works, setWorks] = useState<Work[]>([]);
  const [active, setActive] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [density, setDensity] = useState<Density>('tiny');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<Work | null>(null);

  const pad = spacing.md;
  const gap = 8;
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
      setError(e instanceof Error ? e.message : 'Failed to load library');
      setWorks([]);
    }
  }, [isOwner]);

  useFocusEffect(
    useCallback(() => {
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
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={{ flex: 1 }}>
            <Subtitle>Library</Subtitle>
            <Muted>
              {filtered.length} piece{filtered.length === 1 ? '' : 's'}
              {isOwner ? ' · owner view' : ' · shared works'} · tap to enlarge
            </Muted>
          </View>
        </View>

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search titles, categories..."
          placeholderTextColor={colors.textDim}
          style={styles.search}
        />

        <View style={styles.densityRow}>
          <Text style={styles.densityLabel}>Size</Text>
          {([
            ['tiny', 'Small'],
            ['cozy', 'Medium'],
            ['comfy', 'Large'],
          ] as const).map(([key, label]) => (
            <Pressable
              key={key}
              onPress={() => setDensity(key)}
              style={[styles.densityChip, density === key && styles.densityChipActive]}
            >
              <Text
                style={[
                  styles.densityText,
                  density === key && styles.densityTextActive,
                ]}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {[{ id: 'all', name: 'All' } as Category, ...categories].map((item) => (
          <Chip
            key={item.id}
            label={item.name}
            active={active === item.id}
            onPress={() => setActive(item.id)}
          />
        ))}
      </ScrollView>

      {error ? (
        <Muted style={{ padding: spacing.md, color: colors.danger }}>{error}</Muted>
      ) : null}

      <ScrollView contentContainerStyle={[styles.grid, { paddingHorizontal: pad }]}>
        {filtered.length === 0 ? (
          <Muted style={{ paddingVertical: spacing.lg }}>
            {works.length === 0
              ? 'No works found. Open Admin → Import starter library.'
              : 'No works match this filter.'}
          </Muted>
        ) : (
          <View style={[styles.wrap, { gap }]}>
            {filtered.map((item) => (
              <WorkCard
                key={item.id}
                work={item}
                width={cardWidth}
                onPress={() => setPreview(item)}
                onLongPress={() => router.push(`/work/${item.id}`)}
              />
            ))}
          </View>
        )}
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
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    gap: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  search: {
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 14,
  },
  densityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  densityLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.textMuted,
    marginRight: 4,
  },
  densityChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgElevated,
  },
  densityChipActive: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  densityText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.textMuted,
  },
  densityTextActive: {
    color: colors.text,
  },
  chips: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  grid: {
    paddingBottom: spacing.xxl,
    paddingTop: 4,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
