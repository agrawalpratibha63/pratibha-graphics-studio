import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, radii, spacing } from '@/constants/theme';

type Portal = {
  key: string;
  label: string;
  subtitle: string;
  href: string;
};

export function VaultPortals({
  portals,
  onOpen,
}: {
  portals: Portal[];
  onOpen: (href: string) => void;
}) {
  const [opening, setOpening] = useState<string | null>(null);

  return (
    <View style={styles.wrap}>
      <Text style={styles.kicker}>Chambers</Text>
      <Text style={styles.title}>Tap a door — something waits behind</Text>
      <View style={styles.grid}>
        {portals.map((p) => (
          <PortalDoor
            key={p.key}
            portal={p}
            busy={opening !== null}
            opening={opening === p.key}
            onPress={() => {
              if (opening) return;
              setOpening(p.key);
            }}
            onOpened={() => {
              onOpen(p.href);
              setTimeout(() => setOpening(null), 80);
            }}
          />
        ))}
      </View>
    </View>
  );
}

function PortalDoor({
  portal,
  busy,
  opening,
  onPress,
  onOpened,
}: {
  portal: Portal;
  busy: boolean;
  opening: boolean;
  onPress: () => void;
  onOpened: () => void;
}) {
  const reveal = useSharedValue(0);
  const left = useSharedValue(0);
  const right = useSharedValue(0);
  const active = useSharedValue(0);

  useEffect(() => {
    if (!opening) {
      reveal.value = 0;
      left.value = 0;
      right.value = 0;
      active.value = 0;
      return;
    }
    active.value = 1;
    left.value = withTiming(-1, { duration: 480, easing: Easing.inOut(Easing.cubic) });
    right.value = withTiming(1, { duration: 480, easing: Easing.inOut(Easing.cubic) });
    reveal.value = withDelay(
      120,
      withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) }, (finished) => {
        if (finished) runOnJS(onOpened)();
      })
    );
  }, [opening, left, right, reveal, active, onOpened]);

  const leftStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: left.value * 160 }],
    opacity: active.value * interpolate(left.value, [0, -1], [0.85, 0]),
  }));
  const rightStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: right.value * 160 }],
    opacity: active.value * interpolate(right.value, [0, 1], [0.85, 0]),
  }));
  const behindStyle = useAnimatedStyle(() => ({
    opacity: reveal.value,
    transform: [
      { translateY: interpolate(reveal.value, [0, 1], [56, 0]) },
      { scale: interpolate(reveal.value, [0, 1], [0.86, 1]) },
    ],
  }));
  const faceStyle = useAnimatedStyle(() => ({
    opacity: 1 - reveal.value * 0.85,
  }));
  const cardStyle = useAnimatedStyle(() => ({
    borderColor: active.value > 0 ? colors.accent : colors.border,
    transform: [{ scale: 1 + active.value * 0.015 }],
  }));

  return (
    <Pressable
      disabled={busy}
      onPress={onPress}
      style={({ pressed }) => [styles.cardPress, pressed && !busy && { opacity: 0.92 }]}
    >
      <Animated.View style={[styles.card, cardStyle]}>
        {/* Layer behind the face — emerges on click */}
        <Animated.View style={[styles.behind, behindStyle]} pointerEvents="none">
          <LinearGradient
            colors={['rgba(226,180,87,0.35)', 'rgba(18,16,14,0.95)']}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.behindText}>Entering {portal.label}</Text>
        </Animated.View>

        <Animated.View style={[styles.face, faceStyle]}>
          <Text style={styles.label}>{portal.label}</Text>
          <Text style={styles.sub}>{portal.subtitle}</Text>
          <Text style={styles.hint}>Tap — reveal</Text>
        </Animated.View>

        {/* Split shutters that slide away */}
        <View style={styles.doorStage} pointerEvents="none">
          <Animated.View style={[styles.door, styles.doorLeft, leftStyle]} />
          <Animated.View style={[styles.door, styles.doorRight, rightStyle]} />
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  kicker: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: colors.accent,
  },
  title: {
    fontFamily: fonts.displayExtra,
    fontSize: 28,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  grid: {
    gap: 12,
  },
  cardPress: {
    width: '100%',
  },
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
    minHeight: 118,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  face: {
    padding: spacing.lg,
    zIndex: 2,
  },
  behind: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  behindText: {
    fontFamily: fonts.displayExtra,
    fontSize: 22,
    color: colors.accent,
    letterSpacing: 0.5,
  },
  label: {
    fontFamily: fonts.displayExtra,
    fontSize: 26,
    color: colors.text,
  },
  sub: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
    maxWidth: '78%',
  },
  hint: {
    marginTop: 10,
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.accentDim,
    textTransform: 'uppercase',
  },
  doorStage: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    zIndex: 3,
  },
  door: {
    flex: 1,
    backgroundColor: 'rgba(12,10,9,0.72)',
    borderColor: colors.glassBorder,
  },
  doorLeft: {
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  doorRight: {
    borderLeftWidth: StyleSheet.hairlineWidth,
  },
});
