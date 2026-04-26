import { Transaction, FinancialState, UserProfile, ParseResult } from '../types';

// ─── Financial State Calculation ──────────────────────────────────────────────

/**
 * Derives the current financial state from the user profile + all transactions.
 * This is the single source of truth — never store computed values.
 */
export const computeFinancialState = (
  profile: UserProfile,
  transactions: Transaction[]
): FinancialState => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let balance = profile.initialBalance;
  let monthlyExpenses = 0;
  let monthlyIncome = 0;

  for (const tx of transactions) {
    const txDate = new Date(tx.createdAt);
    const isThisMonth =
      txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;

    if (tx.type === 'expense') {
      balance -= tx.amount;
      if (isThisMonth) monthlyExpenses += tx.amount;
    } else {
      balance += tx.amount;
      if (isThisMonth) monthlyIncome += tx.amount;
    }
  }

  return { balance, monthlyExpenses, monthlyIncome, transactions };
};

// ─── Remaining Budget Calculation ────────────────────────────────────────────

/**
 * Calculates how much the user can still spend this month.
 * Uses fixed monthly income or actual monthly income if variable.
 */
export const getRemainingBudget = (
  profile: UserProfile,
  state: FinancialState
): number => {
  const income = profile.isVariableIncome
    ? state.monthlyIncome
    : profile.monthlyIncome;
  return income - state.monthlyExpenses;
};

// ─── Currency Formatting ──────────────────────────────────────────────────────

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// ─── Response Generation ──────────────────────────────────────────────────────

const pickRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

/**
 * Generates a smart, contextual response after logging a transaction.
 */
export const generateTransactionResponse = (
  parseResult: ParseResult,
  state: FinancialState,
  profile: UserProfile
): string => {
  const { type, amount, categoryLabel } = parseResult;
  const remaining = getRemainingBudget(profile, state);
  const formattedAmount = formatCurrency(amount!);
  const formattedBalance = formatCurrency(state.balance);

  if (type === 'expense') {
    const confirmations = [
      `Anotado! 📝 Você gastou ${formattedAmount} em ${categoryLabel}.`,
      `Registrado! ${formattedAmount} em ${categoryLabel} debitado.`,
      `Tá bom! Lancei ${formattedAmount} de ${categoryLabel} pra você.`,
    ];
    const base = pickRandom(confirmations);

    // Add contextual commentary
    if (remaining < 0) {
      return `${base}\n\n⚠️ Atenção: seu orçamento mensal estourou em ${formatCurrency(Math.abs(remaining))}. Vamos segurar um pouco?\n\nSaldo atual: ${formattedBalance}`;
    } else if (remaining < amount! * 2) {
      return `${base}\n\n💡 Você ainda pode gastar ${formatCurrency(remaining)} este mês — tá ficando apertado.\n\nSaldo atual: ${formattedBalance}`;
    } else {
      return `${base}\n\nSaldo atual: ${formattedBalance} | Ainda pode gastar ${formatCurrency(remaining)} este mês.`;
    }
  } else {
    // Income
    const confirmations = [
      `Boa! 🎉 Receita de ${formattedAmount} em ${categoryLabel} registrada.`,
      `Show! ${formattedAmount} de ${categoryLabel} anotado com sucesso.`,
      `Entrou ${formattedAmount} de ${categoryLabel}. Que isso! 💰`,
    ];
    return `${pickRandom(confirmations)}\n\nSaldo atual: ${formattedBalance}`;
  }
};

/**
 * Generates a response for unrecognized messages.
 */
export const generateUnknownResponse = (state: FinancialState, profile: UserProfile): string => {
  const remaining = getRemainingBudget(profile, state);
  const responses = [
    `Não entendi muito bem. 🐾 Tente algo como:\n• "Gastei 50 no mercado"\n• "Recebi 1200 de freela"\n• "Paguei 300 de aluguel"`,
    `Hmm, não consegui identificar essa transação. Me conta quanto foi e o que foi? Ex: "Paguei 80 no uber"`,
    `Pode repetir de outro jeito? Preciso saber o valor e se foi gasto ou recebimento. Exemplo: "Ganhei 500 de freelance"`,
  ];

  const picked = pickRandom(responses);
  return `${picked}\n\n📊 Saldo atual: ${formatCurrency(state.balance)}`;
};

/**
 * Generates a monthly summary response.
 */
export const generateSummaryResponse = (
  state: FinancialState,
  profile: UserProfile
): string => {
  const remaining = getRemainingBudget(profile, state);
  const income = profile.isVariableIncome ? state.monthlyIncome : profile.monthlyIncome;
  const savingsRate = income > 0 ? ((income - state.monthlyExpenses) / income) * 100 : 0;

  // Group expenses by category
  const now = new Date();
  const thisMonthTxs = state.transactions.filter((tx) => {
    const d = new Date(tx.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const byCategory: Record<string, number> = {};
  for (const tx of thisMonthTxs) {
    if (tx.type === 'expense') {
      byCategory[tx.categoryLabel] = (byCategory[tx.categoryLabel] || 0) + tx.amount;
    }
  }

  const categoryLines = Object.entries(byCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)
    .map(([cat, val]) => `  • ${cat}: ${formatCurrency(val)}`)
    .join('\n');

  const savingsEmoji = savingsRate >= 20 ? '🟢' : savingsRate >= 0 ? '🟡' : '🔴';

  return [
    `📊 *Resumo do mês*`,
    ``,
    `💰 Receitas: ${formatCurrency(state.monthlyIncome)}`,
    `💸 Gastos: ${formatCurrency(state.monthlyExpenses)}`,
    `${savingsEmoji} Sobra: ${formatCurrency(remaining)}`,
    ``,
    categoryLines ? `🏷️ Top categorias:\n${categoryLines}` : '',
    ``,
    `💳 Saldo atual: ${formatCurrency(state.balance)}`,
  ]
    .filter((l) => l !== undefined)
    .join('\n');
};

/**
 * Generates the welcome message shown on app load.
 */
export const generateWelcomeMessage = (profile: UserProfile, state: FinancialState): string => {
  const remaining = getRemainingBudget(profile, state);
  const name = profile.name ? `, ${profile.name}` : '';
  return [
    `Oi${name}! 🐾 Sou o Romeu, seu assistente financeiro.`,
    ``,
    `Você pode me dizer o que gastou ou recebeu em linguagem natural. Exemplos:`,
    `• "Gastei 45 no mercado"`,
    `• "Recebi 1500 de salário"`,
    `• "Paguei 80 de internet"`,
    ``,
    `💳 Saldo atual: ${formatCurrency(state.balance)}`,
    `📅 Você pode gastar ${formatCurrency(remaining)} este mês.`,
    ``,
    `Digite *resumo* para ver seu balanço mensal.`,
  ].join('\n');
};
