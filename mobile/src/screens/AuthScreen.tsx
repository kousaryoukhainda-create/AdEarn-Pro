import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Button } from '../common';
import { colors, typography, spacing } from '../theme';
import { useAuth } from '../store/auth.store';
import { auth } from '../config/firebase';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com', // Get from Firebase Console
  offlineAccess: true,
});

interface AuthScreenProps {
  onAuthSuccess?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const { loading, error, clearError } = useAuth();

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleGoogleSignIn = async () => {
    try {
      // Check if Google Play Services are available
      await GoogleSignin.hasPlayServices();
      
      // Sign in with Google
      const userInfo = await GoogleSignin.signIn();
      
      // Get the ID token
      const idToken = userInfo.idToken;
      
      if (!idToken) {
        throw new Error('No ID token received');
      }

      // Create Firebase credential
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      
      // Sign in to Firebase with the Google credential
      await auth().signInWithCredential(googleCredential);
      
      onAuthSuccess?.();
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled sign in');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Sign in is in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('Google Play Services not available');
      } else {
        console.error('Google Sign-In Error:', error);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Background Decoration */}
      <View style={styles.backgroundDecoration} />
      
      {/* Logo and Title */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>🛡️</Text>
        </View>
        <Text style={styles.title}>AdEarn Pro</Text>
        <Text style={styles.subtitle}>Premium Earning Platform</Text>
      </View>

      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeTitle}>Welcome Back</Text>
        <Text style={styles.welcomeDescription}>
          Sign in with your Google account to access your dashboard and start earning.
        </Text>
      </View>

      {/* Sign In Button */}
      <View style={styles.buttonSection}>
        <Button
          title="Continue with Google"
          onPress={handleGoogleSignIn}
          variant="secondary"
          size="large"
          icon={
            <Image
              source={{ uri: 'https://www.google.com/favicon.ico' }}
              style={styles.googleIcon}
            />
          }
        />
        
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}
      </View>

      {/* Features */}
      <View style={styles.featuresSection}>
        <View style={styles.feature}>
          <Text style={styles.featureValue}>100%</Text>
          <Text style={styles.featureLabel}>Secure</Text>
        </View>
        <View style={[styles.feature, styles.featureBorder]}>
          <Text style={styles.featureValue}>Fast</Text>
          <Text style={styles.featureLabel}>Payouts</Text>
        </View>
        <View style={styles.feature}>
          <Text style={styles.featureValue}>24/7</Text>
          <Text style={styles.featureLabel}>Support</Text>
        </View>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        © 2026 AdEarn Pro • Enterprise Grade Security
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkBg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
  },
  backgroundDecoration: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing[12],
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 32,
    backgroundColor: colors.gold500,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[4],
    ...require('../theme').shadows.gold,
  },
  logoText: {
    fontSize: 40,
  },
  title: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: '900',
    color: colors.gold500,
    textTransform: 'uppercase',
    letterSpacing: -1,
    marginBottom: spacing[2],
  },
  subtitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    color: colors.gray500,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: spacing[10],
    paddingHorizontal: spacing[4],
  },
  welcomeTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: '900',
    color: colors.white,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
    marginBottom: spacing[4],
    textAlign: 'center',
  },
  welcomeDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.gray400,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonSection: {
    width: '100%',
    maxWidth: 400,
    marginBottom: spacing[8],
  },
  googleIcon: {
    width: 20,
    height: 20,
  },
  errorContainer: {
    marginTop: spacing[4],
    padding: spacing[4],
    backgroundColor: `${colors.error}15`,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: `${colors.error}30`,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    textAlign: 'center',
  },
  featuresSection: {
    flexDirection: 'row',
    paddingTop: spacing[8],
    borderTopWidth: 1,
    borderTopColor: colors.darkBorder,
  },
  feature: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing[4],
  },
  featureBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderLeftColor: colors.darkBorder,
    borderRightColor: colors.darkBorder,
  },
  featureValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: '900',
    color: colors.white,
    marginBottom: spacing[1],
  },
  featureLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: '900',
    color: colors.gray500,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  footer: {
    position: 'absolute',
    bottom: spacing[6],
    fontSize: typography.fontSize.xs,
    color: colors.gray600,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
});
