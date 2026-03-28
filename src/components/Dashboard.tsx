import React, { useState, useEffect } from 'react';
import { UserProfile, AdView } from '../types';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { TrendingUp, Wallet, PlayCircle, History as HistoryIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, limit } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

interface DashboardProps {
  user: UserProfile;
}

export default function Dashboard({ user }: DashboardProps) {
  const [recentViews, setRecentViews] = useState<AdView[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [totalRequested, setTotalRequested] = useState(0);

  useEffect(() => {
    const qRecent = query(
      collection(db, 'adViews'),
      where('userId', '==', user.uid),
      limit(20) // Fetch a few more to allow for in-memory sorting
    );
    const unsubRecent = onSnapshot(qRecent, (snapshot) => {
      const list = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as AdView))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5);
      setRecentViews(list);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'adViews');
    });

    const qTotal = query(
      collection(db, 'adViews'),
      where('userId', '==', user.uid)
    );
    const unsubTotal = onSnapshot(qTotal, (snapshot) => {
      setTotalViews(snapshot.size);
      const earned = snapshot.docs.reduce((sum, doc) => sum + (doc.data().reward || 0), 0);
      setTotalEarned(earned);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'adViews');
    });

    const qWithdrawals = query(
      collection(db, 'withdrawals'),
      where('userId', '==', user.uid)
    );
    const unsubWithdrawals = onSnapshot(qWithdrawals, (snapshot) => {
      const requested = snapshot.docs
        .filter(doc => doc.data().status !== 'rejected')
        .reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
      setTotalRequested(requested);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'withdrawals');
    });

    return () => {
      unsubRecent();
      unsubTotal();
      unsubWithdrawals();
    };
  }, [user.uid]);

  const stats = [
    { label: 'Current Balance', value: `Rs ${(totalEarned - totalRequested).toFixed(2)}`, icon: Wallet, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Earned', value: `Rs ${totalEarned.toFixed(2)}`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Ads Watched', value: totalViews.toString(), icon: PlayCircle, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">
            Welcome back, <span className="gold-text uppercase">{user.email.split('@')[0]}</span>
          </h1>
          <p className="text-gray-500 font-medium">Here's what's happening with your account today.</p>
        </div>
        <div className="flex items-center gap-3 bg-dark-surface p-2 rounded-2xl border border-dark-border">
          <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center text-gold-400">
            <TrendingUp size={20} />
          </div>
          <div className="pr-4">
            <p className="text-[10px] uppercase tracking-widest font-black text-gray-500">Status</p>
            <p className="text-sm font-bold text-gray-200">Active Earner</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-8 relative overflow-hidden group"
          >
            <div className={cn(
              "absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 blur-3xl transition-colors",
              i === 0 ? "bg-gold-500/5 group-hover:bg-gold-500/10" :
              i === 1 ? "bg-cyan-500/5 group-hover:bg-cyan-500/10" :
              "bg-purple-500/5 group-hover:bg-purple-500/10"
            )} />
            <div className="flex items-center gap-4 mb-6">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg",
                i === 0 ? "gold-gradient" :
                i === 1 ? "bg-cyan-500 shadow-cyan-500/20" :
                "bg-purple-500 shadow-purple-500/20"
              )}>
                <stat.icon size={24} />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-500">{stat.label}</h3>
            </div>
            <p className="text-4xl font-black text-white tracking-tighter">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="glass-card p-10">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-dark-border flex items-center justify-center text-gold-400 border border-gold-500/20">
                <PlayCircle size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Quick Actions</h3>
                <p className="text-xs text-gray-500 font-bold">Start earning rewards now</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Link 
              to="/ads"
              className="group p-8 rounded-[2rem] bg-dark-bg border border-dark-border hover:border-gold-500/50 transition-all duration-500 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gold-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <PlayCircle className="text-gold-500 mb-4 group-hover:scale-110 transition-transform" size={40} />
              <p className="text-lg font-black text-white mb-1 uppercase tracking-tight">Watch Ads</p>
              <p className="text-xs text-gray-500 font-bold">Earn up to Rs 10 per ad</p>
            </Link>
            <Link 
              to="/withdraw"
              className="group p-8 rounded-[2rem] bg-dark-bg border border-dark-border hover:border-cyan-500/50 transition-all duration-500 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <TrendingUp className="text-cyan-500 mb-4 group-hover:scale-110 transition-transform" size={40} />
              <p className="text-lg font-black text-white mb-1 uppercase tracking-tight">Withdraw</p>
              <p className="text-xs text-gray-500 font-bold">Fast & secure payments</p>
            </Link>
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="p-10 border-b border-dark-border flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-dark-border flex items-center justify-center text-gold-400 border border-gold-500/20">
                <HistoryIcon size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Recent Activity</h3>
                <p className="text-xs text-gray-500 font-bold">Your latest ad views</p>
              </div>
            </div>
            <button className="text-xs font-black uppercase tracking-widest text-gold-500 hover:text-gold-400 transition-colors">View All</button>
          </div>
          <div className="divide-y divide-dark-border">
            {recentViews.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-16 h-16 bg-dark-bg rounded-full flex items-center justify-center mx-auto mb-4 border border-dark-border">
                  <HistoryIcon className="text-gray-700" size={32} />
                </div>
                <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">No activity yet</p>
              </div>
            ) : (
              recentViews.map((view) => (
                <div key={view.id} className="p-8 flex items-center justify-between hover:bg-white/5 transition-colors group">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-dark-bg rounded-2xl flex items-center justify-center border border-dark-border group-hover:border-gold-500/20 transition-colors">
                      <PlayCircle className="text-gray-500 group-hover:text-gold-500 transition-colors" size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-white uppercase tracking-tight">Watched Ad Reward</p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                        {formatDistanceToNow(new Date(view.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <p className="text-lg font-black text-green-500 tracking-tight">+Rs {view.reward.toFixed(2)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
