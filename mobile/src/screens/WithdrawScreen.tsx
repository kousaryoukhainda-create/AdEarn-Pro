import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../store/auth.store';
import { useWithdrawals } from '../store/withdrawal.store';
import { Card, Button, Input } from '../components/common';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { formatCurrency, validateWithdrawalAmount, calculateWithdrawal } from '../utils';

import Icon from 'react-native-vector-icons/Ionicons';

const PAYMENT_METHODS = [
  { id: 'Jazz cash', name: 'Jazz Cash', icon: 'phone-portrait' },
  { id: 'Easy Paisa', name: 'Easy Paisa', icon: 'wallet' },
  { id: 'Naya Pay', name: 'Naya Pay', icon: 'card' },
  { id: 'Sada Pay', name: 'Sada Pay', icon: 'business' },
];

export const WithdrawScreen = () => {
  const { user } = useAuth();
  const { withdrawals, loading, submitting, error, subscribeToWithdrawals, requestWithdrawal } = useWithdrawals();
  
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('Jazz cash');
  const [accountTitle, setAccountTitle] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [showBreakdown, setShowBreakdown] = useState(false);

  React.useEffect(() => {
    const unsub = subscribeToWithdrawals(user?.uid || '');
    return () => unsub();
  }, [user?.uid]);

  const withdrawAmount = parseFloat(amount) || 0;
  const { fee, netAmount } = calculateWithdrawal(withdrawAmount, 10);
  const isValid = withdrawAmount >= 100 && withdrawAmount <= 50000 && withdrawAmount <= (user?.balance || 0);

  React.useEffect(() => {
    setShowBreakdown(withdrawAmount >= 100);
  }, [withdrawAmount]);

  const handleSubmit = async () => {
    const validation = validateWithdrawalAmount(withdrawAmount, user?.balance || 0, 100, 50000);
    
    if (!validation.valid) {
      Alert.alert('Invalid Amount', validation.error);
      return;
    }

    if (!accountTitle.trim() || !accountNumber.trim()) {
      Alert.alert('Missing Information', 'Please provide both Account Title and Account Number');
      return;
    }

    Alert.alert(
      'Confirm Withdrawal',
      `Amount: ${formatCurrency(withdrawAmount)}\nFee: ${formatCurrency(fee)}\nNet: ${formatCurrency(netAmount)}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await requestWithdrawal({
                amount: withdrawAmount,
                method: selectedMethod,
                accountTitle: accountTitle.trim(),
                accountNumber: accountNumber.trim(),
              });
              Alert.alert('Success', 'Withdrawal request submitted!');
              setAmount('');
              setAccountTitle('');
              setAccountNumber('');
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to process withdrawal');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Withdraw Earnings</Text>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceValue}>{formatCurrency(user?.balance || 0)}</Text>
          </View>
        </View>

        {/* Withdrawal Form */}
        <Card title="Withdrawal Details" style={styles.card}>
          <Input
            label="Amount (Rs)"
            placeholder="0"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            leftIcon={<Icon name="cash" size={20} color={colors.gold500} />}
          />
          
          {amount && parseFloat(amount) >= 100 && (
            <View style={styles.breakdown}>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Gross Amount:</Text>
                <Text style={styles.breakdownValue}>{formatCurrency(withdrawAmount)}</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Service Fee (10%):</Text>
                <Text style={[styles.breakdownValue, { color: colors.error }]}>-{formatCurrency(fee)}</Text>
              </View>
              <View style={[styles.breakdownRow, styles.breakdownTotal]}>
                <Text style={styles.breakdownLabel}>Net Payout:</Text>
                <Text style={[styles.breakdownValue, { color: colors.gold400 }]}>{formatCurrency(netAmount)}</Text>
              </View>
            </View>
          )}

          <Text style={styles.label}>Payment Method</Text>
          <View style={styles.methods}>
            {PAYMENT_METHODS.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.method,
                  selectedMethod === method.id && styles.methodSelected,
                ]}
                onPress={() => setSelectedMethod(method.id)}
              >
                <Icon
                  name={method.icon}
                  size={24}
                  color={selectedMethod === method.id ? colors.gold500 : colors.gray500}
                />
                <Text
                  style={[
                    styles.methodText,
                    selectedMethod === method.id && styles.methodTextSelected,
                  ]}
                >
                  {method.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="Account Title"
            placeholder="Enter account holder name"
            value={accountTitle}
            onChangeText={setAccountTitle}
            leftIcon={<Icon name="person" size={20} color={colors.gold500} />}
          />

          <Input
            label="Account Number"
            placeholder="Enter account/mobile number"
            value={accountNumber}
            onChangeText={setAccountNumber}
            keyboardType="phone-pad"
            leftIcon={<Icon name="call" size={20} color={colors.gold500} />}
          />

          {error && (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle" size={18} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Button
            title={submitting ? 'Processing...' : 'Request Withdrawal'}
            onPress={handleSubmit}
            disabled={submitting || !isValid || !accountTitle || !accountNumber}
            loading={submitting}
            style={styles.submitButton}
            icon={<Icon name="wallet" size={20} color={colors.white} />}
          />
        </Card>

        {/* Withdrawal History */}
        <Card title="Withdrawal History" style={styles.card}>
          {loading ? (
            <Text style={styles.loadingText}>Loading history...</Text>
          ) : withdrawals.length === 0 ? (
            <View style={styles.emptyHistory}>
              <Icon name="time-outline" size={32} color={colors.gray600} />
              <Text style={styles.emptyText}>No withdrawal history yet</Text>
            </View>
          ) : (
            withdrawals.slice(0, 5).map((withdrawal) => (
              <View key={withdrawal.id} style={styles.historyItem}>
                <View style={styles.historyLeft}>
                  <View style={[
                    styles.historyIcon,
                    { backgroundColor: withdrawal.status === 'approved' ? `${colors.success}15` : 
                                      withdrawal.status === 'rejected' ? `${colors.error}15` : `${colors.info}15` }
                  ]}>
                    <Icon
                      name={withdrawal.status === 'approved' ? 'checkmark-circle' :
                            withdrawal.status === 'rejected' ? 'close-circle' : 'time'}
                      size={20}
                      color={withdrawal.status === 'approved' ? colors.success :
                            withdrawal.status === 'rejected' ? colors.error : colors.info}
                    />
                  </View>
                  <View>
                    <Text style={styles.historyAmount}>{formatCurrency(withdrawal.amount)}</Text>
                    <Text style={styles.historyDate}>
                      {new Date(withdrawal.createdAt).toLocaleDateString('en-PK')}
                    </Text>
                  </View>
                </View>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: withdrawal.status === 'approved' ? `${colors.success}15` :
                                    withdrawal.status === 'rejected' ? `${colors.error}15` : `${colors.info}15` }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: withdrawal.status === 'approved' ? colors.success :
                              withdrawal.status === 'rejected' ? colors.error : colors.info }
                  ]}>
                    {withdrawal.status.toUpperCase()}
                  </Text>
                </View>
              </View>
            ))
          )}
        </Card>
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
    marginBottom: spacing[4],
  },
  balanceCard: {
    backgroundColor: colors.gold500,
    borderRadius: borderRadius['2xl'],
    padding: spacing[6],
    ...shadows.gold,
  },
  balanceLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.white,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing[2],
  },
  balanceValue: {
    fontSize: typography.fontSize['3xl'],
    color: colors.white,
    fontWeight: '900',
    letterSpacing: -1,
  },
  card: {
    marginBottom: spacing[6],
  },
  label: {
    fontSize: typography.fontSize.xs,
    color: colors.gray500,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing[2],
    marginLeft: spacing[2],
  },
  methods: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  method: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    padding: spacing[3],
    backgroundColor: colors.darkSurface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.darkBorder,
  },
  methodSelected: {
    borderColor: colors.gold500,
    backgroundColor: `${colors.gold500}10`,
  },
  methodText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray400,
    fontWeight: '600',
  },
  methodTextSelected: {
    color: colors.gold500,
    fontWeight: '700',
  },
  breakdown: {
    backgroundColor: colors.darkSurface,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[4],
    borderWidth: 1,
    borderColor: colors.darkBorder,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[2],
  },
  breakdownTotal: {
    borderTopWidth: 1,
    borderTopColor: colors.darkBorder,
    marginTop: spacing[2],
    paddingTop: spacing[3],
  },
  breakdownLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.gray500,
    fontWeight: '600',
  },
  breakdownValue: {
    fontSize: typography.fontSize.base,
    color: colors.white,
    fontWeight: '700',
  },
  submitButton: {
    marginTop: spacing[2],
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: `${colors.error}15`,
    padding: spacing[3],
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: `${colors.error}30`,
    marginBottom: spacing[4],
  },
  errorText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.error,
    fontWeight: '600',
  },
  loadingText: {
    color: colors.gray500,
    fontSize: typography.fontSize.base,
    textAlign: 'center',
    padding: spacing[4],
  },
  emptyHistory: {
    alignItems: 'center',
    padding: spacing[8],
  },
  emptyText: {
    color: colors.gray500,
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    marginTop: spacing[3],
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.darkBorder,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyAmount: {
    fontSize: typography.fontSize.base,
    color: colors.white,
    fontWeight: '700',
  },
  historyDate: {
    fontSize: typography.fontSize.xs,
    color: colors.gray500,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
