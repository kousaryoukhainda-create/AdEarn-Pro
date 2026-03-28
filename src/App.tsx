import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProfile } from './types';
import Auth from './components/Auth';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Ads from './components/Ads';
import Withdraw from './components/Withdraw';
import Admin from './components/Admin';
import Settings from './components/Settings';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDocFromServer } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './lib/firestore-errors';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    }
    testConnection();

    let unsubProfile: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = null;
      }

      if (firebaseUser) {
        // Force token refresh to get latest custom claims
        await firebaseUser.getIdTokenResult(true);
        
        const userRef = doc(db, 'users', firebaseUser.uid);
        unsubProfile = onSnapshot(userRef, (docSnap) => {
          console.log('User Snapshot received. Exists:', docSnap.exists(), 'Data:', docSnap.data());
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            console.log('Updating user state with balance:', data.balance);
            setUser({ ...data }); // Force new object reference
            setLoading(false);
          } else {
            console.log('User document does not exist, creating new profile for:', firebaseUser.email);
            // Get ID token result to check admin claims
            const idTokenResult = await firebaseUser.getIdTokenResult();
            const isAdminClaim = idTokenResult.claims.admin === true;
            
            const newUser: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              balance: 0,
              totalEarned: 0,
              totalWithdrawn: 0,
              role: isAdminClaim ? 'admin' : 'user',
              createdAt: new Date().toISOString(),
            };
            setDoc(userRef, newUser)
              .then(() => {
                console.log('New user profile created successfully');
                setUser(newUser);
                setLoading(false);
              })
              .catch((error) => {
                console.error('Error creating user profile:', error);
                handleFirestoreError(error, OperationType.WRITE, `users/${firebaseUser.uid}`);
              });
          }
        }, (error) => {
          console.error('User Snapshot error:', error);
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
        });
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <Router>
      <Layout user={user}>
        <Routes>
          <Route path="/" element={<Dashboard user={user} />} />
          <Route path="/ads" element={<Ads user={user} />} />
          <Route path="/withdraw" element={<Withdraw user={user} />} />
          <Route path="/settings" element={<Settings user={user} />} />
          {user.role === 'admin' && (
            <Route path="/admin" element={<Admin />} />
          )}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}
