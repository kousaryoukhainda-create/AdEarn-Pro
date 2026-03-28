import { create } from 'zustand';
import { UserProfile } from '../types';
import { auth, firestore } from '../config/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';

interface AuthState {
  user: UserProfile | null;
  firebaseUser: User | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  initialize: () => () => void;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  firebaseUser: null,
  loading: true,
  error: null,

  initialize: () => {
    // Listen to auth state changes
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      set({ firebaseUser, loading: true });

      if (firebaseUser) {
        // Listen to user profile changes
        const userRef = doc(firestore, 'users', firebaseUser.uid);
        const unsubscribeProfile = onSnapshot(
          userRef,
          (docSnap) => {
            if (docSnap.exists()) {
              set({ user: docSnap.data() as UserProfile, loading: false });
            } else {
              // Create new user profile
              const newUser: UserProfile = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                balance: 0,
                totalEarned: 0,
                totalWithdrawn: 0,
                role: firebaseUser.email === 'kousaryoukhainda@gmail.com' && firebaseUser.emailVerified ? 'admin' : 'user',
                createdAt: new Date().toISOString(),
              };
              
              // Note: In production, create user profile via Cloud Function
              set({ user: newUser, loading: false });
            }
          },
          (error) => {
            console.error('Profile snapshot error:', error);
            set({ error: error.message, loading: false });
          }
        );

        return () => unsubscribeProfile();
      } else {
        set({ user: null, loading: false });
      }
    });

    return unsubscribeAuth;
  },

  logout: async () => {
    try {
      await signOut(auth);
      set({ user: null, firebaseUser: null, error: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed';
      set({ error: errorMessage });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

// Hook for using auth state
export const useAuth = () => {
  const { user, firebaseUser, loading, error, logout, clearError } = useAuthStore();
  
  return {
    user,
    firebaseUser,
    loading,
    error,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    logout,
    clearError,
  };
};
