import { create } from 'zustand';
import { Withdrawal } from '../types';
import { firestore, getCloudFunction } from '../config/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

interface WithdrawalState {
  withdrawals: Withdrawal[];
  loading: boolean;
  error: string | null;
  submitting: boolean;
  
  // Actions
  subscribeToWithdrawals: (userId: string) => () => void;
  requestWithdrawal: (data: {
    amount: number;
    method: string;
    accountTitle: string;
    accountNumber: string;
  }) => Promise<void>;
  clearError: () => void;
}

export const useWithdrawalStore = create<WithdrawalState>((set, get) => ({
  withdrawals: [],
  loading: true,
  error: null,
  submitting: false,

  subscribeToWithdrawals: (userId: string) => {
    const q = query(
      collection(firestore, 'withdrawals'),
      where('userId', '==', userId)
    );
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const withdrawalsList = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
          } as Withdrawal))
          .sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        set({ withdrawals: withdrawalsList, loading: false });
      },
      (error) => {
        console.error('Withdrawals snapshot error:', error);
        set({ error: error.message, loading: false });
      }
    );
    
    return unsubscribe;
  },

  requestWithdrawal: async (data) => {
    const requestWithdrawalFn = getCloudFunction('requestWithdrawal');
    
    set({ submitting: true, error: null });
    
    try {
      const response = await requestWithdrawalFn(data);
      const responseData = response.data as { success: boolean };
      
      if (!responseData.success) {
        throw new Error('Withdrawal request failed');
      }
      
      set({ submitting: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Withdrawal failed';
      set({ error: errorMessage, submitting: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

// Hook for using withdrawal state
export const useWithdrawals = () => {
  const { withdrawals, loading, error, submitting, subscribeToWithdrawals, requestWithdrawal, clearError } = useWithdrawalStore();
  
  return {
    withdrawals,
    loading,
    error,
    submitting,
    subscribeToWithdrawals,
    requestWithdrawal,
    clearError,
  };
};
