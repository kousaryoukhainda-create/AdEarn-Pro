import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import functions from '@react-native-firebase/functions';
import messaging from '@react-native-firebase/messaging';
import analytics from '@react-native-firebase/analytics';

// Firebase configuration from environment
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  appId: process.env.FIREBASE_APP_ID,
  projectId: process.env.FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Export Firebase services
export { firebase, auth, firestore, functions, messaging, analytics };

// Helper function to get Cloud Function
export const getCloudFunction = (name: string) => {
  return functions().httpsCallable(name);
};

// Helper function to handle Firestore errors
export const handleFirestoreError = (
  error: unknown,
  operation: string,
  collection: string
): never => {
  const errorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operation,
    collection,
    timestamp: new Date().toISOString(),
  };
  
  console.error('Firestore Error:', JSON.stringify(errorInfo));
  throw error;
};
