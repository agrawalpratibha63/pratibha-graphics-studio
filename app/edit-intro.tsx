import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Button, Field, LoadingBlock, Muted, Subtitle } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import type { OwnerProfile } from '@/lib/types';
import { colors, spacing } from '@/constants/theme';

export default function EditIntroScreen() {
  const { isOwner } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<OwnerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOwner) return;
    api
      .getOwnerProfile()
      .then(setProfile)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isOwner]);

  if (!isOwner) {
    return (
      <View style={styles.center}>
        <Muted>Owner access only.</Muted>
      </View>
    );
  }

  if (loading || !profile) return <LoadingBlock />;

  async function pickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.9,
    });
    if (result.canceled || !result.assets[0]) return;
    setProfile({ ...profile!, photo_url: result.assets[0].uri });
  }

  async function save() {
    setSaving(true);
    try {
      await api.updateOwnerProfile(profile!);
      router.back();
    } catch (e) {
      Alert.alert('Save failed', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
      <Subtitle>Intro screen</Subtitle>
      <Muted>Replace placeholders with your real photo, bio, and links when ready.</Muted>

      {profile.photo_url ? (
        <Image source={{ uri: profile.photo_url }} style={styles.photo} />
      ) : (
        <View style={[styles.photo, styles.placeholder]} />
      )}
      <Button label="Choose photo" variant="outline" onPress={pickPhoto} />

      <Field
        label="Display name"
        value={profile.display_name}
        onChangeText={(display_name) => setProfile({ ...profile, display_name })}
      />
      <Field
        label="Bio"
        value={profile.bio}
        onChangeText={(bio) => setProfile({ ...profile, bio })}
        multiline
        style={{ minHeight: 110, textAlignVertical: 'top' }}
      />
      <Field
        label="Contact email"
        value={profile.email}
        onChangeText={(email) => setProfile({ ...profile, email })}
        autoCapitalize="none"
      />
      <Field
        label="WhatsApp"
        value={profile.whatsapp}
        onChangeText={(whatsapp) => setProfile({ ...profile, whatsapp })}
      />
      <Field
        label="Instagram URL"
        value={profile.social_links.instagram ?? ''}
        onChangeText={(instagram) =>
          setProfile({ ...profile, social_links: { ...profile.social_links, instagram } })
        }
        autoCapitalize="none"
      />
      <Field
        label="LinkedIn URL"
        value={profile.social_links.linkedin ?? ''}
        onChangeText={(linkedin) =>
          setProfile({ ...profile, social_links: { ...profile.social_links, linkedin } })
        }
        autoCapitalize="none"
      />
      <Field
        label="Behance URL"
        value={profile.social_links.behance ?? ''}
        onChangeText={(behance) =>
          setProfile({ ...profile, social_links: { ...profile.social_links, behance } })
        }
        autoCapitalize="none"
      />
      <Field
        label="YouTube URL"
        value={profile.social_links.youtube ?? ''}
        onChangeText={(youtube) =>
          setProfile({ ...profile, social_links: { ...profile.social_links, youtube } })
        }
        autoCapitalize="none"
      />
      <Button label="Save intro" onPress={save} loading={saving} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  photo: {
    width: 140,
    height: 160,
    borderRadius: 14,
    backgroundColor: colors.bgCard,
    alignSelf: 'flex-start',
  },
  placeholder: {
    borderWidth: 1,
    borderColor: colors.border,
  },
});
