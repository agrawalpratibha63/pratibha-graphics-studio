import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { hasSeenVaultUnlock, markVaultUnlockSeen } from '@/lib/session-flags';

type ChamberHref = '/' | '/library' | '/dashboard' | '/visitors' | string;

interface StudioExperienceValue {
  isUnlocking: boolean;
  diveActive: boolean;
  diveLabel: string;
  completeUnlock: () => void;
  skipUnlock: () => void;
  enterChamber: (href: ChamberHref, label?: string) => void;
}

const StudioExperienceContext = createContext<StudioExperienceValue | null>(null);

export function StudioExperienceProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [diveActive, setDiveActive] = useState(false);
  const [diveLabel, setDiveLabel] = useState('');

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setIsUnlocking(false);
      return;
    }
    if (!hasSeenVaultUnlock()) {
      setIsUnlocking(true);
    }
  }, [loading, user]);

  const finishUnlock = useCallback(() => {
    markVaultUnlockSeen();
    setIsUnlocking(false);
  }, []);

  const completeUnlock = useCallback(() => {
    finishUnlock();
  }, [finishUnlock]);

  const skipUnlock = useCallback(() => {
    finishUnlock();
  }, [finishUnlock]);

  const enterChamber = useCallback((href: ChamberHref, label = 'Chamber') => {
    setDiveLabel(label);
    setDiveActive(true);
    setTimeout(() => {
      router.push(href as '/');
      setTimeout(() => setDiveActive(false), 520);
    }, 680);
  }, []);

  const value = useMemo(
    () => ({
      isUnlocking,
      diveActive,
      diveLabel,
      completeUnlock,
      skipUnlock,
      enterChamber,
    }),
    [isUnlocking, diveActive, diveLabel, completeUnlock, skipUnlock, enterChamber]
  );

  return (
    <StudioExperienceContext.Provider value={value}>{children}</StudioExperienceContext.Provider>
  );
}

export function useStudioExperience() {
  const ctx = useContext(StudioExperienceContext);
  if (!ctx) throw new Error('useStudioExperience must be used within StudioExperienceProvider');
  return ctx;
}
