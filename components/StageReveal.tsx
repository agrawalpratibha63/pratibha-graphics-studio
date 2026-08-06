import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '@/constants/theme';

/** Curtain-lift reveal when a section mounts / gains focus */
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
      duration: 720,
      easing: Easing.out(Easing.cubic),
    });
  }, [triggerKey, progress]);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: (1 - progress.value) * 40 },
      { scale: 0.94 + progress.value * 0.06 },
    ],
  }));

  const veilStyle = useAnimatedStyle(() => ({
    opacity: Math.max(0, 1 - progress.value * 1.15),
    transform: [{ translateY: progress.value * -100 }],
  }));

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.content, contentStyle]}>{children}</Animated.View>
      <Animated.View pointerEvents="none" style={[styles.veil, veilStyle]} />
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
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.bgElevated,
    borderBottomWidth: 2,
    borderBottomColor: colors.accent,
  },
});
