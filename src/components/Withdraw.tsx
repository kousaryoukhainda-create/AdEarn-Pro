import React, { useState, useEffect } from 'react';
import { UserProfile, Withdrawal } from '../types';
import { motion } from 'motion/react';
import { Wallet, DollarSign, History, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { cn } from '../lib/utils';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { AppSettings } from '../types';

interface WithdrawProps {
  user: UserProfile;
}

export default function Withdraw({ user }: WithdrawProps) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Jazz cash');
  const [accountTitle, setAccountTitle] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [history, setHistory] = useState<Withdrawal[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  // Initialize Cloud Functions
  const functions = getFunctions();
  const requestWithdrawalFn = httpsCallable<{
    amount: number;
    method: string;
    accountTitle: string;
    accountNumber: string;
  }, { success: boolean; withdrawalId?: string; message?: string }>(functions, 'requestWithdrawal');

  useEffect(() => {
    const unsubSettings = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data() as AppSettings);
      }
    });

    const q = query(
      collection(db, 'withdrawals'),
      where('userId', '==', user.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Withdrawal))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setHistory(list);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'withdrawals');
    });
    return () => unsubscribe();
  }, [user.uid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const minWithdrawal = settings?.minWithdrawal || 100;
    const withdrawAmount = parseFloat(amount);

    // Client-side validation (for UX, server will re-validate)
    if (isNaN(withdrawAmount) || withdrawAmount < minWithdrawal) {
      setError(`Minimum withdrawal amount is Rs ${minWithdrawal}`);
      return;
    }

    if (withdrawAmount > user.balance) {
      setError('Insufficient balance');
      return;
    }

    if (!accountTitle.trim() || !accountNumber.trim()) {
      setError('Please provide both Account Title and Account Number');
      return;
    }

    setLoading(true);
    try {
      // Call Cloud Function for server-side validation and processing
      const result = await requestWithdrawalFn({
        amount: withdrawAmount,
        method,
        accountTitle: accountTitle.trim(),
        accountNumber: accountNumber.trim(),
      });

      const response = result.data;
      
      if (response.success) {
        setSuccess(true);
        setAmount('');
        setAccountTitle('');
        setAccountNumber('');
      } else {
        setError('Failed to process withdrawal. Please try again.');
      }
    } catch (err: any) {
      console.error('Withdrawal failed:', err);
      
      // Handle Cloud Function errors
      if (err.code === 'functions/unauthenticated') {
        setError('You must be logged in to make a withdrawal request.');
      } else if (err.code === 'functions/invalid-argument') {
        setError(err.message);
      } else if (err.code === 'functions/failed-precondition') {
        setError(err.message);
      } else if (err.code === 'functions/permission-denied') {
        setError('You do not have permission to perform this action.');
      } else {
        setError('Failed to process withdrawal. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2 uppercase">Withdraw <span className="gold-text">Earnings</span></h1>
          <p className="text-gray-500 font-medium">Request a payout of your earned rewards.</p>
        </div>
        <div className="bg-dark-surface px-6 py-3 rounded-2xl border border-dark-border flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center text-white">
            <Wallet size={18} />
          </div>
          <span className="text-sm font-black text-gray-200 uppercase tracking-widest">Payout Portal</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Withdrawal Form */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card p-10">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Amount to Withdraw</label>
                  <div className="relative group">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gold-500 font-black text-sm">Rs</span>
                    <input
                      type="number"
                      step="1"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0"
                      className="w-full pl-14 pr-6 py-4 bg-dark-bg border border-dark-border rounded-2xl focus:border-gold-500/50 focus:outline-none transition-all text-white font-black text-lg placeholder:text-gray-700"
                    />
                  </div>
                  <div className="flex justify-between items-center px-1">
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Minimum: Rs {settings?.minWithdrawal || 100}</p>
                    {amount && parseFloat(amount) > 0 && (
                      <p className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">Fee: {settings?.withdrawalFeePercentage || 10}%</p>
                    )}
                  </div>
                  
                  {amount && parseFloat(amount) >= (settings?.minWithdrawal || 100) && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-5 bg-dark-surface rounded-2xl border border-dark-border space-y-3"
                    >
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-gray-500 uppercase tracking-widest">Gross Amount:</span>
                        <span className="text-white">Rs {parseFloat(amount).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-gray-500 uppercase tracking-widest">Service Fee:</span>
                        <span className="text-red-500">-Rs {(parseFloat(amount) * ((settings?.withdrawalFeePercentage || 10) / 100)).toFixed(2)}</span>
                      </div>
                      <div className="border-t border-dark-border pt-3 flex justify-between text-sm font-black">
                        <span className="text-gray-400 uppercase tracking-widest">Net Payout:</span>
                        <span className="gold-text text-lg">Rs {(parseFloat(amount) * (1 - (settings?.withdrawalFeePercentage || 10) / 100)).toFixed(2)}</span>
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Payment Method</label>
                  <div className="relative">
                    <select
                      value={method}
                      onChange={(e) => setMethod(e.target.value)}
                      className="w-full px-6 py-4 bg-dark-bg border border-dark-border rounded-2xl focus:border-gold-500/50 focus:outline-none transition-all appearance-none text-white font-black text-sm uppercase tracking-widest cursor-pointer"
                    >
                      <option>Jazz cash</option>
                      <option>Easy Paisa</option>
                      <option>Naya Pay</option>
                      <option>Sada Pay</option>
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gold-500">
                      <Wallet size={18} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Account Title</label>
                  <input
                    type="text"
                    value={accountTitle}
                    onChange={(e) => setAccountTitle(e.target.value)}
                    placeholder="Enter account holder name"
                    className="w-full px-6 py-4 bg-dark-bg border border-dark-border rounded-2xl focus:border-gold-500/50 focus:outline-none transition-all text-white font-black text-sm placeholder:text-gray-700"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Account Number</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Enter account/mobile number"
                    className="w-full px-6 py-4 bg-dark-bg border border-dark-border rounded-2xl focus:border-gold-500/50 focus:outline-none transition-all text-white font-black text-sm placeholder:text-gray-700"
                  />
                </div>
              </div>

              {error && (
                <div className="p-5 bg-red-500/10 text-red-400 rounded-2xl text-xs font-bold flex items-center gap-3 border border-red-500/20">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              {success && (
                <div className="p-5 bg-green-500/10 text-green-400 rounded-2xl text-xs font-bold flex items-center gap-3 border border-green-500/20">
                  <CheckCircle2 size={18} />
                  Withdrawal request submitted successfully!
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full gold-gradient text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-[1.01] transition-all flex items-center justify-center gap-3 disabled:opacity-30 shadow-xl shadow-gold-500/20"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Wallet size={20} />
                    Request Withdrawal
                  </>
                )}
              </button>
            </form>
          </div>

          {/* History */}
          <div className="glass-card overflow-hidden">
            <div className="p-8 border-b border-dark-border flex items-center justify-between bg-dark-surface">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 gold-gradient rounded-xl flex items-center justify-center text-white">
                  <History size={20} />
                </div>
                <h2 className="text-xl font-black text-white uppercase tracking-tight">Withdrawal <span className="gold-text">History</span></h2>
              </div>
            </div>
            <div className="divide-y divide-dark-border">
              {history.length === 0 ? (
                <div className="p-20 text-center text-gray-600 font-black uppercase tracking-widest text-xs">No withdrawal history yet.</div>
              ) : (
                history.map((item) => (
                  <div key={item.id} className="p-8 flex items-center justify-between hover:bg-white/5 transition-colors group">
                    <div className="flex items-center gap-6">
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center border transition-colors",
                        item.status === 'approved' ? "bg-green-500/10 text-green-500 border-green-500/20" :
                        item.status === 'rejected' ? "bg-red-500/10 text-red-500 border-red-500/20" : 
                        "bg-cyan-500/10 text-cyan-500 border-cyan-500/20"
                      )}>
                        <Clock size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-white uppercase tracking-widest mb-1">{item.method} Withdrawal</p>
                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{new Date(item.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-white tracking-tighter mb-1">Rs {item.amount.toFixed(2)}</p>
                      <p className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-block",
                        item.status === 'approved' ? "bg-green-500/10 text-green-500" :
                        item.status === 'rejected' ? "bg-red-500/10 text-red-500" : 
                        "bg-cyan-500/10 text-cyan-500"
                      )}>{item.status}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Balance Card */}
        <div className="space-y-8">
          <div className="gold-gradient text-white rounded-3xl p-10 shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-white/70 text-[10px] font-black uppercase tracking-widest mb-2">Available Balance</p>
              <h3 className="text-5xl font-black tracking-tighter mb-10">Rs {user.balance.toFixed(2)}</h3>
              <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/60">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                Live Balance Tracking
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
            <div className="absolute top-0 right-0 p-8 opacity-20">
              <Wallet size={80} />
            </div>
          </div>

          <div className="glass-card p-8">
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <AlertCircle size={14} className="text-gold-500" />
              Withdrawal Rules
            </h4>
            <ul className="space-y-5">
              {[
                `Minimum withdrawal is Rs ${settings?.minWithdrawal || 100}`,
                'Processing time: 24-48 hours',
                `Service charge: ${settings?.withdrawalFeePercentage || 10}% fee`,
                'Available for local mobile wallets',
                'Ensure account details are correct'
              ].map((rule, i) => (
                <li key={i} className="flex items-start gap-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed">
                  <div className="w-1.5 h-1.5 gold-gradient rounded-full mt-1.5 flex-shrink-0"></div>
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
