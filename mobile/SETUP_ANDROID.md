# 📱 AdEarn Pro - Android App Setup Guide

Complete guide to setting up the Android app for building and development.

---

## ⚡ Quick Start

### 1. Install Dependencies

```bash
cd mobile
npm install
```

### 2. Initialize Android Project

The Android project structure is already created. Now install Node dependencies:

```bash
cd mobile
npm install
```

### 3. Setup Firebase

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project** or create new one
3. **Add Android App**:
   - Package name: `com.adearnpro.app`
   - App nickname: `AdEarn Pro`
   - Debug signing certificate: (skip for now)
4. **Download `google-services.json`**
5. **Place in**: `mobile/android/app/google-services.json`

### 4. Generate Keystore (for Release Builds)

```bash
cd mobile/android
chmod +x generate-keystore.sh
./generate-keystore.sh
```

**Save the passwords securely!** You'll need them for:
- Local builds
- GitHub Actions secrets
- Play Store uploads

### 5. Build Debug APK

```bash
cd mobile/android
chmod +x gradlew
./gradlew assembleDebug

# APK location: android/app/build/outputs/apk/debug/app-debug.apk
```

### 6. Install on Device

```bash
# Enable USB debugging on your Android device
# Connect via USB

adb install app/build/outputs/apk/debug/app-debug.apk
```

---

## 📋 Detailed Setup

### Prerequisites

Install these before starting:

| Software | Version | Download |
|----------|---------|----------|
| Node.js | 20+ | https://nodejs.org/ |
| Java JDK | 17 | https://adoptium.net/ |
| Android Studio | Latest | https://developer.android.com/studio |
| Git | Latest | https://git-scm.com/ |

### Verify Installation

```bash
# Check Node.js
node --version  # Should be v20+

# Check Java
java -version  # Should be 17

# Check Android SDK
adb --version
```

---

## 🔧 Configuration Files

### Required Files

| File | Location | Purpose |
|------|----------|---------|
| `google-services.json` | `android/app/` | Firebase configuration |
| `keystore.jks` | `android/` | Release signing (generate yourself) |
| `gradle.properties` | `android/` | Build configuration |
| `.env` | `mobile/` | Environment variables |

### Environment Variables

Create `mobile/.env`:

```env
FIREBASE_API_KEY=your_api_key
FIREBASE_APP_ID=your_app_id
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_AUTH_DOMAIN=your_auth_domain
API_BASE_URL=https://your-cloud-functions-url.cloudfunctions.net
```

---

## 🏗️ Build Commands

### Debug Build

```bash
cd mobile/android
./gradlew assembleDebug
```

**Output:** `android/app/build/outputs/apk/debug/app-debug.apk`

### Release Build

```bash
cd mobile/android
./gradlew assembleRelease
```

**Output:** `android/app/build/outputs/apk/release/app-release.apk`

### Clean Build

```bash
cd mobile/android
./gradlew clean
./gradlew build
```

### Install on Device

```bash
# Debug
adb install app/build/outputs/apk/debug/app-debug.apk

# Release
adb install app/build/outputs/apk/release/app-release.apk

# Uninstall
adb uninstall com.adearnpro.app
```

---

## 🔐 Signing Configuration

### For Local Builds

Edit `android/gradle.properties`:

```properties
MYAPP_UPLOAD_STORE_FILE=keystore.jks
MYAPP_UPLOAD_KEY_ALIAS=adearn-pro
MYAPP_UPLOAD_STORE_PASSWORD=your_password
MYAPP_UPLOAD_KEY_PASSWORD=your_password
```

### For GitHub Actions

Add these secrets to your repository:

```
ANDROID_KEYSTORE=<base64 encoded keystore>
ANDROID_KEYSTORE_PASSWORD=your_password
ANDROID_KEY_ALIAS=adearn-pro
ANDROID_KEY_PASSWORD=your_password
```

**Encode keystore:**
```bash
base64 -w 0 keystore.jks
```

---

## 📲 Testing

### On Emulator

```bash
# Start emulator from Android Studio
# Then install APK
adb install app/build/outputs/apk/debug/app-debug.apk
```

### On Physical Device

1. **Enable Developer Options**:
   - Settings > About Phone
   - Tap "Build Number" 7 times

2. **Enable USB Debugging**:
   - Settings > Developer Options
   - Enable "USB Debugging"

3. **Connect and Install**:
   ```bash
   adb devices  # Verify device is connected
   adb install app/build/outputs/apk/debug/app-debug.apk
   ```

### Test Checklist

- [ ] App installs successfully
- [ ] Splash screen appears
- [ ] Google Sign-In works
- [ ] Dashboard loads
- [ ] Can navigate between tabs
- [ ] Withdrawal form works
- [ ] Settings screen shows profile
- [ ] Logout works
- [ ] No crashes

---

## 🐛 Troubleshooting

### SDK Not Found

```bash
# Create local.properties
echo "sdk.dir=/path/to/Android/sdk" > android/local.properties
```

### Build Failed - Out of Memory

```bash
# Increase Gradle memory
# Edit android/gradle.properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=1024m
```

### Duplicate Classes Error

```bash
# Clean and rebuild
cd android
./gradlew clean
./gradlew assembleDebug
```

### Firebase Not Connecting

1. Verify `google-services.json` is in `android/app/`
2. Check package name matches: `com.adearnpro.app`
3. Verify SHA-1 fingerprint is added to Firebase Console

```bash
# Get SHA-1 for debug keystore
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

### APK Not Installing

```bash
# Uninstall first
adb uninstall com.adearnpro.app

# Or enable "Install from Unknown Sources"
```

---

## 📦 File Structure

```
mobile/android/
├── app/
│   ├── build.gradle
│   ├── proguard-rules.pro
│   ├── src/main/
│   │   ├── AndroidManifest.xml
│   │   ├── java/com/adearnpro/app/
│   │   │   ├── MainActivity.java
│   │   │   └── MainApplication.java
│   │   └── res/
│   │       ├── values/strings.xml
│   │       ├── values/colors.xml
│   │       └── drawable/
│   ├── build/
│   │   └── outputs/apk/
│   │       ├── debug/app-debug.apk
│   │       └── release/app-release.apk
├── gradle.properties
├── gradle-wrapper.properties
├── generate-keystore.sh
└── gradlew
```

---

## 🚀 Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Add `google-services.json`
3. ✅ Generate keystore
4. ✅ Build debug APK
5. ✅ Test on device
6. 📝 Configure GitHub secrets
7. 📝 Build release APK
8. 📝 Publish to GitHub Releases

---

## 📞 Support

- **React Native Docs**: https://reactnative.dev/
- **Firebase Android**: https://firebase.google.com/docs/android/setup
- **Android Developers**: https://developer.android.com/

For issues, check:
1. Build logs: `./gradlew assembleDebug --stacktrace`
2. Logcat: `adb logcat | grep -i "adearn"`
3. GitHub Issues: https://github.com/kousaryoukhainda-create/AdEarn-Pro/issues
