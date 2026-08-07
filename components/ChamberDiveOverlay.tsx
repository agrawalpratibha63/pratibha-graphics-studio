import React from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useStudioExperience } from '@/contexts/StudioExperienceContext';
import { colors, fonts } from '@/constants/theme';

/** Full-screen dive when entering a chamber from the foyer */
export function ChamberDiveOverlay() {
  const { diveActive, diveLabel } = useStudioExperience();
  const { width, height } = useWindowDimensions();
  const progress = useSharedValue(0);

  React.useEffect(() => {
    if (diveActive) {
      progress.value = 0;
      progress.value = withTiming(1, { duration: 900, easing: Easing.inOut(Easing.cubic) });
    } else {
      progress.value = withTiming(0, { duration: 280 });
    }
  }, [diveActive, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.15, 0.75, 1], [0, 1, 1, 0]),
    transform: [{ scale: interpolate(progress.value, [0, 1], [0.72, 1.35]) }],
  }));

  const bloom = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.4, 1], [0, 0.55, 0]),
  }));

  if (!diveActive && progress.value === 0) {
    // still render while animating out — use diveActive gate for mount
  }

  if (!diveActive) return null;

  return (
    <View style={[styles.root, { width, height }]} pointerEvents="none">
      <Animated.View style={[styles.bloom, bloom]}>
        <LinearGradient
          colors={['rgba(226,180,87,0.45)', 'transparent']}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <Animated.View style={[styles.card, style]}>
        <Text style={styles.label}>Entering</Text>
        <Text style={styles.title}>{diveLabel}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    zIndex: 9000,
    elevation: 9000,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(7,6,5,0.55)',
  },
  bloom: {
    ...StyleSheet.absoluteFill,
  },
  card: {
    paddingHorizontal: 28,
    paddingVertical: 22,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.glass,
    alignItems: 'center',
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: colors.accent,
  },
  title: {
    marginTop: 8,
    fontFamily: fonts.displayExtra,
    fontSize: 32,
    color: colors.text,
  },
});
