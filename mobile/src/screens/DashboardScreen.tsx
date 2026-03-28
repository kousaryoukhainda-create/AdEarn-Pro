import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar'; // Or react-native

import { useAuth } from '../store/auth.store';
import { useAds } from '../store/ads.store';
import { useWithdrawals } from '../store/withdrawal.store';
import { Card, StatCard, Button } from '../components/common';
import { colors, typography, spacing, shadows } from '../theme';
import { formatCurrency, getInitials } from '../utils';

// Icons (using react-native-vector-icons)
import Icon from 'react-native-vector-icons/Ionicons';

export const DashboardScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const { subscribeToAds, subscribeToWatchedAds } = useAds();
  const { subscribeToWithdrawals } = useWithdrawals();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    const unsubAds = subscribeToAds();
    const unsubWatched = subscribeToWatchedAds(user?.uid || '');
    const unsubWithdrawals = subscribeToWithdrawals(user?.uid || '');
    return () => {
      unsubAds();
      unsubWatched();
      unsubWithdrawals();
    };
  }, [user?.uid]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  if (!user) {
    return null;
  }

  const stats = [
    {
      label: 'Available Balance',
      value: formatCurrency(user.balance),
      icon: 'wallet',
      color: colors.gold500,
    },
    {
      label: 'Total Earned',
      value: formatCurrency(user.totalEarned),
      icon: 'trending-up',
      color: colors.success,
    },
    {
      label: 'Total Withdrawn',
      value: formatCurrency(user.totalWithdrawn),
      icon: 'arrow-up-circle',
      color: colors.info,
    },
  ];

  const quickActions = [
    {
      title: 'Watch Ads',
      subtitle: 'Earn rewards',
      icon: 'play-circle',
      color: colors.gold500,
      screen: 'Ads' as const,
    },
    {
      title: 'Withdraw',
      subtitle: 'Cash out',
      icon: 'bank',
      color: colors.success,
      screen: 'Withdraw' as const,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold500} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user.email.split('@')[0]}</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(user.email)}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              icon={<Icon name={stat.icon} size={24} color={stat.color} />}
              color={stat.color}
            />
          ))}
        </View>

        {/* Quick Actions */}
        <Card title="Quick Actions" style={styles.card}>
          <View style={styles.quickActions}>
            {quickActions.map((action) => (
              <Button
                key={action.title}
                title={action.title}
                onPress={() => navigation.navigate(action.screen)}
                variant="secondary"
                style={styles.quickAction}
                icon={<Icon name={action.icon} size={20} color={action.color} />}
              />
            ))}
          </View>
        </Card>

        {/* Account Info */}
        <Card title="Account Status" style={styles.card}>
          <View style={styles.accountInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Account Type</Text>
              <View style={[styles.badge, user.role === 'admin' && styles.badgeAdmin]}>
                <Text style={[styles.badgeText, user.role === 'admin' && styles.badgeAdminText]}>
                  {user.role.toUpperCase()}
                </Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Member Since</Text>
              <Text style={styles.infoValue}>
                {new Date(user.createdAt).toLocaleDateString('en-PK')}
              </Text>
            </View>
          </View>
        </Card>

        {/* Logout */}
        <Button
          title="Logout"
          onPress={logout}
          variant="outline"
          style={styles.logoutButton}
          icon={<Icon name="log-out" size={20} color={colors.error} />}
        />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[8],
    marginTop: spacing[4],
  },
  greeting: {
    fontSize: typography.fontSize.sm,
    color: colors.gray500,
    fontWeight: '500',
    marginBottom: spacing[1],
  },
  userName: {
    fontSize: typography.fontSize['2xl'],
    color: colors.white,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.gold500,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.gold,
  },
  avatarText: {
    fontSize: typography.fontSize.lg,
    color: colors.white,
    fontWeight: '900',
  },
  statsContainer: {
    marginBottom: spacing[6],
  },
  card: {
    marginBottom: spacing[6],
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing[4],
  },
  quickAction: {
    flex: 1,
  },
  accountInfo: {
    gap: spacing[4],
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.gray500,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: typography.fontSize.base,
    color: colors.white,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    backgroundColor: colors.darkSurface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.darkBorder,
  },
  badgeAdmin: {
    backgroundColor: colors.gold500,
    borderColor: colors.gold500,
  },
  badgeText: {
    fontSize: typography.fontSize.xs,
    color: colors.gray400,
    fontWeight: '900',
    letterSpacing: 1,
  },
  badgeAdminText: {
    color: colors.white,
  },
  logoutButton: {
    marginTop: spacing[4],
    borderColor: colors.error,
  },
});
