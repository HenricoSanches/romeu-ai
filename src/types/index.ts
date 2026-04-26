// ─── Core Domain Types ────────────────────────────────────────────────────────

export type TransactionType = 'income' | 'expense';

export type Category =
  | 'food'
  | 'housing'
  | 'transport'
  | 'health'
  | 'entertainment'
  | 'education'
  | 'clothing'
  | 'freelance'
  | 'salary'
  | 'investment'
  | 'other';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: Category;
  description: string;        // original user message
  categoryLabel: string;      // human-readable category
  createdAt: string;          // ISO date string
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export interface UserProfile {
  name: string;
  monthlyIncome: number;       // 0 = variable income
  isVariableIncome: boolean;
  initialBalance: number;
}

// ─── Financial State ──────────────────────────────────────────────────────────

export interface FinancialState {
  balance: number;
  monthlyExpenses: number;
  monthlyIncome: number;
  transactions: Transaction[];
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export type MessageSender = 'user' | 'romeu';

export interface ChatMessage {
  id: string;
  sender: MessageSender;
  text: string;
  createdAt: string;
  transaction?: Transaction;  // attached parsed transaction, if any
}

// ─── Parser Result ────────────────────────────────────────────────────────────

export interface ParseResult {
  recognized: boolean;
  type?: TransactionType;
  amount?: number;
  category?: Category;
  categoryLabel?: string;
}
