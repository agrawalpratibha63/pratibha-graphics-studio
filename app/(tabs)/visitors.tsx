import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Card, LoadingBlock, Muted, Subtitle, Title } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import type { Profile, Visit } from '@/lib/types';
import { colors, fonts, spacing } from '@/constants/theme';

export default function VisitorsScreen() {
  const { isOwner } = useAuth();
  const [visitors, setVisitors] = useState<Profile[]>([]);
  const [visits, setVisits] = useState<Array<Visit & { profile?: Profile }>>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [v, history] = await Promise.all([api.getVisitors(), api.getVisits()]);
    setVisitors(v);
    setVisits(history);
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
      data={visits}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <View style={{ gap: spacing.md, marginBottom: spacing.md }}>
          <Title style={{ fontSize: 34 }}>Visitors</Title>
          <Muted>
            Silent tracking — visitors are not notified. You see name, email, and total visits.
          </Muted>
          <Subtitle>People</Subtitle>
          {visitors.length === 0 ? (
            <Muted>No visitors yet.</Muted>
          ) : (
            visitors.map((person) => (
              <Card key={person.id}>
                <Text style={styles.name}>{person.full_name}</Text>
                <Muted>{person.email}</Muted>
                <Text style={styles.meta}>
                  Total visits: {person.visit_count}
                  {person.last_seen_at
                    ? ` · Last: ${new Date(person.last_seen_at).toLocaleString()}`
                    : ''}
                </Text>
              </Card>
            ))
          )}
          <Subtitle>Visit history</Subtitle>
        </View>
      }
      ListEmptyComponent={<Muted>No visit events yet.</Muted>}
      renderItem={({ item }) => (
        <Card>
          <Text style={styles.name}>{item.profile?.full_name ?? 'Visitor'}</Text>
          <Muted>{item.profile?.email}</Muted>
          <Text style={styles.meta}>
            {new Date(item.visited_at).toLocaleString()} · {item.source}
          </Text>
        </Card>
      )}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  name: {
    fontFamily: fonts.bodyBold,
    color: colors.text,
    fontSize: 16,
  },
  meta: {
    fontFamily: fonts.body,
    color: colors.textDim,
    fontSize: 12,
    marginTop: 6,
  },
});
