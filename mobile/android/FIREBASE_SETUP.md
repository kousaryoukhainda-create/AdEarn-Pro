# 🔥 Firebase Configuration Guide

How to get your `google-services.json` file.

---

## Option 1: Use Existing Firebase Project (Current)

I've already created a `google-services.json` with your existing Firebase project credentials:

**Location:** `mobile/android/app/google-services.json`

**Current Configuration:**
- **Project ID:** `gen-lang-client-0553826491`
- **App ID:** `1:91077653322:android:2d0fbbeac9006bcf4587b3`
- **Package:** `com.adearnpro.app`
- **API Key:** `AIzaSyDZADP5Flcgjl-0GM5nTcnKOzHxUAkY0ZM`

This should work with your existing Firebase project! Just verify:

1. Go to [Firebase Console](https://console.firebase.google.com/project/gen-lang-client-0553826491)
2. Check if Android app `com.adearnpro.app` is registered
3. If not, add it with the same package name

---

## Option 2: Create New google-services.json

### Step 1: Go to Firebase Console

https://console.firebase.google.com/

### Step 2: Select or Create Project

- Select existing project: `gen-lang-client-0553826491`
- Or create new project

### Step 3: Add Android App

1. Click **"Add app"** → Android icon
2. **Package name:** `com.adearnpro.app` (must match exactly)
3. **App nickname:** `AdEarn Pro`
4. **Debug signing certificate:** (optional for now)
5. Click **"Register app"**

### Step 4: Download google-services.json

1. Click **"Download google-services.json"**
2. Save the file

### Step 5: Place in Project

```
mobile/
└── android/
    └── app/
        └── google-services.json  ← Place here
```

---

## Verify Configuration

### Check Package Name Matches

In `android/app/build.gradle`:
```gradle
android {
    defaultConfig {
        applicationId "com.adearnpro.app"  // Must match Firebase
    }
}
```

### Check google-services.json

Open `android/app/google-services.json` and verify:

```json
{
  "client": [
    {
      "client_info": {
        "android_client_info": {
          "package_name": "com.adearnpro.app"  // Must match!
        }
      }
    }
  ]
}
```

---

## Get SHA-1 Certificate (for Google Sign-In)

### Debug Keystore

```bash
# Linux/Mac
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# Windows
keytool -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android
```

### Release Keystore (after generating)

```bash
keytool -list -v -keystore keystore.jks -alias adearn-pro
```

### Add SHA-1 to Firebase

1. Go to Firebase Console → Project Settings
2. Your apps → Android app
3. Add fingerprint → Paste SHA-1
4. Save

---

## Test Firebase Connection

After adding `google-services.json`:

```bash
cd mobile/android
./gradlew assembleDebug

# Look for this in build output:
# > Task :app:googleServices
```

If you see `googleServices` task completed, Firebase is configured correctly!

---

## Fields Explained

| Field | Description | Required |
|-------|-------------|----------|
| `project_id` | Firebase project ID | ✅ Yes |
| `app_id` | Android app ID in Firebase | ✅ Yes |
| `api_key` | Firebase API key | ✅ Yes |
| `auth_domain` | Firebase auth domain | ✅ Yes |
| `storage_bucket` | Firebase storage | ✅ Yes |
| `messaging_sender_id` | FCM sender ID | ✅ Yes |
| `client.client_info.package_name` | Must match app | ✅ Yes |

---

## Troubleshooting

### Build Error: google-services.json not found

```
File google-services.json is missing.
```

**Solution:** Place file in `mobile/android/app/google-services.json`

### Build Error: Package name mismatch

```
Execution failed for task ':app:validateSigningRelease'.
```

**Solution:** Ensure package name in `google-services.json` matches `build.gradle`

### Google Sign-In Not Working

**Solution:** Add SHA-1 fingerprint to Firebase Console

---

## Current File (Editable)

The file at `mobile/android/app/google-services.json` is ready to use with your existing Firebase project.

**To update with new credentials:**
1. Download new `google-services.json` from Firebase Console
2. Replace content of `mobile/android/app/google-services.json`
3. Rebuild APK

---

## Resources

- [Firebase Android Setup](https://firebase.google.com/docs/android/setup)
- [Firebase Console](https://console.firebase.google.com/)
- [google-services.json Format](https://developers.google.com/android/guides/google-services-plugin)
