#!/bin/bash

##############################################################################
# AdEarn Pro - Quick Build Script
# 
# This script installs dependencies and builds the debug APK.
# Run this after adding google-services.json
##############################################################################

set -e

echo "========================================"
echo "  AdEarn Pro - Android Build Script"
echo "========================================"
echo ""

cd "$(dirname "$0")"

# Step 1: Check Node.js
echo "📦 Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Install from https://nodejs.org/"
    exit 1
fi
NODE_VERSION=$(node --version)
echo "✅ Node.js $NODE_VERSION"
echo ""

# Step 2: Install dependencies
echo "📦 Installing dependencies..."
echo "   This may take 5-10 minutes..."
npm install --loglevel=error
echo "✅ Dependencies installed"
echo ""

# Step 3: Check Firebase config
echo "🔥 Checking Firebase configuration..."
if [ ! -f "android/app/google-services.json" ]; then
    echo "❌ google-services.json not found!"
    echo ""
    echo "   Please:"
    echo "   1. Go to https://console.firebase.google.com/"
    echo "   2. Add Android app with package: com.adearnpro.app"
    echo "   3. Download google-services.json"
    echo "   4. Place it in: android/app/google-services.json"
    echo ""
    exit 1
fi
echo "✅ Firebase configured"
echo ""

# Step 4: Check Java
echo "☕ Checking Java..."
if ! command -v java &> /dev/null; then
    echo "❌ Java not found. Install JDK 17 from https://adoptium.net/"
    exit 1
fi
JAVA_VERSION=$(java -version 2>&1 | head -1)
echo "✅ $JAVA_VERSION"
echo ""

# Step 5: Build debug APK
echo "🔨 Building debug APK..."
cd android
chmod +x gradlew
./gradlew assembleDebug --no-daemon
echo "✅ Build complete!"
echo ""

# Step 6: Show APK location
APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
if [ -f "$APK_PATH" ]; then
    echo "========================================"
    echo "  ✅ APK Built Successfully!"
    echo "========================================"
    echo ""
    echo "  APK Location: $APK_PATH"
    echo ""
    echo "  To install on device:"
    echo "  adb install $APK_PATH"
    echo ""
    echo "  Or transfer to device and install manually"
    echo ""
else
    echo "❌ Build failed. Check logs above."
    exit 1
fi
