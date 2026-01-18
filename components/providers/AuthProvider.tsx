'use client';

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useAuthStore } from '@/store/authStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading, loadProfile } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        await loadProfile(user.uid);
      } else {
        setUser(null);
        useAuthStore.getState().setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading, loadProfile]);

  return <>{children}</>;
}
