import { ParseResult, Category } from '../types';

// ─── Keyword Maps ─────────────────────────────────────────────────────────────

const EXPENSE_KEYWORDS = [
  'gastei', 'gastar', 'gasto', 'gasta',
  'paguei', 'pagar', 'pagando', 'pago',
  'comprei', 'comprar', 'comprando',
  'desembolsei', 'debitou', 'saiu',
  'custou', 'custa',
];

const INCOME_KEYWORDS = [
  'ganhei', 'ganhar', 'ganhando',
  'recebi', 'receber', 'recebendo',
  'entrou', 'depositei', 'deposito',
  'caiu', 'caiu na conta',
  'renda', 'salário', 'salario', 'pagaram',
  'transferência', 'transferencia', 'pix recebido',
];

// ─── Category Keyword Map ─────────────────────────────────────────────────────

const CATEGORY_MAP: Array<{ keywords: string[]; category: Category; label: string }> = [
  // Food & Dining
  {
    keywords: ['mercado', 'supermercado', 'feira', 'padaria', 'açougue', 'hortifruti',
               'ifood', 'rappi', 'uber eats', 'restaurant', 'restaurante', 'lanche',
               'pizza', 'hamburguer', 'sushi', 'comida', 'almoço', 'jantar', 'café',
               'starbucks', 'mcdonalds', 'mc donalds', 'mc donald', 'burger king'],
    category: 'food',
    label: 'Alimentação',
  },
  // Housing
  {
    keywords: ['aluguel', 'condomínio', 'condominio', 'iptu', 'água', 'luz', 'energia',
               'gás', 'gas', 'internet', 'conta de luz', 'conta de água', 'moradia',
               'casa', 'apartamento', 'retrofit'],
    category: 'housing',
    label: 'Moradia',
  },
  // Transport
  {
    keywords: ['uber', 'táxi', 'taxi', '99', 'ônibus', 'metro', 'metrô', 'gasolina',
               'combustível', 'combustivel', 'posto', 'estacionamento', 'pedágio',
               'pedagio', 'moto', 'carro', 'transporte', 'passagem'],
    category: 'transport',
    label: 'Transporte',
  },
  // Health
  {
    keywords: ['farmácia', 'farmacia', 'remédio', 'remedio', 'médico', 'medico',
               'dentista', 'hospital', 'exame', 'consulta', 'plano de saúde',
               'academia', 'gym', 'saúde', 'saude'],
    category: 'health',
    label: 'Saúde',
  },
  // Entertainment
  {
    keywords: ['netflix', 'spotify', 'amazon prime', 'disney', 'hbo', 'globoplay',
               'cinema', 'show', 'ingresso', 'viagem', 'hotel', 'bar', 'balada',
               'clube', 'lazer', 'entretenimento', 'jogo', 'game', 'steam'],
    category: 'entertainment',
    label: 'Lazer',
  },
  // Education
  {
    keywords: ['curso', 'faculdade', 'universidade', 'livro', 'escola', 'mensalidade',
               'udemy', 'alura', 'educação', 'educacao', 'treinamento'],
    category: 'education',
    label: 'Educação',
  },
  // Clothing
  {
    keywords: ['roupa', 'tênis', 'sapato', 'camiseta', 'calça', 'vestido', 'moda',
               'loja', 'shopping', 'renner', 'riachuelo', 'zara', 'hm', 'h&m'],
    category: 'clothing',
    label: 'Vestuário',
  },
  // Income: Freelance
  {
    keywords: ['freela', 'freelance', 'freelancer', 'projeto', 'serviço', 'cliente',
               'trabalho extra', 'bico', 'consultoria'],
    category: 'freelance',
    label: 'Freelance',
  },
  // Income: Salary
  {
    keywords: ['salário', 'salario', 'holerite', 'pagamento', 'empresa', 'emprego',
               'trabalho', 'quinzena', 'mensal'],
    category: 'salary',
    label: 'Salário',
  },
  // Income: Investment
  {
    keywords: ['dividendo', 'rendimento', 'investimento', 'tesouro', 'ação', 'acoes',
               'cdb', 'fii', 'bolsa', 'retorno'],
    category: 'investment',
    label: 'Investimentos',
  },
];

// ─── Number Extraction ────────────────────────────────────────────────────────

/**
 * Extracts the first number found in a string.
 * Handles formats: 1200, 1.200, 1,200, 1200.50, R$ 50
 */
export const extractAmount = (text: string): number | null => {
  // Remove currency symbol
  const cleaned = text.replace(/R\$\s?/gi, '');

  // Match numbers like 1.200,50 or 1,200.50 or 1200.50 or 1200,50 or 1200
  const match = cleaned.match(/(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{1,2})?|\d+(?:[.,]\d{1,2})?)/);
  if (!match) return null;

  let raw = match[0];

  // Normalize: if there's a comma and dot, figure out which is decimal
  if (raw.includes(',') && raw.includes('.')) {
    // e.g. 1.200,50 → remove dot, replace comma with dot
    raw = raw.replace('.', '').replace(',', '.');
  } else if (raw.includes(',')) {
    // Could be 1.200 style thousand sep OR 1,50 decimal
    const parts = raw.split(',');
    if (parts[1] && parts[1].length <= 2) {
      // Decimal: 1200,50
      raw = raw.replace(',', '.');
    } else {
      // Thousand sep: 1,200
      raw = raw.replace(',', '');
    }
  }
  // else: plain number with dot decimal → leave as is

  const value = parseFloat(raw);
  return isNaN(value) ? null : value;
};

// ─── Intent Detection ─────────────────────────────────────────────────────────

const containsAny = (text: string, keywords: string[]): boolean => {
  const lower = text.toLowerCase();
  return keywords.some((kw) => lower.includes(kw));
};

// ─── Category Detection ───────────────────────────────────────────────────────

const detectCategory = (
  text: string,
  type: 'income' | 'expense'
): { category: Category; label: string } => {
  const lower = text.toLowerCase();

  for (const entry of CATEGORY_MAP) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return { category: entry.category, label: entry.label };
    }
  }

  // Default by type
  return type === 'income'
    ? { category: 'other', label: 'Receita' }
    : { category: 'other', label: 'Outros' };
};

// ─── Main Parser ──────────────────────────────────────────────────────────────

export const parseMessage = (text: string): ParseResult => {
  const isExpense = containsAny(text, EXPENSE_KEYWORDS);
  const isIncome = containsAny(text, INCOME_KEYWORDS);

  // Must match at least one intent
  if (!isExpense && !isIncome) {
    return { recognized: false };
  }

  const amount = extractAmount(text);
  if (!amount || amount <= 0) {
    return { recognized: false };
  }

  const type = isExpense ? 'expense' : 'income';
  const { category, label } = detectCategory(text, type);

  return {
    recognized: true,
    type,
    amount,
    category,
    categoryLabel: label,
  };
};
