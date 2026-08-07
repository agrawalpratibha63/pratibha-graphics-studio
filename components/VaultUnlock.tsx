import React, { useEffect, useMemo, useState } from 'react';
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
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useSegments } from 'expo-router';
import { useStudioExperience } from '@/contexts/StudioExperienceContext';
import { api } from '@/lib/api';
import type { Work } from '@/lib/types';
import { brand, colors, fonts, spacing } from '@/constants/theme';

function workUri(w: Work) {
  return w.media_type === 'image' ? w.storage_path : w.thumb_path || w.storage_path;
}

/** Once-per-session cinematic vault unlock overlay */
export function VaultUnlock() {
  const { isUnlocking, completeUnlock, skipUnlock } = useStudioExperience();
  const segments = useSegments();
  const { width, height } = useWindowDimensions();
  const [works, setWorks] = useState<Work[]>([]);

  const phase = useSharedValue(0);
  const doors = useSharedValue(0);
  const tunnel = useSharedValue(0);
  const fadeOut = useSharedValue(0);
  const wordmark = useSharedValue(0);

  useEffect(() => {
    if (!isUnlocking) return;
    let cancelled = false;
    api
      .getFeaturedWorks()
      .then((w) => {
        if (!cancelled) setWorks(w.slice(0, 8));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [isUnlocking]);

  useEffect(() => {
    if (!isUnlocking) return;

    wordmark.value = 0;
    doors.value = 0;
    tunnel.value = 0;
    fadeOut.value = 0;
    phase.value = 0;

    wordmark.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) });
    doors.value = withDelay(
      1100,
      withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.cubic) })
    );
    tunnel.value = withDelay(
      2200,
      withTiming(1, { duration: 3200, easing: Easing.in(Easing.cubic) })
    );
    fadeOut.value = withDelay(
      5400,
      withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) })
    );
    phase.value = withDelay(
      6200,
      withTiming(1, { duration: 200 }, (finished) => {
        if (finished) {
          // runOnJS not needed if we use setTimeout on JS
        }
      })
    );

    const t = setTimeout(() => completeUnlock(), 6400);
    return () => clearTimeout(t);
  }, [isUnlocking, completeUnlock, wordmark, doors, tunnel, fadeOut, phase]);

  const frames = useMemo(() => {
    const base = works.length
      ? works
      : Array.from({ length: 6 }).map((_, i) => ({ id: `p${i}` } as Work));
    return base.map((w, i) => ({
      work: w,
      uri: works.length ? workUri(w) : '',
      z: 40 + i * 80,
      x: ((i % 3) - 1) * 28,
      rot: ((i % 2) * 2 - 1) * (4 + (i % 3)),
      delay: i * 0.08,
    }));
  }, [works]);

  const rootStyle = useAnimatedStyle(() => ({
    opacity: 1 - fadeOut.value,
  }));

  const wordStyle = useAnimatedStyle(() => ({
    opacity: wordmark.value,
    transform: [
      { translateY: interpolate(wordmark.value, [0, 1], [24, 0]) },
      { scale: interpolate(wordmark.value, [0, 1], [0.92, 1]) },
    ],
  }));

  const slitStyle = useAnimatedStyle(() => ({
    opacity: interpolate(doors.value, [0, 0.2, 1], [0, 1, 0.35]),
    transform: [{ scaleY: interpolate(doors.value, [0, 0.35, 1], [0.05, 1, 1.2]) }],
  }));

  const leftDoor = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1200 },
      { rotateY: `${interpolate(doors.value, [0, 1], [0, -78])}deg` },
      { translateX: interpolate(doors.value, [0, 1], [0, -width * 0.15]) },
    ],
  }));

  const rightDoor = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1200 },
      { rotateY: `${interpolate(doors.value, [0, 1], [0, 78])}deg` },
      { translateX: interpolate(doors.value, [0, 1], [0, width * 0.15]) },
    ],
  }));

  const tunnelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(tunnel.value, [0, 0.15, 1], [0, 1, 1]),
    transform: [{ scale: interpolate(tunnel.value, [0, 1], [0.55, 2.6]) }],
  }));

  if (!isUnlocking || segments[0] === 'login') return null;

  return (
    <Animated.View style={[styles.root, { width, height }, rootStyle]} pointerEvents="auto">
      <LinearGradient
        colors={[colors.unlockVoid, colors.washStart, colors.washEnd]}
        style={StyleSheet.absoluteFill}
      />

      {/* Dust / beam atmosphere */}
      <View style={styles.haze} />
      <Animated.View style={[styles.slit, slitStyle]} />

      {/* Twin vault doors */}
      <View style={styles.doorRow}>
        <Animated.View style={[styles.door, styles.doorLeft, leftDoor]}>
          <LinearGradient
            colors={[colors.bgElevated, colors.heroWash, colors.bgCard]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.doorEdge} />
        </Animated.View>
        <Animated.View style={[styles.door, styles.doorRight, rightDoor]}>
          <LinearGradient
            colors={[colors.bgCard, colors.heroWash, colors.bgElevated]}
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.doorEdge, styles.doorEdgeRight]} />
        </Animated.View>
      </View>

      {/* Artwork tunnel */}
      <Animated.View style={[styles.tunnel, tunnelStyle]} pointerEvents="none">
        {frames.map((f, i) => (
          <View
            key={f.work.id || i}
            style={[
              styles.tunnelCard,
              {
                left: `${46 + f.x}%`,
                top: `${30 + (i % 4) * 12}%`,
                transform: [{ rotate: `${f.rot}deg` }, { scale: 1 - i * 0.04 }],
                zIndex: 10 - i,
              },
            ]}
          >
            {f.uri ? (
              <Image source={{ uri: f.uri }} style={styles.tunnelImg} />
            ) : (
              <View style={[styles.tunnelImg, styles.tunnelPlaceholder]} />
            )}
          </View>
        ))}
      </Animated.View>

      <Animated.View style={[styles.centerCopy, wordStyle]}>
        <Text style={styles.kicker}>Entering</Text>
        <Text style={styles.title}>{brand.name}</Text>
        <Text style={styles.sub}>A living gallery · unlock in progress</Text>
      </Animated.View>

      <Pressable onPress={skipUnlock} style={styles.skip} hitSlop={12}>
        <Text style={styles.skipText}>Skip</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    zIndex: 9999,
    elevation: 9999,
    backgroundColor: colors.ink,
    overflow: 'hidden',
  },
  haze: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.beam,
  },
  slit: {
    position: 'absolute',
    top: '8%',
    bottom: '8%',
    left: '50%',
    marginLeft: -1.5,
    width: 3,
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOpacity: 0.9,
    shadowRadius: 24,
  },
  doorRow: {
    ...StyleSheet.absoluteFill,
    flexDirection: 'row',
  },
  door: {
    flex: 1,
    borderColor: colors.glassBorder,
  },
  doorLeft: {
    borderRightWidth: 1,
  },
  doorRight: {
    borderLeftWidth: 1,
  },
  doorEdge: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: 10,
    backgroundColor: colors.accentSoft,
  },
  doorEdgeRight: {
    right: undefined,
    left: 0,
  },
  tunnel: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tunnelCard: {
    position: 'absolute',
    width: 160,
    height: 110,
    marginLeft: -80,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.bgCard,
  },
  tunnelImg: {
    width: '100%',
    height: '100%',
  },
  tunnelPlaceholder: {
    backgroundColor: colors.bgCard,
  },
  centerCopy: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  kicker: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    letterSpacing: 4,
    textTransform: 'uppercase',
    color: colors.accent,
    marginBottom: 10,
  },
  title: {
    fontFamily: fonts.displayExtra,
    fontSize: 36,
    color: colors.text,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  sub: {
    marginTop: 12,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
  skip: {
    position: 'absolute',
    bottom: 36,
    right: 28,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  skipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textDim,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
