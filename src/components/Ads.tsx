import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Ad, UserProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Clock, DollarSign, ExternalLink } from 'lucide-react';
import AdPlayer from './AdPlayer';

interface AdsProps {
  user: UserProfile;
}

export default function Ads({ user }: AdsProps) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [watchedAdIds, setWatchedAdIds] = useState<Set<string>>(new Set());
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all active ads
    const qAds = query(collection(db, 'ads'), where('active', '==', true));
    const unsubscribeAds = onSnapshot(qAds, (snapshot) => {
      const adsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ad));
      setAds(adsList);
      setLoading(false);
    });

    // Fetch watched ads for the current user
    const qViews = query(collection(db, 'adViews'), where('userId', '==', user.uid));
    const unsubscribeViews = onSnapshot(qViews, (snapshot) => {
      const watchedIds = new Set(snapshot.docs.map(doc => doc.data().adId as string));
      setWatchedAdIds(watchedIds);
    });

    return () => {
      unsubscribeAds();
      unsubscribeViews();
    };
  }, [user.uid]);

  const availableAds = ads.filter(ad => !watchedAdIds.has(ad.id));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2 uppercase">Available <span className="gold-text">Ads</span></h1>
          <p className="text-gray-500 font-medium">Watch ads to earn rewards instantly.</p>
        </div>
        <div className="bg-dark-surface px-6 py-3 rounded-2xl border border-dark-border flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center text-white">
            <Play size={18} />
          </div>
          <span className="text-sm font-black text-gray-200 uppercase tracking-widest">{availableAds.length} Ads Available</span>
        </div>
      </div>

      {availableAds.length === 0 ? (
        <div className="glass-card p-20 text-center">
          <div className="w-20 h-20 bg-dark-bg rounded-full flex items-center justify-center mx-auto mb-6 border border-dark-border">
            <Play className="text-gray-700" size={40} />
          </div>
          <h3 className="text-2xl font-black text-white uppercase mb-2">No Ads Available</h3>
          <p className="text-gray-500 font-medium">You've watched all available ads or there are no new ones. Check back later!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {availableAds.map((ad, i) => (
            <motion.div
              key={ad.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card group relative overflow-hidden flex flex-col"
            >
              <div className="p-8 flex-1">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-dark-bg border border-dark-border flex items-center justify-center text-gold-500 group-hover:border-gold-500/30 transition-colors">
                    <Play size={28} />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Reward</p>
                    <p className="text-2xl font-black text-gold-400 tracking-tighter">Rs {ad.reward.toFixed(2)}</p>
                  </div>
                </div>
                
                <h3 className="text-xl font-black text-white uppercase tracking-tight mb-3 group-hover:gold-text transition-all">{ad.title}</h3>
                <p className="text-sm text-gray-500 font-medium line-clamp-2 mb-6">{ad.description || 'Watch this advertisement to earn rewards.'}</p>
                
                <div className="flex items-center gap-6 pt-6 border-t border-dark-border">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-gold-500" />
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{ad.duration}s</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign size={14} className="text-cyan-500" />
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Instant</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedAd(ad)}
                className="w-full py-5 bg-dark-border text-white font-black uppercase tracking-widest text-xs hover:gold-gradient transition-all duration-300 flex items-center justify-center gap-3 group-hover:bg-gold-500/10"
              >
                <Play size={18} />
                Watch Now
              </button>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedAd && (
          <AdPlayer 
            ad={selectedAd} 
            user={user} 
            onClose={() => setSelectedAd(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
