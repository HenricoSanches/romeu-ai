import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, Transaction, ChatMessage } from '../types';

const KEYS = {
  USER_PROFILE: '@romeu:user_profile',
  TRANSACTIONS: '@romeu:transactions',
  MESSAGES: '@romeu:messages',
};

// ─── User Profile ──────────────────────────────────────────────────────────────

export const saveUserProfile = async (profile: UserProfile): Promise<void> => {
  await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
};

export const loadUserProfile = async (): Promise<UserProfile | null> => {
  const raw = await AsyncStorage.getItem(KEYS.USER_PROFILE);
  return raw ? JSON.parse(raw) : null;
};

export const clearUserProfile = async (): Promise<void> => {
  await AsyncStorage.removeItem(KEYS.USER_PROFILE);
};

// ─── Transactions ─────────────────────────────────────────────────────────────

export const saveTransactions = async (txs: Transaction[]): Promise<void> => {
  await AsyncStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(txs));
};

export const loadTransactions = async (): Promise<Transaction[]> => {
  const raw = await AsyncStorage.getItem(KEYS.TRANSACTIONS);
  return raw ? JSON.parse(raw) : [];
};

export const appendTransaction = async (tx: Transaction): Promise<Transaction[]> => {
  const existing = await loadTransactions();
  const updated = [...existing, tx];
  await saveTransactions(updated);
  return updated;
};

// ─── Chat Messages ────────────────────────────────────────────────────────────

export const saveMessages = async (msgs: ChatMessage[]): Promise<void> => {
  // Keep only last 200 messages to avoid unbounded growth
  const trimmed = msgs.slice(-200);
  await AsyncStorage.setItem(KEYS.MESSAGES, JSON.stringify(trimmed));
};

export const loadMessages = async (): Promise<ChatMessage[]> => {
  const raw = await AsyncStorage.getItem(KEYS.MESSAGES);
  return raw ? JSON.parse(raw) : [];
};

// ─── Full Reset ───────────────────────────────────────────────────────────────

export const clearAllData = async (): Promise<void> => {
  await AsyncStorage.multiRemove(Object.values(KEYS));
};
