import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { Button, Chip, Field, Muted, Subtitle } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import type { Category, MediaType, WorkVisibility } from '@/lib/types';
import { colors, fonts, fileLimits, spacing } from '@/constants/theme';

type Picked = {
  uri: string;
  mime_type: string;
  size_bytes: number;
  file_name: string;
  media_type: MediaType;
};

export default function UploadScreen() {
  const { isOwner } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [visibility, setVisibility] = useState<WorkVisibility>('visitors');
  const [picked, setPicked] = useState<Picked | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOwner) return;
    api.getCategories(true).then((cats) => {
      setCategories(cats);
      if (cats[0]) setCategoryId(cats[0].id);
    });
  }, [isOwner]);

  if (!isOwner) {
    return (
      <View style={styles.center}>
        <Muted>Only the owner can upload.</Muted>
      </View>
    );
  }

  function mediaTypeFromMime(mime: string, name: string): MediaType {
    if (mime.startsWith('video/') || /\.(mp4|mov)$/i.test(name)) return 'video';
    if (mime.startsWith('image/') || /\.(png|jpe?g|gif|svg)$/i.test(name)) return 'image';
    return 'document';
  }

  function validateSize(mediaType: MediaType, size: number) {
    const limit = mediaType === 'video' ? fileLimits.videoBytes : fileLimits.imageBytes;
    if (size > limit) {
      throw new Error(
        `File too large. Max ${mediaType === 'video' ? '100MB' : '20MB'} for ${mediaType}.`
      );
    }
  }

  async function pickFromLibrary() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      quality: 1,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    const mime = asset.mimeType ?? 'image/jpeg';
    const name = asset.fileName ?? `upload_${Date.now()}`;
    const media_type = mediaTypeFromMime(mime, name);
    const size = asset.fileSize ?? 0;
    try {
      validateSize(media_type, size);
      setPicked({
        uri: asset.uri,
        mime_type: mime,
        size_bytes: size,
        file_name: name,
        media_type,
      });
    } catch (e) {
      Alert.alert('File too large', e instanceof Error ? e.message : 'Invalid file');
    }
  }

  async function pickFromCamera() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Camera access is required.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 1 });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    setPicked({
      uri: asset.uri,
      mime_type: asset.mimeType ?? 'image/jpeg',
      size_bytes: asset.fileSize ?? 0,
      file_name: asset.fileName ?? `camera_${Date.now()}.jpg`,
      media_type: 'image',
    });
  }

  async function pickDocument() {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/*', 'video/*', 'application/pdf', 'image/svg+xml'],
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    const mime = asset.mimeType ?? 'application/octet-stream';
    const media_type = mediaTypeFromMime(mime, asset.name);
    try {
      validateSize(media_type, asset.size ?? 0);
      setPicked({
        uri: asset.uri,
        mime_type: mime,
        size_bytes: asset.size ?? 0,
        file_name: asset.name,
        media_type,
      });
    } catch (e) {
      Alert.alert('File too large', e instanceof Error ? e.message : 'Invalid file');
    }
  }

  async function submit() {
    if (!picked) {
      Alert.alert('Pick a file', 'Choose an image, video, or document first.');
      return;
    }
    if (!title.trim()) {
      Alert.alert('Title required', 'Add a title for this work.');
      return;
    }
    setLoading(true);
    try {
      const work = await api.createWork({
        title: title.trim(),
        description: description.trim(),
        category_id: categoryId,
        visibility,
        media_type: picked.media_type,
        uri: picked.uri,
        mime_type: picked.mime_type,
        size_bytes: picked.size_bytes,
        file_name: picked.file_name,
      });
      router.replace(`/work/${work.id}`);
    } catch (e) {
      Alert.alert('Upload failed', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
      <Subtitle>Add to vault</Subtitle>
      <Muted>PNG, JPG, SVG, PDF, MP4, MOV, GIF — images/docs 20MB, video 100MB.</Muted>

      <View style={styles.row}>
        <Button label="Gallery" onPress={pickFromLibrary} variant="outline" />
        {Platform.OS !== 'web' && (
          <Button label="Camera" onPress={pickFromCamera} variant="outline" />
        )}
        <Button label="Files" onPress={pickDocument} variant="outline" />
      </View>

      {picked && (
        <View style={styles.preview}>
          {picked.media_type === 'image' ? (
            <Image source={{ uri: picked.uri }} style={styles.previewImage} />
          ) : (
            <Text style={styles.fileName}>{picked.file_name}</Text>
          )}
          <Muted>
            {picked.media_type} · {(picked.size_bytes / (1024 * 1024)).toFixed(2)} MB
          </Muted>
        </View>
      )}

      <Field label="Title" value={title} onChangeText={setTitle} placeholder="Project title" />
      <Field
        label="Description"
        value={description}
        onChangeText={setDescription}
        placeholder="Short description"
        multiline
        style={{ minHeight: 90, textAlignVertical: 'top' }}
      />

      <Muted>Category</Muted>
      <View style={styles.chips}>
        {categories.map((cat) => (
          <Chip
            key={cat.id}
            label={cat.name}
            active={categoryId === cat.id}
            onPress={() => setCategoryId(cat.id)}
          />
        ))}
      </View>

      <Muted>Visibility</Muted>
      <View style={styles.chips}>
        {(['private', 'visitors', 'featured'] as WorkVisibility[]).map((v) => (
          <Chip key={v} label={v} active={visibility === v} onPress={() => setVisibility(v)} />
        ))}
      </View>

      <Button label="Save to library" onPress={submit} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  row: { gap: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  preview: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    gap: 8,
    backgroundColor: colors.bgCard,
  },
  previewImage: { width: '100%', height: 180, borderRadius: 8 },
  fileName: {
    fontFamily: fonts.bodyMedium,
    color: colors.text,
  },
});
