import React, { useCallback, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { StageReveal } from '@/components/StageReveal';
import { Button, Card, LoadingBlock, Muted, Subtitle, Title } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import type { Profile, Work } from '@/lib/types';
import { colors, fonts, spacing } from '@/constants/theme';

export default function DashboardScreen() {
  const { isOwner } = useAuth();
  const router = useRouter();
  const [works, setWorks] = useState<Work[]>([]);
  const [visitors, setVisitors] = useState<Profile[]>([]);
  const [emails, setEmails] = useState<Array<{ subject: string; body: string; at: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [focusTick, setFocusTick] = useState(0);

  const load = useCallback(async () => {
    const [w, v, e] = await Promise.all([
      api.getWorks(true),
      api.getVisitors(),
      api.getPendingEmails(),
    ]);
    setWorks(w);
    setVisitors(v);
    setEmails(e.slice(0, 5));
    return w;
  }, []);

  const runImport = useCallback(
    async (force = false) => {
      setImporting(true);
      setStatus(force ? 'Re-importing library…' : 'Importing your logos & works…');
      try {
        const result = await api.importStarterLibrary(force);
        if (result.skipped) {
          setStatus(null);
        } else {
          setStatus(`Imported ${result.imported} works to your cloud library.`);
        }
        await load();
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Import failed';
        setStatus(msg);
        Alert.alert('Import failed', msg);
      } finally {
        setImporting(false);
      }
    },
    [load]
  );

  useFocusEffect(
    useCallback(() => {
      if (!isOwner) return;
      setFocusTick((t) => t + 1);
      let cancelled = false;
      (async () => {
        setLoading(true);
        try {
          const w = await load();
          if (!cancelled && w.length === 0 && !api.isDemoMode) {
            await runImport(false);
          }
        } catch (e) {
          console.error(e);
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [isOwner, load, runImport])
  );

  if (!isOwner) {
    return (
      <View style={styles.center}>
        <Muted>Owner access only.</Muted>
      </View>
    );
  }

  if (loading) return <LoadingBlock />;

  const featured = works.filter((w) => w.visibility === 'featured').length;
  const privateCount = works.filter((w) => w.visibility === 'private').length;

  return (
    <StageReveal triggerKey={`admin-${focusTick}`}>
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={load} tintColor={colors.accent} />
      }
    >
      <Title style={{ fontSize: 34 }}>Dashboard</Title>
      <Muted>Upload, organize visibility, and review who entered the vault.</Muted>

      <View style={styles.stats}>
        <Stat label="Works" value={String(works.length)} />
        <Stat label="Featured" value={String(featured)} />
        <Stat label="Private" value={String(privateCount)} />
        <Stat label="Visitors" value={String(visitors.length)} />
      </View>

      {works.length === 0 && (
        <Card>
          <Text style={styles.rowTitle}>Library empty on cloud</Text>
          <Muted>
            Your earlier logos were in demo mode. Import them to Supabase so Home & Library show again.
          </Muted>
        </Card>
      )}

      {status ? <Muted>{status}</Muted> : null}

      <Button
        label={works.length === 0 ? 'Import starter library' : 'Re-import starter library'}
        onPress={() => runImport(works.length > 0)}
        loading={importing}
      />
      <Button label="Upload work" variant="outline" onPress={() => router.push('/upload')} />
      <Button label="Edit intro / photo" variant="outline" onPress={() => router.push('/edit-intro')} />
      <Button label="Manage categories" variant="outline" onPress={() => router.push('/categories')} />
      <Button label="Visitor history" variant="outline" onPress={() => router.push('/visitors')} />

      <Subtitle style={{ marginTop: spacing.md }}>Recent works</Subtitle>
      {works.slice(0, 8).map((work) => (
        <Pressable key={work.id} onPress={() => router.push(`/edit-work/${work.id}`)}>
          <Card style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{work.title}</Text>
              <Muted>{work.visibility} · tap to edit</Muted>
            </View>
            <Text style={styles.edit}>Edit</Text>
          </Card>
        </Pressable>
      ))}

      {api.isDemoMode && (
        <>
          <Subtitle style={{ marginTop: spacing.md }}>Visit email queue (demo)</Subtitle>
          <Muted>
            In production these go to your inbox via Resend. Demo stores them locally.
          </Muted>
          {emails.length === 0 ? (
            <Muted>No visit emails yet.</Muted>
          ) : (
            emails.map((email, i) => (
              <Card key={`${email.at}_${i}`}>
                <Text style={styles.rowTitle}>{email.subject}</Text>
                <Muted>{email.body}</Muted>
              </Card>
            ))
          )}
        </>
      )}
    </ScrollView>
    </StageReveal>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  stat: {
    width: '47%',
    backgroundColor: colors.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: spacing.md,
  },
  statValue: {
    fontFamily: fonts.displayExtra,
    fontSize: 32,
    color: colors.accent,
  },
  statLabel: {
    fontFamily: fonts.bodyMedium,
    color: colors.textMuted,
    fontSize: 13,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowTitle: {
    fontFamily: fonts.bodyBold,
    color: colors.text,
    fontSize: 15,
  },
  edit: {
    fontFamily: fonts.bodyMedium,
    color: colors.accent,
  },
});
