#!/bin/bash

# Firebase Deployment Script for AdEarn Pro
# This script deploys Firestore rules and Cloud Functions

set -e  # Exit on error

echo "========================================"
echo "  AdEarn Pro - Firebase Deployment"
echo "========================================"
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed."
    echo "   Install it with: npm install -g firebase-tools"
    exit 1
fi

echo "✅ Firebase CLI found"

# Check if logged in
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged in to Firebase."
    echo "   Login with: firebase login"
    exit 1
fi

echo "✅ Firebase authentication verified"
echo ""

# Get project ID from firebase.json or prompt
PROJECT_ID=""
if [ -f "firebase.json" ]; then
    PROJECT_ID=$(grep -o '"projectId": "[^"]*"' firebase.json | head -1 | cut -d'"' -f4)
fi

if [ -z "$PROJECT_ID" ]; then
    echo "Enter Firebase Project ID:"
    read PROJECT_ID
fi

echo "📦 Deploying to project: $PROJECT_ID"
echo ""

# Deploy Firestore Rules
echo "========================================"
echo "  Step 1: Deploying Firestore Rules"
echo "========================================"
firebase deploy --only firestore:rules --project "$PROJECT_ID"
echo "✅ Firestore rules deployed"
echo ""

# Deploy Cloud Functions
echo "========================================"
echo "  Step 2: Deploying Cloud Functions"
echo "========================================"
echo "   This may take a few minutes..."
firebase deploy --only functions --project "$PROJECT_ID"
echo "✅ Cloud Functions deployed"
echo ""

# Summary
echo "========================================"
echo "  Deployment Complete! 🎉"
echo "========================================"
echo ""
echo "Deployed components:"
echo "  ✅ Firestore Security Rules"
echo "  ✅ Cloud Functions:"
echo "     - requestWithdrawal"
echo "     - claimAdReward"
echo "     - processWithdrawal"
echo "     - setAdminClaims"
echo "     - verifyAdminClaims"
echo "     - onUserCreate (trigger)"
echo ""
echo "Next steps:"
echo "  1. Set admin claims for your account:"
echo "     firebase functions:call setAdminClaims '{\"uid\":\"YOUR_UID\",\"setAdmin\":true}'"
echo ""
echo "  2. Verify admin claims:"
echo "     firebase functions:call verifyAdminClaims"
echo ""
echo "  3. Test the application"
echo ""
