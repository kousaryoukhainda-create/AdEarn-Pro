import { create } from 'zustand';
import { Ad, AdView } from '../types';
import { firestore, getCloudFunction } from '../config/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

interface AdsState {
  ads: Ad[];
  watchedAdIds: Set<string>;
  loading: boolean;
  error: string | null;
  
  // Actions
  subscribeToAds: () => () => void;
  subscribeToWatchedAds: (userId: string) => () => void;
  claimReward: (adId: string) => Promise<number>;
  clearError: () => void;
}

export const useAdsStore = create<AdsState>((set, get) => ({
  ads: [],
  watchedAdIds: new Set(),
  loading: true,
  error: null,

  subscribeToAds: () => {
    const q = query(
      collection(firestore, 'ads'),
      where('active', '==', true)
    );
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const adsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as Ad));
        set({ ads: adsList, loading: false });
      },
      (error) => {
        console.error('Ads snapshot error:', error);
        set({ error: error.message, loading: false });
      }
    );
    
    return unsubscribe;
  },

  subscribeToWatchedAds: (userId: string) => {
    const q = query(
      collection(firestore, 'adViews'),
      where('userId', '==', userId)
    );
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const watchedIds = new Set(
          snapshot.docs.map(doc => doc.data().adId as string)
        );
        set({ watchedAdIds: watchedIds });
      },
      (error) => {
        console.error('Watched ads snapshot error:', error);
      }
    );
    
    return unsubscribe;
  },

  claimReward: async (adId: string): Promise<number> => {
    const claimAdReward = getCloudFunction('claimAdReward');
    
    try {
      const response = await claimAdReward({ adId });
      const data = response.data as { success: boolean; reward?: number };
      
      if (data.success && data.reward) {
        // Add adId to watched set
        set((state) => ({
          watchedAdIds: new Set([...state.watchedAdIds, adId]),
        }));
        return data.reward;
      }
      
      throw new Error('Failed to claim reward');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Claim failed';
      set({ error: errorMessage });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

// Hook for using ads state
export const useAds = () => {
  const { ads, watchedAdIds, loading, error, subscribeToAds, subscribeToWatchedAds, claimReward, clearError } = useAdsStore();
  
  const availableAds = ads.filter(ad => !watchedAdIds.has(ad.id));
  
  return {
    ads,
    availableAds,
    watchedAdIds,
    loading,
    error,
    subscribeToAds,
    subscribeToWatchedAds,
    claimReward,
    clearError,
  };
};
