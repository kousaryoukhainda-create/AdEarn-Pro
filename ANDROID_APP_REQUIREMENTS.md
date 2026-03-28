# Android App Development Requirements for AdEarn Pro

This document outlines all requirements to create a fully functional Android app for AdEarn Pro and host it on GitHub.

---

## 📱 Technology Recommendation

### Recommended: **React Native**

Since AdEarn Pro already uses React + TypeScript, **React Native** is the optimal choice:

| Factor | React Native | Flutter | Native (Kotlin) | PWA Wrapper |
|--------|--------------|---------|-----------------|-------------|
| **Code Reuse** | 70-80% (existing React logic) | 0% (new language) | 0% | 90% |
| **Learning Curve** | Low (same as web) | Medium (Dart) | High | Low |
| **Performance** | Good | Excellent | Excellent | Fair |
| **Development Speed** | Fast | Fast | Slow | Fastest |
| **Team Skills Match** | ✅ Perfect | ❌ New language | ❌ New language | ✅ Good |

---

## 1. GitHub Repository Setup

### 1.1 Repository Structure Options

**Option A: Monorepo (Recommended)**
```
AdEarn-Pro/
├── web/                    # Existing web app
│   ├── src/
│   ├── public/
│   └── package.json
├── mobile/                 # New React Native app
│   ├── src/
│   ├── android/
│   ├── ios/
│   └── package.json
├── shared/                 # Shared code
│   ├── types/
│   ├── utils/
│   ├── api/
│   └── components/
├── functions/              # Cloud Functions
└── README.md
```

**Option B: Separate Repository**
```
AdEarn-Pro-Android/
├── src/
├── android/
├── ios/
├── package.json
└── README.md
```

### 1.2 GitHub Repository Configuration

**Required Files:**

```yaml
# .gitignore (React Native)
node_modules/
.gradle/
android/app/build/
android/.gradle/
ios/build/
*.keystore
*.jks
.env
.env.local
.DS_Store
*.orig
*.log

# Keep google-services.json and GoogleService-Info.plist out of git
google-services.json
GoogleService-Info.plist
```

```markdown
# README.md Template

# AdEarn Pro - Android App

[![Build Status](https://github.com/yourusername/AdEarn-Pro-Android/actions/workflows/build.yml/badge.svg)](https://github.com/yourusername/AdEarn-Pro-Android/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Android-green.svg)](https://developer.android.com/)

Premium earning platform - Watch ads and earn rewards.

## Features

- 🔐 Secure Google Sign-in
- 📺 Watch ads to earn rewards
- 💰 Withdraw to Jazz Cash, Easy Paisa, Naya Pay, Sada Pay
- 📊 Real-time balance tracking
- 🔔 Push notifications
- 🛡️ Enterprise-grade security

## Tech Stack

- React Native
- TypeScript
- Firebase (Auth, Firestore, Cloud Functions)
- React Navigation

## Requirements

- Node.js >= 18
- Java Development Kit (JDK) 17
- Android Studio
- React Native CLI

## Installation

```bash
# Clone repository
git clone https://github.com/yourusername/AdEarn-Pro-Android.git
cd AdEarn-Pro-Android

# Install dependencies
npm install

# Install iOS dependencies (macOS only)
cd ios && pod install && cd ..

# Run on Android
npm run android

# Run on iOS (macOS only)
npm run ios
```

## Environment Setup

Create `android/app/google-services.json` from Firebase Console.
Create `.env` file with required variables.

## Build

```bash
# Debug APK
cd android && ./gradlew assembleDebug

# Release APK (signed)
cd android && ./gradlew assembleRelease
```

## Testing

```bash
npm test
npm run test:e2e
```

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contact

Support: support@adearnpro.com
```

```markdown
# CONTRIBUTING.md

# Contributing to AdEarn Pro Android

## Development Workflow

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## Code Style

- ESLint + Prettier configured
- TypeScript strict mode
- Follow existing patterns

## Testing Requirements

- Unit tests for all new functions
- Integration tests for critical flows
- E2E tests for user journeys

## Commit Messages

Follow Conventional Commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code refactoring
- `test:` Tests
- `chore:` Maintenance
```

```markdown
# LICENSE

MIT License

Copyright (c) 2026 AdEarn Pro

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### 1.3 GitHub Branch Protection

**Required Settings:**
```
Settings > Branches > Add rule

Branch name pattern: main
✓ Require a pull request before merging
✓ Require approvals (1)
✓ Require status checks to pass before merging
✓ Require branches to be up to date before merging
✓ Require conversation resolution before merging
✓ Include administrators
```

### 1.4 GitHub Actions (CI/CD)

```yaml
# .github/workflows/build.yml
name: Build & Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm test -- --coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  build-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - name: Setup Java
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'
      - name: Setup Gradle
        uses: gradle/gradle-build-action@v2
      - run: npm ci
      - name: Build Debug APK
        run: |
          cd android
          chmod +x gradlew
          ./gradlew assembleDebug
      - name: Upload APK
        uses: actions/upload-artifact@v4
        with:
          name: app-debug
          path: android/app/build/outputs/apk/debug/app-debug.apk

  build-release:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    needs: [lint, test, build-android]
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - name: Setup Java
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'
      - name: Decode Keystore
        run: |
          echo "${{ secrets.ANDROID_KEYSTORE }}" | base64 --decode > android/app/keystore.jks
      - name: Build Release APK
        run: |
          cd android
          chmod +x gradlew
          ./gradlew assembleRelease
        env:
          ANDROID_KEYSTORE_PASSWORD: ${{ secrets.ANDROID_KEYSTORE_PASSWORD }}
          ANDROID_KEY_ALIAS: ${{ secrets.ANDROID_KEY_ALIAS }}
          ANDROID_KEY_PASSWORD: ${{ secrets.ANDROID_KEY_PASSWORD }}
      - name: Upload Release APK
        uses: actions/upload-artifact@v4
        with:
          name: app-release
          path: android/app/build/outputs/apk/release/app-release.apk
```

```yaml
# .github/workflows/release.yml
name: Release to Play Store

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - name: Setup Java
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'
      - run: npm ci
      - name: Decode Service Account Key
        run: |
          echo "${{ secrets.PLAY_STORE_SERVICE_ACCOUNT }}" | base64 --decode > android/play-store-key.json
      - name: Build Release Bundle
        run: |
          cd android
          chmod +x gradlew
          ./gradlew bundleRelease
        env:
          ANDROID_KEYSTORE_PASSWORD: ${{ secrets.ANDROID_KEYSTORE_PASSWORD }}
          ANDROID_KEY_ALIAS: ${{ secrets.ANDROID_KEY_ALIAS }}
          ANDROID_KEY_PASSWORD: ${{ secrets.ANDROID_KEY_PASSWORD }}
      - name: Upload to Play Store
        uses: r0adkll/upload-google-play@v1
        with:
          serviceAccountJson: android/play-store-key.json
          packageName: com.adearnpro.app
          releaseFiles: android/app/build/outputs/bundle/release/app-release.aab
          track: internal
          status: draft
```

---

## 2. Project Setup

### 2.1 Initialize React Native Project

```bash
# Install React Native CLI
npm install -g react-native-cli

# Create new project
npx react-native@latest init AdEarnPro --template react-native-template-typescript

# Or use Expo (recommended for faster setup)
npx create-expo-app@latest AdEarnPro --template expo-template-blank-typescript
```

### 2.2 Required Dependencies

```bash
cd AdEarnPro

# Core dependencies
npm install react react-native

# Navigation
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context

# Firebase
npm install firebase @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore @react-native-firebase/functions @react-native-firebase/messaging @react-native-firebase/analytics

# UI & Styling
npm install react-native-vector-icons react-native-gesture-handler react-native-reanimated react-native-screens

# State Management (optional, if needed)
npm install zustand  # or @reduxjs/toolkit react-redux

# Utilities
npm install @react-native-async-storage/async-storage
npm install react-native-dotenv  # For environment variables
npm install date-fns  # Date formatting (already using in web)
npm install clsx tailwind-merge  # Already using in web

# Development
npm install -D @types/react @types/react-native typescript eslint prettier @react-native/eslint-config @react-native/metro-config
```

### 2.3 Package.json Scripts

```json
{
  "name": "AdEarnPro",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "android": "react-native run-android",
    "ios": "react-native run-ios",
    "start": "react-native start",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:e2e": "detox test --configuration android.emu.debug",
    "test:e2e:build": "detox build --configuration android.emu.debug",
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx --fix",
    "type-check": "tsc --noEmit",
    "clean": "cd android && ./gradlew clean",
    "build:debug": "cd android && ./gradlew assembleDebug",
    "build:release": "cd android && ./gradlew assembleRelease",
    "bundle:release": "cd android && ./gradlew bundleRelease"
  },
  "dependencies": {
    "@react-native-async-storage/async-storage": "^1.21.0",
    "@react-native-firebase/analytics": "^19.0.0",
    "@react-native-firebase/app": "^19.0.0",
    "@react-native-firebase/auth": "^19.0.0",
    "@react-native-firebase/firestore": "^19.0.0",
    "@react-native-firebase/functions": "^19.0.0",
    "@react-native-firebase/messaging": "^19.0.0",
    "@react-navigation/bottom-tabs": "^6.5.0",
    "@react-navigation/native": "^6.1.0",
    "@react-navigation/stack": "^6.3.0",
    "clsx": "^2.1.1",
    "date-fns": "^4.1.0",
    "firebase": "^12.11.0",
    "motion": "^12.23.24",
    "react": "18.2.0",
    "react-native": "0.73.0",
    "react-native-dotenv": "^3.4.0",
    "react-native-gesture-handler": "^2.14.0",
    "react-native-reanimated": "^3.6.0",
    "react-native-safe-area-context": "^4.8.0",
    "react-native-screens": "^3.29.0",
    "react-native-vector-icons": "^10.0.0",
    "tailwind-merge": "^3.5.0",
    "zustand": "^4.5.0"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "@babel/preset-env": "^7.20.0",
    "@babel/runtime": "^7.20.0",
    "@react-native/eslint-config": "^0.73.0",
    "@react-native/metro-config": "^0.73.0",
    "@tsconfig/react-native": "^3.0.0",
    "@types/jest": "^29.5.0",
    "@types/react": "^18.2.0",
    "@types/react-native": "^0.73.0",
    "@types/react-native-vector-icons": "^6.4.18",
    "@types/react-test-renderer": "^18.0.0",
    "detox": "^20.19.0",
    "eslint": "^8.19.0",
    "jest": "^29.6.0",
    "metro-react-native-babel-preset": "0.77.0",
    "prettier": "^3.1.0",
    "react-test-renderer": "18.2.0",
    "typescript": "^5.8.2"
  }
}
```

---

## 3. Firebase Mobile Integration

### 3.1 Firebase Console Setup

1. **Add Android App to Firebase Project**
   ```
   Firebase Console > Project Settings > Add app > Android
   Package name: com.adearnpro.app
   App nickname: AdEarn Pro Android
   Debug signing certificate SHA-1: (get from development keystore)
   Release signing certificate SHA-1: (get from release keystore)
   ```

2. **Download google-services.json**
   ```
   Download google-services.json
   Place in: android/app/google-services.json
   DO NOT COMMIT TO GIT
   ```

3. **Enable Required Services**
   - Authentication (Google Sign-In)
   - Firestore Database
   - Cloud Functions
   - Cloud Messaging (FCM)
   - Analytics

### 3.2 Android Configuration

```groovy
// android/build.gradle
buildscript {
    dependencies {
        // Add Google Services plugin
        classpath 'com.google.gms:google-services:4.4.0'
    }
}

// android/app/build.gradle
apply plugin: 'com.google.gms.google-services'

android {
    defaultConfig {
        applicationId "com.adearnpro.app"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "1.0.0"
        multiDexEnabled true
    }
    
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

### 3.3 Environment Configuration

```bash
# .env
FIREBASE_API_KEY=your_api_key
FIREBASE_APP_ID=your_app_id
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_STORAGE_BUCKET=your_storage_bucket
API_BASE_URL=https://your-cloud-functions-url.cloudfunctions.net
```

```typescript
// src/config/firebase.ts
import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import functions from '@react-native-firebase/functions';
import messaging from '@react-native-firebase/messaging';
import analytics from '@react-native-firebase/analytics';

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  appId: process.env.FIREBASE_APP_ID,
  projectId: process.env.FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export { firebase, auth, firestore, functions, messaging, analytics };
```

---

## 4. App Architecture

### 4.1 Project Structure

```
mobile/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Loading.tsx
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── ads/
│   │   └── withdraw/
│   ├── screens/            # Screen components
│   │   ├── AuthScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── AdsScreen.tsx
│   │   ├── WithdrawScreen.tsx
│   │   ├── AdminScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── navigation/         # Navigation configuration
│   │   ├── AppNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── TabNavigator.tsx
│   ├── services/           # API & Firebase services
│   │   ├── auth.service.ts
│   │   ├── ads.service.ts
│   │   ├── withdrawal.service.ts
│   │   └── api.service.ts
│   ├── store/              # State management
│   │   ├── index.ts
│   │   ├── auth.store.ts
│   │   ├── user.store.ts
│   │   └── app.store.ts
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useUser.ts
│   │   ├── useAds.ts
│   │   └── useWithdrawals.ts
│   ├── types/              # TypeScript types (shared with web)
│   │   ├── user.types.ts
│   │   ├── ad.types.ts
│   │   └── withdrawal.types.ts
│   ├── utils/              # Utility functions (shared with web)
│   │   ├── validation.ts
│   │   ├── formatters.ts
│   │   └── constants.ts
│   ├── theme/              # Theme configuration
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   └── spacing.ts
│   └── config/             # Configuration
│       ├── firebase.ts
│       └── env.ts
├── android/
├── ios/
├── assets/
│   ├── images/
│   ├── fonts/
│   └── icons/
├── __tests__/
├── .env
├── .env.example
├── package.json
└── tsconfig.json
```

### 4.2 Shared Code Strategy

Create a `shared/` directory for code reuse:

```bash
# Monorepo structure
shared/
├── types/
│   ├── index.ts
│   ├── user.ts
│   ├── ad.ts
│   └── withdrawal.ts
├── utils/
│   ├── validation.ts
│   ├── formatters.ts
│   └── constants.ts
├── hooks/
│   ├── useAuth.ts
│   └── useFirestore.ts
└── services/
    ├── firebase.ts
    └── api.ts
```

```json
// tsconfig.json (mobile) - Reference shared code
{
  "compilerOptions": {
    "paths": {
      "@shared/*": ["../shared/*"],
      "@/*": ["./src/*"]
    }
  }
}
```

---

## 5. Google Play Store Requirements

### 5.1 Developer Account

| Requirement | Details |
|-------------|---------|
| **Account Type** | Google Play Console Developer Account |
| **Cost** | $25 one-time fee |
| **Verification** | Identity verification required |
| **Setup Time** | 1-3 business days |

### 5.2 App Listing Requirements

**Required Assets:**

| Asset | Specifications |
|-------|----------------|
| **App Icon** | 512x512 PNG, 32-bit, no transparency |
| **Feature Graphic** | 1024x500 PNG or JPEG |
| **Screenshots** | Minimum 2, up to 8 (1080x1920 or 1920x1080) |
| **Promo Video** | Optional (YouTube URL) |
| **Description** | Max 4000 characters |
| **Short Description** | Max 80 characters |

**Store Listing Content:**
- App name (30 chars max)
- Short description (80 chars)
- Full description (4000 chars)
- Category (Finance or Lifestyle)
- Contact email
- Privacy policy URL
- Website URL (optional)

### 5.3 Content Rating (IARC)

**Required Questionnaires:**
- Violence
- Sexual content
- Language
- Gambling
- Drug use
- User interaction

**Expected Rating:** Teen (13+) or Mature (17+) due to financial transactions

### 5.4 Privacy & Security

**Required:**
- ✅ Privacy Policy (URL required)
- ✅ Data safety form completion
- ✅ Target SDK level (API 34+)
- ✅ App signing by Google Play
- ✅ Permission declarations

**Data Safety Form:**
Must disclose:
- Personal info collected (email, user ID)
- Financial info (transaction data)
- App activity (ad views, interactions)
- Device info
- Data sharing practices

### 5.5 Financial Compliance

**For Pakistan Payment Methods:**

| Requirement | Status |
|-------------|--------|
| Payment Provider License | ⚠️ Verify with State Bank of Pakistan |
| Terms of Service | ❌ Required |
| Refund Policy | ❌ Required |
| Contact Information | ❌ Required |
| Age Restrictions | ⚠️ 18+ for financial apps |

### 5.6 APK/AAB Requirements

```bash
# Build Release Bundle (Recommended)
cd android
./gradlew bundleRelease

# Output: android/app/build/outputs/bundle/release/app-release.aab

# Build Release APK (Alternative)
./gradlew assembleRelease

# Output: android/app/build/outputs/apk/release/app-release.apk
```

**Requirements:**
- **Format:** AAB (Android App Bundle) - Required for new apps
- **Signing:** Must be signed with release keystore
- **Version Code:** Integer, must increment with each release
- **Version Name:** User-visible string (e.g., "1.0.0")
- **Min SDK:** API 21+ (Android 5.0)
- **Target SDK:** API 34+ (Android 14)

### 5.7 Release Checklist

```markdown
## Pre-Release Checklist

### Code Quality
- [ ] All tests passing
- [ ] No console.log in production
- [ ] Error handling implemented
- [ ] Loading states handled
- [ ] Offline support tested

### Security
- [ ] API keys secured (not hardcoded)
- [ ] Keystore backed up securely
- [ ] ProGuard/R8 enabled
- [ ] SSL pinning (optional)

### Firebase
- [ ] Production Firebase configured
- [ ] Cloud Functions deployed
- [ ] Firestore rules deployed
- [ ] Analytics events configured

### Play Store Assets
- [ ] App icon (512x512)
- [ ] Feature graphic (1024x500)
- [ ] Screenshots (minimum 2)
- [ ] Store listing content
- [ ] Privacy policy URL
- [ ] Data safety form completed

### Compliance
- [ ] Privacy policy created
- [ ] Terms of service created
- [ ] Content rating completed
- [ ] Target SDK updated
- [ ] Permissions justified

### Testing
- [ ] Tested on multiple devices
- [ ] Tested on different Android versions
- [ ] Network conditions tested (slow, offline)
- [ ] Deep links tested (if applicable)
- [ ] Push notifications tested

### Release Notes
- [ ] Version name set
- [ ] Version code incremented
- [ ] Release notes written
- [ ] Changelog updated
```

---

## 6. Testing Requirements

### 6.1 Unit Testing

```bash
# Install testing libraries
npm install -D jest @testing-library/react-native @testing-library/jest-native
```

```typescript
// __tests__/services/withdrawal.test.ts
import { validateWithdrawal } from '../../src/services/withdrawal.service';

describe('Withdrawal Service', () => {
  it('should reject amount below minimum', () => {
    expect(() => validateWithdrawal(50)).toThrow('Minimum withdrawal is Rs 100');
  });

  it('should reject amount above balance', () => {
    expect(() => validateWithdrawal(1000, 500)).toThrow('Insufficient balance');
  });

  it('should accept valid withdrawal', () => {
    expect(() => validateWithdrawal(500, 1000)).not.toThrow();
  });
});
```

### 6.2 E2E Testing (Detox)

```bash
# Install Detox
npm install -D detox
npx detox init -s jest
```

```javascript
// e2e/withdrawal.e2e.js
describe('Withdrawal Flow', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should submit withdrawal request', async () => {
    // Login
    await element(by.id('login-button')).tap();
    
    // Navigate to Withdraw
    await element(by.id('withdraw-tab')).tap();
    
    // Enter amount
    await element(by.id('amount-input')).typeText('500');
    
    // Select method
    await element(by.id('method-picker')).tap();
    await element(by.text('Jazz cash')).tap();
    
    // Submit
    await element(by.id('submit-button')).tap();
    
    // Verify success
    await expect(element(by.text('Withdrawal submitted'))).toBeVisible();
  });
});
```

---

## 7. Security Considerations

### 7.1 Mobile-Specific Security

| Threat | Mitigation |
|--------|------------|
| **Root Detection** | Implement root/jailbreak detection |
| **App Tampering** | Use Play Integrity API |
| **Reverse Engineering** | Enable ProGuard/R8, code obfuscation |
| **Man-in-the-Middle** | SSL pinning |
| **Debugging** | Detect and block debuggers |

### 7.2 Implementation

```typescript
// src/utils/security.ts
import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';

export const isEmulator = async (): Promise<boolean> => {
  return DeviceInfo.isEmulator();
};

export const isRooted = async (): Promise<boolean> => {
  // Use react-native-root-detect or similar
  // Implement custom checks
  return false;
};

export const hasDebugging = async (): Promise<boolean> => {
  return __DEV__;
};
```

```proguard
# android/app/proguard-rules.pro
-keep class com.adearnpro.app.BuildConfig { *; }
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }

# React Native
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}
```

---

## 8. Performance Optimization

### 8.1 Bundle Size

| Target | Value |
|--------|-------|
| **APK Size** | < 50 MB |
| **AAB Size** | < 150 MB |
| **First Launch** | < 3 seconds |

**Optimization Techniques:**
```javascript
// 1. Enable Hermes engine (android/gradle.properties)
hermesEnabled=true

// 2. Enable ProGuard (android/app/build.gradle)
minifyEnabled true
proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'

// 3. Split APKs by ABI
splits {
    abi {
        enable true
        reset()
        include 'armeabi-v7a', 'arm64-v8a', 'x86', 'x86_64'
        universalApk true
    }
}
```

### 8.2 Runtime Performance

```typescript
// 1. Use React.memo for expensive components
const DashboardCard = React.memo(({ title, value }) => {
  return (
    <View>
      <Text>{title}</Text>
      <Text>{value}</Text>
    </View>
  );
});

// 2. Use FlatList for long lists
<FlatList
  data={ads}
  renderItem={({ item }) => <AdCard ad={item} />}
  keyExtractor={item => item.id}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={5}
  removeClippedSubviews={true}
/>

// 3. Use useMemo for expensive calculations
const totalEarned = useMemo(() => {
  return adViews.reduce((sum, view) => sum + view.reward, 0);
}, [adViews]);
```

---

## 9. Push Notifications

### 9.1 Setup

```typescript
// src/services/notification.service.ts
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';

export const requestNotificationPermission = async (): Promise<boolean> => {
  const authStatus = await messaging().requestPermission();
  return (
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL
  );
};

export const getFCMToken = async (): Promise<string | null> => {
  try {
    return await messaging().getToken();
  } catch (error) {
    console.error('Failed to get FCM token:', error);
    return null;
  }
};

export const setupNotificationListener = () => {
  // Foreground notifications
  const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
    await notifee.displayNotification({
      title: remoteMessage.notification?.title,
      body: remoteMessage.notification?.body,
      data: remoteMessage.data,
    });
  });

  // Background notifications handled by FCM automatically
  
  // Notification tap handler
  const unsubscribeTap = notifee.onForegroundEvent(({ type, detail }) => {
    if (type === EventType.PRESS) {
      // Navigate based on notification data
      console.log('Notification pressed:', detail.notification.data);
    }
  });

  return () => {
    unsubscribeForeground();
    unsubscribeTap();
  };
};
```

### 9.2 Notification Use Cases

| Trigger | Type | Content |
|---------|------|---------|
| Withdrawal Approved | Push | "Your withdrawal of Rs X has been approved" |
| Withdrawal Rejected | Push | "Your withdrawal request was rejected" |
| New Ad Available | Push | "New ad available! Earn Rs X now" |
| Daily Reminder | Push | "Watch ads today and earn rewards!" |

---

## 10. Release Management

### 10.1 Versioning Strategy

```json
{
  "version": "1.0.0",
  "versionCode": 1
}
```

**Semantic Versioning:**
- **MAJOR.MINOR.PATCH** (e.g., 1.2.3)
- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes

### 10.2 Release Tracks

| Track | Purpose | Review Time |
|-------|---------|-------------|
| **Internal** | Team testing | Minutes |
| **Closed Testing** | Beta testers | Hours |
| **Open Testing** | Public beta | Hours |
| **Production** | Public release | 1-7 days |

### 10.3 Rollout Strategy

```
Phase 1: Internal Testing (1-3 days)
  - Team members only
  - Critical bug fixes

Phase 2: Closed Testing (1 week)
  - Selected beta testers
  - Gather feedback

Phase 3: Open Testing (1 week)
  - Public beta
  - Final adjustments

Phase 4: Production Rollout
  - 10% users (2 days)
  - 50% users (2 days)
  - 100% users
```

---

## 11. Post-Launch Requirements

### 11.1 Monitoring

| Tool | Purpose |
|------|---------|
| **Firebase Crashlytics** | Crash reporting |
| **Firebase Analytics** | User behavior |
| **Firebase Performance** | App performance |
| **Google Play Console** | Reviews, ratings, vitals |

### 11.2 Maintenance Tasks

| Frequency | Task |
|-----------|------|
| **Daily** | Monitor crashes, reviews |
| **Weekly** | Review analytics, update content |
| **Monthly** | Security updates, dependency updates |
| **Quarterly** | Major updates, SDK updates |

---

## 12. Estimated Timeline

| Phase | Duration | Tasks |
|-------|----------|-------|
| **Setup** | 1 week | Project init, Firebase, CI/CD |
| **Core Development** | 3-4 weeks | Screens, navigation, integration |
| **Testing** | 1-2 weeks | Unit, integration, E2E |
| **Play Store Prep** | 1 week | Assets, compliance, listing |
| **Beta Testing** | 1-2 weeks | Closed/open testing |
| **Launch** | 1 week | Production rollout |

**Total: 8-11 weeks**

---

## 13. Cost Estimate

| Item | Cost |
|------|------|
| **Google Play Account** | $25 (one-time) |
| **Developer Mac (optional)** | $1000+ |
| **Test Devices** | $500-1000 |
| **Firebase (Free Tier)** | $0 |
| **Firebase (Production)** | $25-100/month |
| **Total Initial** | $1525-2025 |
| **Total Monthly** | $25-100 |

---

## 14. Quick Start Commands

```bash
# 1. Create React Native project
npx react-native@latest init AdEarnPro --template react-native-template-typescript

# 2. Install dependencies
cd AdEarnPro
npm install

# 3. Install iOS dependencies (macOS only)
cd ios && pod install && cd ..

# 4. Run on Android
npm run android

# 5. Run tests
npm test

# 6. Build debug APK
npm run build:debug

# 7. Build release bundle
npm run bundle:release
```

---

## 15. Resources

- [React Native Documentation](https://reactnative.dev/)
- [Firebase for React Native](https://rnfirebase.io/)
- [Google Play Console](https://play.google.com/console)
- [Android Developer Guidelines](https://developer.android.com/)
- [Material Design](https://material.io/)

---

## Next Steps

1. **Today:** Create GitHub repository, initialize React Native project
2. **Week 1:** Set up Firebase, implement authentication
3. **Week 2-4:** Build core screens and features
4. **Week 5:** Testing and bug fixes
5. **Week 6:** Play Store preparation
6. **Week 7-8:** Beta testing and launch
