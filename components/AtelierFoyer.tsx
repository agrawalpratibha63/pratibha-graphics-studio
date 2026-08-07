import React, { useEffect } from 'react';
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  Easing,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useStudioExperience } from '@/contexts/StudioExperienceContext';
import { brand, colors, fonts, radii, spacing } from '@/constants/theme';
import type { OwnerProfile, Work } from '@/lib/types';
import { Body, Muted } from '@/components/ui';

function workUri(w: Work) {
  return w.media_type === 'image' ? w.storage_path : w.thumb_path || w.storage_path;
}

type Chamber = {
  key: string;
  label: string;
  subtitle: string;
  href: string;
};

export function AtelierFoyer({
  profile,
  featured,
  chambers,
  onPressWork,
}: {
  profile: OwnerProfile;
  featured: Work[];
  chambers: Chamber[];
  onPressWork: (work: Work) => void;
}) {
  const { enterChamber } = useStudioExperience();
  const { width, height } = useWindowDimensions();
  const stageH = Math.max(height * 0.88, height >= 720 ? 640 : 520);
  const enter = useSharedValue(0);
  const drift = useSharedValue(0);

  useEffect(() => {
    enter.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.cubic) });
    drift.value = withRepeat(
      withTiming(1, { duration: 9000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, [enter, drift]);

  const heroStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ translateY: interpolate(enter.value, [0, 1], [30, 0]) }],
  }));

  const floatFrames = featured.slice(0, 5);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingBottom: spacing.xxl }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.stage, { minHeight: stageH, height: stageH }]}>
        <LinearGradient
          colors={['#120E0B', '#070605', '#0A0807']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.floorGlow} />

        {floatFrames.map((work, i) => (
          <FloatFrame
            key={work.id}
            uri={workUri(work)}
            index={i}
            width={width}
            height={stageH}
            drift={drift}
            onPress={() => onPressWork(work)}
          />
        ))}

        <Animated.View style={[styles.hero, heroStyle]}>
          <Text style={styles.kicker}>You are inside</Text>
          <Text style={styles.brand}>{brand.name}</Text>
          <Text style={styles.tag}>Step into a chamber — the walls will open</Text>
        </Animated.View>

        <View style={styles.doorRow}>
          {chambers.map((c, i) => (
            <ChamberDoor
              key={c.key}
              chamber={c}
              delay={i * 120}
              enter={enter}
              onOpen={() => enterChamber(c.href, c.label)}
            />
          ))}
        </View>
      </View>

      {/* Quiet plaque — secondary */}
      <View style={styles.plaque}>
        <Text style={styles.plaqueKicker}>Atelier plaque</Text>
        <View style={styles.plaqueInner}>
          {profile.photo_url ? (
            <Image source={{ uri: profile.photo_url }} style={styles.photo} />
          ) : (
            <View style={[styles.photo, styles.photoPh]}>
              <Text style={styles.initials}>
                {profile.display_name.slice(0, 2).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{profile.display_name}</Text>
            <Muted>Graphic Designer · Living Gallery</Muted>
            <Body style={styles.bio}>
              {profile.bio}
            </Body>
            <Pressable onPress={() => Linking.openURL(`mailto:${profile.email}`)}>
              <Text style={styles.mail}>{profile.email}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function FloatFrame({
  uri,
  index,
  width,
  height,
  drift,
  onPress,
}: {
  uri: string;
  index: number;
  width: number;
  height: number;
  drift: SharedValue<number>;
  onPress: () => void;
}) {
  const layout = [
    { x: 0.06, y: 0.12, s: 0.9, r: -8 },
    { x: 0.72, y: 0.1, s: 1, r: 6 },
    { x: 0.08, y: 0.48, s: 0.85, r: 4 },
    { x: 0.7, y: 0.42, s: 0.92, r: -5 },
    { x: 0.4, y: 0.08, s: 0.75, r: 3 },
  ][index] ?? { x: 0.5, y: 0.2, s: 0.8, r: 0 };

  const cardW = Math.min(150, width * 0.22);

  const style = useAnimatedStyle(() => {
    const dy = interpolate(drift.value, [0, 1], [-8, 10]) * (index % 2 === 0 ? 1 : -1);
    return {
      transform: [
        { translateY: dy },
        { rotate: `${layout.r}deg` },
        { scale: layout.s },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.float,
        {
          left: width * layout.x,
          top: height * layout.y,
          width: cardW,
          height: cardW * 0.72,
        },
        style,
      ]}
    >
      <Pressable onPress={onPress} style={styles.floatPress}>
        {uri ? (
          <Image source={{ uri }} style={styles.floatImg} />
        ) : (
          <View style={[styles.floatImg, { backgroundColor: colors.bgCard }]} />
        )}
      </Pressable>
    </Animated.View>
  );
}

function ChamberDoor({
  chamber,
  delay,
  enter,
  onOpen,
}: {
  chamber: Chamber;
  delay: number;
  enter: SharedValue<number>;
  onOpen: () => void;
}) {
  const open = useSharedValue(0);
  const appear = useSharedValue(0);

  useEffect(() => {
    appear.value = withDelay(
      400 + delay,
      withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) })
    );
  }, [appear, delay]);

  const style = useAnimatedStyle(() => ({
    opacity: appear.value * enter.value,
    transform: [
      { translateY: interpolate(appear.value, [0, 1], [40, 0]) },
      { scale: 1 + open.value * 0.03 },
    ],
    borderColor: open.value > 0 ? colors.accent : colors.border,
  }));

  const spill = useAnimatedStyle(() => ({
    opacity: open.value * 0.85,
  }));

  return (
    <Pressable
      onPress={() => {
        open.value = withTiming(1, { duration: 320 }, () => {
          // navigation handled by parent after short beat
        });
        setTimeout(onOpen, 280);
      }}
      style={styles.doorPress}
    >
      <Animated.View style={[styles.door, style]}>
        <Animated.View style={[styles.spill, spill]} pointerEvents="none">
          <LinearGradient
            colors={['rgba(226,180,87,0.4)', 'transparent']}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
        <Text style={styles.doorLabel}>{chamber.label}</Text>
        <Text style={styles.doorSub}>{chamber.subtitle}</Text>
        <Text style={styles.doorHint}>Walk in</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  stage: {
    position: 'relative',
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
    justifyContent: 'flex-end',
    paddingBottom: spacing.xl,
  },
  floorGlow: {
    position: 'absolute',
    left: '10%',
    right: '10%',
    bottom: 0,
    height: 120,
    backgroundColor: 'rgba(226,180,87,0.06)',
    borderTopLeftRadius: 200,
    borderTopRightRadius: 200,
  },
  hero: {
    zIndex: 5,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  kicker: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: colors.accent,
  },
  brand: {
    marginTop: 8,
    fontFamily: fonts.displayExtra,
    fontSize: 40,
    color: colors.text,
    letterSpacing: -0.8,
  },
  tag: {
    marginTop: 8,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textMuted,
    maxWidth: 420,
  },
  doorRow: {
    zIndex: 6,
    paddingHorizontal: spacing.lg,
    gap: 12,
  },
  doorPress: {
    width: '100%',
  },
  door: {
    minHeight: 108,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(18,16,14,0.88)',
    padding: spacing.lg,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  spill: {
    ...StyleSheet.absoluteFill,
  },
  doorLabel: {
    fontFamily: fonts.displayExtra,
    fontSize: 28,
    color: colors.text,
  },
  doorSub: {
    marginTop: 4,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
    maxWidth: '85%',
  },
  doorHint: {
    marginTop: 10,
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.accentDim,
  },
  float: {
    position: 'absolute',
    zIndex: 2,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.bgCard,
  },
  floatPress: {
    flex: 1,
  },
  floatImg: {
    width: '100%',
    height: '100%',
  },
  plaque: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  plaqueKicker: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.textDim,
  },
  plaqueInner: {
    flexDirection: 'row',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radii.lg,
    padding: spacing.md,
    backgroundColor: colors.bgElevated,
  },
  photo: {
    width: 72,
    height: 72,
    borderRadius: radii.md,
  },
  photoPh: {
    backgroundColor: colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily: fonts.displayExtra,
    color: colors.accent,
    fontSize: 20,
  },
  name: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.text,
  },
  bio: {
    marginTop: 6,
    color: colors.textMuted,
  },
  mail: {
    marginTop: 8,
    fontFamily: fonts.bodyMedium,
    color: colors.accent,
    fontSize: 13,
  },
});
