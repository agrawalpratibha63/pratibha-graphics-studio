import React, { useEffect, useMemo } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, radii } from '@/constants/theme';
import { getStarterWorks } from '@/lib/media-assets';

type FrameSpec = {
  uri: string;
  title: string;
  x: number;
  y: number;
  size: number;
  rotate: number;
  delay: number;
  duration: number;
  drift: number;
};

function FloatingFrame({
  spec,
  hovered,
  onHover,
}: {
  spec: FrameSpec;
  hovered: boolean;
  onHover: (v: boolean) => void;
}) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withDelay(
      spec.delay,
      withRepeat(
        withTiming(1, {
          duration: spec.duration,
          easing: Easing.inOut(Easing.sin),
        }),
        -1,
        true
      )
    );
  }, [spec.delay, spec.duration, t]);

  const style = useAnimatedStyle(() => {
    const y = interpolate(t.value, [0, 1], [0, -spec.drift]);
    const r = interpolate(t.value, [0, 1], [spec.rotate, spec.rotate + 2.5]);
    const scale = hovered ? 1.08 : 1;
    return {
      transform: [
        { translateY: y },
        { rotate: `${r}deg` },
        { scale },
      ],
      zIndex: hovered ? 20 : 1,
    };
  });

  return (
    <Animated.View
      style={[
        styles.frame,
        style,
        {
          left: `${spec.x}%`,
          top: `${spec.y}%`,
          width: spec.size,
          height: spec.size * 1.15,
        },
      ]}
    >
      <Pressable
        onHoverIn={() => onHover(true)}
        onHoverOut={() => onHover(false)}
        onPressIn={() => onHover(true)}
        onPressOut={() => onHover(false)}
        style={styles.frameInner}
      >
        <Image source={{ uri: spec.uri }} style={styles.frameImage} />
        <LinearGradient
          colors={['transparent', 'rgba(21, 32, 43, 0.55)']}
          style={styles.frameShade}
        />
        <Text numberOfLines={1} style={styles.frameTitle}>
          {spec.title}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

function DriftLane({
  works,
  reverse,
  top,
}: {
  works: Array<{ uri: string; title: string }>;
  reverse?: boolean;
  top: number;
}) {
  const { width } = useWindowDimensions();
  const x = useSharedValue(0);
  const card = 140;
  const gap = 18;
  const loop = [...works, ...works, ...works];
  const track = loop.length * (card + gap);

  useEffect(() => {
    x.value = reverse ? -track / 3 : 0;
    x.value = withRepeat(
      withTiming(reverse ? 0 : -track / 3, {
        duration: 42000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, [reverse, track, x]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { perspective: 900 },
      { rotateX: '18deg' },
      { translateX: x.value },
    ],
  }));

  return (
    <View style={[styles.lane, { top, width }]} pointerEvents="none">
      <Animated.View style={[styles.laneTrack, { width: track }, style]}>
        {loop.map((w, i) => (
          <View key={`${w.title}_${i}`} style={[styles.laneCard, { width: card }]}>
            <Image source={{ uri: w.uri }} style={styles.laneImage} />
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

export function CinematicGalleryBg() {
  const starters = useMemo(
    () =>
      getStarterWorks()
        .filter((w) => w.media_type === 'image')
        .map((w) => ({ uri: w.uri, title: w.title })),
    []
  );
  const [hoverKey, setHoverKey] = React.useState<string | null>(null);

  const frames: FrameSpec[] = useMemo(() => {
    // Keep floating frames on the RIGHT so they don't cover login hero copy
    const layout = [
      { x: 62, y: 8, size: 150, rotate: 5, delay: 0, duration: 5200, drift: 18 },
      { x: 78, y: 38, size: 128, rotate: -6, delay: 400, duration: 6100, drift: 22 },
      { x: 58, y: 52, size: 118, rotate: 4, delay: 200, duration: 5800, drift: 16 },
      { x: 84, y: 68, size: 110, rotate: -4, delay: 700, duration: 6400, drift: 20 },
    ];
    return layout.map((L, i) => ({
      ...L,
      uri: starters[i % Math.max(starters.length, 1)]?.uri ?? '',
      title: starters[i % Math.max(starters.length, 1)]?.title ?? 'Work',
    }));
  }, [starters]);

  const beam = useSharedValue(0);
  useEffect(() => {
    beam.value = withRepeat(
      withTiming(1, { duration: 8000, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, [beam]);
  const beamStyle = useAnimatedStyle(() => ({
    opacity: interpolate(beam.value, [0, 1], [0.25, 0.55]),
    transform: [{ translateX: interpolate(beam.value, [0, 1], [-40, 40]) }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <LinearGradient
        colors={[colors.washStart, colors.washMid, colors.heroWash]}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View style={[styles.beam, beamStyle]} />
      <DriftLane works={starters} top={18} />
      <DriftLane works={[...starters].reverse()} reverse top={58} />

      {frames.map((f) => (
        <FloatingFrame
          key={`${f.title}_${f.x}`}
          spec={f}
          hovered={hoverKey === `${f.title}_${f.x}`}
          onHover={(v) => setHoverKey(v ? `${f.title}_${f.x}` : null)}
        />
      ))}

      <LinearGradient
        colors={['rgba(240, 243, 246, 0.2)', 'rgba(240, 243, 246, 0.55)', 'rgba(240, 243, 246, 0.92)']}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View style={styles.grain} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  beam: {
    position: 'absolute',
    top: '-10%',
    left: '20%',
    width: '55%',
    height: '120%',
    backgroundColor: colors.beam,
    transform: [{ rotate: '18deg' }],
  },
  grain: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.05,
    backgroundColor: colors.accent,
  },
  frame: {
    position: 'absolute',
    borderRadius: radii.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.bgCard,
    shadowColor: '#15202B',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
  frameInner: {
    flex: 1,
  },
  frameImage: {
    width: '100%',
    height: '100%',
  },
  frameShade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: '45%',
  },
  frameTitle: {
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: 8,
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    color: colors.paper,
  },
  lane: {
    position: 'absolute',
    height: 120,
    overflow: 'hidden',
    opacity: 0.35,
  },
  laneTrack: {
    flexDirection: 'row',
    gap: 18,
  },
  laneCard: {
    height: 100,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  laneImage: {
    width: '100%',
    height: '100%',
  },
});
