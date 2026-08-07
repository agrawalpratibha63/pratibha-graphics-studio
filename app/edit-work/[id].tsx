import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Chip, Field, LoadingBlock, Muted, Subtitle } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import type { Category, Work, WorkVisibility } from '@/lib/types';
import { colors, spacing } from '@/constants/theme';

export default function EditWorkScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isOwner } = useAuth();
  const router = useRouter();
  const [work, setWork] = useState<Work | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [visibility, setVisibility] = useState<WorkVisibility>('visitors');
  const [featuredOrder, setFeaturedOrder] = useState('1');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    const [w, cats] = await Promise.all([api.getWork(id, true), api.getCategories(true)]);
    if (!w) throw new Error('Work not found');
    setWork(w);
    setCategories(cats);
    setTitle(w.title);
    setDescription(w.description);
    setCategoryId(w.category_id);
    setVisibility(w.visibility);
    setFeaturedOrder(String(w.featured_order ?? 1));
  }, [id]);

  useEffect(() => {
    if (!isOwner) return;
    setLoading(true);
    load()
      .catch((e) => Alert.alert('Error', e.message))
      .finally(() => setLoading(false));
  }, [isOwner, load]);

  if (!isOwner) {
    return (
      <View style={styles.center}>
        <Muted>Owner access only.</Muted>
      </View>
    );
  }

  if (loading || !work) return <LoadingBlock />;

  async function save() {
    setSaving(true);
    try {
      await api.updateWork(work!.id, {
        title: title.trim(),
        description: description.trim(),
        category_id: categoryId,
        visibility,
        featured_order: visibility === 'featured' ? Number(featuredOrder) || 1 : null,
      });
      router.back();
    } catch (e) {
      Alert.alert('Save failed', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    const go = async () => {
      setDeleting(true);
      try {
        await api.deleteWork(work!.id);
        router.replace('/dashboard');
      } catch (e) {
        Alert.alert('Delete failed', e instanceof Error ? e.message : 'Unknown error');
        setDeleting(false);
      }
    };

    if (Platform.OS === 'web') {
      if (
        typeof window !== 'undefined' &&
        window.confirm('Delete this work? This cannot be undone.')
      ) {
        await go();
      }
      return;
    }

    Alert.alert('Delete work?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => void go() },
    ]);
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
    >
      <Subtitle>Edit work</Subtitle>
      <Field label="Title" value={title} onChangeText={setTitle} />
      <Field
        label="Description"
        value={description}
        onChangeText={setDescription}
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
      {visibility === 'featured' && (
        <Field
          label="Featured order"
          value={featuredOrder}
          onChangeText={setFeaturedOrder}
          keyboardType="number-pad"
        />
      )}
      <Button label="Save changes" onPress={save} loading={saving} />
      <Button label="Delete work" variant="danger" onPress={remove} loading={deleting} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
