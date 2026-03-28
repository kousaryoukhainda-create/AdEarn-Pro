# ⚠️ Keystore Generation Required

## Why This Failed

The `keytool` command (part of Java JDK) is not available in this cloud environment.

## ✅ Solution: Generate Keystore Locally

You need to run the keystore generation on your **local machine** where Java is installed.

---

## Step 1: Check Java Installation

```bash
# Check if Java is installed
java -version

# If not installed, download from:
# https://adoptium.net/ (JDK 17 recommended)
```

---

## Step 2: Generate Keystore (On Your Machine)

### Option A: Using Script (Recommended)

```bash
# Navigate to android folder
cd /path/to/AdEarn-Pro/mobile/android

# Make script executable
chmod +x generate-keystore.sh

# Run script (interactive)
./generate-keystore.sh

# Follow prompts:
# - Enter keystore password: adearn123 (or your choice)
# - Enter key password: adearn123 (or your choice)
```

### Option B: Using keytool Directly

```bash
cd /path/to/AdEarn-Pro/mobile/android

keytool -genkey -v \
  -keystore keystore.jks \
  -alias adearn-pro \
  -keyalg RSA \
  -keysize 2048 \
  -validity 9125 \
  -storepass adearn123 \
  -keypass adearn123 \
  -dname "CN=AdEarn Pro, OU=Development, O=AdEarn Pro, L=City, ST=State, C=PK"
```

---

## Step 3: Encode for GitHub

```bash
# Encode keystore to base64
base64 -w 0 keystore.jks

# On macOS, use:
base64 -i keystore.jks | tr -d '\n'

# Copy the output (long string)
```

---

## Step 4: Add to GitHub Secrets

1. Go to: https://github.com/kousaryoukhainda-create/AdEarn-Pro/settings/secrets/actions

2. Add these 4 secrets:

```
Name: ANDROID_KEYSTORE
Value: <paste base64 output from Step 3>

Name: ANDROID_KEYSTORE_PASSWORD
Value: adearn123 (or your password)

Name: ANDROID_KEY_ALIAS
Value: adearn-pro

Name: ANDROID_KEY_PASSWORD
Value: adearn123 (or your password)
```

---

## Step 5: Create Release

```bash
# Navigate to project root
cd /path/to/AdEarn-Pro

# Create version tag
git tag v1.0.0

# Push tag (triggers auto-build)
git push origin v1.0.0
```

---

## Step 6: Monitor Build

1. Go to: https://github.com/kousaryoukhainda-create/AdEarn-Pro/actions
2. Wait for "Release Android APK" workflow to complete (~15-20 min)
3. Download APK from: https://github.com/kousaryoukhainda-create/AdEarn-Pro/releases

---

## Alternative: Use Debug Build (For Testing Only)

If you just want to test the app without release signing:

```bash
cd mobile/android
chmod +x gradlew
./gradlew assembleDebug

# APK location: android/app/build/outputs/apk/debug/app-debug.apk
# This uses the default debug keystore (no setup needed)
```

**Note:** Debug APK cannot be uploaded to Play Store, but works fine for testing.

---

## Passwords Used (If Following This Guide)

| Item | Password |
|------|----------|
| Keystore Password | `adearn123` |
| Key Password | `adearn123` |
| Key Alias | `adearn-pro` |
| Validity | 25 years (9125 days) |

**⚠️ Change these for production!**

---

## Troubleshooting

### "Java not found"
Install JDK from: https://adoptium.net/

### "keytool: command not found"
Java JDK not in PATH. Add Java bin directory to PATH or reinstall Java.

### "Keystore file already exists"
Delete existing keystore: `rm keystore.jks`

### "Passwords don't match"
Re-run the script and ensure passwords match.

---

## Next Steps After Keystore

1. ✅ Generate keystore (on local machine with Java)
2. ✅ Add GitHub Secrets
3. ✅ Push version tag
4. ✅ Download APK from Releases
5. ✅ Test on device

---

**For immediate testing:** Use debug build (`./gradlew assembleDebug`)

**For public release:** Generate release keystore on local machine
