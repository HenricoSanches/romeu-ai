import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserProfile } from '../types';
import { saveUserProfile } from '../storage/storage';
import { Colors, Typography, Spacing, Radii, Shadows } from '../styles/theme';

interface Props {
  onComplete: (profile: UserProfile) => void;
}

type Step = 'welcome' | 'name' | 'income' | 'balance';

const OnboardingScreen: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState<Step>('welcome');
  const [name, setName] = useState('');
  const [isVariableIncome, setIsVariableIncome] = useState(false);
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const transition = (next: () => void) => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    setTimeout(next, 150);
  };

  const parseNumber = (val: string): number => {
    const cleaned = val.replace(/[R$\s.]/g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
  };

  const handleComplete = async () => {
    const profile: UserProfile = {
      name: name.trim(),
      isVariableIncome,
      monthlyIncome: isVariableIncome ? 0 : parseNumber(monthlyIncome),
      initialBalance: parseNumber(initialBalance),
    };
    await saveUserProfile(profile);
    onComplete(profile);
  };

  const renderStep = () => {
    switch (step) {
      case 'welcome':
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.bigEmoji}>🐾</Text>
            <Text style={styles.title}>Olá! Sou o Romeu</Text>
            <Text style={styles.subtitle}>
              Seu assistente financeiro pessoal. Vou te ajudar a controlar suas finanças
              de forma simples, por mensagens.
            </Text>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => transition(() => setStep('name'))}
            >
              <Text style={styles.primaryBtnText}>Vamos começar →</Text>
            </TouchableOpacity>
          </View>
        );

      case 'name':
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepNumber}>1 de 3</Text>
            <Text style={styles.title}>Como posso te chamar?</Text>
            <TextInput
              style={styles.input}
              placeholder="Seu nome"
              placeholderTextColor={Colors.textMuted}
              value={name}
              onChangeText={setName}
              autoFocus
              returnKeyType="next"
            />
            <TouchableOpacity
              style={[styles.primaryBtn, !name.trim() && styles.btnDisabled]}
              disabled={!name.trim()}
              onPress={() => transition(() => setStep('income'))}
            >
              <Text style={styles.primaryBtnText}>Continuar →</Text>
            </TouchableOpacity>
          </View>
        );

      case 'income':
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepNumber}>2 de 3</Text>
            <Text style={styles.title}>Qual sua renda mensal?</Text>
            <Text style={styles.hint}>Isso me ajuda a calcular seu orçamento.</Text>

            {/* Toggle: fixed vs variable */}
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[styles.toggleBtn, !isVariableIncome && styles.toggleActive]}
                onPress={() => setIsVariableIncome(false)}
              >
                <Text style={[styles.toggleText, !isVariableIncome && styles.toggleTextActive]}>
                  Renda fixa
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, isVariableIncome && styles.toggleActive]}
                onPress={() => setIsVariableIncome(true)}
              >
                <Text style={[styles.toggleText, isVariableIncome && styles.toggleTextActive]}>
                  Renda variável
                </Text>
              </TouchableOpacity>
            </View>

            {!isVariableIncome && (
              <TextInput
                style={styles.input}
                placeholder="R$ 0,00"
                placeholderTextColor={Colors.textMuted}
                value={monthlyIncome}
                onChangeText={setMonthlyIncome}
                keyboardType="numeric"
                autoFocus
              />
            )}

            {isVariableIncome && (
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  💡 Com renda variável, vou usar o que você registrar como receita a cada mês.
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.primaryBtn,
                !isVariableIncome && !monthlyIncome.trim() && styles.btnDisabled,
              ]}
              disabled={!isVariableIncome && !monthlyIncome.trim()}
              onPress={() => transition(() => setStep('balance'))}
            >
              <Text style={styles.primaryBtnText}>Continuar →</Text>
            </TouchableOpacity>
          </View>
        );

      case 'balance':
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepNumber}>3 de 3</Text>
            <Text style={styles.title}>Qual seu saldo atual?</Text>
            <Text style={styles.hint}>Quanto você tem disponível agora?</Text>
            <TextInput
              style={styles.input}
              placeholder="R$ 0,00"
              placeholderTextColor={Colors.textMuted}
              value={initialBalance}
              onChangeText={setInitialBalance}
              keyboardType="numeric"
              autoFocus
            />
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleComplete}
            >
              <Text style={styles.primaryBtnText}>Começar a usar 🐾</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setInitialBalance('0'); handleComplete(); }}>
              <Text style={styles.skipText}>Pular (começar do zero)</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kav}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Progress dots */}
          {step !== 'welcome' && (
            <View style={styles.dots}>
              {(['name', 'income', 'balance'] as Step[]).map((s) => (
                <View
                  key={s}
                  style={[
                    styles.dot,
                    step === s && styles.dotActive,
                    (['name', 'income', 'balance'] as Step[]).indexOf(step) >
                      (['name', 'income', 'balance'] as Step[]).indexOf(s) && styles.dotDone,
                  ]}
                />
              ))}
            </View>
          )}

          <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
            {renderStep()}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bgBase,
  },
  kav: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: Spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: 24,
  },
  dotDone: {
    backgroundColor: Colors.primaryLight,
  },
  stepContainer: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  bigEmoji: {
    fontSize: 72,
    marginBottom: Spacing.sm,
  },
  stepNumber: {
    color: Colors.textMuted,
    fontSize: Typography.fontSizeSM,
    fontWeight: Typography.fontWeightMedium,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizeXXL,
    fontWeight: Typography.fontWeightBold,
    textAlign: 'center',
    lineHeight: 36,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizeMD,
    textAlign: 'center',
    lineHeight: 24,
    marginTop: Spacing.xs,
  },
  hint: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizeMD,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: Colors.inputBg,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    color: Colors.textPrimary,
    fontSize: Typography.fontSizeLG,
    marginTop: Spacing.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: Colors.bgElevated,
    borderRadius: Radii.md,
    padding: 4,
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.sm,
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: Colors.primary,
    ...Shadows.button,
  },
  toggleText: {
    color: Colors.textMuted,
    fontSize: Typography.fontSizeSM,
    fontWeight: Typography.fontWeightMedium,
  },
  toggleTextActive: {
    color: Colors.white,
  },
  infoBox: {
    backgroundColor: Colors.primaryGhost,
    borderRadius: Radii.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary + '44',
    width: '100%',
  },
  infoText: {
    color: Colors.primaryLight,
    fontSize: Typography.fontSizeSM,
    lineHeight: 20,
  },
  primaryBtn: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: Radii.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
    ...Shadows.button,
  },
  btnDisabled: {
    backgroundColor: Colors.bgElevated,
    ...({ shadowOpacity: 0 } as any),
  },
  primaryBtnText: {
    color: Colors.white,
    fontSize: Typography.fontSizeLG,
    fontWeight: Typography.fontWeightBold,
  },
  skipText: {
    color: Colors.textMuted,
    fontSize: Typography.fontSizeSM,
    marginTop: Spacing.sm,
    textDecorationLine: 'underline',
  },
});

export default OnboardingScreen;
