import React, { useState, useEffect } from 'react';
import { Ad, UserProfile, Withdrawal, AdView, AppSettings } from '../types';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy, setDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { motion } from 'motion/react';
import { Plus, Trash2, Check, X, Users, Play, Wallet, ShieldCheck, ExternalLink, Clock, CheckCircle2, TrendingUp, Settings as SettingsIcon } from 'lucide-react';
import { cn, getEmbedUrl } from '../lib/utils';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

export default function Admin() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [adViews, setAdViews] = useState<AdView[]>([]);
  const [activeTab, setActiveTab] = useState<'ads' | 'withdrawals' | 'users' | 'settings'>('ads');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [trxInputs, setTrxInputs] = useState<Record<string, string>>({});
  const [settings, setSettings] = useState<AppSettings | null>(null);

  // Ad Form State
  const [newAd, setNewAd] = useState({
    title: '',
    description: '',
    reward: '',
    duration: '',
    url: '',
  });

  useEffect(() => {
    const unsubSettings = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        const s = docSnap.data() as AppSettings;
        setSettings(s);
        setNewAd(prev => ({ ...prev, reward: prev.reward || s.adReward.toString() }));
      }
    });

    const unsubAds = onSnapshot(query(collection(db, 'ads'), orderBy('createdAt', 'desc')), (snapshot) => {
      setAds(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ad)));
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'ads');
    });
    const unsubWithdrawals = onSnapshot(query(collection(db, 'withdrawals'), orderBy('createdAt', 'desc')), (snapshot) => {
      setWithdrawals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Withdrawal)));
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'withdrawals');
    });
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersList = snapshot.docs.map(doc => ({ ...doc.data() } as UserProfile));
      // Sort by createdAt desc in memory to handle missing fields
      usersList.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      setUsers(usersList);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'users');
    });
    const unsubViews = onSnapshot(collection(db, 'adViews'), (snapshot) => {
      setAdViews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AdView)));
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'adViews');
    });

    return () => {
      unsubSettings();
      unsubAds();
      unsubWithdrawals();
      unsubUsers();
      unsubViews();
    };
  }, []);

  // Initialize Cloud Functions
  const functions = getFunctions();
  const processWithdrawalFn = httpsCallable<{
    withdrawalId: string;
    status: 'approved' | 'rejected';
    trxId?: string;
  }, { success: boolean; message?: string }>(functions, 'processWithdrawal');

  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const adRef = doc(collection(db, 'ads'));
      const adData: Ad = {
        id: adRef.id,
        title: newAd.title,
        description: newAd.description,
        reward: parseFloat(newAd.reward),
        duration: parseInt(newAd.duration),
        url: newAd.url,
        active: true,
        createdAt: new Date().toISOString(),
      };
      await setDoc(adRef, adData);
      setNewAd({
        title: '',
        description: '',
        reward: settings?.adReward.toString() || '0.50',
        duration: '30',
        url: '',
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'ads');
    }
  };

  const handleDeleteAd = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'ads', id));
      setConfirmDeleteId(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `ads/${id}`);
    }
  };

  const handleWithdrawalAction = async (withdrawal: Withdrawal, status: 'approved' | 'rejected') => {
    const trxId = trxInputs[withdrawal.id] || '';

    if (status === 'approved' && !trxId) {
      alert('Please enter a Transaction ID (TRX ID) before approving.');
      return;
    }

    try {
      // Call Cloud Function for server-side processing
      const result = await processWithdrawalFn({
        withdrawalId: withdrawal.id,
        status,
        trxId: status === 'approved' ? trxId : undefined,
      });

      const response = result.data;
      
      if (response.success) {
        // Clear TRX input after successful processing
        setTrxInputs(prev => {
          const newInputs = { ...prev };
          delete newInputs[withdrawal.id];
          return newInputs;
        });
      }
    } catch (err: any) {
      console.error('Failed to process withdrawal:', err);
      
      // Handle Cloud Function errors
      if (err.code === 'functions/unauthenticated') {
        alert('You must be logged in to process withdrawals.');
      } else if (err.code === 'functions/permission-denied') {
        alert('Only administrators can process withdrawals.');
      } else if (err.code === 'functions/invalid-argument') {
        alert(err.message);
      } else if (err.code === 'functions/not-found') {
        alert('Withdrawal request not found.');
      } else if (err.code === 'functions/failed-precondition') {
        alert(err.message);
      } else {
        alert('Failed to process withdrawal. Please try again.');
      }
    }
  };

  const handleInitializeSettings = async () => {
    try {
      const initialSettings: AppSettings = {
        minWithdrawal: 100,
        withdrawalFeePercentage: 10,
        adReward: 0.5,
        appName: 'AdEarn Pro',
        contactEmail: 'kousaryoukhainda@gmail.com'
      };
      await setDoc(doc(db, 'settings', 'global'), initialSettings);
      alert('Settings initialized successfully!');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/global');
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      await setDoc(doc(db, 'settings', 'global'), settings);
      alert('Settings updated successfully!');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/global');
    }
  };

  const stats = [
    { label: 'Total Users', value: users.length.toString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Ads', value: ads.filter(a => a.active).length.toString(), icon: Play, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Pending Withdrawals', value: withdrawals.filter(w => w.status === 'pending').length.toString(), icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Total Platform Balance', value: `Rs ${(adViews.reduce((sum, v) => sum + v.reward, 0) - withdrawals.filter(w => w.status !== 'rejected').reduce((sum, w) => sum + w.amount, 0)).toFixed(2)}`, icon: Wallet, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Platform Earned', value: `Rs ${adViews.reduce((sum, v) => sum + v.reward, 0).toFixed(2)}`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Payout', value: `Rs ${withdrawals.filter(w => w.status === 'approved').reduce((sum, w) => sum + w.amount, 0).toFixed(2)}`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2 uppercase">Admin <span className="gold-text">Panel</span></h1>
          <p className="text-gray-500 font-medium">Manage ads, withdrawals, and user accounts.</p>
        </div>
        <div className="flex bg-dark-surface p-1.5 rounded-2xl border border-dark-border shadow-2xl">
          {[
            { id: 'ads', label: 'Ads', icon: Play },
            { id: 'withdrawals', label: 'Withdrawals', icon: Wallet },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'settings', label: 'Settings', icon: SettingsIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-3 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                activeTab === tab.id ? "gold-gradient text-white shadow-lg shadow-gold-500/20" : "text-gray-500 hover:text-gray-300"
              )}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 group hover:border-gold-500/30 transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-dark-bg border border-dark-border flex items-center justify-center mb-4 text-gold-500 group-hover:gold-gradient group-hover:text-white transition-all">
              <stat.icon size={24} />
            </div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-xl font-black text-white tracking-tighter">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {activeTab === 'ads' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Create Ad Form */}
          <div className="glass-card p-8 h-fit">
            <h2 className="text-xl font-black text-white uppercase tracking-tight mb-8 flex items-center gap-3">
              <Plus size={24} className="text-gold-500" />
              Create New <span className="gold-text">Ad</span>
            </h2>
            <form onSubmit={handleCreateAd} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Ad Title</label>
                <input
                  placeholder="Enter Title"
                  value={newAd.title}
                  onChange={e => setNewAd({...newAd, title: e.target.value})}
                  className="w-full px-5 py-4 bg-dark-bg border border-dark-border rounded-2xl focus:border-gold-500/50 focus:outline-none text-white font-bold"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Description</label>
                <textarea
                  placeholder="Enter Description"
                  value={newAd.description}
                  onChange={e => setNewAd({...newAd, description: e.target.value})}
                  className="w-full px-5 py-4 bg-dark-bg border border-dark-border rounded-2xl focus:border-gold-500/50 focus:outline-none text-white font-bold h-24"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Reward (Rs)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.50"
                    value={newAd.reward}
                    onChange={e => setNewAd({...newAd, reward: e.target.value})}
                    className="w-full px-5 py-4 bg-dark-bg border border-dark-border rounded-2xl focus:border-gold-500/50 focus:outline-none text-white font-bold"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Duration (s)</label>
                  <input
                    type="number"
                    placeholder="30"
                    value={newAd.duration}
                    onChange={e => setNewAd({...newAd, duration: e.target.value})}
                    className="w-full px-5 py-4 bg-dark-bg border border-dark-border rounded-2xl focus:border-gold-500/50 focus:outline-none text-white font-bold"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Ad URL</label>
                <input
                  placeholder="https://..."
                  value={newAd.url}
                  onChange={e => setNewAd({...newAd, url: e.target.value})}
                  className="w-full px-5 py-4 bg-dark-bg border border-dark-border rounded-2xl focus:border-gold-500/50 focus:outline-none text-white font-bold"
                  required
                />
              </div>
              
              {newAd.url && (
                <div className="mt-6 border border-dark-border rounded-2xl overflow-hidden aspect-video bg-black flex flex-col relative group">
                  <div className="bg-dark-surface px-4 py-2 text-[10px] font-black text-gray-500 border-b border-dark-border flex justify-between items-center uppercase tracking-widest">
                    <span>Live Preview</span>
                    <a 
                      href={newAd.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gold-500 hover:text-gold-400 flex items-center gap-1.5 transition-colors"
                    >
                      <ExternalLink size={12} />
                      Test Link
                    </a>
                  </div>
                  <iframe 
                    src={getEmbedUrl(newAd.url)} 
                    className="flex-1 w-full h-full"
                    title="Preview"
                  />
                </div>
              )}

              <button className="w-full gold-gradient text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] transition-all shadow-xl shadow-gold-500/20">
                Publish Ad
              </button>
            </form>
          </div>

          {/* Ads List */}
          <div className="lg:col-span-2 space-y-6">
            {ads.map((ad) => (
              <div key={ad.id} className="glass-card p-8 flex items-center justify-between group hover:border-gold-500/30 transition-all">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-dark-bg border border-dark-border flex items-center justify-center text-gold-500 group-hover:gold-gradient group-hover:text-white transition-all">
                    <Play size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight mb-1">{ad.title}</h3>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Rs {ad.reward.toFixed(2)} • {ad.duration}s • {ad.active ? 'Active' : 'Inactive'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {confirmDeleteId === ad.id ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteAd(ad.id)}
                        className="px-4 py-2 bg-red-500/10 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="p-2 text-gray-500 hover:text-white transition-colors"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setConfirmDeleteId(ad.id)}
                      className="p-4 bg-dark-bg border border-dark-border text-red-500/50 hover:text-red-500 hover:border-red-500/30 rounded-2xl transition-all"
                      title="Delete Ad"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'withdrawals' && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="glass-card p-6 border-cyan-500/20">
              <p className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-2">Pending</p>
              <p className="text-3xl font-black text-white tracking-tighter">{withdrawals.filter(w => w.status === 'pending').length}</p>
            </div>
            <div className="glass-card p-6 border-green-500/20">
              <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-2">Approved</p>
              <p className="text-3xl font-black text-white tracking-tighter">{withdrawals.filter(w => w.status === 'approved').length}</p>
            </div>
            <div className="glass-card p-6 border-red-500/20">
              <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2">Rejected</p>
              <p className="text-3xl font-black text-white tracking-tighter">{withdrawals.filter(w => w.status === 'rejected').length}</p>
            </div>
            <div className="glass-card p-6 border-gold-500/20">
              <p className="text-[10px] font-black text-gold-500 uppercase tracking-widest mb-2">Total Paid</p>
              <p className="text-3xl font-black text-white tracking-tighter">Rs {withdrawals.filter(w => w.status === 'approved').reduce((sum, w) => sum + w.amount, 0).toFixed(2)}</p>
            </div>
          </div>
          
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-[1200px] w-full text-left">
                <thead className="bg-dark-surface border-b border-dark-border">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">User Details</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Amount Info</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Payment Method</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Account Details</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">TRX ID</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border">
                  {withdrawals.map((w) => (
                    <tr key={w.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-8 py-6">
                        <p className="text-sm font-black text-white mb-1">{w.userEmail || 'No Email'}</p>
                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">ID: {w.userId.slice(0, 8)}...</p>
                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-1">{new Date(w.createdAt).toLocaleString()}</p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-1">
                          <p className="text-sm font-black text-white">Gross: Rs {w.amount.toFixed(2)}</p>
                          <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Fee: Rs {w.fee?.toFixed(2) || (w.amount * 0.1).toFixed(2)}</p>
                          <p className="text-sm font-black text-gold-400">Net: Rs {w.netAmount?.toFixed(2) || (w.amount * 0.9).toFixed(2)}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest bg-dark-bg px-3 py-1 rounded-lg border border-dark-border">
                          {w.method}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-black text-white mb-1">{w.accountTitle}</p>
                        <p className="text-xs font-black text-gray-500 tracking-widest">{w.accountNumber}</p>
                      </td>
                      <td className="px-8 py-6">
                        <span className={cn(
                          "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest inline-block border",
                          w.status === 'approved' ? "bg-green-500/10 text-green-500 border-green-500/20" :
                          w.status === 'rejected' ? "bg-red-500/10 text-red-500 border-red-500/20" : 
                          "bg-cyan-500/10 text-cyan-500 border-cyan-500/20"
                        )}>
                          {w.status}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        {w.trxId ? (
                          <p className="text-xs font-black text-gold-500 bg-gold-500/5 px-3 py-1.5 rounded-lg border border-gold-500/20 tracking-widest">{w.trxId}</p>
                        ) : w.status === 'pending' ? (
                          <input
                            type="text"
                            placeholder="Enter TRX ID"
                            value={trxInputs[w.id] || ''}
                            onChange={(e) => setTrxInputs({ ...trxInputs, [w.id]: e.target.value })}
                            className="text-[10px] font-black px-3 py-2 bg-dark-bg border border-dark-border rounded-xl focus:border-gold-500/50 focus:outline-none text-white w-32 tracking-widest"
                          />
                        ) : (
                          <span className="text-gray-700">-</span>
                        )}
                      </td>
                      <td className="px-8 py-6 text-right">
                        {w.status === 'pending' && (
                          <div className="flex items-center justify-end gap-3">
                            <button 
                              onClick={() => handleWithdrawalAction(w, 'approved')}
                              className="w-10 h-10 bg-green-500/10 text-green-500 rounded-xl hover:bg-green-500 hover:text-white transition-all flex items-center justify-center border border-green-500/20"
                              title="Approve"
                            >
                              <Check size={20} />
                            </button>
                            <button 
                              onClick={() => handleWithdrawalAction(w, 'rejected')}
                              className="w-10 h-10 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center border border-red-500/20"
                              title="Reject"
                            >
                              <X size={20} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="glass-card p-6">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Total Users</p>
              <p className="text-3xl font-black text-white tracking-tighter">{users.length}</p>
            </div>
            <div className="glass-card p-6 border-gold-500/20">
              <p className="text-[10px] font-black text-gold-500 uppercase tracking-widest mb-2">Platform Balance</p>
              <p className="text-3xl font-black text-white tracking-tighter">Rs {(adViews.reduce((sum, v) => sum + v.reward, 0) - withdrawals.filter(w => w.status !== 'rejected').reduce((sum, w) => sum + w.amount, 0)).toFixed(2)}</p>
            </div>
            <div className="glass-card p-6 border-cyan-500/20">
              <p className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-2">Total Earned</p>
              <p className="text-3xl font-black text-white tracking-tighter">Rs {adViews.reduce((sum, v) => sum + v.reward, 0).toFixed(2)}</p>
            </div>
            <div className="glass-card p-6 border-green-500/20">
              <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-2">Total Payouts</p>
              <p className="text-3xl font-black text-white tracking-tighter">Rs {withdrawals.filter(w => w.status === 'approved').reduce((sum, w) => sum + w.amount, 0).toFixed(2)}</p>
            </div>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-[1000px] w-full text-left">
                <thead className="bg-dark-surface border-b border-dark-border">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">User Email</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Current Balance</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Lifetime Earned</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Lifetime Withdrawn</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border">
                  {users.map((u) => {
                    const userWithdrawn = withdrawals
                      .filter(w => w.userId === u.uid && w.status === 'approved')
                      .reduce((sum, w) => sum + w.amount, 0);
                    
                    const userEarned = adViews
                      .filter(v => v.userId === u.uid)
                      .reduce((sum, v) => sum + v.reward, 0);
                    
                    const userRequested = withdrawals
                      .filter(w => w.userId === u.uid && w.status !== 'rejected')
                      .reduce((sum, w) => sum + w.amount, 0);
                    
                    const userBalance = userEarned - userRequested;
                    
                    return (
                      <tr key={u.uid} className="hover:bg-white/5 transition-colors">
                        <td className="px-8 py-6">
                          <p className="text-sm font-black text-white">{u.email}</p>
                          <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-1">UID: {u.uid.slice(0, 12)}...</p>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-lg font-black text-gold-400 tracking-tighter">Rs {userBalance.toFixed(2)}</p>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-sm font-black text-white">Rs {userEarned.toFixed(2)}</p>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-sm font-black text-gray-400">Rs {userWithdrawn.toFixed(2)}</p>
                        </td>
                        <td className="px-8 py-6">
                          <span className={cn(
                            "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                            u.role === 'admin' ? "bg-gold-500/10 text-gold-500 border-gold-500/20" : "bg-dark-bg text-gray-500 border-dark-border"
                          )}>
                            {u.role}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {activeTab === 'settings' && !settings && (
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="glass-card p-10 inline-block neon-gold-glow">
             <SettingsIcon size={64} className="text-gold-500 mx-auto mb-6 opacity-20" />
             <h2 className="text-2xl font-black text-white uppercase mb-4">Settings Not Initialized</h2>
             <p className="text-gray-500 mb-8">Initialize the global application settings to get started.</p>
             <button 
               onClick={handleInitializeSettings}
               className="gold-gradient text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.05] transition-all shadow-xl shadow-gold-500/20"
             >
               Initialize Settings
             </button>
          </div>
        </div>
      )}
      {activeTab === 'settings' && settings && (
        <div className="max-w-2xl mx-auto">
          <div className="glass-card p-10 neon-gold-glow">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-10 flex items-center gap-4">
              <SettingsIcon size={32} className="text-gold-500" />
              Global App <span className="gold-text">Settings</span>
            </h2>
            <form onSubmit={handleUpdateSettings} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">App Name</label>
                  <input
                    value={settings.appName}
                    onChange={e => setSettings({...settings, appName: e.target.value})}
                    className="w-full px-5 py-4 bg-dark-bg border border-dark-border rounded-2xl focus:border-gold-500/50 focus:outline-none text-white font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Min Withdrawal (Rs)</label>
                  <input
                    type="number"
                    value={settings.minWithdrawal}
                    onChange={e => setSettings({...settings, minWithdrawal: parseFloat(e.target.value)})}
                    className="w-full px-5 py-4 bg-dark-bg border border-dark-border rounded-2xl focus:border-gold-500/50 focus:outline-none text-white font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Fee Percentage (%)</label>
                  <input
                    type="number"
                    value={settings.withdrawalFeePercentage}
                    onChange={e => setSettings({...settings, withdrawalFeePercentage: parseFloat(e.target.value)})}
                    className="w-full px-5 py-4 bg-dark-bg border border-dark-border rounded-2xl focus:border-gold-500/50 focus:outline-none text-white font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Default Ad Reward (Rs)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.adReward}
                    onChange={e => setSettings({...settings, adReward: parseFloat(e.target.value)})}
                    className="w-full px-5 py-4 bg-dark-bg border border-dark-border rounded-2xl focus:border-gold-500/50 focus:outline-none text-white font-bold"
                  />
                </div>
              </div>
              <button className="w-full gold-gradient text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] transition-all shadow-xl shadow-gold-500/20">
                Save Global Settings
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
