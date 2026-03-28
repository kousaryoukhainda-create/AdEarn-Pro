import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  onPress?: () => void;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  onPress,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {(title || subtitle) && (
        <View style={styles.header}>
          {title && <Text style={styles.title}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      )}
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: `${colors.darkSurface}99`,
    backdropFilter: 'blur(12px)',
    borderRadius: borderRadius['3xl'],
    borderWidth: 1,
    borderColor: colors.darkBorder,
    ...shadows.lg,
    overflow: 'hidden',
  },
  header: {
    padding: spacing[6],
    paddingBottom: spacing[4],
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: '900',
    color: colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing[1],
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.gray500,
    fontWeight: '500',
  },
  content: {
    padding: spacing[6],
    paddingTop: 0,
  },
});

export const StatCard: React.FC<{
  label: string;
  value: string;
  icon?: React.ReactNode;
  color?: string;
  onPress?: () => void;
}> = ({ label, value, icon, color = colors.gold500, onPress }) => {
  return (
    <View style={[styles.statCard, onPress && styles.statCardPressable]}>
      {icon && (
        <View style={[styles.statIcon, { backgroundColor: `${color}15` }]}>
          {icon}
        </View>
      )}
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );
};

const statCardStyles = StyleSheet.create({
  statCard: {
    backgroundColor: `${colors.darkSurface}99`,
    borderRadius: borderRadius['3xl'],
    borderWidth: 1,
    borderColor: colors.darkBorder,
    padding: spacing[6],
    ...shadows.md,
  },
  statCardPressable: {
    opacity: 0.9,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: '900',
    color: colors.gray500,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing[2],
  },
  statValue: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: '900',
    letterSpacing: -1,
  },
});

Object.assign(styles, statCardStyles);
