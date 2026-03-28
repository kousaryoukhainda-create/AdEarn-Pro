import { colors, typography, spacing, borderRadius, shadows } from './index';

/**
 * Utility function to format currency
 */
export const formatCurrency = (amount: number): string => {
  return `Rs ${amount.toFixed(2)}`;
};

/**
 * Utility function to format date
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Utility function to format relative time
 */
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return formatDate(dateString);
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate withdrawal amount
 */
export const validateWithdrawalAmount = (
  amount: number,
  balance: number,
  minWithdrawal: number = 100,
  maxWithdrawal: number = 50000
): { valid: boolean; error?: string } => {
  if (isNaN(amount) || amount <= 0) {
    return { valid: false, error: 'Please enter a valid amount' };
  }
  if (amount < minWithdrawal) {
    return { valid: false, error: `Minimum withdrawal is ${formatCurrency(minWithdrawal)}` };
  }
  if (amount > maxWithdrawal) {
    return { valid: false, error: `Maximum withdrawal is ${formatCurrency(maxWithdrawal)}` };
  }
  if (amount > balance) {
    return { valid: false, error: 'Insufficient balance' };
  }
  return { valid: true };
};

/**
 * Calculate withdrawal fee and net amount
 */
export const calculateWithdrawal = (
  amount: number,
  feePercentage: number = 10
): { fee: number; netAmount: number } => {
  const fee = amount * (feePercentage / 100);
  const netAmount = amount - fee;
  return { fee, netAmount };
};

/**
 * Get initials from email
 */
export const getInitials = (email: string): string => {
  return email.charAt(0).toUpperCase();
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
};

/**
 * Generate deterministic color from string
 */
export const stringToColor = (str: string): string => {
  const colors = [
    colors.gold500,
    '#3b82f6',
    '#22c55e',
    '#ef4444',
    '#f59e0b',
    '#8b5cf6',
    '#ec4899',
    '#14b8a6',
  ];
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

// Export theme objects for easy access
export { colors, typography, spacing, borderRadius, shadows };
