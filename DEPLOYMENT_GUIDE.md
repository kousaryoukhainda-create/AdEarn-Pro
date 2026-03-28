# Firebase Deployment Guide

Quick deployment guide for AdEarn Pro to Firebase.

---

## Prerequisites

1. **Node.js 20+** installed
2. **Firebase CLI** installed
3. **Firebase Project** created
4. **Billing enabled** (for Cloud Functions)

---

## Quick Start

### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Login to Firebase

```bash
firebase login
```

### 3. Initialize Firebase (if not done)

```bash
firebase init
```

Select:
- ✅ Firestore
- ✅ Functions
- ✅ Hosting

Use existing project: `gen-lang-client-0553826491` (or your project)

### 4. Install Dependencies

```bash
# Root dependencies
npm install

# Cloud Functions dependencies
cd functions
npm install
```

### 5. Deploy Everything

```bash
# From project root
./deploy.sh
```

Or manually:

```bash
# Deploy Firestore Rules
firebase deploy --only firestore:rules

# Deploy Cloud Functions
firebase deploy --only functions

# Deploy Firestore Indexes
firebase deploy --only firestore:indexes
```

---

## Set Admin Claims

After deployment, set admin claims for your account:

### Option 1: Using Script

```bash
./scripts/set-admin-claims.sh
```

### Option 2: Using Firebase CLI

```bash
# Get your UID from Firebase Console or after login
firebase functions:call setAdminClaims --data '{"uid":"YOUR_UID","setAdmin":true}'
```

### Option 3: Using Cloud Console

1. Go to Firebase Console > Authentication
2. Find your user and copy the UID
3. Use the Cloud Function as shown above

### Verify Admin Claims

```bash
firebase functions:call verifyAdminClaims
```

---

## Environment Variables

### For Cloud Functions

```bash
# Set SMTP for email notifications
firebase functions:secrets:set SMTP_HOST
firebase functions:secrets:set SMTP_PORT
firebase functions:secrets:set SMTP_USER
firebase functions:secrets:set SMTP_PASS
```

### For Web App

Create `.env` file in root:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## Deployment Commands

| Command | Description |
|---------|-------------|
| `firebase deploy` | Deploy everything |
| `firebase deploy --only firestore:rules` | Deploy rules only |
| `firebase deploy --only firestore:indexes` | Deploy indexes only |
| `firebase deploy --only functions` | Deploy functions only |
| `firebase deploy --only hosting` | Deploy web app |
| `./deploy.sh` | Deploy rules + functions |

---

## Post-Deployment Checklist

### 1. Verify Cloud Functions

```bash
firebase functions:list
```

Expected functions:
- ✅ requestWithdrawal
- ✅ claimAdReward
- ✅ processWithdrawal
- ✅ setAdminClaims
- ✅ verifyAdminClaims
- ✅ onUserCreate (trigger)

### 2. Test Firestore Rules

```bash
# Try to create a withdrawal as a regular user
# Should enforce fee calculation and limits
```

### 3. Test Admin Access

1. Sign in as admin
2. Navigate to `/admin`
3. Verify you can see admin panel
4. Try processing a withdrawal

### 4. Check Function Logs

```bash
firebase functions:log
```

---

## Troubleshooting

### Function Deployment Fails

```bash
# Check Node.js version
node --version  # Should be 20+

# Reinstall functions dependencies
cd functions
rm -rf node_modules package-lock.json
npm install
cd ..

# Try deploying again
firebase deploy --only functions
```

### Firestore Rules Fail

```bash
# Validate rules syntax
firebase deploy --only firestore:rules --dry-run

# Check for syntax errors in firestore.rules
```

### Admin Panel Not Showing

1. Clear browser cache
2. Force refresh token: Sign out and sign in again
3. Verify admin claims: `firebase functions:call verifyAdminClaims`

### Email Not Sending

1. Check SMTP secrets are set:
   ```bash
   firebase functions:secrets:access SMTP_HOST
   ```
2. Check function logs:
   ```bash
   firebase functions:log --only processWithdrawal
   ```

---

## Production Checklist

- [ ] Firestore rules deployed
- [ ] Cloud Functions deployed
- [ ] Firestore indexes deployed
- [ ] Admin claims set for admin user
- [ ] SMTP secrets configured
- [ ] Environment variables set
- [ ] Tested withdrawal flow
- [ ] Tested ad claiming flow
- [ ] Tested admin panel
- [ ] Verified email notifications
- [ ] Checked function logs for errors
- [ ] Set up error monitoring (Sentry)
- [ ] Configured custom domain (optional)
- [ ] Enabled Firebase App Check (recommended)

---

## Useful Commands

```bash
# View function logs
firebase functions:log

# View logs for specific function
firebase functions:log --only requestWithdrawal

# Delete a function
firebase functions:delete functionName

# Set concurrency (for performance)
firebase functions:config:set concurrency=80

# View project usage
firebase hosting:channel:list

# Rollback deployment
firebase hosting:rollback
```

---

## Function URLs

After deployment, your functions will be available at:

```
https://<region>-<project-id>.cloudfunctions.net/
  ├── requestWithdrawal
  ├── claimAdReward
  ├── processWithdrawal
  ├── setAdminClaims
  └── verifyAdminClaims
```

Replace `<region>` with your deployed region (usually `us-central1`).

---

## Cost Estimate

| Service | Free Tier | Paid (10K users) |
|---------|-----------|------------------|
| Cloud Functions | 2M invocations/mo | $25-100/mo |
| Firestore | 1GB storage, 50K reads/day | $50-200/mo |
| Hosting | 10GB/mo | $10-25/mo |
| Auth | 10K/mo | Free |
| **Total** | **$0** | **$85-325/mo** |

---

## Support

- Firebase Documentation: https://firebase.google.com/docs
- Firestore Rules: https://firebase.google.com/docs/firestore/security
- Cloud Functions: https://firebase.google.com/docs/functions

For issues: Check function logs first!

```bash
firebase functions:log --severity ERROR
```
