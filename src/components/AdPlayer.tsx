import React, { useState, useEffect } from 'react';
import { Ad, UserProfile, AdView } from '../types';
import { motion } from 'motion/react';
import { X, Clock, CheckCircle2, AlertCircle, DollarSign, Wallet, ExternalLink } from 'lucide-react';
import { getEmbedUrl } from '../lib/utils';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

interface AdPlayerProps {
  ad: Ad;
  user: UserProfile;
  onClose: () => void;
}

export default function AdPlayer({ ad, user, onClose }: AdPlayerProps) {
  const [timeLeft, setTimeLeft] = useState(ad.duration);
  const [isFinished, setIsFinished] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isClaimed, setIsClaimed] = useState(false);
  const [isLaunched, setIsLaunched] = useState(false);

  // Initialize Cloud Functions
  const functions = getFunctions();
  const claimAdRewardFn = httpsCallable<{
    adId: string;
  }, { success: boolean; reward?: number; message?: string }>(functions, 'claimAdReward');

  useEffect(() => {
    if (isLaunched && timeLeft > 0 && !isClaimed) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isLaunched && timeLeft === 0) {
      setIsFinished(true);
    }
  }, [isLaunched, timeLeft, isClaimed]);

  const handleLaunch = () => {
    window.open(ad.url, '_blank');
    setIsLaunched(true);
  };

  const handleClaim = async () => {
    if (!isFinished || isClaiming || isClaimed) return;
    setIsClaiming(true);
    setError(null);

    try {
      // Call Cloud Function for server-side validation and reward claiming
      const result = await claimAdRewardFn({ adId: ad.id });
      const response = result.data;

      if (response.success) {
        setIsClaimed(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError('Failed to claim reward. Please try again.');
        setIsClaiming(false);
      }
    } catch (err: any) {
      console.error('Failed to claim reward:', err);
      
      // Handle Cloud Function errors
      if (err.code === 'functions/unauthenticated') {
        setError('You must be logged in to claim rewards.');
      } else if (err.code === 'functions/invalid-argument') {
        setError(err.message);
      } else if (err.code === 'functions/not-found') {
        setError('Advertisement not found.');
      } else if (err.code === 'functions/failed-precondition') {
        setError(err.message);
      } else if (err.code === 'functions/already-exists') {
        setError('You have already watched this advertisement.');
      } else {
        setError('Failed to claim reward. Please try again.');
      }
      setIsClaiming(false);
    }
  };

  const progress = ((ad.duration - timeLeft) / ad.duration) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="glass-card w-full max-w-4xl overflow-hidden flex flex-col h-[80vh] border-gold-500/30"
      >
        {/* Header */}
        <div className="p-6 border-b border-dark-border flex items-center justify-between bg-dark-surface">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 gold-gradient rounded-xl flex items-center justify-center text-white shadow-lg shadow-gold-500/20">
              <Clock size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight">{ad.title}</h3>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                {isClaimed ? 'Reward Claimed!' : isFinished ? 'Ready to claim' : 'Watching for reward'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {!isClaimed && (
              <button 
                onClick={() => alert('Ad reported. Thank you for your feedback.')}
                className="text-[10px] font-black text-gray-500 hover:text-red-500 transition-colors uppercase tracking-widest"
              >
                Report Broken
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-2 hover:bg-dark-bg rounded-full transition-colors text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-dark-bg overflow-hidden border-b border-dark-border">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full gold-gradient"
          />
        </div>

        {/* Ad Content Area */}
        <div className="flex-1 bg-dark-bg relative overflow-hidden flex flex-col items-center justify-center p-12 text-center">
          {isClaimed ? (
            <div className="absolute inset-0 bg-dark-bg flex flex-col items-center justify-center text-center p-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-24 h-24 gold-gradient text-white rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-gold-500/30"
              >
                <CheckCircle2 size={48} />
              </motion.div>
              <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">Success!</h2>
              <p className="text-xl font-black text-gold-400 tracking-tight mb-6">You've earned Rs {ad.reward.toFixed(2)}</p>
              <p className="text-xs font-black text-gray-500 uppercase tracking-widest animate-pulse">Closing in a moment...</p>
            </div>
          ) : (
            <div className="max-w-md mx-auto">
              {!isLaunched ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-8"
                >
                  <div className="w-24 h-24 gold-gradient rounded-3xl flex items-center justify-center text-white mx-auto shadow-2xl shadow-gold-500/30 rotate-3">
                    <ExternalLink size={40} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Ready to <span className="gold-text">Earn</span>?</h2>
                    <p className="text-gray-500 font-medium leading-relaxed">
                      Click the button below to open the ad in a new tab. 
                      Keep this window open to track your progress and claim your reward.
                    </p>
                  </div>
                  <button
                    onClick={handleLaunch}
                    className="w-full gold-gradient text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] transition-all flex items-center justify-center gap-3 shadow-xl shadow-gold-500/20 active:scale-[0.98]"
                  >
                    <ExternalLink size={20} />
                    Launch Ad in New Tab
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div className="w-24 h-24 bg-dark-surface rounded-3xl flex items-center justify-center text-gold-500 mx-auto border border-dark-border shadow-xl">
                    <Clock size={40} className="animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">
                      {isFinished ? "Time's Up!" : "Tracking <span className='gold-text'>Progress</span>"}
                    </h2>
                    <p className="text-gray-500 font-medium leading-relaxed">
                      {isFinished 
                        ? "You've watched long enough. You can now claim your reward below." 
                        : `Please wait ${timeLeft} more seconds while the ad runs in your other tab.`}
                    </p>
                  </div>
                  {!isFinished && (
                    <div className="flex flex-col gap-3">
                      <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest">Don't see the ad?</p>
                      <button
                        onClick={() => window.open(ad.url, '_blank')}
                        className="text-xs font-black text-gold-500 hover:text-gold-400 uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
                      >
                        <ExternalLink size={14} />
                        Re-open Ad Tab
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          )}

          {/* Overlay when not finished */}
          {isLaunched && !isFinished && !isClaimed && (
            <div className="absolute top-6 right-6 flex flex-col items-end gap-3 z-20">
              <div className="bg-dark-surface/80 backdrop-blur-md text-white px-6 py-3 rounded-2xl flex items-center gap-3 text-sm font-black border border-dark-border shadow-2xl">
                <Clock size={16} className="text-gold-500 animate-pulse" />
                <span className="tabular-nums">{timeLeft}s remaining</span>
              </div>
              <motion.div 
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="gold-gradient text-white px-6 py-3 rounded-2xl flex items-center gap-2 text-sm font-black border border-white/10 shadow-xl shadow-gold-500/20"
              >
                Reward: Rs {ad.reward.toFixed(2)}
              </motion.div>
            </div>
          )}
        </div>

        {/* Footer / Claim Area */}
        <div className="p-8 bg-dark-surface border-t border-dark-border">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 text-red-400 rounded-2xl text-xs font-bold flex items-center gap-3 border border-red-500/20">
              <AlertCircle size={18} />
              {error}
            </div>
          )}
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-10">
              <div className="text-left">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">
                  Potential Reward
                </p>
                <p className="text-2xl font-black text-gold-400 tracking-tighter">Rs {ad.reward.toFixed(2)}</p>
              </div>
              <div className="h-10 w-px bg-dark-border hidden md:block" />
              <div className="text-left">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">
                  Your Balance
                </p>
                <p className="text-2xl font-black text-white tracking-tighter">Rs {user.balance.toFixed(2)}</p>
              </div>
            </div>

            {isClaimed ? (
              <div className="bg-gold-500/10 text-gold-500 px-12 py-4 rounded-2xl font-black uppercase tracking-widest text-sm border border-gold-500/20 flex items-center gap-3">
                <CheckCircle2 size={20} />
                Claimed
              </div>
            ) : isFinished ? (
              <button
                onClick={handleClaim}
                disabled={isClaiming}
                className="w-full md:w-auto gold-gradient text-white px-12 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] transition-all flex items-center justify-center gap-3 disabled:opacity-30 shadow-xl shadow-gold-500/20"
              >
                {isClaiming ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <CheckCircle2 size={20} />
                    Claim Reward
                  </>
                )}
              </button>
            ) : !isLaunched ? (
              <div className="w-full md:w-auto bg-dark-bg text-gray-600 px-12 py-4 rounded-2xl font-black uppercase tracking-widest text-sm border border-dark-border flex items-center justify-center gap-3 cursor-not-allowed opacity-50">
                <ExternalLink size={20} />
                Launch Ad First
              </div>
            ) : (
              <div className="w-full md:w-auto bg-dark-bg text-gold-500/50 px-12 py-4 rounded-2xl font-black uppercase tracking-widest text-sm border border-dark-border flex items-center justify-center gap-3 cursor-not-allowed">
                <Clock size={20} className="animate-pulse" />
                Wait {timeLeft}s
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
