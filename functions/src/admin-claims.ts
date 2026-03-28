import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();
const auth = admin.auth();

/**
 * Cloud Function to set admin custom claims
 * This should only be called once by the super admin
 * 
 * Usage:
 * 1. Deploy this function
 * 2. Call it via Firebase Console or gcloud CLI
 * 3. Verify the claims are set
 * 4. Delete this function (optional, for security)
 */
export const setAdminClaims = functions.https.onCall(async (data, context) => {
  // Security: Only allow specific email to set admin claims
  const ALLOWED_ADMIN_EMAIL = 'kousaryoukhainda@gmail.com';
  
  // Verify caller is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be authenticated to set admin claims.'
    );
  }

  // Verify caller is the allowed admin
  if (context.auth.token.email !== ALLOWED_ADMIN_EMAIL) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only the super admin can set admin claims.'
    );
  }

  const { uid, setAdmin } = data;

  if (!uid || typeof uid !== 'string') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'User UID is required.'
    );
  }

  try {
    // Set custom claims
    await auth.setCustomUserClaims(uid, {
      admin: setAdmin === true,
    });

    // Update user document in Firestore
    const userRef = db.doc(`users/${uid}`);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      await userRef.update({
        role: setAdmin ? 'admin' : 'user',
      });
    } else {
      await userRef.set({
        uid,
        email: context.auth.token.email,
        role: setAdmin ? 'admin' : 'user',
        balance: 0,
        totalEarned: 0,
        totalWithdrawn: 0,
        createdAt: new Date().toISOString(),
      });
    }

    return {
      success: true,
      message: `User ${uid} is now ${setAdmin ? 'an admin' : 'a regular user'}.`,
    };
  } catch (error) {
    console.error('Error setting admin claims:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to set admin claims.'
    );
  }
});

/**
 * Cloud Function to verify current user's claims
 * Useful for debugging and verification
 */
export const verifyAdminClaims = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be authenticated.'
    );
  }

  const userRecord = await auth.getUser(context.auth.uid);
  const customClaims = userRecord.customClaims || {};

  return {
    uid: context.auth.uid,
    email: context.auth.token.email,
    isAdmin: customClaims.admin === true,
    customClaims,
  };
});

/**
 * On user creation trigger - automatically set admin claims for specific email
 * This ensures the admin user always has admin claims
 */
export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  const ADMIN_EMAIL = 'kousaryoukhainda@gmail.com';
  
  if (user.email === ADMIN_EMAIL) {
    await auth.setCustomUserClaims(user.uid, {
      admin: true,
    });

    // Also update Firestore user document
    const userRef = db.doc(`users/${user.uid}`);
    await userRef.set({
      uid: user.uid,
      email: user.email,
      role: 'admin',
      balance: 0,
      totalEarned: 0,
      totalWithdrawn: 0,
      createdAt: new Date().toISOString(),
    }, { merge: true });

    console.log(`Admin claims set for ${user.email}`);
  }
});
