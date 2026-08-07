import React, { useEffect } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import type { Work } from '@/lib/types';

const CARD_W = 220;
const CARD_H = 140;
const GAP = 14;

export function FeaturedTrain({
  works,
  onPressWork,
}: {
  works: Work[];
  onPressWork: (work: Work) => void;
}) {
  const { width } = useWindowDimensions();
  const items = works.length > 0 ? works : [];
  const loop = items.length > 0 ? [...items, ...items, ...items] : [];
  const trackWidth = loop.length * (CARD_W + GAP);
  const translateX = useSharedValue(0);

  useEffect(() => {
    if (loop.length === 0) return;
    const distance = items.length * (CARD_W + GAP);
    translateX.value = 0;
    translateX.value = withRepeat(
      withTiming(-distance, {
        duration: Math.max(12000, items.length * 3500),
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, [items.length, loop.length, translateX]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  if (items.length === 0) {
    return (
      <View style={[styles.empty, { width }]}>
        <Text style={styles.emptyText}>Featured work will loop here once you mark images as featured.</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Text style={styles.kicker}>Now showing</Text>
        <Text style={styles.header}>Featured reel</Text>
      </View>
      <View style={styles.viewport}>
        <Animated.View style={[styles.track, { width: trackWidth }, style]}>
          {loop.map((work, index) => (
            <Pressable
              key={`${work.id}_${index}`}
              onPress={() => onPressWork(work)}
              style={styles.card}
            >
              <Image source={{ uri: work.storage_path }} style={styles.image} />
              <View style={styles.caption}>
                <Text numberOfLines={1} style={styles.captionText}>
                  {work.title}
                </Text>
              </View>
            </Pressable>
          ))}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
  },
  headerRow: {
    paddingHorizontal: spacing.lg,
    gap: 4,
  },
  kicker: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.accentDim,
  },
  header: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.text,
  },
  viewport: {
    overflow: 'hidden',
    height: CARD_H + 8,
  },
  track: {
    flexDirection: 'row',
    gap: GAP,
    paddingLeft: spacing.lg,
  },
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: radii.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  caption: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: 'rgba(21, 32, 43, 0.62)',
  },
  captionText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.paper,
  },
  empty: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    fontSize: 14,
  },
});
