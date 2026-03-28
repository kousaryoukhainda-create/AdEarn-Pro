import React, { useState, useEffect } from 'react';
import { UserProfile, AppSettings } from '../types';
import { motion } from 'motion/react';
import { Settings as SettingsIcon, Shield, User, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { db } from '../firebase';
import { doc, onSnapshot, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { cn } from '../lib/utils';

interface SettingsProps {
  user: UserProfile;
}

const DEFAULT_SETTINGS: AppSettings = {
  minWithdrawal: 100,
  withdrawalFeePercentage: 10,
  adReward: 0.5,
  appName: 'AdEarn Pro',
  contactEmail: 'support@adearnpro.com'
};

export default function Settings({ user }: SettingsProps) {
  const [appSettings, setAppSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        setAppSettings(docSnap.data() as AppSettings);
      } else if (user.role === 'admin') {
        // Initialize settings if they don't exist (Admin only)
        setDoc(doc(db, 'settings', 'global'), DEFAULT_SETTINGS)
          .catch(err => console.error('Error initializing settings:', err));
      }
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'settings/global');
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user.role !== 'admin') return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await updateDoc(doc(db, 'settings', 'global'), { ...appSettings });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      setError('Failed to update global settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage your profile and application configuration.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
                <User size={40} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">{user.email}</h3>
              <p className="text-sm text-gray-500 capitalize mb-6">{user.role} Account</p>
              
              <div className="w-full space-y-4 text-left">
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">Account UID</p>
                  <p className="text-xs font-mono text-gray-600 break-all">{user.uid}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">Joined On</p>
                  <p className="text-xs text-gray-600">{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Global App Settings (Admin Only) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
                <Shield className="text-white" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">App Configuration</h3>
                <p className="text-xs text-gray-500">Global parameters for AdEarn Pro</p>
              </div>
            </div>

            {user.role === 'admin' ? (
              <form onSubmit={handleSaveSettings} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">App Name</label>
                    <input
                      type="text"
                      value={appSettings.appName}
                      onChange={(e) => setAppSettings({ ...appSettings, appName: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Contact Email</label>
                    <input
                      type="email"
                      value={appSettings.contactEmail}
                      onChange={(e) => setAppSettings({ ...appSettings, contactEmail: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Min Withdrawal (Rs)</label>
                    <input
                      type="number"
                      value={appSettings.minWithdrawal}
                      onChange={(e) => setAppSettings({ ...appSettings, minWithdrawal: parseFloat(e.target.value) })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Withdrawal Fee (%)</label>
                    <input
                      type="number"
                      value={appSettings.withdrawalFeePercentage}
                      onChange={(e) => setAppSettings({ ...appSettings, withdrawalFeePercentage: parseFloat(e.target.value) })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Ad Reward (Rs)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={appSettings.adReward}
                      onChange={(e) => setAppSettings({ ...appSettings, adReward: parseFloat(e.target.value) })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-gray-900 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm flex items-center gap-3">
                    <AlertCircle size={18} />
                    {error}
                  </div>
                )}

                {success && (
                  <div className="p-4 bg-green-50 text-green-600 rounded-2xl text-sm flex items-center gap-3">
                    <CheckCircle2 size={18} />
                    Settings saved successfully!
                  </div>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Save size={20} />
                      Save Changes
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="text-gray-300" size={32} />
                </div>
                <p className="text-gray-500 text-sm">Global app settings are restricted to administrators only.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
