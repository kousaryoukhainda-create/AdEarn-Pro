import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../store/auth.store';
import { Card, Button } from '../components/common';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { getInitials } from '../utils';

import Icon from 'react-native-vector-icons/Ionicons';

export const SettingsScreen = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      title: 'Account',
      icon: 'person',
      color: colors.gold500,
      items: [
        { label: 'Email', value: user?.email || '' },
        { label: 'User ID', value: user?.uid.slice(0, 12) + '...' || '' },
        { label: 'Account Type', value: user?.role.toUpperCase() || '' },
        { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-PK') : '' },
      ],
    },
    {
      title: 'Earnings',
      icon: 'wallet',
      color: colors.success,
      items: [
        { label: 'Total Earned', value: `Rs ${user?.totalEarned.toFixed(2)}` || '' },
        { label: 'Total Withdrawn', value: `Rs ${user?.totalWithdrawn.toFixed(2)}` || '' },
        { label: 'Current Balance', value: `Rs ${user?.balance.toFixed(2)}` || '' },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>{getInitials(user?.email || '')}</Text>
          </View>
          <Text style={styles.profileEmail}>{user?.email}</Text>
          <View style={[styles.roleBadge, user?.role === 'admin' && styles.roleBadgeAdmin]}>
            <Text style={[styles.roleBadgeText, user?.role === 'admin' && styles.roleBadgeAdminText]}>
              {user?.role.toUpperCase()}
            </Text>
          </View>
        </Card>

        {/* Menu Sections */}
        {menuItems.map((section) => (
          <Card key={section.title} title={section.title} style={styles.card}>
            <View style={styles.sectionContent}>
              {section.items.map((item, index) => (
                <View
                  key={item.label}
                  style={[
                    styles.itemRow,
                    index < section.items.length - 1 && styles.itemRowBorder,
                  ]}
                >
                  <Text style={styles.itemLabel}>{item.label}</Text>
                  <Text style={styles.itemValue}>{item.value}</Text>
                </View>
              ))}
            </View>
          </Card>
        ))}

        {/* App Info */}
        <Card style={styles.card}>
          <View style={styles.appInfo}>
            <View style={styles.appInfoRow}>
              <Icon name="shield-checkmark" size={20} color={colors.gold500} />
              <Text style={styles.appInfoText}>Enterprise Grade Security</Text>
            </View>
            <View style={styles.appInfoRow}>
              <Icon name="cloud-upload" size={20} color={colors.gold500} />
              <Text style={styles.appInfoText}>Version 1.0.0</Text>
            </View>
            <View style={styles.appInfoRow}>
              <Icon name="mail" size={20} color={colors.gold500} />
              <Text style={styles.appInfoText}>support@adearnpro.com</Text>
            </View>
          </View>
        </Card>

        {/* Logout Button */}
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="outline"
          style={styles.logoutButton}
          icon={<Icon name="log-out" size={20} color={colors.error} />}
        />

        {/* Footer */}
        <Text style={styles.footer}>© 2026 AdEarn Pro. All rights reserved.</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkBg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[6],
  },
  header: {
    marginBottom: spacing[6],
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    color: colors.white,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: spacing[8],
    marginBottom: spacing[6],
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.gold500,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[4],
    ...shadows.gold,
  },
  profileAvatarText: {
    fontSize: typography.fontSize['3xl'],
    color: colors.white,
    fontWeight: '900',
  },
  profileEmail: {
    fontSize: typography.fontSize.base,
    color: colors.white,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing[3],
  },
  roleBadge: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    backgroundColor: colors.darkSurface,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.darkBorder,
  },
  roleBadgeAdmin: {
    backgroundColor: colors.gold500,
    borderColor: colors.gold500,
  },
  roleBadgeText: {
    fontSize: typography.fontSize.xs,
    color: colors.gray400,
    fontWeight: '900',
    letterSpacing: 1,
  },
  roleBadgeAdminText: {
    color: colors.white,
  },
  card: {
    marginBottom: spacing[6],
  },
  sectionContent: {
    gap: 0,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[4],
  },
  itemRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.darkBorder,
  },
  itemLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.gray500,
    fontWeight: '600',
  },
  itemValue: {
    fontSize: typography.fontSize.base,
    color: colors.white,
    fontWeight: '600',
    textAlign: 'right',
  },
  appInfo: {
    gap: spacing[3],
  },
  appInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  appInfoText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray400,
    fontWeight: '500',
  },
  logoutButton: {
    marginTop: spacing[2],
    borderColor: colors.error,
  },
  footer: {
    textAlign: 'center',
    fontSize: typography.fontSize.xs,
    color: colors.gray600,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: spacing[6],
    marginBottom: spacing[4],
  },
});
