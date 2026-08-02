import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
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
  onPress,
  onLongPress,
}: {
  work: Work;
  width: number;
  onPress: () => void;
  onLongPress?: () => void;
}) {
  const scale = useSharedValue(1);
  const [imgError, setImgError] = useState(false);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const previewUri =
    work.media_type === 'image'
      ? work.storage_path
      : work.thumb_path || work.storage_path;
  const showImage = Boolean(previewUri) && !imgError && work.media_type !== 'document';

  return (
    <AnimatedPressable
      onPress={onPress}
      onLongPress={onLongPress}
      onHoverIn={() => {
        scale.value = withSpring(1.04, { damping: 14, stiffness: 220 });
      }}
      onHoverOut={() => {
        scale.value = withSpring(1);
      }}
      onPressIn={() => {
        scale.value = withSpring(0.96);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
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
              {work.media_type === 'video' ? '▶ VIDEO' : work.media_type === 'document' ? 'DOC' : 'IMG'}
            </Text>
          </View>
        )}
        {work.visibility === 'featured' && (
          <View style={styles.corner}>
            <Text style={styles.cornerText}>★</Text>
          </View>
        )}
        {work.media_type === 'video' && (
          <View style={styles.playBadge}>
            <Text style={styles.playText}>VIDEO</Text>
          </View>
        )}
      </View>
      <View style={styles.meta}>
        <Text numberOfLines={2} style={styles.title}>
          {work.title}
        </Text>
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
    marginBottom: 10,
  },
  mediaWrap: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.bgElevated,
  },
  media: {
    width: '100%',
    height: '100%',
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
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(44,33,24,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cornerText: {
    color: colors.accent,
    fontSize: 11,
  },
  playBadge: {
    position: 'absolute',
    left: 6,
    bottom: 6,
    backgroundColor: 'rgba(44,33,24,0.75)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  playText: {
    fontFamily: fonts.bodyBold,
    color: '#FFF9F2',
    fontSize: 9,
    letterSpacing: 0.8,
  },
  meta: {
    paddingHorizontal: 8,
    paddingVertical: 7,
    minHeight: 42,
  },
  title: {
    fontFamily: fonts.bodyMedium,
    color: colors.text,
    fontSize: 11,
    lineHeight: 14,
  },
});
