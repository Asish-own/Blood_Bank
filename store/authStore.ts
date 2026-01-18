import { create } from 'zustand';
import { User as FirebaseUser } from 'firebase/auth';
import { UserProfile, getUserProfile } from '@/lib/firebase/auth';

interface AuthState {
  user: (FirebaseUser & { role?: string }) | null;
  profile: UserProfile | null;
  loading: boolean;
  setUser: (user: FirebaseUser | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  loadProfile: (uid: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  loadProfile: async (uid: string) => {
    const profile = await getUserProfile(uid);
    set({ profile });
    if (profile) {
      set((state) => ({
        user: state.user ? { ...state.user, role: profile.role } : null,
      }));
    }
  },
}));
