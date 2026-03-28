import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { useAuth } from '../store/auth.store';
import { useAds } from '../store/ads.store';
import { Card, Button } from '../components/common';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { formatCurrency } from '../utils';

import Icon from 'react-native-vector-icons/Ionicons';

export const AdsScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { ads, availableAds, watchedAdIds, loading, subscribeToAds, subscribeToWatchedAds } = useAds();

  React.useEffect(() => {
    const unsubAds = subscribeToAds();
    const unsubWatched = subscribeToWatchedAds(user?.uid || '');
    return () => {
      unsubAds();
      unsubWatched();
    };
  }, [user?.uid]);

  const handleWatchAd = (adId: string) => {
    // Navigate to AdPlayer screen (to be implemented)
    Alert.alert('Watch Ad', 'Ad player will open here', [
      { text: 'OK', onPress: () => console.log('Watch ad:', adId) }
    ]);
  };

  const renderAdCard = ({ item }: { item: any }) => {
    const isWatched = watchedAdIds.has(item.id);
    
    return (
      <Card style={styles.adCard}>
        <View style={styles.adHeader}>
          <View style={[styles.adIcon, { backgroundColor: `${colors.gold500}15` }]}>
            <Icon name="play" size={24} color={colors.gold500} />
          </View>
          <View style={styles.adReward}>
            <Text style={styles.adRewardValue}>{formatCurrency(item.reward)}</Text>
            <Text style={styles.adRewardLabel}>Reward</Text>
          </View>
        </View>
        
        <Text style={styles.adTitle}>{item.title}</Text>
        <Text style={styles.adDescription} numberOfLines={2}>
          {item.description || 'Watch this advertisement to earn rewards.'}
        </Text>
        
        <View style={styles.adFooter}>
          <View style={styles.adMeta}>
            <Icon name="time" size={14} color={colors.gold500} />
            <Text style={styles.adMetaText}>{item.duration}s</Text>
          </View>
          
          {isWatched ? (
            <View style={[styles.watchedBadge, { backgroundColor: `${colors.success}15` }]}>
              <Icon name="checkmark-circle" size={16} color={colors.success} />
              <Text style={[styles.watchedText, { color: colors.success }]}>Watched</Text>
            </View>
          ) : (
            <Button
              title="Watch Now"
              onPress={() => handleWatchAd(item.id)}
              variant="primary"
              style={styles.watchButton}
              icon={<Icon name="play" size={16} color={colors.white} />}
            />
          )}
        </View>
      </Card>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading ads...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Available Ads</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{availableAds.length} Available</Text>
        </View>
      </View>

      {availableAds.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Icon name="play-circle-outline" size={48} color={colors.gray600} />
          </View>
          <Text style={styles.emptyTitle}>No Ads Available</Text>
          <Text style={styles.emptyText}>
            You've watched all available ads or there are no new ones. Check back later!
          </Text>
        </View>
      ) : (
        <FlatList
          data={availableAds}
          renderItem={renderAdCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkBg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[6],
    paddingTop: spacing[4],
    paddingBottom: spacing[4],
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    color: colors.white,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  badge: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    backgroundColor: colors.darkSurface,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.darkBorder,
  },
  badgeText: {
    fontSize: typography.fontSize.xs,
    color: colors.gray400,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.gray500,
    fontSize: typography.fontSize.base,
  },
  listContent: {
    padding: spacing[6],
    gap: spacing[4],
  },
  adCard: {
    marginBottom: 0,
  },
  adHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  adIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adReward: {
    alignItems: 'flex-end',
  },
  adRewardValue: {
    fontSize: typography.fontSize['2xl'],
    color: colors.gold400,
    fontWeight: '900',
    letterSpacing: -1,
  },
  adRewardLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.gray500,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  adTitle: {
    fontSize: typography.fontSize.lg,
    color: colors.white,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: spacing[2],
  },
  adDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.gray500,
    fontWeight: '500',
    marginBottom: spacing[4],
    lineHeight: 20,
  },
  adFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.darkBorder,
  },
  adMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  adMetaText: {
    fontSize: typography.fontSize.xs,
    color: colors.gray400,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  watchButton: {
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
    minHeight: 40,
  },
  watchedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
  },
  watchedText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[12],
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.darkSurface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[6],
    borderWidth: 1,
    borderColor: colors.darkBorder,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    color: colors.white,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: spacing[4],
    textAlign: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray500,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 22,
  },
});
