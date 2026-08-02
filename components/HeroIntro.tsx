import React from 'react';
import { Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { brand, colors, fonts, radii, spacing } from '@/constants/theme';
import type { OwnerProfile } from '@/lib/types';
import { Body, Muted } from './ui';

export function HeroIntro({ profile }: { profile: OwnerProfile }) {
  const links = Object.entries(profile.social_links).filter(([, v]) => Boolean(v));

  return (
    <View style={styles.wrap}>
      <LinearGradient
        colors={[colors.heroWash, colors.bg, '#FFF9F2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>
        <Text style={styles.brand}>{brand.name}</Text>
        <Text style={styles.tagline}>{brand.tagline}</Text>
        <View style={styles.row}>
          <View style={styles.photoWrap}>
            {profile.photo_url ? (
              <Image source={{ uri: profile.photo_url }} style={styles.photo} />
            ) : (
              <View style={[styles.photo, styles.photoPlaceholder]}>
                <Text style={styles.initials}>
                  {profile.display_name.slice(0, 2).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.copy}>
            <Text style={styles.name}>{profile.display_name}</Text>
            <Text style={styles.role}>Graphic Designer · Pratibha Graphics Studio</Text>
            <Body style={styles.bio}>{profile.bio}</Body>
          </View>
        </View>
        <View style={styles.contacts}>
          <Muted>Contact</Muted>
          <Pressable onPress={() => Linking.openURL(`mailto:${profile.email}`)}>
            <Text style={styles.link}>{profile.email}</Text>
          </Pressable>
          {!!profile.whatsapp && profile.whatsapp.replace(/\D/g, '').length > 5 && (
            <Pressable
              onPress={() =>
                Linking.openURL(
                  `https://wa.me/${profile.whatsapp.replace(/[^\d]/g, '')}`
                )
              }
            >
              <Text style={styles.link}>WhatsApp {profile.whatsapp}</Text>
            </Pressable>
          )}
        </View>
        {links.length > 0 && (
          <View style={styles.socialRow}>
            {links.map(([key, url]) => (
              <Pressable key={key} onPress={() => Linking.openURL(url!)} style={styles.socialChip}>
                <Text style={styles.socialText}>{key}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: 420,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
    overflow: 'hidden',
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  brand: {
    fontFamily: fonts.displayExtra,
    fontSize: 13,
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: colors.accentDim,
  },
  tagline: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginTop: -12,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.lg,
    flexWrap: 'wrap',
  },
  photoWrap: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    backgroundColor: colors.bgElevated,
    shadowColor: '#2C2118',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  photo: {
    width: 148,
    height: 148,
  },
  photoPlaceholder: {
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily: fonts.displayExtra,
    fontSize: 36,
    color: colors.accentDim,
  },
  copy: {
    flex: 1,
    minWidth: 220,
    gap: 8,
  },
  name: {
    fontFamily: fonts.displayExtra,
    fontSize: 44,
    lineHeight: 48,
    color: colors.text,
    letterSpacing: -1,
  },
  role: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  bio: {
    color: colors.textMuted,
    maxWidth: 520,
  },
  contacts: {
    gap: 6,
  },
  link: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.text,
    textDecorationLine: 'underline',
    textDecorationColor: colors.accent,
  },
  socialRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  socialChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.bgElevated,
  },
  socialText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.text,
    textTransform: 'capitalize',
  },
});
