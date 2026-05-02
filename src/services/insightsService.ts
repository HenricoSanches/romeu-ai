import { Transaction, FinancialState, UserProfile } from '../types';
import { formatCurrency, getRemainingBudget } from './financialService';

export type InsightSeverity = 'positive' | 'warning' | 'danger' | 'info';

export interface Insight {
  id: string;
  icon: string;
  title: string;
  description: string;
  severity: InsightSeverity;
}

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
}

export interface CategorySlice {
  category: string;
  label: string;
  amount: number;
  percentage: number;
  color: string;
}

const PT_MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

export const isInMonth = (isoDate: string, year: number, month: number): boolean => {
  const d = new Date(isoDate);
  return d.getFullYear() === year && d.getMonth() === month;
};

const CATEGORY_COLORS: Record<string, string> = {
  food: '#7C3AED', housing: '#10B981', transport: '#F59E0B',
  health: '#EF4444', entertainment: '#EC4899', education: '#3B82F6',
  clothing: '#8B5CF6', other: '#6B7280',
};

export const getCategoryColor = (category: string): string =>
  CATEGORY_COLORS[category] ?? '#6B7280';

export const getLast6MonthsData = (transactions: Transaction[]): MonthlyData[] => {
  const result: MonthlyData[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    let income = 0, expenses = 0;
    for (const tx of transactions) {
      if (!isInMonth(tx.createdAt, year, month)) continue;
      if (tx.type === 'income') income += tx.amount;
      else expenses += tx.amount;
    }
    result.push({ month: PT_MONTHS[month], income, expenses });
  }
  return result;
};

export const getExpensesByCategory = (
  transactions: Transaction[], year: number, month: number
): CategorySlice[] => {
  const totals: Record<string, { label: string; amount: number; category: string }> = {};
  for (const tx of transactions) {
    if (tx.type !== 'expense' || !isInMonth(tx.createdAt, year, month)) continue;
    const key = tx.category;
    if (!totals[key]) totals[key] = { label: tx.categoryLabel, amount: 0, category: tx.category };
    totals[key].amount += tx.amount;
  }
  const entries = Object.values(totals).sort((a, b) => b.amount - a.amount);
  const total = entries.reduce((s, e) => s + e.amount, 0);
  return entries.map((e) => ({
    category: e.category,
    label: e.label,
    amount: e.amount,
    percentage: total > 0 ? Math.round((e.amount / total) * 100) : 0,
    color: getCategoryColor(e.category),
  }));
};

export const generateInsights = (state: FinancialState, profile: UserProfile): Insight[] => {
  const insights: Insight[] = [];
  const now = new Date();
  const curYear = now.getFullYear(), curMonth = now.getMonth();

  const thisMonth = state.transactions.filter((tx) => isInMonth(tx.createdAt, curYear, curMonth));
  const lastMonthDate = new Date(curYear, curMonth - 1, 1);
  const lastMonth = state.transactions.filter((tx) =>
    isInMonth(tx.createdAt, lastMonthDate.getFullYear(), lastMonthDate.getMonth())
  );

  const thisExpenses = thisMonth.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const lastExpenses = lastMonth.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const thisIncome   = thisMonth.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const lastIncome   = lastMonth.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);

  const remaining = getRemainingBudget(profile, state);
  const income = profile.isVariableIncome ? state.monthlyIncome : profile.monthlyIncome;

  if (income > 0) {
    const pctLeft = (remaining / income) * 100;
    if (remaining < 0) {
      insights.push({ id: 'budget-over', icon: '🚨', title: 'Orçamento estourado',
        description: `Você passou ${formatCurrency(Math.abs(remaining))} acima do orçamento.`, severity: 'danger' });
    } else if (pctLeft < 15) {
      insights.push({ id: 'budget-low', icon: '⚠️', title: 'Orçamento quase esgotado',
        description: `Só ${formatCurrency(remaining)} restantes (${Math.round(pctLeft)}% do mês).`, severity: 'warning' });
    } else {
      insights.push({ id: 'budget-ok', icon: '✅', title: 'Orçamento saudável',
        description: `Você ainda pode gastar ${formatCurrency(remaining)} este mês.`, severity: 'positive' });
    }
  }

  if (lastExpenses > 0 && thisExpenses > 0) {
    const delta = ((thisExpenses - lastExpenses) / lastExpenses) * 100;
    if (delta > 20)
      insights.push({ id: 'exp-up', icon: '📈', title: `Gastos subiram ${Math.round(delta)}%`,
        description: `Este mês: ${formatCurrency(thisExpenses)} vs ${formatCurrency(lastExpenses)} no anterior.`, severity: 'warning' });
    else if (delta < -10)
      insights.push({ id: 'exp-down', icon: '📉', title: `Gastos caíram ${Math.abs(Math.round(delta))}%`,
        description: `Você economizou ${formatCurrency(lastExpenses - thisExpenses)} em relação ao mês passado.`, severity: 'positive' });
  }

  if (profile.isVariableIncome && lastIncome > 0 && thisIncome > 0) {
    const delta = ((thisIncome - lastIncome) / lastIncome) * 100;
    if (delta < -20)
      insights.push({ id: 'income-drop', icon: '💸', title: `Renda caiu ${Math.abs(Math.round(delta))}%`,
        description: `${formatCurrency(thisIncome)} este mês vs ${formatCurrency(lastIncome)} no anterior.`, severity: 'warning' });
    else if (delta > 20)
      insights.push({ id: 'income-up', icon: '🎉', title: `Renda subiu ${Math.round(delta)}%`,
        description: `${formatCurrency(thisIncome)} este mês vs ${formatCurrency(lastIncome)} no anterior.`, severity: 'positive' });
  }

  const catTotals: Record<string, { label: string; amount: number }> = {};
  for (const tx of thisMonth) {
    if (tx.type !== 'expense') continue;
    if (!catTotals[tx.category]) catTotals[tx.category] = { label: tx.categoryLabel, amount: 0 };
    catTotals[tx.category].amount += tx.amount;
  }
  const topCat = Object.values(catTotals).sort((a, b) => b.amount - a.amount)[0];
  if (topCat && income > 0 && topCat.amount / income > 0.35)
    insights.push({ id: 'cat-high', icon: '🔍', title: `Alto gasto em ${topCat.label}`,
      description: `${formatCurrency(topCat.amount)} representa mais de 35% da sua renda.`, severity: 'warning' });

  if (income > 0) {
    const rate = ((income - thisExpenses) / income) * 100;
    if (rate > 20)
      insights.push({ id: 'savings-good', icon: '💰', title: `Taxa de poupança: ${Math.round(rate)}%`,
        description: `Você está guardando ${formatCurrency(income - thisExpenses)} este mês. Parabéns!`, severity: 'positive' });
  }

  return insights.slice(0, 4);
};

export const generateRomeuTip = (state: FinancialState, profile: UserProfile): string => {
  const now = new Date();
  const remaining = getRemainingBudget(profile, state);
  const daysLeft = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate();
  if (remaining > 0 && daysLeft > 0)
    return `Você pode gastar ${formatCurrency(remaining / daysLeft)} por dia até o fim do mês sem estourar o orçamento. 📅`;
  const tips = [
    `Registrar gastos diariamente ajuda a identificar padrões que você nem sabia que tinha. 🔍`,
    `Tente a regra 50/30/20: 50% necessidades, 30% desejos, 20% poupança.`,
    `Pequenos gastos diários somam muito no fim do mês. Já calculou seu "café por mês"? ☕`,
    `Uma reserva de emergência de 3-6 meses de despesas traz muita tranquilidade.`,
  ];
  return tips[Math.floor(Math.random() * tips.length)];
};