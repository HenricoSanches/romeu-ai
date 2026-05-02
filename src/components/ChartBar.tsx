import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { MonthlyData } from '../services/insightsService';
import { Colors, Typography, Spacing } from '../styles/theme';

const BAR_HEIGHT = 120;

const AnimatedBar: React.FC<{ value: number; maxValue: number; color: string; delay: number }> = ({ value, maxValue, color, delay }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 600, delay, useNativeDriver: false }).start();
  }, [value]);
  const targetH = maxValue > 0 ? Math.max((value / maxValue) * BAR_HEIGHT, value > 0 ? 4 : 0) : 0;
  const height = anim.interpolate({ inputRange: [0, 1], outputRange: [0, targetH] });
  return <Animated.View style={[styles.bar, { height, backgroundColor: color }]} />;
};

const ChartBar: React.FC<{ data: MonthlyData[] }> = ({ data }) => {
  const maxValue = Math.max(...data.flatMap((d) => [d.income, d.expenses]), 1);
  return (
    <View>
      <View style={styles.chart}>
        {[0.25, 0.5, 0.75, 1].map((p) => (
          <View key={p} style={[styles.gridLine, { bottom: p * BAR_HEIGHT }]} />
        ))}
        {data.map((item, i) => (
          <View key={item.month} style={styles.group}>
            <View style={styles.barPair}>
              <AnimatedBar value={item.income}   maxValue={maxValue} color={Colors.income}  delay={i * 60} />
              <AnimatedBar value={item.expenses} maxValue={maxValue} color={Colors.expense} delay={i * 60 + 80} />
            </View>
            <Text style={styles.monthLabel}>{item.month}</Text>
          </View>
        ))}
      </View>
      <View style={styles.legend}>
        {[{ color: Colors.income, label: 'Receitas' }, { color: Colors.expense, label: 'Gastos' }].map(({ color, label }) => (
          <View key={label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: color }]} />
            <Text style={styles.legendText}>{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chart: { height: BAR_HEIGHT + 28, flexDirection: 'row', alignItems: 'flex-end',
    justifyContent: 'space-between', paddingBottom: 28, position: 'relative' },
  gridLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: Colors.border, opacity: 0.5 },
  group: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%', position: 'relative' },
  barPair: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, marginBottom: 6 },
  bar: { width: 10, borderRadius: 3 },
  monthLabel: { position: 'absolute', bottom: 0, color: Colors.textMuted, fontSize: Typography.fontSizeXS },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.lg, marginTop: Spacing.xs },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: Colors.textSecondary, fontSize: Typography.fontSizeSM },
});

export default ChartBar;