import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/theme';

/** Chamber settle: scale-from-depth + light bloom when a section gains focus */
export function StageReveal({
  children,
  triggerKey,
}: {
  children: React.ReactNode;
  triggerKey: string;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, {
      duration: 860,
      easing: Easing.out(Easing.cubic),
    });
  }, [triggerKey, progress]);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [48, 0]) },
      { scale: interpolate(progress.value, [0, 1], [0.9, 1]) },
    ],
  }));

  const veilStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.55, 1], [1, 0.35, 0]),
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [0, -120]) },
      { scale: interpolate(progress.value, [0, 1], [1, 1.08]) },
    ],
  }));

  const bloomStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.3, 0.7, 1], [0, 0.5, 0.2, 0]),
  }));

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.content, contentStyle]}>{children}</Animated.View>
      <Animated.View pointerEvents="none" style={[styles.veil, veilStyle]}>
        <LinearGradient
          colors={[colors.bgElevated, colors.bg]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <Animated.View pointerEvents="none" style={[styles.bloom, bloomStyle]}>
        <LinearGradient
          colors={['rgba(226,180,87,0.28)', 'transparent']}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
  },
  veil: {
    ...StyleSheet.absoluteFill,
    borderBottomWidth: 2,
    borderBottomColor: colors.accent,
  },
  bloom: {
    ...StyleSheet.absoluteFill,
  },
});
