#!/bin/bash

# Set Admin Claims Script for AdEarn Pro
# This script sets admin custom claims for a user

set -e  # Exit on error

echo "========================================"
echo "  AdEarn Pro - Set Admin Claims"
echo "========================================"
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed."
    echo "   Install it with: npm install -g firebase-tools"
    exit 1
fi

echo "✅ Firebase CLI found"
echo ""

# Get project ID
PROJECT_ID=""
if [ -f "firebase.json" ]; then
    PROJECT_ID=$(grep -o '"projectId": "[^"]*"' firebase.json | head -1 | cut -d'"' -f4)
fi

if [ -z "$PROJECT_ID" ]; then
    echo "Enter Firebase Project ID:"
    read PROJECT_ID
fi

echo "Project: $PROJECT_ID"
echo ""

# Get user UID
echo "Enter the User UID to set as admin:"
read USER_UID

if [ -z "$USER_UID" ]; then
    echo "❌ User UID is required"
    exit 1
fi

echo ""
echo "Setting admin claims for user: $USER_UID"
echo ""

# Call the Cloud Function
echo "Calling setAdminClaims function..."
firebase functions:call setAdminClaims --project "$PROJECT_ID" --data "{\"uid\":\"$USER_UID\",\"setAdmin\":true}"

echo ""
echo "✅ Admin claims set successfully!"
echo ""

# Verify the claims
echo "Verifying admin claims..."
firebase functions:call verifyAdminClaims --project "$PROJECT_ID"

echo ""
echo "========================================"
echo "  Complete! 🎉"
echo "========================================"
echo ""
echo "The user now has admin privileges."
echo "You may need to sign out and sign in again for the claims to take effect."
echo ""
