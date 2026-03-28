#!/bin/bash

##############################################################################
# AdEarn Pro - GitHub Release Setup Script
# 
# This script helps you set up everything needed for public APK releases.
##############################################################################

set -e

echo "========================================"
echo "  AdEarn Pro - GitHub Release Setup"
echo "========================================"
echo ""

cd "$(dirname "$0")"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check prerequisites
echo "📋 Checking prerequisites..."
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found${NC}"
    echo "   Install from: https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}✅${NC} Node.js $(node --version)"

# Check Java
if ! command -v java &> /dev/null; then
    echo -e "${RED}❌ Java not found${NC}"
    echo "   Install JDK 17 from: https://adoptium.net/"
    exit 1
fi
echo -e "${GREEN}✅${NC} Java $(java -version 2>&1 | head -1)"

# Check Git
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git not found${NC}"
    echo "   Install from: https://git-scm.com/"
    exit 1
fi
echo -e "${GREEN}✅${NC} Git $(git --version)"

# Check Firebase config
if [ ! -f "android/app/google-services.json" ]; then
    echo -e "${RED}❌ google-services.json not found${NC}"
    echo "   See: android/FIREBASE_SETUP.md"
    exit 1
fi
echo -e "${GREEN}✅${NC} Firebase configured"

echo ""
echo "========================================"
echo "  Step 1: Generate Release Keystore"
echo "========================================"
echo ""

cd android

if [ -f "keystore.jks" ]; then
    echo -e "${YELLOW}⚠️  Keystore already exists${NC}"
    echo "   Do you want to generate a new one? (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        rm keystore.jks
    else
        echo "   Using existing keystore"
    fi
fi

if [ ! -f "keystore.jks" ]; then
    chmod +x generate-keystore.sh
    ./generate-keystore.sh
fi

echo ""
echo "========================================"
echo "  Step 2: Prepare GitHub Secrets"
echo "========================================"
echo ""

if ! command -v base64 &> /dev/null; then
    echo -e "${RED}❌ base64 command not found${NC}"
    echo "   Please install it or encode keystore manually"
    exit 1
fi

echo "📦 Encoding keystore for GitHub Secrets..."
echo ""

KEYSTORE_BASE64=$(base64 -w 0 keystore.jks)

echo -e "${GREEN}✅${NC} Keystore encoded"
echo ""
echo "========================================"
echo "  GitHub Secrets to Add"
echo "========================================"
echo ""
echo "Go to: https://github.com/kousaryoukhainda-create/AdEarn-Pro/settings/secrets/actions"
echo ""
echo "Add these secrets:"
echo ""
echo -e "${YELLOW}Name:${NC} ANDROID_KEYSTORE"
echo -e "${YELLOW}Value:${NC} $KEYSTORE_BASE64"
echo ""
echo -e "${YELLOW}Name:${NC} ANDROID_KEYSTORE_PASSWORD"
echo -e "${YELLOW}Value:${NC} <your keystore password>"
echo ""
echo -e "${YELLOW}Name:${NC} ANDROID_KEY_ALIAS"
echo -e "${YELLOW}Value:${NC} adearn-pro"
echo ""
echo -e "${YELLOW}Name:${NC} ANDROID_KEY_PASSWORD"
echo -e "${YELLOW}Value:${NC} <your key password>"
echo ""
echo "========================================"
echo ""

# Copy to clipboard if xclip is available
if command -v xclip &> /dev/null; then
    echo "$KEYSTORE_BASE64" | xclip -selection clipboard
    echo -e "${GREEN}✅${NC} ANDROID_KEYSTORE value copied to clipboard!"
    echo ""
fi

echo "========================================"
echo "  Step 3: Create Release Tag"
echo "========================================"
echo ""

cd ..

# Get current version
CURRENT_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")

if [ -n "$CURRENT_TAG" ]; then
    echo "Current tag: $CURRENT_TAG"
    echo "Do you want to create a new tag? (y/n)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "Skipping tag creation"
    else
        echo "Enter new version number (e.g., 1.0.0):"
        read -r NEW_VERSION
        git tag "v$NEW_VERSION"
        echo -e "${GREEN}✅${NC} Tag v$NEW_VERSION created"
    fi
else
    echo "No existing tags found."
    echo "Enter version number for first release (e.g., 1.0.0):"
    read -r VERSION
    git tag "v$VERSION"
    echo -e "${GREEN}✅${NC} Tag v$VERSION created"
fi

echo ""
echo "========================================"
echo "  Step 4: Push to GitHub"
echo "========================================"
echo ""

echo "Do you want to push the tag to GitHub now? (y/n)"
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
    echo "Pushing tag..."
    git push origin --tags
    echo -e "${GREEN}✅${NC} Tag pushed to GitHub"
    echo ""
    echo "GitHub Actions will now build your APK!"
    echo ""
    echo "Watch the build: https://github.com/kousaryoukhainda-create/AdEarn-Pro/actions"
else
    echo "You can push manually with:"
    echo "  git push origin --tags"
fi

echo ""
echo "========================================"
echo "  Setup Complete! 🎉"
echo "========================================"
echo ""
echo "Next Steps:"
echo ""
echo "1. ${YELLOW}Add GitHub Secrets${NC} (if not done)"
echo "   https://github.com/kousaryoukhainda-create/AdEarn-Pro/settings/secrets/actions"
echo ""
echo "2. ${YELLOW}Push the tag${NC} (if not done)"
echo "   git push origin --tags"
echo ""
echo "3. ${YELLOW}Monitor Build${NC}"
echo "   https://github.com/kousaryoukhainda-create/AdEarn-Pro/actions"
echo ""
echo "4. ${YELLOW}Download APK${NC} (after build completes)"
echo "   https://github.com/kousaryoukhainda-create/AdEarn-Pro/releases"
echo ""
echo "5. ${YELLOW}Test on Device${NC}"
echo "   adb install app-release.apk"
echo ""
echo "========================================"
echo ""
echo -e "${GREEN}✅${NC} All done! Your APK will be ready in 15-20 minutes."
echo ""
