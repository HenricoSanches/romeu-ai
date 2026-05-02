import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Animated, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserProfile, FinancialState } from '../types';
import { computeFinancialState, formatCurrency, getRemainingBudget } from '../services/financialService';
import { generateInsights, generateRomeuTip, getLast6MonthsData, getExpensesByCategory } from '../services/insightsService';
import { loadTransactions } from '../storage/storage';
import ChartBar from '../components/ChartBar';
import ChartPie from '../components/ChartPie';
import InsightCard from '../components/InsightCard';
import TransactionRow from '../components/TransactionRow';
import RomeuAvatar from '../components/RomeuAvatar';
import { Colors, Typography, Spacing, Radii, Shadows } from '../styles/theme';

interface Props { userProfile: UserProfile; }

const SectionCard: React.FC<{
  title: string;
  children: React.ReactNode;
  delay?: number;
  rightContent?: React.ReactNode;
}> = ({ title, children, delay = 0, rightContent }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 1, duration: 450, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 450, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.View style={[styles.card, { opacity, transform: [{ translateY }] }]}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        {rightContent}
      </View>
      {children}
    </Animated.View>
  );
};

const StatPill: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color }) => (
  <View style={styles.statPill}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={[styles.statValue, color ? { color } : {}]}>{value}</Text>
  </View>
);

const DashboardScreen: React.FC<Props> = ({ userProfile }) => {
  const [financialState, setFinancialState] = useState<FinancialState>({
    balance: userProfile.initialBalance,
    monthlyExpenses: 0,
    monthlyIncome: 0,
    transactions: [],
  });
  const [refreshing, setRefreshing] = useState(false);
  const headerAnim = useRef(new Animated.Value(0)).current;

  const loadData = useCallback(async () => {
    const txs = await loadTransactions();
    setFinancialState(computeFinancialState(userProfile, txs));
  }, [userProfile]);

  useEffect(() => {
    loadData();
    Animated.timing(headerAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

  const now = new Date();
  const remaining = getRemainingBudget(userProfile, financialState);
  const income = userProfile.isVariableIncome ? financialState.monthlyIncome : userProfile.monthlyIncome;
  const savingsPct = income > 0 ? Math.max(0, Math.round(((income - financialState.monthlyExpenses) / income) * 100)) : 0;
  const budgetUsedPct = income > 0 ? Math.min(100, (financialState.monthlyExpenses / income) * 100) : 0;
  const progressColor = budgetUsedPct > 90 ? Colors.danger : budgetUsedPct > 70 ? Colors.warning : Colors.income;
  const insights = generateInsights(financialState, userProfile);
  const romeuTip = generateRomeuTip(financialState, userProfile);
  const barData = getLast6MonthsData(financialState.transactions);
  const pieSlices = getExpensesByCategory(financialState.transactions, now.getFullYear(), now.getMonth());
  const recentTxs = [...financialState.transactions]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
  const monthName = now.toLocaleString('pt-BR', { month: 'long' });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Animated.View style={[styles.header, { opacity: headerAnim }]}>
        <View>
          <Text style={styles.headerGreeting}>
            {userProfile.name ? `Olá, ${userProfile.name.split(' ')[0]} 👋` : 'Dashboard'}
          </Text>
          <Text style={styles.headerSub}>
            {monthName.charAt(0).toUpperCase() + monthName.slice(1)} · visão financeira
          </Text>
        </View>
        <RomeuAvatar size={40} />
      </Animated.View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Hero balance card */}
        <Animated.View style={[styles.heroCard, { opacity: headerAnim }]}>
          <View style={styles.heroBg} />
          <Text style={styles.heroLabel}>Saldo total</Text>
          <Text style={styles.heroBalance}>{formatCurrency(financialState.balance)}</Text>
          <View style={styles.progressSection}>
            <View style={styles.progressLabels}>
              <Text style={styles.progressLabelLeft}>Orçamento usado</Text>
              <Text style={[styles.progressLabelRight, { color: progressColor }]}>{Math.round(budgetUsedPct)}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${budgetUsedPct}%`, backgroundColor: progressColor }]} />
            </View>
          </View>
          <View style={styles.heroStats}>
            <StatPill label="↑ Receitas"   value={formatCurrency(financialState.monthlyIncome)}   color={Colors.income} />
            <View style={styles.heroStatSep} />
            <StatPill label="↓ Gastos"     value={formatCurrency(financialState.monthlyExpenses)} color={Colors.expense} />
            <View style={styles.heroStatSep} />
            <StatPill label="💡 Disponível" value={formatCurrency(remaining)} color={remaining >= 0 ? Colors.income : Colors.danger} />
          </View>
        </Animated.View>

        {insights.length > 0 && (
          <SectionCard title="📡 Insights" delay={100}>
            {insights.map((ins, i) => <InsightCard key={ins.id} insight={ins} index={i} />)}
          </SectionCard>
        )}

        <SectionCard title="📊 Últimos 6 meses" delay={200}>
          <ChartBar data={barData} />
        </SectionCard>

        {pieSlices.length > 0 && (
          <SectionCard title="🏷️ Gastos por categoria" delay={300}>
            <ChartPie slices={pieSlices} totalExpenses={financialState.monthlyExpenses} />
          </SectionCard>
        )}

        {income > 0 && (
          <SectionCard title="🏦 Taxa de poupança" delay={350}>
            <View style={styles.savingsRow}>
              <View style={styles.savingsCircle}>
                <Text style={styles.savingsPct}>{savingsPct}%</Text>
                <Text style={styles.savingsSubLabel}>guardado</Text>
              </View>
              <View style={styles.savingsDetails}>
                {[
                  { color: Colors.income,       label: `Renda: ${formatCurrency(income)}` },
                  { color: Colors.expense,      label: `Gastos: ${formatCurrency(financialState.monthlyExpenses)}` },
                  { color: Colors.primaryLight, label: `Poupança: ${formatCurrency(Math.max(0, income - financialState.monthlyExpenses))}` },
                ].map(({ color, label }) => (
                  <View key={label} style={styles.savingsLine}>
                    <View style={[styles.savingsDot, { backgroundColor: color }]} />
                    <Text style={styles.savingsText}>{label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </SectionCard>
        )}

        <SectionCard title="" delay={400}>
          <View style={styles.romeuTipRow}>
            <RomeuAvatar size={44} />
            <View style={styles.romeuTipContent}>
              <Text style={styles.romeuTipHeader}>Dica do Romeu 🐾</Text>
              <Text style={styles.romeuTipText}>{romeuTip}</Text>
            </View>
          </View>
        </SectionCard>

        <SectionCard
          title="🕐 Últimas transações"
          delay={450}
          rightContent={recentTxs.length > 0
            ? <Text style={styles.seeAllText}>{financialState.transactions.length} total</Text>
            : undefined}
        >
          {recentTxs.length === 0
            ? <Text style={styles.emptyText}>Nenhuma transação ainda. Mande uma mensagem no chat! 💬</Text>
            : recentTxs.map((tx) => <TransactionRow key={tx.id} transaction={tx} />)
          }
        </SectionCard>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgBase },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    backgroundColor: Colors.bgSurface, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerGreeting: { color: Colors.textPrimary, fontSize: Typography.fontSizeLG, fontWeight: Typography.fontWeightBold },
  headerSub: { color: Colors.textMuted, fontSize: Typography.fontSizeXS, marginTop: 1, textTransform: 'capitalize' },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.md, gap: Spacing.md },
  heroCard: {
    backgroundColor: Colors.bgElevated, borderRadius: Radii.lg, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.border, overflow: 'hidden', ...Shadows.card,
  },
  heroBg: { position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: Colors.primaryGhost },
  heroLabel: { color: Colors.textMuted, fontSize: Typography.fontSizeXS, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  heroBalance: { color: Colors.textPrimary, fontSize: 32, fontWeight: Typography.fontWeightBold, letterSpacing: -0.5, marginBottom: Spacing.md },
  progressSection: { marginBottom: Spacing.md },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabelLeft: { color: Colors.textMuted, fontSize: Typography.fontSizeXS },
  progressLabelRight: { fontSize: Typography.fontSizeXS, fontWeight: Typography.fontWeightBold },
  progressTrack: { height: 6, backgroundColor: Colors.bgBase, borderRadius: Radii.full, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: Radii.full },
  heroStats: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.sm, marginTop: Spacing.xs },
  heroStatSep: { width: 1, backgroundColor: Colors.border, marginHorizontal: Spacing.xs },
  statPill: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  statLabel: { color: Colors.textMuted, fontSize: Typography.fontSizeXS, marginBottom: 2 },
  statValue: { color: Colors.textPrimary, fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightBold },
  card: { backgroundColor: Colors.bgElevated, borderRadius: Radii.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md },
  cardTitle: { color: Colors.textPrimary, fontSize: Typography.fontSizeMD, fontWeight: Typography.fontWeightSemiBold },
  seeAllText: { color: Colors.textMuted, fontSize: Typography.fontSizeXS },
  savingsRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  savingsCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primaryGhost,
    borderWidth: 3, borderColor: Colors.primary, alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  savingsPct: { color: Colors.primaryLight, fontSize: Typography.fontSizeXL, fontWeight: Typography.fontWeightBold },
  savingsSubLabel: { color: Colors.textMuted, fontSize: Typography.fontSizeXS },
  savingsDetails: { flex: 1, gap: 8 },
  savingsLine: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  savingsDot: { width: 8, height: 8, borderRadius: 4 },
  savingsText: { color: Colors.textSecondary, fontSize: Typography.fontSizeSM },
  romeuTipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  romeuTipContent: { flex: 1 },
  romeuTipHeader: { color: Colors.primaryLight, fontSize: Typography.fontSizeSM, fontWeight: Typography.fontWeightBold, marginBottom: 4 },
  romeuTipText: { color: Colors.textSecondary, fontSize: Typography.fontSizeSM, lineHeight: 20 },
  emptyText: { color: Colors.textMuted, fontSize: Typography.fontSizeSM, textAlign: 'center', paddingVertical: Spacing.sm, lineHeight: 20 },
});

export default DashboardScreen;