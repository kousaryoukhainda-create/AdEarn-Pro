# Shared Types (reuse between web and mobile)

export interface UserProfile {
  uid: string;
  email: string;
  balance: number;
  totalEarned: number;
  totalWithdrawn: number;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface Ad {
  id: string;
  title: string;
  description?: string;
  reward: number;
  duration: number;
  url: string;
  active: boolean;
  createdAt: string;
}

export interface Withdrawal {
  id: string;
  userId: string;
  userEmail?: string;
  amount: number;
  fee: number;
  netAmount: number;
  status: 'pending' | 'approved' | 'rejected';
  statusUpdatedAt?: string;
  trxId?: string;
  method: string;
  accountTitle: string;
  accountNumber: string;
  createdAt: string;
}

export interface AdView {
  id: string;
  userId: string;
  adId: string;
  reward: number;
  timestamp: string;
}

export interface AppSettings {
  minWithdrawal: number;
  withdrawalFeePercentage: number;
  adReward: number;
  appName: string;
  contactEmail: string;
}
