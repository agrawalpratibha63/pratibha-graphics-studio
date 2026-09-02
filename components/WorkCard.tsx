import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { colors, fonts, radii } from '@/constants/theme';
import type { Work } from '@/lib/types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function WorkCard({
  work,
  width,
  categoryName,
  onPress,
  onLongPress,
}: {
  work: Work;
  width: number;
  categoryName?: string;
  onPress: () => void;
  onLongPress?: () => void;
}) {
  const motion = useSharedValue(0);
  const [imgError, setImgError] = useState(false);
  const style = useAnimatedStyle(() => ({
    transform: [
      { perspective: 900 },
      { translateY: interpolate(motion.value, [0, 1], [0, -7]) },
      { rotateX: `${interpolate(motion.value, [0, 1], [0, 2.2])}deg` },
      { rotateY: `${interpolate(motion.value, [0, 1], [0, -2.2])}deg` },
      { scale: interpolate(motion.value, [0, 1], [1, 1.025]) },
    ],
  }));

  const previewUri =
    work.media_type === 'image'
      ? work.storage_path
      : work.thumb_path || work.storage_path;
  const showImage = Boolean(previewUri) && !imgError && work.media_type !== 'document';
  const intro = work.description?.trim() || 'A selected visual from the Pratibha Graphics Studio portfolio.';

  return (
    <AnimatedPressable
      onPress={onPress}
      onLongPress={onLongPress}
      onHoverIn={() => {
        motion.value = withSpring(1, { damping: 16, stiffness: 190 });
      }}
      onHoverOut={() => {
        motion.value = withSpring(0, { damping: 16, stiffness: 190 });
      }}
      onPressIn={() => {
        motion.value = withSpring(0.45);
      }}
      onPressOut={() => {
        motion.value = withSpring(0);
      }}
      style={[styles.card, style, { width }]}
    >
      <View style={styles.mediaWrap}>
        {showImage ? (
          <Image
            source={{ uri: previewUri }}
            style={styles.media}
            resizeMode="cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <View style={[styles.media, styles.fallback]}>
            <Text style={styles.fallbackText}>
              {work.media_type === 'video' ? '▶ MOTION' : work.media_type === 'document' ? 'CASE FILE' : 'VISUAL'}
            </Text>
          </View>
        )}
        <View style={styles.shade} />
        {work.visibility === 'featured' && (
          <View style={styles.corner}>
            <Text style={styles.cornerText}>FEATURED</Text>
          </View>
        )}
        <View style={styles.mediaLabel}>
          <Text style={styles.mediaLabelText}>{categoryName || 'Selected work'}</Text>
        </View>
      </View>
      <View style={styles.meta}>
        <View style={styles.titleRow}>
          <Text numberOfLines={2} style={styles.title}>
            {work.title}
          </Text>
          <Text style={styles.arrow}>↗</Text>
        </View>
        <Text numberOfLines={3} style={styles.description}>
          {intro}
        </Text>
        <Text style={styles.caseLink}>View project story</Text>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.bgCard,
    marginBottom: 14,
  },
  mediaWrap: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1.12,
    backgroundColor: colors.bgElevated,
    overflow: 'hidden',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  shade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '34%',
    backgroundColor: 'rgba(7,6,5,0.25)',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentSoft,
  },
  fallbackText: {
    fontFamily: fonts.bodyBold,
    color: colors.accentDim,
    fontSize: 12,
    letterSpacing: 1,
    textAlign: 'center',
    paddingHorizontal: 6,
  },
  corner: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(18,14,11,0.82)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  cornerText: {
    fontFamily: fonts.bodyBold,
    color: colors.accent,
    fontSize: 8,
    letterSpacing: 1,
  },
  mediaLabel: {
    position: 'absolute',
    left: 9,
    bottom: 9,
    backgroundColor: 'rgba(7,6,5,0.76)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
  },
  mediaLabelText: {
    fontFamily: fonts.bodyMedium,
    color: '#FFF9F2',
    fontSize: 9,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  meta: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 124,
    gap: 7,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  title: {
    flex: 1,
    fontFamily: fonts.display,
    color: colors.text,
    fontSize: 16,
    lineHeight: 20,
  },
  arrow: {
    fontFamily: fonts.bodyBold,
    color: colors.accent,
    fontSize: 14,
  },
  description: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
  caseLink: {
    marginTop: 2,
    fontFamily: fonts.bodyBold,
    color: colors.accent,
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});
