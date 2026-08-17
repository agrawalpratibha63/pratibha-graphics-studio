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

  const floatFrames = featured.slice(0, 4);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingBottom: spacing.xxl }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.stage, { minHeight: Math.min(stageH, height * 0.92) }]}>
        <LinearGradient
          colors={['#120E0B', '#070605', '#0A0807']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.floorGlow} pointerEvents="none" />

        <View style={styles.floatLayer} pointerEvents="box-none">
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
        </View>

        <Animated.View style={[styles.hero, heroStyle]}>
          <View style={styles.availabilityRow}>
            <View style={styles.liveDot} />
            <Text style={styles.kicker}>Available for selected projects</Text>
          </View>
          <Text style={styles.brand} numberOfLines={2}>
            Visual identities{`\n`}built to be remembered.
          </Text>
          <Text style={styles.tag}>
            Brand systems, campaign graphics and digital experiences for founders and teams
            who want to look unmistakably their own.
          </Text>
          <View style={styles.heroActions}>
            <Pressable
              onPress={() => enterChamber('/library', 'Selected work')}
              style={styles.primaryAction}
            >
              <Text style={styles.primaryActionText}>Explore selected work</Text>
              <Text style={styles.actionArrow}>↗</Text>
            </Pressable>
            <Pressable
              onPress={() => Linking.openURL(`mailto:${profile.email}?subject=Project enquiry — Pratibha Graphics Studio`)}
              style={styles.secondaryAction}
            >
              <Text style={styles.secondaryActionText}>Start a project</Text>
            </Pressable>
          </View>
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

      <View style={styles.proofStrip}>
        {['Brand identity', 'Social campaigns', 'YouTube systems', 'Motion & reels'].map(
          (item, index) => (
            <View key={item} style={styles.proofItem}>
              <Text style={styles.proofNumber}>0{index + 1}</Text>
              <Text style={styles.proofText}>{item}</Text>
            </View>
          )
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionEyebrow}>Design capabilities</Text>
          <Text style={styles.sectionTitle}>One studio. Four ways to move a brand forward.</Text>
          <Text style={styles.sectionBody}>
            Thoughtful design systems made for real launches, real campaigns and consistent
            day-to-day communication.
          </Text>
        </View>
        <View style={styles.serviceGrid}>
          {[
            ['01', 'Brand identity', 'Logos, visual language, colour and typography systems that make a young brand feel established.'],
            ['02', 'Campaign design', 'Launch graphics, social campaigns and adaptable creative systems built for consistent output.'],
            ['03', 'Creator visuals', 'Thumbnail families, channel art and recognisable visual formats designed to earn attention.'],
            ['04', 'Motion stories', 'Reels, animated assets and presentation-led storytelling for products, events and communities.'],
          ].map(([number, title, copy]) => (
            <View key={number} style={styles.serviceCard}>
              <View style={styles.serviceTop}>
                <Text style={styles.serviceNumber}>{number}</Text>
                <Text style={styles.serviceArrow}>↗</Text>
              </View>
              <Text style={styles.serviceTitle}>{title}</Text>
              <Text style={styles.serviceCopy}>{copy}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.section, styles.processSection]}>
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionEyebrow}>A clear collaboration</Text>
          <Text style={styles.sectionTitle}>From brief to a system your team can actually use.</Text>
        </View>
        <View style={styles.processGrid}>
          {[
            ['Discover', 'We define the audience, business goal and visual opportunity.'],
            ['Direct', 'You receive a focused creative direction before production begins.'],
            ['Design', 'The selected direction becomes a consistent, flexible asset system.'],
            ['Deliver', 'Organised final files, usage guidance and launch-ready exports.'],
          ].map(([title, copy], index) => (
            <View key={title} style={styles.processStep}>
              <Text style={styles.processIndex}>0{index + 1}</Text>
              <View style={styles.processLine} />
              <Text style={styles.processTitle}>{title}</Text>
              <Text style={styles.processCopy}>{copy}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.ctaWrap}>
        <LinearGradient
          colors={['rgba(226,180,87,0.2)', 'rgba(18,16,14,0.96)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.ctaCard}
        >
          <Text style={styles.ctaKicker}>Have a project in mind?</Text>
          <Text style={styles.ctaTitle}>Let’s turn the brief into something people remember.</Text>
          <Text style={styles.ctaBody}>
            Share the goal, timeline and deliverables. You’ll receive a focused response with the
            best next step for your project.
          </Text>
          <Pressable
            onPress={() => Linking.openURL(`mailto:${profile.email}?subject=Project enquiry — Pratibha Graphics Studio`)}
            style={styles.ctaButton}
          >
            <Text style={styles.ctaButtonText}>Send project brief</Text>
            <Text style={styles.ctaButtonArrow}>→</Text>
          </Pressable>
        </LinearGradient>
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
    { x: 0.04, y: 0.18, s: 0.85, r: -7 },
    { x: 0.78, y: 0.16, s: 0.9, r: 5 },
    { x: 0.05, y: 0.58, s: 0.8, r: 4 },
    { x: 0.76, y: 0.55, s: 0.88, r: -4 },
  ][index] ?? { x: 0.8, y: 0.3, s: 0.8, r: 0 };

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
    overflow: 'visible',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    justifyContent: 'flex-start',
  },
  floatLayer: {
    ...StyleSheet.absoluteFill,
    zIndex: 1,
    overflow: 'hidden',
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
    zIndex: 0,
  },
  hero: {
    zIndex: 5,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    paddingTop: spacing.sm,
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.success,
    shadowColor: colors.success,
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  kicker: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: colors.accent,
    marginBottom: 6,
  },
  brand: {
    fontFamily: fonts.displayExtra,
    fontSize: 36,
    lineHeight: 44,
    color: colors.text,
    letterSpacing: -0.6,
    paddingVertical: 4,
  },
  tag: {
    marginTop: 10,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
    maxWidth: 420,
  },
  heroActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: spacing.lg,
  },
  primaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    borderRadius: radii.pill,
    paddingHorizontal: 18,
    paddingVertical: 13,
    backgroundColor: colors.accent,
  },
  primaryActionText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.ink,
  },
  actionArrow: {
    fontFamily: fonts.bodyBold,
    color: colors.ink,
    fontSize: 15,
  },
  secondaryAction: {
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radii.pill,
    paddingHorizontal: 18,
    paddingVertical: 13,
    backgroundColor: colors.glass,
  },
  secondaryActionText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.text,
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
    opacity: 0.55,
  },
  floatPress: {
    flex: 1,
  },
  floatImg: {
    width: '100%',
    height: '100%',
  },
  proofStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
    backgroundColor: colors.bgElevated,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  proofItem: {
    flexGrow: 1,
    flexBasis: 180,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  proofNumber: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.accentDim,
  },
  proofText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textMuted,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
    gap: spacing.xl,
  },
  sectionHeading: {
    maxWidth: 720,
    gap: 10,
  },
  sectionEyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    color: colors.accent,
  },
  sectionTitle: {
    fontFamily: fonts.displayExtra,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.7,
    color: colors.text,
  },
  sectionBody: {
    maxWidth: 560,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 23,
    color: colors.textMuted,
  },
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  serviceCard: {
    flexGrow: 1,
    flexBasis: 250,
    minHeight: 230,
    justifyContent: 'flex-end',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.bgCard,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.3,
    shadowRadius: 28,
  },
  serviceTop: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  serviceNumber: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: colors.accent,
    letterSpacing: 2,
  },
  serviceArrow: {
    fontFamily: fonts.body,
    fontSize: 18,
    color: colors.textDim,
  },
  serviceTitle: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.text,
    marginBottom: 8,
  },
  serviceCopy: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMuted,
  },
  processSection: {
    backgroundColor: colors.bgElevated,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.borderSoft,
  },
  processGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  processStep: {
    flexGrow: 1,
    flexBasis: 210,
    minHeight: 170,
  },
  processIndex: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 2,
    color: colors.accent,
  },
  processLine: {
    width: '100%',
    height: 1,
    marginVertical: spacing.md,
    backgroundColor: colors.border,
  },
  processTitle: {
    fontFamily: fonts.display,
    fontSize: 21,
    color: colors.text,
    marginBottom: 7,
  },
  processCopy: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMuted,
  },
  ctaWrap: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  ctaCard: {
    minHeight: 340,
    justifyContent: 'center',
    alignItems: 'flex-start',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    padding: spacing.xl,
    overflow: 'hidden',
  },
  ctaKicker: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    color: colors.accent,
    marginBottom: spacing.md,
  },
  ctaTitle: {
    maxWidth: 720,
    fontFamily: fonts.displayExtra,
    fontSize: 35,
    lineHeight: 41,
    color: colors.text,
  },
  ctaBody: {
    maxWidth: 580,
    marginTop: 12,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 23,
    color: colors.textMuted,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: radii.pill,
    backgroundColor: colors.paper,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  ctaButtonText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.ink,
  },
  ctaButtonArrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.ink,
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
