import React, { useCallback, useMemo, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { AtelierFoyer } from '@/components/AtelierFoyer';
import { StageReveal } from '@/components/StageReveal';
import { LoadingBlock } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import type { OwnerProfile, Work } from '@/lib/types';

export default function HomeScreen() {
  const router = useRouter();
  const { isOwner } = useAuth();
  const [ownerProfile, setOwnerProfile] = useState<OwnerProfile | null>(null);
  const [featured, setFeatured] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [focusTick, setFocusTick] = useState(0);

  const load = useCallback(async () => {
    const [op, feat] = await Promise.all([api.getOwnerProfile(), api.getFeaturedWorks()]);
    setOwnerProfile(op);
    setFeatured(feat);
  }, []);

  useFocusEffect(
    useCallback(() => {
      setFocusTick((t) => t + 1);
      setLoading(true);
      load()
        .catch(console.error)
        .finally(() => setLoading(false));
    }, [load])
  );

  const chambers = useMemo(() => {
    const base = [
      {
        key: 'library',
        label: 'Library',
        subtitle: 'Logos, thumbnails, invites, reels — the full vault.',
        href: '/library',
      },
    ];
    if (isOwner) {
      base.push(
        {
          key: 'admin',
          label: 'Admin',
          subtitle: 'Upload, edit visibility, import starter work.',
          href: '/dashboard',
        },
        {
          key: 'visitors',
          label: 'Visitors',
          subtitle: 'Who stepped in — silent, tracked, yours alone.',
          href: '/visitors',
        }
      );
    }
    return base;
  }, [isOwner]);

  if (loading || !ownerProfile) return <LoadingBlock />;

  return (
    <StageReveal triggerKey={`home-${focusTick}`}>
      <AtelierFoyer
        profile={ownerProfile}
        featured={featured}
        chambers={chambers}
        onPressWork={(work) => router.push(`/work/${work.id}`)}
      />
    </StageReveal>
  );
}
