# 📱 AdEarn Pro - APK Build & Release Guide

Complete guide to building and releasing the AdEarn Pro Android APK.

---

## 📋 Prerequisites

### Required Software
- **Node.js 20+** - [Download](https://nodejs.org/)
- **Java JDK 17** - [Download](https://adoptium.net/)
- **Android Studio** - [Download](https://developer.android.com/studio)
- **Git** - [Download](https://git-scm.com/)

### Required Accounts
- **Firebase Account** - For backend services
- **Google Play Console** (optional) - For Play Store release
- **GitHub Account** - For code hosting and releases

---

## 🚀 Quick Start (Choose One Method)

### Method 1: React Native CLI (Full Control)

**Best for:** Production apps, full native control

```bash
# 1. Navigate to mobile directory
cd mobile

# 2. Initialize React Native with Android project
npx @react-native-community/cli init AdEarnPro --template react-native-template-typescript

# 3. Install dependencies
npm install

# 4. Add Firebase config
# - Download google-services.json from Firebase Console
# - Place in mobile/android/app/google-services.json

# 5. Build Debug APK
cd android
./gradlew assembleDebug

# APK location: android/app/build/outputs/apk/debug/app-debug.apk
```

### Method 2: Expo EAS Build (Fastest)

**Best for:** Quick builds, no Android Studio needed

```bash
# 1. Install Expo CLI
npm install -g eas-cli

# 2. Login to Expo
eas login

# 3. Configure EAS Build
cd mobile
eas build:configure

# 4. Build APK in cloud
eas build --platform android --profile preview

# 5. Download APK from provided URL
```

**Build Time:** ~15 minutes (cloud)

---

## 📦 Step-by-Step: React Native CLI

### Step 1: Initialize Project

```bash
cd mobile

# Initialize with Android and iOS folders
npx @react-native-community/cli init AdEarnPro \
  --template react-native-template-typescript \
  --directory .

# This creates:
# - android/ (native Android code)
# - ios/ (native iOS code - macOS only)
# - node_modules/
# - Configuration files
```

### Step 2: Configure Firebase

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Add Android App**:
   - Package name: `com.adearnpro.app`
   - App nickname: `AdEarn Pro`
3. **Download `google-services.json`**
4. **Place in `android/app/google-services.json`**

### Step 3: Update Android Configuration

Edit `android/app/build.gradle`:

```gradle
android {
    defaultConfig {
        applicationId "com.adearnpro.app"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "1.0.0"
    }
}
```

### Step 4: Create Release Keystore

```bash
# Generate signing key
keytool -genkey -v \
  -keystore adearn-pro.keystore \
  -alias adearn-pro \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# Store these passwords securely!
# - Keystore password
# - Key alias: adearn-pro
# - Key password
```

### Step 5: Configure Signing

Create `android/gradle.properties`:

```properties
MYAPP_UPLOAD_STORE_FILE=keystore.jks
MYAPP_UPLOAD_KEY_ALIAS=adearn-pro
MYAPP_UPLOAD_STORE_PASSWORD=your_keystore_password
MYAPP_UPLOAD_KEY_PASSWORD=your_key_password
```

Update `android/app/build.gradle`:

```gradle
android {
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
                storeFile file(MYAPP_UPLOAD_STORE_FILE)
                storePassword MYAPP_UPLOAD_STORE_PASSWORD
                keyAlias MYAPP_UPLOAD_KEY_ALIAS
                keyPassword MYAPP_UPLOAD_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Step 6: Build APKs

```bash
cd android

# Debug APK (for testing)
./gradlew assembleDebug

# Release APK (signed, for distribution)
./gradlew assembleRelease

# Release Bundle (for Play Store)
./gradlew bundleRelease
```

**Output Locations:**
- Debug: `android/app/build/outputs/apk/debug/app-debug.apk`
- Release: `android/app/build/outputs/apk/release/app-release.apk`
- Bundle: `android/app/build/outputs/bundle/release/app-release.aab`

---

## 🔧 GitHub Actions Automated Builds

### Setup GitHub Secrets

1. **Go to Repository Settings** → Secrets and variables → Actions
2. **Add these secrets:**

```
ANDROID_KEYSTORE=<base64 encoded keystore>
ANDROID_KEYSTORE_PASSWORD=your_keystore_password
ANDROID_KEY_ALIAS=adearn-pro
ANDROID_KEY_PASSWORD=your_key_password
```

### Encode Keystore

```bash
# Encode keystore to base64
base64 -w 0 adearn-pro.keystore

# Copy the output and add to GitHub secrets as ANDROID_KEYSTORE
```

### Trigger Release Build

```bash
# Tag a release
git tag v1.0.0
git push origin v1.0.0

# GitHub Actions will automatically:
# 1. Build the release APK
# 2. Create a GitHub Release
# 3. Upload the APK as an asset
```

---

## 📲 Installation & Testing

### Install Debug APK on Device

```bash
# Enable USB debugging on Android device
# Connect via USB

# Install APK
adb install mobile/android/app/build/outputs/apk/debug/app-debug.apk

# Or transfer APK to device and install manually
```

### Test Checklist

- [ ] App installs successfully
- [ ] Splash screen appears
- [ ] Google Sign-In works
- [ ] Dashboard loads with user data
- [ ] Ads screen shows available ads
- [ ] Withdrawal form submits
- [ ] Settings screen shows profile
- [ ] Logout works
- [ ] No crashes during navigation
- [ ] Push notifications work (if configured)

---

## 🎨 App Icons & Assets

### Generate App Icons

```bash
# Install icon generator
npm install -g app-icon

# Generate icons (place icon-1024.png in assets/)
app-icon generate -i assets/icon-1024.png -o android/

# Or use online tool: https://romannurik.github.io/AndroidAssetStudio/
```

### Required Icon Sizes

| Type | Size | Location |
|------|------|----------|
| **Play Store** | 512x512 | `android/app/src/main/play/listings/en-US/` |
| **Adaptive Icon** | 108x108dp | `android/app/src/main/res/mipmap-*/` |
| **Notification** | 24x24dp | `android/app/src/main/res/drawable-*/` |

---

## 📊 APK Size Optimization

### Enable ProGuard/R8

In `android/app/build.gradle`:

```gradle
buildTypes {
    release {
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

### Split APKs by ABI

```gradle
splits {
    abi {
        enable true
        reset()
        include 'armeabi-v7a', 'arm64-v8a'
        universalApk false
    }
}
```

### Enable Hermes Engine

In `android/gradle.properties`:

```properties
hermesEnabled=true
```

---

## 🚢 Distribution Options

### 1. GitHub Releases (Recommended)

**Pros:** Free, unlimited downloads, version tracking

```bash
# Manual release
gh release create v1.0.0 \
  --title "Release v1.0.0" \
  --notes "Initial release" \
  mobile/android/app/build/outputs/apk/release/app-release.apk
```

### 2. Firebase App Distribution

**Pros:** Internal testing, feedback collection

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Distribute
firebase appdistribution:distribute \
  mobile/android/app/build/outputs/apk/release/app-release.apk \
  --app "1:YOUR_APP_ID:android:YOUR_ANDROID_ID" \
  --groups "beta-testers"
```

### 3. Google Play Store

**Pros:** Automatic updates, wide reach

**Steps:**
1. Create Play Console account ($25 one-time)
2. Create app listing
3. Upload AAB file
4. Complete content rating
5. Submit for review

### 4. Direct Download (Website)

**Pros:** Full control, no approval needed

**Setup:**
- Host APK on your website
- Provide installation instructions
- Handle updates manually

---

## ⚠️ Common Issues & Solutions

### Issue: SDK Location Not Found

```bash
# Create local.properties
echo "sdk.dir=/path/to/Android/sdk" > android/local.properties
```

### Issue: Build Failed - Duplicate Classes

```bash
# Clean and rebuild
cd android
./gradlew clean
./gradlew assembleRelease
```

### Issue: APK Not Installing

```bash
# Check if app is already installed
adb uninstall com.adearnpro.app

# Or enable "Install from Unknown Sources" on device
```

### Issue: Firebase Not Connecting

```bash
# Verify google-services.json is in correct location
ls android/app/google-services.json

# Check package name matches Firebase Console
# com.adearnpro.app
```

---

## 📈 Release Checklist

### Pre-Release

- [ ] All screens implemented
- [ ] Firebase configured
- [ ] Google Sign-In working
- [ ] Cloud Functions deployed
- [ ] Firestore rules deployed
- [ ] App icons added
- [ ] Keystore created and backed up
- [ ] Version code incremented
- [ ] Version name updated
- [ ] Tested on multiple devices
- [ ] No console.log in production code
- [ ] Error handling implemented
- [ ] Loading states handled

### Release

- [ ] Build release APK
- [ ] Sign APK with release keystore
- [ ] Test release APK
- [ ] Create GitHub Release
- [ ] Upload APK
- [ ] Write release notes
- [ ] Tag commit with version

### Post-Release

- [ ] Monitor crash reports
- [ ] Collect user feedback
- [ ] Plan next release
- [ ] Update documentation

---

## 📞 Support & Resources

### Documentation
- [React Native Docs](https://reactnative.dev/)
- [Firebase Android Setup](https://firebase.google.com/docs/android/setup)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Android App Bundles](https://developer.android.com/guide/app-bundle)

### Tools
- [Android Studio](https://developer.android.com/studio)
- [Firebase Console](https://console.firebase.google.com/)
- [GitHub Releases](https://github.com/features/releases)

### Community
- [React Native Community](https://github.com/react-native-community)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/react-native)
- [Reddit r/reactnative](https://www.reddit.com/r/reactnative/)

---

## 🎯 Next Steps

1. **Initialize Android project:**
   ```bash
   cd mobile
   npx @react-native-community/cli init AdEarnPro
   ```

2. **Configure Firebase:**
   - Add Android app in Firebase Console
   - Download google-services.json

3. **Build first APK:**
   ```bash
   cd android
   ./gradlew assembleDebug
   ```

4. **Test on device:**
   ```bash
   adb install app/build/outputs/apk/debug/app-debug.apk
   ```

5. **Setup automated releases:**
   - Add GitHub secrets
   - Tag first release
   - Let GitHub Actions build

---

**Ready to build?** Run this command:

```bash
cd /storage/internal_new/project/AdEarn-Pro/mobile
npx @react-native-community/cli init AdEarnPro --template react-native-template-typescript
```
