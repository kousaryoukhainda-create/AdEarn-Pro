import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();
const auth = admin.auth();

// Email transporter
const createTransporter = () => {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || '587');
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.warn('SMTP not configured. Emails will be logged only.');
    return null;
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
};

const sendEmail = async (to: string, subject: string, text: string) => {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.log('--- EMAIL LOG (SMTP not configured) ---');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Text: ${text}`);
    console.log('---------------------------------------');
    return { logged: true };
  }

  return transporter.sendMail({
    from: `"AdEarn Pro" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
  });
};

// ============================================================================
// Withdrawal Function
// ============================================================================

export interface WithdrawalRequest {
  amount: number;
  method: string;
  accountTitle: string;
  accountNumber: string;
}

export interface WithdrawalResponse {
  success: boolean;
  withdrawalId?: string;
  message?: string;
}

/**
 * Request a withdrawal with server-side validation
 */
export const requestWithdrawal = functions.https.onCall(
  async (data: WithdrawalRequest, context): Promise<WithdrawalResponse> => {
    // Authentication check
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'You must be logged in to make a withdrawal request.'
      );
    }

    const userId = context.auth.uid;
    const userEmail = context.auth.token.email;

    // Input validation
    const { amount, method, accountTitle, accountNumber } = data;

    if (typeof amount !== 'number' || isNaN(amount)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Amount must be a valid number.'
      );
    }

    if (!method || typeof method !== 'string') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Payment method is required.'
      );
    }

    if (!accountTitle || typeof accountTitle !== 'string' || accountTitle.trim().length === 0) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Account title is required.'
      );
    }

    if (!accountNumber || typeof accountNumber !== 'string' || accountNumber.trim().length === 0) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Account number is required.'
      );
    }

    // Get app settings
    const settingsDoc = await db.doc('settings/global').get();
    const settings = settingsDoc.exists ? settingsDoc.data()! : {};
    
    const minWithdrawal = settings.minWithdrawal || 100;
    const withdrawalFeePercentage = settings.withdrawalFeePercentage || 10;
    const maxWithdrawal = 50000; // Hard maximum

    // Server-side amount validation
    if (amount < minWithdrawal) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        `Minimum withdrawal amount is Rs ${minWithdrawal}.`
      );
    }

    if (amount > maxWithdrawal) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        `Maximum withdrawal amount is Rs ${maxWithdrawal}.`
      );
    }

    // Validate payment method
    const validMethods = ['Jazz cash', 'Easy Paisa', 'Naya Pay', 'Sada Pay'];
    if (!validMethods.includes(method)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Invalid payment method.'
      );
    }

    // Calculate fee and net amount (server-side, cannot be tampered)
    const fee = amount * (withdrawalFeePercentage / 100);
    const netAmount = amount - fee;

    let withdrawalId: string | undefined;
    let insufficientBalance = false;

    // Transaction: Check balance and create withdrawal
    await db.runTransaction(async (transaction) => {
      const userRef = db.doc(`users/${userId}`);
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists) {
        throw new functions.https.HttpsError(
          'not-found',
          'User profile not found.'
        );
      }

      const userData = userDoc.data()!;
      const currentBalance = userData.balance || 0;

      // Balance check
      if (currentBalance < amount) {
        insufficientBalance = true;
        return; // Exit transaction early
      }

      // Create withdrawal request
      const withdrawalRef = db.collection('withdrawals').doc();
      withdrawalId = withdrawalRef.id;

      const withdrawalData = {
        id: withdrawalId,
        userId,
        userEmail,
        amount,
        fee,
        netAmount,
        status: 'pending' as const,
        method,
        accountTitle: accountTitle.trim(),
        accountNumber: accountNumber.trim(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      transaction.set(withdrawalRef, withdrawalData);

      // Deduct from user balance immediately
      transaction.update(userRef, {
        balance: admin.firestore.FieldValue.increment(-amount),
      });
    });

    // Handle insufficient balance
    if (insufficientBalance) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Insufficient balance for this withdrawal.'
      );
    }

    // Send admin notification email
    try {
      const adminEmail = 'kousaryoukhainda@gmail.com';
      const subject = `NEW Withdrawal Request - AdEarn Pro`;
      const message = `Hello Admin,

A new withdrawal request has been received on AdEarn Pro.

--- Request Details ---
User Email: ${userEmail}
User ID: ${userId}
Amount: Rs ${amount.toFixed(2)}
Fee (${withdrawalFeePercentage}%): Rs ${fee.toFixed(2)}
Net Amount: Rs ${netAmount.toFixed(2)}
Account Title: ${accountTitle}
Account Number: ${accountNumber}
Payment Method: ${method}
Time: ${new Date().toLocaleString()}
Withdrawal ID: ${withdrawalId}

Please login to the Admin Panel to review and process this request.

AdEarn Pro System`;

      await sendEmail(adminEmail, subject, message);
    } catch (emailError) {
      console.error('Failed to send admin notification email:', emailError);
      // Don't fail the withdrawal if email fails
    }

    return {
      success: true,
      withdrawalId,
      message: 'Withdrawal request submitted successfully.',
    };
  }
);

// ============================================================================
// Claim Ad Reward Function
// ============================================================================

export interface ClaimRewardRequest {
  adId: string;
}

export interface ClaimRewardResponse {
  success: boolean;
  reward?: number;
  message?: string;
}

/**
 * Claim reward for watching an ad with server-side validation
 */
export const claimAdReward = functions.https.onCall(
  async (data: ClaimRewardRequest, context): Promise<ClaimRewardResponse> => {
    // Authentication check
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'You must be logged in to claim rewards.'
      );
    }

    const userId = context.auth.uid;

    // Input validation
    const { adId } = data;

    if (!adId || typeof adId !== 'string') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Ad ID is required.'
      );
    }

    let reward: number | undefined;

    await db.runTransaction(async (transaction) => {
      // Verify ad exists and is active
      const adRef = db.doc(`ads/${adId}`);
      const adDoc = await transaction.get(adRef);

      if (!adDoc.exists) {
        throw new functions.https.HttpsError(
          'not-found',
          'Advertisement not found.'
        );
      }

      const adData = adDoc.data()!;

      if (!adData.active) {
        throw new functions.https.HttpsError(
          'failed-precondition',
          'This advertisement is no longer active.'
        );
      }

      const adReward = adData.reward || 0;
      
      // Validate reward is reasonable
      if (adReward <= 0 || adReward > 100) {
        throw new functions.https.HttpsError(
          'failed-precondition',
          'Invalid ad reward configuration.'
        );
      }

      // Check if user already watched this ad
      // Use a deterministic query to check for existing view
      const existingViewsQuery = db.collection('adViews')
        .where('userId', '==', userId)
        .where('adId', '==', adId)
        .limit(1);
      
      const existingViews = await existingViewsQuery.get();

      if (!existingViews.empty) {
        throw new functions.https.HttpsError(
          'already-exists',
          'You have already watched this advertisement.'
        );
      }

      // Create ad view record
      const viewRef = db.collection('adViews').doc();
      const viewData = {
        id: viewRef.id,
        userId,
        adId,
        reward: adReward,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      };

      transaction.set(viewRef, viewData);

      // Update user balance and total earned
      const userRef = db.doc(`users/${userId}`);
      transaction.update(userRef, {
        balance: admin.firestore.FieldValue.increment(adReward),
        totalEarned: admin.firestore.FieldValue.increment(adReward),
      });

      reward = adReward;
    });

    return {
      success: true,
      reward,
      message: `Reward of Rs ${(reward || 0).toFixed(2)} claimed successfully!`,
    };
  }
);

// ============================================================================
// Admin Functions
// ============================================================================

export interface ProcessWithdrawalRequest {
  withdrawalId: string;
  status: 'approved' | 'rejected';
  trxId?: string;
}

export interface ProcessWithdrawalResponse {
  success: boolean;
  message?: string;
}

/**
 * Process a withdrawal request (admin only)
 */
export const processWithdrawal = functions.https.onCall(
  async (data: ProcessWithdrawalRequest, context): Promise<ProcessWithdrawalResponse> => {
    // Authentication check
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'You must be logged in to process withdrawals.'
      );
    }

    // Admin check
    const userDoc = await db.doc(`users/${context.auth.uid}`).get();
    const userData = userDoc.data();
    
    if (!userData || userData.role !== 'admin') {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only administrators can process withdrawals.'
      );
    }

    // Input validation
    const { withdrawalId, status, trxId } = data;

    if (!withdrawalId || typeof withdrawalId !== 'string') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Withdrawal ID is required.'
      );
    }

    if (!status || !['approved', 'rejected'].includes(status)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Status must be either "approved" or "rejected".'
      );
    }

    if (status === 'approved' && !trxId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Transaction ID is required for approved withdrawals.'
      );
    }

    let withdrawalData: any;
    let userEmail: string | undefined;

    // Update withdrawal status
    await db.runTransaction(async (transaction) => {
      const withdrawalRef = db.doc(`withdrawals/${withdrawalId}`);
      const withdrawalDoc = await transaction.get(withdrawalRef);

      if (!withdrawalDoc.exists) {
        throw new functions.https.HttpsError(
          'not-found',
          'Withdrawal request not found.'
        );
      }

      withdrawalData = withdrawalDoc.data()!;

      if (withdrawalData.status !== 'pending') {
        throw new functions.https.HttpsError(
          'failed-precondition',
          'This withdrawal has already been processed.'
        );
      }

      userEmail = withdrawalData.userEmail;

      const updateData: any = {
        status,
        statusUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      if (status === 'approved' && trxId) {
        updateData.trxId = trxId;
      }

      transaction.update(withdrawalRef, updateData);

      // Handle balance adjustments
      const userRef = db.doc(`users/${withdrawalData.userId}`);
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists) {
        throw new functions.https.HttpsError(
          'not-found',
          'User not found for this withdrawal.'
        );
      }

      if (status === 'rejected') {
        // Refund the amount to user
        transaction.update(userRef, {
          balance: admin.firestore.FieldValue.increment(withdrawalData.amount),
        });
      } else if (status === 'approved') {
        // Update total withdrawn
        transaction.update(userRef, {
          totalWithdrawn: admin.firestore.FieldValue.increment(withdrawalData.amount),
        });
      }
    });

    // Send notification email to user
    if (userEmail) {
      try {
        const subject = `Withdrawal Request ${status.charAt(0).toUpperCase() + status.slice(1)} - AdEarn Pro`;
        const formattedDate = new Date().toLocaleString();
        
        let message = `Hello,

Your withdrawal request for Rs ${withdrawalData.amount.toFixed(2)} has been ${status}.

--- Transaction Details ---
App Name: AdEarn Pro
Status: ${status.toUpperCase()}
Amount: Rs ${withdrawalData.amount.toFixed(2)}
Fee: Rs ${withdrawalData.fee.toFixed(2)}
Net Amount: Rs ${withdrawalData.netAmount.toFixed(2)}
Account Title: ${withdrawalData.accountTitle}
Account Number: ${withdrawalData.accountNumber}
Payment Method: ${withdrawalData.method}
Time: ${formattedDate}`;

        if (status === 'approved') {
          message += `\nTRX ID: ${trxId}\n\nThe funds have been sent to your ${withdrawalData.method} account.`;
        } else {
          message += `\n\nReason: Your request did not meet our criteria. The amount has been refunded to your balance.`;
        }

        message += `\n\nThank you for using AdEarn Pro!`;

        await sendEmail(userEmail, subject, message);
      } catch (emailError) {
        console.error('Failed to send user notification email:', emailError);
      }
    }

    return {
      success: true,
      message: `Withdrawal ${status} successfully.`,
    };
  }
);
