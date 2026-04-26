import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FinancialState, UserProfile } from '../types';
import { computeFinancialState, formatCurrency, getRemainingBudget } from '../services/financialService';
import { Colors, Typography, Spacing, Radii, Shadows } from '../styles/theme';

interface Props {
  state: FinancialState;
  profile: UserProfile;
}

const BalanceCard: React.FC<Props> = ({ state, profile }) => {
  const [showBalance, setShowBalance] = useState(true);
  const remaining = getRemainingBudget(profile, state);
  const remainingColor = remaining >= 0 ? Colors.income : Colors.danger;

  return (
    <View style={styles.card}>
      {/* Row 1: Balance */}
      <View style={styles.row}>
        <View style={styles.cell}>
          <Text style={styles.label}>Saldo</Text>
          <TouchableOpacity onPress={() => setShowBalance((v) => !v)}>
            <Text style={styles.balanceValue}>
              {showBalance ? formatCurrency(state.balance) : '••••••'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Show/hide icon */}
        <TouchableOpacity onPress={() => setShowBalance((v) => !v)} style={styles.eyeBtn}>
          <Text style={styles.eyeIcon}>{showBalance ? '👁' : '🙈'}</Text>
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Row 2: Monthly stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>↑ Receitas</Text>
          <Text style={[styles.statValue, { color: Colors.income }]}>
            {formatCurrency(state.monthlyIncome)}
          </Text>
        </View>

        <View style={styles.statSep} />

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>↓ Gastos</Text>
          <Text style={[styles.statValue, { color: Colors.expense }]}>
            {formatCurrency(state.monthlyExpenses)}
          </Text>
        </View>

        <View style={styles.statSep} />

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>💡 Disponível</Text>
          <Text style={[styles.statValue, { color: remainingColor }]}>
            {formatCurrency(remaining)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgElevated,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cell: {
    flex: 1,
  },
  label: {
    color: Colors.textMuted,
    fontSize: Typography.fontSizeXS,
    fontWeight: Typography.fontWeightMedium,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  balanceValue: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizeXXL,
    fontWeight: Typography.fontWeightBold,
    letterSpacing: -0.5,
  },
  eyeBtn: {
    padding: Spacing.xs,
  },
  eyeIcon: {
    fontSize: 18,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    color: Colors.textMuted,
    fontSize: Typography.fontSizeXS,
    marginBottom: 2,
  },
  statValue: {
    fontSize: Typography.fontSizeSM,
    fontWeight: Typography.fontWeightSemiBold,
  },
  statSep: {
    width: 1,
    height: 28,
    backgroundColor: Colors.border,
  },
});

export default BalanceCard;
