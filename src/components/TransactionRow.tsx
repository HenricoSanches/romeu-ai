import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Transaction } from '../types';
import { Colors, Typography, Spacing } from '../styles/theme';
import { formatCurrency } from '../services/financialService';

const ICONS: Record<string, string> = {
  food: '🍔', housing: '🏠', transport: '🚗', health: '💊',
  entertainment: '🎮', education: '📚', clothing: '👕',
  freelance: '💻', salary: '💼', investment: '📈', other: '📌',
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

const TransactionRow: React.FC<{ transaction: Transaction }> = ({ transaction: tx }) => {
  const isIncome = tx.type === 'income';
  return (
    <View style={styles.row}>
      <View style={[styles.iconWrap, { backgroundColor: isIncome ? `${Colors.income}1A` : `${Colors.expense}1A` }]}>
        <Text style={styles.iconText}>{ICONS[tx.category] ?? '📌'}</Text>
      </View>
      <View style={styles.details}>
        <Text style={styles.label} numberOfLines={1}>{tx.categoryLabel}</Text>
        <Text style={styles.date}>{formatDate(tx.createdAt)}</Text>
      </View>
      <Text style={[styles.amount, { color: isIncome ? Colors.income : Colors.expense }]}>
        {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  iconWrap: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  iconText: { fontSize: 18 },
  details: { flex: 1, gap: 2 },
  label: { color: Colors.textPrimary, fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightMedium },
  date: { color: Colors.textMuted, fontSize: Typography.fontSizeXS },
  amount: { fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightBold },
});

export default TransactionRow;