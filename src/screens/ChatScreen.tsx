import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserProfile, ChatMessage, Transaction, FinancialState } from '../types';
import { parseMessage } from '../services/parser';
import {
  computeFinancialState,
  generateTransactionResponse,
  generateUnknownResponse,
  generateSummaryResponse,
  generateWelcomeMessage,
  formatCurrency,
} from '../services/financialService';
import {
  loadMessages,
  saveMessages,
  loadTransactions,
  appendTransaction,
  clearAllData,
} from '../storage/storage';
import ChatBubble from '../components/ChatBubble';
import MessageInput from '../components/MessageInput';
import BalanceCard from '../components/BalanceCard';
import QuickActions from '../components/QuickActions';
import TypingIndicator from '../components/TypingIndicator';
import RomeuAvatar from '../components/RomeuAvatar';
import { Colors, Typography, Spacing, Radii } from '../styles/theme';

interface Props {
  userProfile: UserProfile;
  onResetProfile: () => void;
}

const generateId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
const now = () => new Date().toISOString();

const ChatScreen: React.FC<Props> = ({ userProfile, onResetProfile }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [financialState, setFinancialState] = useState<FinancialState>({
    balance: userProfile.initialBalance,
    monthlyExpenses: 0,
    monthlyIncome: 0,
    transactions: [],
  });
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const isFirstLoad = useRef(true);

  // ─── Load persisted data ───────────────────────────────────────────────────

  useEffect(() => {
    const loadData = async () => {
      const [storedMessages, transactions] = await Promise.all([
        loadMessages(),
        loadTransactions(),
      ]);

      const state = computeFinancialState(userProfile, transactions);
      setFinancialState(state);

      if (storedMessages.length === 0) {
        // First session: show welcome message
        const welcome: ChatMessage = {
          id: generateId(),
          sender: 'romeu',
          text: generateWelcomeMessage(userProfile, state),
          createdAt: now(),
        };
        setMessages([welcome]);
        await saveMessages([welcome]);
      } else {
        setMessages(storedMessages);
      }

      isFirstLoad.current = false;
    };

    loadData();
  }, []);

  // ─── Auto-scroll ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages, isTyping]);

  // ─── Add a message helper ─────────────────────────────────────────────────

  const addMessages = useCallback(async (newMsgs: ChatMessage[]) => {
    setMessages((prev) => {
      const updated = [...prev, ...newMsgs];
      saveMessages(updated);
      return updated;
    });
  }, []);

  // ─── Handle special commands ──────────────────────────────────────────────

  const handleSpecialCommand = (text: string, state: FinancialState): string | null => {
    const lower = text.toLowerCase().trim();

    if (lower === 'resumo' || lower === 'summary' || lower.includes('resumo do mês')) {
      return generateSummaryResponse(state, userProfile);
    }

    if (lower === 'saldo' || lower.includes('qual meu saldo') || lower.includes('ver saldo')) {
      return `💳 Seu saldo atual é ${formatCurrency(state.balance)}.`;
    }

    if (lower === 'ajuda' || lower === 'help' || lower === '?') {
      return [
        `🐾 *Como usar o Romeu AI*`,
        ``,
        `Me mande mensagens naturais como:`,
        `• "Gastei 50 no mercado"`,
        `• "Paguei 150 de conta de luz"`,
        `• "Recebi 2000 de salário"`,
        `• "Ganhei 500 de freela"`,
        ``,
        `Comandos especiais:`,
        `• *resumo* — ver resumo do mês`,
        `• *saldo* — ver saldo atual`,
      ].join('\n');
    }

    return null;
  };

  // ─── Main message handler ─────────────────────────────────────────────────

  const handleSend = async (text: string) => {
    // Add user message immediately
    const userMsg: ChatMessage = {
      id: generateId(),
      sender: 'user',
      text,
      createdAt: now(),
    };

    await addMessages([userMsg]);
    setIsTyping(true);
    setShowQuickActions(false);

    // Simulate Romeu "thinking" (150–600ms)
    const delay = 300 + Math.random() * 300;
    await new Promise((r) => setTimeout(r, delay));
    setIsTyping(false);

    // Check for special commands first
    const specialResponse = handleSpecialCommand(text, financialState);
    if (specialResponse) {
      const romeuMsg: ChatMessage = {
        id: generateId(),
        sender: 'romeu',
        text: specialResponse,
        createdAt: now(),
      };
      await addMessages([romeuMsg]);
      return;
    }

    // Try to parse as a financial transaction
    const parseResult = parseMessage(text);

    if (parseResult.recognized) {
      // Create the transaction record
      const tx: Transaction = {
        id: generateId(),
        type: parseResult.type!,
        amount: parseResult.amount!,
        category: parseResult.category!,
        categoryLabel: parseResult.categoryLabel!,
        description: text,
        createdAt: now(),
      };

      // Persist and recompute state
      const updatedTxs = await appendTransaction(tx);
      const newState = computeFinancialState(userProfile, updatedTxs);
      setFinancialState(newState);

      const responseText = generateTransactionResponse(parseResult, newState, userProfile);
      const romeuMsg: ChatMessage = {
        id: generateId(),
        sender: 'romeu',
        text: responseText,
        createdAt: now(),
        transaction: tx,
      };
      await addMessages([romeuMsg]);
    } else {
      // Unknown message
      const responseText = generateUnknownResponse(financialState, userProfile);
      const romeuMsg: ChatMessage = {
        id: generateId(),
        sender: 'romeu',
        text: responseText,
        createdAt: now(),
      };
      await addMessages([romeuMsg]);
    }
  };

  // ─── Handle quick action selection ───────────────────────────────────────

  const handleQuickAction = (value: string) => {
    // For prefilled templates, just send them directly if complete; otherwise let user edit
    const needsEdit = value.includes('  '); // double space = placeholder
    if (needsEdit) {
      // TODO: populate input — for now, just show a hint
      const romeuMsg: ChatMessage = {
        id: generateId(),
        sender: 'romeu',
        text: `Preencha o valor e me mande, tipo: "${value.replace('  ', ' X ')}" 😊`,
        createdAt: now(),
      };
      addMessages([romeuMsg]);
    } else {
      handleSend(value);
    }
  };

  // ─── Reset / settings ──────────────────────────────────────────────────────

  const handleReset = () => {
    Alert.alert(
      'Reiniciar app',
      'Isso apagará todos os seus dados. Tem certeza?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar tudo',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            onResetProfile();
          },
        },
      ]
    );
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <RomeuAvatar size={40} />
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>Romeu AI</Text>
            <Text style={styles.headerSub}>
              {userProfile.name ? `Olá, ${userProfile.name} 👋` : 'Assistente financeiro'}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.menuBtn} onPress={handleReset}>
          <Text style={styles.menuIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Balance Card */}
      <BalanceCard state={financialState} profile={userProfile} />

      {/* Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => <ChatBubble message={item} />}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={isTyping ? <TypingIndicator /> : null}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Quick action chips */}
        {showQuickActions && <QuickActions onSelect={handleQuickAction} />}

        {/* Input bar */}
        <MessageInput onSend={handleSend} loading={isTyping} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bgBase,
  },
  flex: {
    flex: 1,
  },
  // ─── Header ──────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerInfo: {
    gap: 1,
  },
  headerName: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizeLG,
    fontWeight: Typography.fontWeightBold,
  },
  headerSub: {
    color: Colors.textMuted,
    fontSize: Typography.fontSizeXS,
  },
  menuBtn: {
    padding: Spacing.sm,
  },
  menuIcon: {
    fontSize: 20,
  },
  // ─── Messages ────────────────────────────────────────────────────────────
  messageList: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
});

export default ChatScreen;
