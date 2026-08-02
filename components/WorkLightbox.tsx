import React, { useEffect } from 'react';
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useVideoPlayer, VideoView } from 'expo-video';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import type { Work } from '@/lib/types';
import { Button, Muted } from './ui';

function PreviewVideo({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
  });
  return (
    <VideoView
      player={player}
      style={styles.video}
      nativeControls
      contentFit="contain"
    />
  );
}

export function WorkLightbox({
  work,
  categoryName,
  visible,
  onClose,
  onOpenFull,
}: {
  work: Work | null;
  categoryName?: string;
  visible: boolean;
  onClose: () => void;
  onOpenFull: () => void;
}) {
  const { width, height } = useWindowDimensions();
  const scale = useSharedValue(0.92);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 16, stiffness: 180 });
      opacity.value = withSpring(1);
    } else {
      scale.value = 0.92;
      opacity.value = 0;
    }
  }, [visible, scale, opacity]);

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (!work) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View
          style={[
            styles.panel,
            panelStyle,
            { maxWidth: Math.min(width - 32, 720), maxHeight: height * 0.88 },
          ]}
        >
          <Pressable onPress={(e) => e.stopPropagation?.()}>
            <View style={styles.mediaWrap}>
              {work.media_type === 'image' ? (
                <Image
                  source={{ uri: work.storage_path }}
                  style={styles.image}
                  resizeMode="contain"
                />
              ) : work.media_type === 'video' ? (
                <PreviewVideo uri={work.storage_path} />
              ) : (
                <View style={styles.doc}>
                  <Text style={styles.docText}>{work.mime_type || 'Document'}</Text>
                </View>
              )}
            </View>
            <View style={styles.meta}>
              <Text style={styles.title}>{work.title}</Text>
              {!!work.description && <Muted>{work.description}</Muted>}
              <Text style={styles.badge}>
                {(categoryName ?? 'Work') + ' · ' + work.visibility}
              </Text>
              <View style={styles.actions}>
                <Button label="Open full view" onPress={onOpenFull} />
                <Button label="Close" variant="outline" onPress={onClose} />
              </View>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  panel: {
    width: '100%',
    backgroundColor: colors.bgElevated,
    borderRadius: radii.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  mediaWrap: {
    backgroundColor: '#1a1510',
    minHeight: 220,
    maxHeight: 420,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: 360,
  },
  video: {
    width: '100%',
    height: 320,
    backgroundColor: '#000',
  },
  doc: {
    padding: spacing.xl,
  },
  docText: {
    fontFamily: fonts.display,
    color: colors.accent,
    fontSize: 20,
  },
  meta: {
    padding: spacing.md,
    gap: 8,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.text,
  },
  badge: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.accentDim,
    textTransform: 'capitalize',
  },
  actions: {
    gap: 8,
    marginTop: 4,
  },
});
