# AdEarn Pro - Android App

[![Build Status](https://github.com/kousaryoukhainda-create/AdEarn-Pro/actions/workflows/build-apk.yml/badge.svg)](https://github.com/kousaryoukhainda-create/AdEarn-Pro/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](../LICENSE)
[![Platform](https://img.shields.io/badge/platform-Android-green.svg)](https://developer.android.com/)

Premium earning platform - Watch ads and earn rewards on Android.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd mobile
npm install
```

### 2. Setup Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Add Android app with package name: `com.adearnpro.app`
3. Download `google-services.json`
4. Place in `android/app/google-services.json`

### 3. Generate Keystore (for release builds)

```bash
cd android
chmod +x generate-keystore.sh
./generate-keystore.sh
```

### 4. Build Debug APK

```bash
cd android
chmod +x gradlew
./gradlew assembleDebug

# APK: android/app/build/outputs/apk/debug/app-debug.apk
```

### 5. Install on Device

```bash
adb install app/build/outputs/apk/debug/app-debug.apk
```

📖 **Full Setup Guide:** See [SETUP_ANDROID.md](SETUP_ANDROID.md)

---

## Features

- 🔐 Secure Google Sign-in
- 📺 Watch ads to earn rewards
- 💰 Withdraw to Jazz Cash, Easy Paisa, Naya Pay, Sada Pay
- 📊 Real-time balance tracking
- 🔔 Push notifications (coming soon)
- 🛡️ Enterprise-grade security with Cloud Functions validation

## Tech Stack

- **React Native** - Cross-platform mobile development
- **TypeScript** - Type-safe code
- **Firebase** - Auth, Firestore, Cloud Functions, Analytics
- **React Navigation** - Navigation
- **Zustand** - State management
- **React Native Reanimated** - Smooth animations

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

# Set up environment variables
cp .env.example .env
# Edit .env with your Firebase configuration

# Run on Android
npm run android
```

## Environment Setup

### 1. Firebase Configuration

1. Add Android app to Firebase Console
2. Download `google-services.json`
3. Place in `android/app/google-services.json`

### 2. Environment Variables

Create `.env` file:

```env
FIREBASE_API_KEY=your_api_key
FIREBASE_APP_ID=your_app_id
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_AUTH_DOMAIN=your_auth_domain
API_BASE_URL=https://your-cloud-functions-url.cloudfunctions.net
```

### 3. Google Sign-In

1. Get Web Client ID from Firebase Console
2. Update `src/screens/AuthScreen.tsx`:
```typescript
GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
});
```

## Build

```bash
# Debug APK
npm run build:debug

# Release APK
npm run build:release

# Release Bundle (for Play Store)
npm run bundle:release
```

## Testing

```bash
# Run unit tests
npm test

# Watch mode
npm run test:watch

# Lint
npm run lint
```

## Project Structure

```
mobile/
├── src/
│   ├── components/     # Reusable UI components
│   ├── screens/        # Screen components
│   ├── navigation/     # Navigation configuration
│   ├── services/       # API & Firebase services
│   ├── store/          # State management (Zustand)
│   ├── hooks/          # Custom React hooks
│   ├── types/          # TypeScript types
│   ├── utils/          # Utility functions
│   ├── theme/          # Theme configuration
│   └── config/         # Configuration files
├── android/            # Android native code
├── ios/                # iOS native code (if needed)
├── assets/             # Images, fonts, icons
├── __tests__/          # Test files
└── .github/workflows/  # CI/CD configuration
```

## Deployment

### Google Play Store

1. Create Google Play Console account ($25 one-time)
2. Create app listing
3. Upload AAB file
4. Complete content rating questionnaire
5. Submit for review

See [ANDROID_APP_REQUIREMENTS.md](../ANDROID_APP_REQUIREMENTS.md) for detailed deployment guide.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run android` | Run on Android device/emulator |
| `npm run ios` | Run on iOS simulator (macOS only) |
| `npm start` | Start Metro bundler |
| `npm test` | Run tests |
| `npm run lint` | Run ESLint |
| `npm run build:debug` | Build debug APK |
| `npm run build:release` | Build release APK |
| `npm run bundle:release` | Build release bundle |

## License

MIT License - see [LICENSE](../LICENSE) for details.

## Contact

- Support: support@adearnpro.com
- Website: https://adearnpro.com

## Acknowledgments

- Built with React Native
- Powered by Firebase
