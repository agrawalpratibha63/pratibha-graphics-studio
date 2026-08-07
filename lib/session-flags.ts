const UNLOCK_KEY = 'pgs_vault_unlock_seen';

let memorySeen = false;

export function hasSeenVaultUnlock(): boolean {
  if (memorySeen) return true;
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return window.sessionStorage.getItem(UNLOCK_KEY) === '1';
    }
  } catch {
    /* private mode */
  }
  return false;
}

export function markVaultUnlockSeen(): void {
  memorySeen = true;
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(UNLOCK_KEY, '1');
    }
  } catch {
    /* private mode */
  }
}
