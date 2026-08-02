import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Switch, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Card, LoadingBlock, Muted, Subtitle } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import type { Category } from '@/lib/types';
import { colors, fonts, spacing } from '@/constants/theme';

export default function CategoriesScreen() {
  const { isOwner } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setCategories(await api.getCategories(true));
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!isOwner) return;
      setLoading(true);
      load()
        .catch(console.error)
        .finally(() => setLoading(false));
    }, [isOwner, load])
  );

  if (!isOwner) {
    return (
      <View style={styles.center}>
        <Muted>Owner access only.</Muted>
      </View>
    );
  }

  if (loading) return <LoadingBlock />;

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
      data={categories}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <View style={{ gap: 8, marginBottom: spacing.md }}>
          <Subtitle>Categories</Subtitle>
          <Muted>
            Hide a whole category from visitors while keeping everything in your private library.
          </Muted>
        </View>
      }
      renderItem={({ item }) => (
        <Card style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.name}</Text>
            <Muted>{item.slug}</Muted>
          </View>
          <View style={styles.toggle}>
            <Muted>Visible</Muted>
            <Switch
              value={item.visible_to_visitors}
              onValueChange={async (value) => {
                const updated = await api.updateCategory(item.id, {
                  visible_to_visitors: value,
                });
                setCategories((prev) =>
                  prev.map((c) => (c.id === updated.id ? updated : c))
                );
              }}
              trackColor={{ false: colors.border, true: colors.accentDim }}
              thumbColor={item.visible_to_visitors ? colors.accent : colors.textDim}
            />
          </View>
        </Card>
      )}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  name: { fontFamily: fonts.bodyBold, color: colors.text, fontSize: 16 },
  toggle: { alignItems: 'center', gap: 4 },
});
