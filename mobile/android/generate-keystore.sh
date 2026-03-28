#!/bin/bash

###############################################################################
# AdEarn Pro - Keystore Generation Script
# 
# This script generates a signing key for releasing the Android app.
# 
# IMPORTANT: Store the keystore and passwords securely!
# If you lose the keystore, you cannot update your app on Play Store.
###############################################################################

set -e

echo "========================================"
echo "  AdEarn Pro - Keystore Generation"
echo "========================================"
echo ""

# Configuration
KEYSTORE_NAME="keystore.jks"
KEY_ALIAS="adearn-pro"
KEYSTORE_PASSWORD=""
KEY_PASSWORD=""
VALIDITY_YEARS=25

# Prompt for passwords
echo "Enter keystore password (min 6 characters):"
read -s KEYSTORE_PASSWORD
echo ""

echo "Confirm keystore password:"
read -s KEYSTORE_PASSWORD_CONFIRM
echo ""

if [ "$KEYSTORE_PASSWORD" != "$KEYSTORE_PASSWORD_CONFIRM" ]; then
    echo "❌ Passwords do not match!"
    exit 1
fi

echo "Enter key password (min 6 characters):"
read -s KEY_PASSWORD
echo ""

echo "Confirm key password:"
read -s KEY_PASSWORD_CONFIRM
echo ""

if [ "$KEY_PASSWORD" != "$KEY_PASSWORD_CONFIRM" ]; then
    echo "❌ Key passwords do not match!"
    exit 1
fi

echo ""
echo "Generating keystore..."
echo ""

# Generate keystore
keytool -genkey -v \
    -keystore "$KEYSTORE_NAME" \
    -alias "$KEY_ALIAS" \
    -keyalg RSA \
    -keysize 2048 \
    -validity $((VALIDITY_YEARS * 365)) \
    -storepass "$KEYSTORE_PASSWORD" \
    -keypass "$KEY_PASSWORD" \
    -dname "CN=AdEarn Pro, OU=Development, O=AdEarn Pro, L=City, ST=State, C=PK"

echo ""
echo "✅ Keystore generated successfully!"
echo ""
echo "========================================"
echo "  IMPORTANT - Save This Information"
echo "========================================"
echo ""
echo "Keystore file: $KEYSTORE_NAME"
echo "Key alias: $KEY_ALIAS"
echo "Validity: $VALIDITY_YEARS years"
echo ""
echo "⚠️  NEXT STEPS:"
echo ""
echo "1. Move keystore to secure location:"
echo "   mv $KEYSTORE_NAME ~/SecureLocation/"
echo ""
echo "2. Add to gradle.properties (mobile/android/):"
echo "   MYAPP_UPLOAD_STORE_FILE=../keystore.jks"
echo "   MYAPP_UPLOAD_KEY_ALIAS=$KEY_ALIAS"
echo "   MYAPP_UPLOAD_STORE_PASSWORD=<your_password>"
echo "   MYAPP_UPLOAD_KEY_PASSWORD=<your_password>"
echo ""
echo "3. Add to GitHub Secrets (for CI/CD):"
echo "   ANDROID_KEYSTORE=$(base64 -w 0 $KEYSTORE_NAME)"
echo "   ANDROID_KEYSTORE_PASSWORD=<your_password>"
echo "   ANDROID_KEY_ALIAS=$KEY_ALIAS"
echo "   ANDROID_KEY_PASSWORD=<your_password>"
echo ""
echo "4. Backup your keystore in a secure location!"
echo "   Without it, you cannot update your app on Play Store."
echo ""
echo "========================================"
