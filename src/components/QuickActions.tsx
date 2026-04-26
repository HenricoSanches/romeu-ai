import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Colors, Typography, Spacing, Radii } from '../styles/theme';

const QUICK_ACTIONS = [
  { label: '📊 Resumo', value: 'resumo' },
  { label: '💰 Saldo', value: 'saldo' },
  { label: '🛒 Mercado', value: 'Gastei  no mercado' },
  { label: '🍔 iFood', value: 'Pedi  no iFood' },
  { label: '🚗 Uber', value: 'Paguei  de uber' },
  { label: '💸 Recebi', value: 'Recebi  de ' },
];

interface Props {
  onSelect: (value: string) => void;
}

const QuickActions: React.FC<Props> = ({ onSelect }) => {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {QUICK_ACTIONS.map((action) => (
          <TouchableOpacity
            key={action.value}
            style={styles.chip}
            onPress={() => onSelect(action.value)}
            activeOpacity={0.7}
          >
            <Text style={styles.label}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.bgSurface,
  },
  container: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    flexDirection: 'row',
  },
  chip: {
    backgroundColor: Colors.bgElevated,
    borderRadius: Radii.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizeSM,
    fontWeight: Typography.fontWeightMedium,
  },
});

export default QuickActions;
